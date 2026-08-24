import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { projectPages, projects, scans } from '@/db/schema';
import { eq } from 'drizzle-orm';
import * as cheerio from 'cheerio';
import { geminiGenerateContent, wrapUntrustedContent, stripJsonFences } from '@/lib/ai/gemini';
import { logActivity } from '@/lib/audit';
import { requireUser, assertProjectAccess, authErrorStatus } from '@/lib/auth';
import { safeFetch } from '@/lib/security';

export const maxDuration = 60; // Max execution time

const ANALYSIS_PROMPT = `
You are an expert SEO specialist, copywriter, and grammarian.
Analyze the provided web page text content.

Please provide a detailed evaluation returning a JSON object following this exact schema:
{
  "seoScore": number, // 0 to 10
  "seoFeedback": string, // general feedback on SEO
  "seoIssues": string[], // list of specific SEO issues found (max 5)
  "grammarScore": number, // 0 to 10
  "grammarFeedback": string, // general feedback on grammar and readability
  "grammarIssues": string[], // list of specific spelling/grammar errors found (max 5)
  "structureScore": number, // 0 to 10
  "structureFeedback": string // feedback on how the content is structured (headers, paragraphs, etc.)
}

Focus strictly on the text content. Output ONLY the JSON.
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pageId } = body;

    if (!pageId) {
      return NextResponse.json({ error: 'Page ID is required' }, { status: 400 });
    }

    const user = await requireUser();

    const page = await db.query.projectPages.findFirst({
      where: eq(projectPages.id, pageId)
    });

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    // Authorize: the page must belong to a project the caller can access.
    await assertProjectAccess(page.projectId, user.id);

    const project = await db.query.projects.findFirst({
      where: eq(projects.id, page.projectId)
    });

    // Fetch page content (SSRF-guarded)
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 10000);
    const res = await safeFetch(page.url, { signal: controller.signal });
    clearTimeout(id);

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch the target URL' }, { status: 400 });
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // Clean up to get text content for the LLM
    $('script, style, noscript, svg, nav, footer, iframe').remove();
    const textContent = $('body').text().replace(/\s{2,}/g, ' ').trim();

    // Call Gemini
    const response = await geminiGenerateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { 
          role: 'user', 
          parts: [
            { text: ANALYSIS_PROMPT + '\n\nPage Title: ' + (page.title || 'Unknown') + wrapUntrustedContent('page content snippet', textContent.slice(0, 35000)) }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
      }
    });

    if (!response.text) {
      throw new Error('No text returned from Gemini');
    }

    const analysisResult = JSON.parse(stripJsonFences(response.text));

    const promptTokens = response.usageMetadata?.promptTokenCount || Math.ceil((ANALYSIS_PROMPT.length + textContent.slice(0, 35000).length) / 4);
    const candidateTokens = response.usageMetadata?.candidatesTokenCount || Math.ceil((response.text.length || 0) / 4);
    const tokensConsumed = response.usageMetadata?.totalTokenCount || (promptTokens + candidateTokens);

    // Update the database
    await db.update(projectPages)
      .set({
        status: 'scanned',
        contentAnalysis: analysisResult
      })
      .where(eq(projectPages.id, pageId));

    // Record AI token consumption in scans table
    await db.insert(scans).values({
      projectId: page.projectId,
      status: 'completed',
      startedAt: new Date(),
      completedAt: new Date(),
      scores: { type: 'content_auditor', pageUrl: page.url, seoScore: analysisResult.seoScore, grammarScore: analysisResult.grammarScore },
      tokensConsumed,
    });

    await logActivity('Content Analysis Executed', page.title || page.url, 'success', undefined, page.projectId);

    return NextResponse.json({ success: true, analysis: analysisResult });

  } catch (error) {
    console.error('Analysis Error:', error);
    const status = authErrorStatus(error);
    return NextResponse.json(
      { error: status === 500 ? 'Failed to analyze content' : (error as Error).message },
      { status }
    );
  }
}
