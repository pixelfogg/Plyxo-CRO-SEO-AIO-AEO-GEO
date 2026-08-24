'use server'

import { db } from '@/db'
import { competitors, competitorKeywordGaps, scans } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import * as cheerio from 'cheerio'
import { geminiGenerateContent, wrapUntrustedContent, stripJsonFences } from '@/lib/ai/gemini'
import { logActivity } from '@/lib/audit'
import { requireUser, requireProjectAccess, assertProjectAccess } from '@/lib/auth'
import { safeFetch } from '@/lib/security'

const COMPETITOR_ANALYSIS_PROMPT = `
You are an elite Enterprise SEO Competitor Analyst.
We are providing you with the text content of two websites:
1. MY PROJECT (The primary website)
2. COMPETITOR (The rival website)

Analyze both sites to understand their semantic niche, overlap, and gaps.

Return a JSON object containing two main simulated datasets:
1. "competitor": Simulated top-level metrics for the competitor.
   - "name": Clean domain name (e.g. competitor.com)
   - "da": Estimated Domain Authority (0-100) based on perceived brand strength.
   - "trafficShare": An estimated percentage of traffic they own in this niche vs you (e.g. 45).
   - "overlap": Estimated number of keywords you both rank for (e.g. 1200).

2. "gaps": An array of 15-25 high-value keyword opportunities that the competitor likely ranks for, but the primary project is missing.
   For each gap:
   - "keyword": The search phrase.
   - "volume": Estimated monthly search volume (integer).
   - "intent": "informational", "commercial", "transactional", or "navigational".
   - "kd": Keyword Difficulty (0-100).
   - "myPosition": Estimated position for MY PROJECT (integer, e.g., 45), or null if not ranking.
   - "compTopPosition": Estimated position for the COMPETITOR (integer, 1-10).

Example output format:
{
  "competitor": {
    "name": "example.com",
    "da": 74,
    "trafficShare": 45,
    "overlap": 3400
  },
  "gaps": [
    {
      "keyword": "b2b saas cro agency",
      "volume": 850,
      "intent": "commercial",
      "kd": 45,
      "myPosition": null,
      "compTopPosition": 2
    }
  ]
}

Ensure the response is ONLY valid JSON.
`

async function fetchAndCleanHTML(url: string) {
  const response = await safeFetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }})
  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${url}`)
  }
  const html = await response.text()
  const $ = cheerio.load(html)
  
  $('script, style, noscript, iframe, svg, nav, footer').remove()
  return $('body').text().replace(/\s{2,}/g, ' ').trim().slice(0, 15000)
}

export async function getCompetitors(projectId: string) {
  try {
    const user = await requireUser()
    await assertProjectAccess(projectId, user.id)
    const data = await db.query.competitors.findMany({
      where: eq(competitors.projectId, projectId),
      orderBy: (table, { desc }) => [desc(table.trafficShare)]
    })
    return { success: true, competitors: data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getCompetitorKeywordGaps(projectId: string) {
  try {
    const user = await requireUser()
    await assertProjectAccess(projectId, user.id)
    const data = await db.query.competitorKeywordGaps.findMany({
      where: eq(competitorKeywordGaps.projectId, projectId),
      orderBy: (table, { desc }) => [desc(table.volume)],
      with: {
        competitor: true
      }
    })
    return { success: true, gaps: data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function analyzeCompetitor(projectId: string, competitorUrl: string) {
  try {
    const { project } = await requireProjectAccess(projectId)

    // 2. Fetch both sites
    const myText = await fetchAndCleanHTML(project.websiteUrl)
    const compText = await fetchAndCleanHTML(competitorUrl)

    const fullContext = `
    --- MY PROJECT (${project.websiteUrl}) ---
    ${myText}
    
    --- COMPETITOR (${competitorUrl}) ---
    ${compText}
    `

    // 3. Call Gemini
    const aiResponse = await geminiGenerateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: COMPETITOR_ANALYSIS_PROMPT + wrapUntrustedContent('scraped website content of both sites', fullContext) }] }
      ],
      config: {
        responseMimeType: 'application/json',
      }
    })

    if (!aiResponse.text) {
      throw new Error("Empty response from AI")
    }

    const parsed = JSON.parse(stripJsonFences(aiResponse.text))

    if (!parsed.competitor || !parsed.gaps) {
      throw new Error("AI returned invalid structure")
    }

    const promptTokens = aiResponse.usageMetadata?.promptTokenCount || Math.ceil((COMPETITOR_ANALYSIS_PROMPT.length + fullContext.length) / 4)
    const candidateTokens = aiResponse.usageMetadata?.candidatesTokenCount || Math.ceil((aiResponse.text?.length || 0) / 4)
    const tokensConsumed = aiResponse.usageMetadata?.totalTokenCount || (promptTokens + candidateTokens)

    // 4. Update DB
    let cleanDomain = competitorUrl.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0];
    if (parsed.competitor.name) {
      cleanDomain = parsed.competitor.name;
    }
    
    const [compRecord] = await db.insert(competitors).values({
      projectId,
      name: cleanDomain,
      url: competitorUrl,
      da: parsed.competitor.da ?? null,
      trafficShare: parsed.competitor.trafficShare ?? null,
      overlap: parsed.competitor.overlap ?? null,
    }).returning()
    
    if (Array.isArray(parsed.gaps) && parsed.gaps.length > 0) {
      const records = parsed.gaps.map((k: any) => ({
        projectId,
        competitorId: compRecord.id,
        keyword: k.keyword || 'Unknown',
        volume: typeof k.volume === 'number' ? k.volume : 0,
        intent: k.intent || 'informational',
        kd: typeof k.kd === 'number' ? k.kd : 0,
        myPosition: typeof k.myPosition === 'number' ? k.myPosition : null,
        compTopPosition: typeof k.compTopPosition === 'number' ? k.compTopPosition : null,
      }))
      if (records.length > 0) {
        await db.insert(competitorKeywordGaps).values(records)
      }
    }

    // Record token usage in scans table
    await db.insert(scans).values({
      projectId,
      status: 'completed',
      startedAt: new Date(),
      completedAt: new Date(),
      scores: { type: 'competitor_intelligence', competitor: cleanDomain },
      tokensConsumed,
    })

    await logActivity('Competitor Scan Executed', competitorUrl, 'success', undefined, projectId);

    revalidatePath(`/dashboard/competitors/${projectId}`)
    return { success: true }
  } catch (error: any) {
    console.error("Competitor Analysis failed:", error)
    return { success: false, error: error.message }
  }
}
