import { NextResponse } from 'next/server';
import { db } from '@/db';
import { aeoScans, projects, scans } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { validateApiKey, resolveTargetProject, AuthResult } from '@/lib/api-auth';
import { assertScanAllowed } from '@/lib/billing/quota';
import * as cheerio from 'cheerio';
import { geminiGenerateContent, wrapUntrustedContent, stripJsonFences } from '@/lib/ai/gemini';
import { logActivity } from '@/lib/audit';
import { safeFetch, fetchHtmlResilient } from '@/lib/security';
import { runAutomationsForEvent } from '@/lib/automations/engine';

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
  "entities": string[], // List of core entities/brands/concepts the AI successfully extracted
  "simulatedAnswer": string, // A mock paragraph simulating how the target engine would summarize this page right now
  "recommendations": {
    "title": string, // Short title of the recommendation (e.g. "Add a TL;DR section")
    "impact": "High" | "Medium" | "Low", // The impact this change will have on the citation score
    "tutorial": { // Step-by-step tutorial on how to implement this recommendation
      "stepNumber": number,
      "instruction": string,
      "codeSnippet": string | null // Optional HTML, JSON-LD, or markdown snippet to help the user implement it
    }[]
  }[]
}

Ensure the response is ONLY valid JSON.
`;

interface AeoScanOptions {
  scanId: string;
  projectId: string;
  orgId: string;
  url: string;
  targetQuery: string;
  targetEngine: string;
  targetPersona: string;
}

// Simple background worker for AEO Scan
async function processAeoScanInBackground(options: AeoScanOptions) {
  const { scanId, projectId, orgId, url, targetQuery, targetEngine, targetPersona } = options;
  try {
    const { html } = await fetchHtmlResilient(url);
    const $ = cheerio.load(html);

    $('script, style, noscript, iframe, svg, img').remove();
    const cleanText = $('body').text().replace(/\s{2,}/g, ' ').trim().slice(0, 30000);

    let prompt = AIO_ANALYSIS_PROMPT.replace('{TARGET_QUERY}', targetQuery);
    prompt = prompt.replace('{TARGET_ENGINE}', targetEngine);
    prompt = prompt.replace('{TARGET_PERSONA}', targetPersona);

    const aiResponse = await geminiGenerateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: prompt + wrapUntrustedContent('page content', cleanText) }] }
      ],
      config: {
        responseMimeType: 'application/json',
      }
    });

    if (!aiResponse.text) {
      throw new Error("Empty response from AI");
    }

    const parsed = JSON.parse(stripJsonFences(aiResponse.text));

    const promptTokens = aiResponse.usageMetadata?.promptTokenCount || Math.ceil((prompt.length + cleanText.length) / 4);
    const candidateTokens = aiResponse.usageMetadata?.candidatesTokenCount || Math.ceil((aiResponse.text?.length || 0) / 4);
    const tokensConsumed = aiResponse.usageMetadata?.totalTokenCount || (promptTokens + candidateTokens);

    await db.update(aeoScans).set({
      status: 'completed',
      citationScore: parsed.citationScore || 0,
      entities: parsed.entities || [],
      recommendations: parsed.recommendations || [],
      simulatedAnswer: parsed.simulatedAnswer || '',
      updatedAt: new Date()
    }).where(eq(aeoScans.id, scanId));

    // Record AI token consumption in scans table for billing metering
    await db.insert(scans).values({
      projectId,
      status: 'completed',
      startedAt: new Date(),
      completedAt: new Date(),
      scores: { type: 'aio_intelligence_api', query: targetQuery, citationScore: parsed.citationScore },
      tokensConsumed,
    });

    await logActivity('AIO Scan Executed', 'Project (API)', 'success', undefined, projectId);

    await runAutomationsForEvent(orgId, 'aeo.completed', {
      projectId, url, targetQuery, citationScore: parsed.citationScore ?? null,
    });
  } catch (error: any) {
    console.error("API AIO Analysis failed:", error);
    await db.update(aeoScans).set({ status: 'failed', updatedAt: new Date() }).where(eq(aeoScans.id, scanId)).catch(() => {});
    await logActivity('AIO Scan Executed', 'Project (API)', 'error', undefined, projectId).catch(() => {});
  }
}

export async function GET(request: Request) {
  try {
    const authResult = await validateApiKey(request, 'read:audits');
    if ('error' in authResult) return authResult.error;

    const { apiKey, project, organization, isGlobal } = authResult as any;
    const url = new URL(request.url);
    const requestedProjectId = url.searchParams.get('projectId');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    
    // Resolve project
    const projectResolution = await resolveTargetProject(authResult as AuthResult, requestedProjectId);
    if ('error' in projectResolution) return projectResolution.error;
    const targetProjectId = projectResolution.targetProjectId;

    const scans = await db.query.aeoScans.findMany({
      where: eq(aeoScans.projectId, targetProjectId),
      orderBy: [desc(aeoScans.createdAt)],
      limit: Math.min(limit, 100),
    });

    return NextResponse.json({
      success: true,
      data: scans,
      count: scans.length
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authResult = await validateApiKey(request, 'write:audits');
    if ('error' in authResult) return authResult.error;
    
    const { apiKey, project, organization, isGlobal } = authResult as any;
    const body = await request.json().catch(() => ({}));
    
    // Resolve project
    const projectResolution = await resolveTargetProject(authResult as AuthResult, body.projectId);
    if ('error' in projectResolution) return projectResolution.error;
    const targetProjectId = projectResolution.targetProjectId;

    if (!body.url || !body.targetQuery) {
      return NextResponse.json({ error: 'Missing required fields: url, targetQuery' }, { status: 400 });
    }

    try {
      if (!organization?.id) throw new Error("Organization not found for this key");
      await assertScanAllowed(organization.id);
    } catch (e: any) {
      return NextResponse.json({ error: e.message || 'Payment Required. Upgrade your plan.' }, { status: 402 });
    }

    const targetEngine = body.targetEngine || 'ChatGPT (GPT-4)';
    const targetPersona = body.targetPersona || 'General Audience';

    const [newScan] = await db.insert(aeoScans).values({
      projectId: targetProjectId,
      url: body.url,
      targetQuery: body.targetQuery,
      status: 'running'
    }).returning();

    // Run scan in background
    processAeoScanInBackground({
      scanId: newScan.id,
      projectId: targetProjectId,
      orgId: organization?.id || '',
      url: body.url,
      targetQuery: body.targetQuery,
      targetEngine,
      targetPersona
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      message: 'AEO scan triggered successfully and is running in the background',
      data: newScan
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
