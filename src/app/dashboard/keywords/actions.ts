'use server'

import { db } from '@/db'
import { keywordOpportunities, rankingSuggestions, scans } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import * as cheerio from 'cheerio'
import { geminiGenerateContent, wrapUntrustedContent, stripJsonFences } from '@/lib/ai/gemini'
import { logActivity } from '@/lib/audit'
import { requireUser, requireProjectAccess, assertProjectAccess } from '@/lib/auth'
import { assertScanAllowed } from '@/lib/billing/quota'
import { safeFetch, assertUrlAllowed, fetchHtmlResilient } from '@/lib/security'
import { fetchRealKeywordMetrics, isKeywordProviderConfigured, type RealKeywordMetric } from '@/lib/seo/keyword-provider'
import { runAutomationsForEvent } from '@/lib/automations/engine'

const KEYWORD_DISCOVERY_PROMPT = `
You are an elite Enterprise SEO Architect and Keyword Strategist.
Analyze the extracted text content of this website and generate at least 50 highly relevant, high-value SEO keyword opportunities.

Return a JSON array of objects representing these keyword opportunities.
For each keyword, provide realistic, simulated metrics based on your vast knowledge of SEO trends for this industry.

Requirements for the data:
- "keyword": The actual search phrase (mix of head terms and long-tail).
- "volume": Estimated monthly search volume (integer, realistic numbers like 1400, 32000, 450).
- "intent": MUST be one of "informational", "commercial", "transactional", "navigational".
- "kd": Keyword Difficulty score from 0 to 100 (integer).
- "cpc": Cost Per Click in USD (float/real, e.g., 4.50).
- "position": Your estimated current ranking position (integer 1-100), or null if you likely don't rank yet.
- "url": A suggested relative URL path on the site that should target this keyword (e.g. "/services/cro" or "/blog/ab-testing").
- "trend": "up", "down", or "flat".

Example output format:
[
  {
    "keyword": "b2b saas cro agency",
    "volume": 850,
    "intent": "commercial",
    "kd": 45,
    "cpc": 12.50,
    "position": 12,
    "url": "/services/b2b-saas",
    "trend": "up"
  }
]

Ensure the response is ONLY valid JSON (a single array of objects).
`

export async function getKeywordOpportunities(projectId: string) {
  try {
    const user = await requireUser()
    await assertProjectAccess(projectId, user.id)
    const keywords = await db.query.keywordOpportunities.findMany({
      where: eq(keywordOpportunities.projectId, projectId),
      orderBy: (table, { desc }) => [desc(table.volume)]
    })
    // Tell the UI whether metrics are live (real provider) or AI-estimated.
    return { success: true, keywords, dataSource: isKeywordProviderConfigured() ? 'live' : 'estimated' }
  } catch (error: any) {
    return { success: false, error: error.message, dataSource: 'estimated' }
  }
}

const RANKING_SUGGESTIONS_PROMPT = `
You are a senior technical SEO consultant. Using the page content and the site's
current tracked keywords, produce concrete, high-leverage edits that would most
improve this page's search rankings.

Return ONLY a JSON array (6-10 items), most impactful first, each object:
{
  "title": string,            // short, action-oriented (e.g. "Rewrite the <title> around 'B2B CRO audit'")
  "area": "On-page" | "Content" | "Technical" | "Keyword targeting" | "Internal linking" | "E-E-A-T",
  "priority": "high" | "medium" | "low",
  "impact": string,           // one line: expected ranking impact
  "recommendation": string,   // 1-3 sentences: exactly what to change and why
  "example": string | null    // optional concrete before→after or snippet; null if not applicable
}
Be specific to THIS page and its keywords. No generic filler.
`

