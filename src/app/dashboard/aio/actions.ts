'use server'

import { db } from '@/db'
import { aeoScans, projectPages } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import * as cheerio from 'cheerio'
import { geminiGenerateContent, wrapUntrustedContent, stripJsonFences } from '@/lib/ai/gemini'
import { logActivity } from '@/lib/audit'
import { requireUser, assertProjectAccess, requireProjectAccess, getAccessibleProjects } from '@/lib/auth'
import { safeFetch, fetchHtmlResilient } from '@/lib/security'
import { assertScanAllowed } from '@/lib/billing/quota'
import { runAutomationsForEvent } from '@/lib/automations/engine'

const AIO_ANALYSIS_PROMPT = `
You are an expert Artificial Intelligence Optimization (AIO) and SEO specialist.
Your goal is to evaluate if a given web page content is highly likely to be cited by Large Language Models like {TARGET_ENGINE} for a specific target query, aimed at this persona: {TARGET_PERSONA}.

Analyze the provided HTML/text snippet against this Target Query: "{TARGET_QUERY}"

LLMs prefer content that:
1. directly and concisely answers the query
2. provides unique statistics or data
3. uses structured formatting (lists, tables)
4. has clear definitions
5. establishes strong entity relationships

Return a JSON object following this exact TypeScript interface:
{
  "citationScore": number, // 0-100 indicating probability of being cited for this query by the target engine
  "entities": { 
    "name": string, 
    "relevance": "Strong" | "Weak" | "Missing", 
    "category": string // e.g. "Concept", "Brand", "Person", "Statistic"
  }[],
  "simulatedAnswer": string, // A mock paragraph simulating how the target engine would summarize this page right now
  "recommendations": {
    "title": string, // Short title of the recommendation (e.g. "Add a TL;DR section")
    "impact": "High" | "Medium" | "Low", // The impact this change will have on the citation score
    "rationale": string, // Explanation of why this helps AIO
    "tutorial": { // Step-by-step tutorial on how to implement this recommendation
      "stepNumber": number,
      "instruction": string,
      "codeSnippet": string | null // Optional HTML, JSON-LD, or markdown snippet to help the user implement it
    }[]
  }[]
}

Ensure the response is ONLY valid JSON.
`

export async function getProjects() {
  try {
    const user = await requireUser()
    const allProjects = await getAccessibleProjects(user.id)
    const sorted = [...allProjects].sort((a: any, b: any) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return timeB - timeA
    })
    return { success: true, projects: sorted }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getProjectPages(projectId: string) {
  try {
    const user = await requireUser()
    await assertProjectAccess(projectId, user.id)
    const pages = await db.query.projectPages.findMany({
      where: eq(projectPages.projectId, projectId),
      orderBy: [desc(projectPages.discoveredAt)]
    })
    return { success: true, pages }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getAioScans(projectId: string) {
  try {
    const user = await requireUser()
    await assertProjectAccess(projectId, user.id)
    const scans = await db.query.aeoScans.findMany({
      where: eq(aeoScans.projectId, projectId),
      orderBy: [desc(aeoScans.createdAt)]
    })
    return { success: true, scans }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function runAioAnalysis(projectId: string, url: string, targetQuery: string, targetEngine: string = 'ChatGPT (GPT-4)', targetPersona: string = 'General Audience') {
  let scanId: string | undefined
  try {
    const { project } = await requireProjectAccess(projectId)
    await assertScanAllowed(project.organizationId)

    // 1. Create a pending scan record
    const [scan] = await db.insert(aeoScans).values({
      projectId,
      url,
      targetQuery,
      status: 'running'
    }).returning()
    scanId = scan.id

    // 2. Fetch and parse HTML (SSRF-guarded with resilient fallback)
    const { html } = await fetchHtmlResilient(url)
    const $ = cheerio.load(html)

    // Clean up HTML to save tokens
    $('script, style, noscript, iframe, svg, img').remove()
    const cleanText = $('body').text().replace(/\s{2,}/g, ' ').trim().slice(0, 30000) // limit context

    // 3. Call Gemini
    let prompt = AIO_ANALYSIS_PROMPT.replace('{TARGET_QUERY}', targetQuery)
    prompt = prompt.replace('{TARGET_ENGINE}', targetEngine)
    prompt = prompt.replace('{TARGET_PERSONA}', targetPersona)

    const aiResponse = await geminiGenerateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: prompt + wrapUntrustedContent('page content', cleanText) }] }
      ],
      config: {
        responseMimeType: 'application/json',
      }
    })

    if (!aiResponse.text) {
      throw new Error("Empty response from AI")
    }

    const parsed = JSON.parse(stripJsonFences(aiResponse.text))

    const promptTokens = aiResponse.usageMetadata?.promptTokenCount || Math.ceil((prompt.length + cleanText.length) / 4)
    const candidateTokens = aiResponse.usageMetadata?.candidatesTokenCount || Math.ceil((aiResponse.text?.length || 0) / 4)
    const tokensConsumed = aiResponse.usageMetadata?.totalTokenCount || (promptTokens + candidateTokens)

    // 4. Update DB
    await db.update(aeoScans).set({
      status: 'completed',
      citationScore: parsed.citationScore || 0,
      entities: parsed.entities || [],
      recommendations: parsed.recommendations || [],
      simulatedAnswer: parsed.simulatedAnswer || '',
      updatedAt: new Date()
    }).where(eq(aeoScans.id, scan.id))

    // Record in scans table for billing token metering
    const { scans } = await import('@/db/schema')
    await db.insert(scans).values({
      projectId,
      status: 'completed',
      startedAt: new Date(),
      completedAt: new Date(),
      scores: { type: 'aio_intelligence', query: targetQuery, citationScore: parsed.citationScore },
      tokensConsumed,
    })

    // Log success only after the scan actually completes.
    await logActivity('AIO Scan Executed', 'Project', 'success', undefined, projectId);

    await runAutomationsForEvent(project.organizationId, 'aeo.completed', {
      projectId, url, targetQuery, citationScore: parsed.citationScore ?? null,
    })

    revalidatePath(`/dashboard/aio/${projectId}`)
    revalidatePath('/dashboard/billing')
    return { success: true, scanId: scan.id }
  } catch (error: any) {
    console.error("AIO Analysis failed:", error)
    // Mark the scan failed instead of leaving it stuck in "running".
    if (scanId) {
      await db.update(aeoScans).set({ status: 'failed', updatedAt: new Date() }).where(eq(aeoScans.id, scanId)).catch(() => {})
    }
    await logActivity('AIO Scan Executed', 'Project', 'error', undefined, projectId).catch(() => {})
    return { success: false, error: error.message }
  }
}