/** AI-generated, page-specific edits to improve ranking. */
export async function getRankingSuggestions(projectId: string) {
  try {
    const { project } = await requireProjectAccess(projectId)
    await assertScanAllowed(project.organizationId)

    const { html } = await fetchHtmlResilient(project.websiteUrl)
    const $ = cheerio.load(html)
    const title = $('title').first().text().trim()
    const metaDescription = $('meta[name="description"]').attr('content')?.trim() || ''
    const h1s = $('h1').map((_, el) => $(el).text().trim()).get().slice(0, 10)
    const h2s = $('h2').map((_, el) => $(el).text().trim()).get().slice(0, 20)
    $('script, style, noscript, iframe, svg, nav, footer').remove()
    const cleanText = $('body').text().replace(/\s{2,}/g, ' ').trim().slice(0, 12000)

    const kws = await db.query.keywordOpportunities.findMany({
      where: eq(keywordOpportunities.projectId, projectId),
      orderBy: (table, { desc }) => [desc(table.volume)],
      limit: 25,
    })
    const kwSummary = kws.map((k) => `${k.keyword} (vol ${k.volume ?? '?'}, kd ${k.kd ?? '?'}, pos ${k.position ?? 'n/a'})`).join('; ')

    const context = `
    URL: ${project.websiteUrl}
    Industry: ${project.industry || 'Unknown'}
    Page Title: ${title || 'N/A'}
    Meta Description: ${metaDescription || 'N/A'}
    H1: ${JSON.stringify(h1s)}
    H2: ${JSON.stringify(h2s)}
    Currently tracked keywords: ${kwSummary || 'none yet'}

    --- PAGE CONTENT ---
    ${cleanText}
    `

    const aiResponse = await geminiGenerateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: RANKING_SUGGESTIONS_PROMPT + wrapUntrustedContent('page + keyword data', context) }] }],
      config: { responseMimeType: 'application/json', temperature: 0.3 },
    })
    if (!aiResponse.text) throw new Error('Empty response from AI')

    const parsed = JSON.parse(stripJsonFences(aiResponse.text))
    if (!Array.isArray(parsed)) throw new Error('AI did not return a list')

    const promptTokens = aiResponse.usageMetadata?.promptTokenCount || Math.ceil((RANKING_SUGGESTIONS_PROMPT.length + context.length) / 4)
    const candidateTokens = aiResponse.usageMetadata?.candidatesTokenCount || Math.ceil((aiResponse.text.length || 0) / 4)
    const tokensConsumed = aiResponse.usageMetadata?.totalTokenCount || (promptTokens + candidateTokens)

    const records = parsed.map((s: any) => ({
      projectId,
      title: s.title || 'Untitled',
      area: s.area || 'On-page',
      priority: s.priority || 'medium',
      impact: s.impact || '',
      recommendation: s.recommendation || '',
      example: s.example || null,
    }))

    if (records.length > 0) {
      await db.transaction(async (tx) => {
        await tx.delete(rankingSuggestions).where(eq(rankingSuggestions.projectId, projectId))
        await tx.insert(rankingSuggestions).values(records)
      })
    }

    // Record AI token consumption in scans table for billing metering
    await db.insert(scans).values({
      projectId,
      status: 'completed',
      startedAt: new Date(),
      completedAt: new Date(),
      scores: { type: 'keyword_ranking_suggestions', suggestionsCount: records.length },
      tokensConsumed,
    })

    await logActivity('Generated Ranking Suggestions', project.name, 'success', undefined, projectId)
    revalidatePath('/dashboard/billing')
    return { success: true, suggestions: parsed }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getSavedRankingSuggestions(projectId: string) {
  try {
    const user = await requireUser()
    await assertProjectAccess(projectId, user.id)
    const suggestions = await db.query.rankingSuggestions.findMany({
      where: eq(rankingSuggestions.projectId, projectId),
      orderBy: (table, { asc }) => [asc(table.createdAt)]
    })
    return { success: true, suggestions }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function runKeywordDiscovery(projectId: string) {
  try {
    const { project } = await requireProjectAccess(projectId)
    await assertScanAllowed(project.organizationId)

    const url = project.websiteUrl

    // 2. Fetch and parse HTML (SSRF-guarded with resilient Cloudflare/WAF fallback)
    const { html } = await fetchHtmlResilient(url)
    const $ = cheerio.load(html)

    const title = $('title').first().text().trim()
    const metaDescription = $('meta[name="description"]').attr('content')?.trim() || ''
    const h1s = $('h1').map((_, el) => $(el).text().trim()).get().slice(0, 10)
    const h2s = $('h2').map((_, el) => $(el).text().trim()).get().slice(0, 20)

    $('script, style, noscript, iframe, svg, nav, footer').remove()
    const cleanText = $('body').text().replace(/\s{2,}/g, ' ').trim().slice(0, 20000)

    const fullContext = `
    URL: ${url}
    Industry: ${project.industry || 'Unknown'}
    Page Title: ${title || 'N/A'}
    Meta Description: ${metaDescription || 'N/A'}
    H1 Headings: ${JSON.stringify(h1s)}
    H2 Headings: ${JSON.stringify(h2s)}

    --- PAGE CONTENT (Clean Text) ---
    ${cleanText}
    `

    // 3. Call Gemini
    const aiResponse = await geminiGenerateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: KEYWORD_DISCOVERY_PROMPT + wrapUntrustedContent('page content', fullContext) }] }
      ],
      config: {
        responseMimeType: 'application/json',
      }
    })

    if (!aiResponse.text) {
      throw new Error("Empty response from AI")
    }

    let parsed = []
    try {
      parsed = JSON.parse(stripJsonFences(aiResponse.text))
    } catch (e) {
      throw new Error("Failed to parse AI response as JSON")
    }

    if (!Array.isArray(parsed)) {
      throw new Error("AI did not return a JSON array")
    }

    const promptTokens = aiResponse.usageMetadata?.promptTokenCount || Math.ceil((KEYWORD_DISCOVERY_PROMPT.length + fullContext.length) / 4)
    const candidateTokens = aiResponse.usageMetadata?.candidatesTokenCount || Math.ceil((aiResponse.text?.length || 0) / 4)
    const tokensConsumed = aiResponse.usageMetadata?.totalTokenCount || (promptTokens + candidateTokens)

    // Enrich AI-generated keywords with REAL search volume / CPC / difficulty
    // when a provider is configured (DataForSEO). Otherwise keep the AI estimate.
    let realMetrics = new Map<string, RealKeywordMetric>()
    if (isKeywordProviderConfigured()) {
      realMetrics = await fetchRealKeywordMetrics(parsed.map((k: any) => String(k.keyword || '')).filter(Boolean))
    }

    // Insert new keywords
    const records = parsed.map((k: any) => {
      const real = realMetrics.get(String(k.keyword || '').toLowerCase())
      return {
        projectId,
        keyword: k.keyword || 'Unknown',
        volume: real?.volume ?? (typeof k.volume === 'number' ? k.volume : 0),
        intent: k.intent || 'informational',
        kd: real?.competitionIndex ?? (typeof k.kd === 'number' ? k.kd : 0),
        cpc: real?.cpc ?? (typeof k.cpc === 'number' ? k.cpc : 0),
        position: typeof k.position === 'number' ? k.position : null,
        url: k.url || '/',
        trend: k.trend || 'flat',
      }
    })
    
    if (records.length > 0) {
      await db.transaction(async (tx) => {
        await tx.delete(keywordOpportunities).where(eq(keywordOpportunities.projectId, projectId))
        await tx.insert(keywordOpportunities).values(records)
      })
    } else {
      throw new Error('Discovery returned no keywords; existing data left unchanged')
    }

    // Record in scans table for billing metering
    await db.insert(scans).values({
      projectId,
      status: 'completed',
      startedAt: new Date(),
      completedAt: new Date(),
      scores: { type: 'keyword_discovery', keywordsCount: records.length },
      tokensConsumed,
    })

    await logActivity('Keyword Discovery Executed', project.name, 'success', undefined, projectId);
    await runAutomationsForEvent(project.organizationId, 'keywords.discovered', { projectId, count: records.length })

    revalidatePath(`/dashboard/keywords/${projectId}`)
    revalidatePath('/dashboard/billing')
    return { success: true }
  } catch (error: any) {
    console.error("Keyword Discovery failed:", error)
    return { success: false, error: error.message }
  }
}
