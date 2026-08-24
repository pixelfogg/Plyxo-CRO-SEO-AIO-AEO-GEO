import { NextResponse } from 'next/server';
import { db } from '@/db';
import { keywordOpportunities, projects } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { validateApiKey, resolveTargetProject, AuthResult } from '@/lib/api-auth';

export async function GET(request: Request) {
  try {
    const authResult = await validateApiKey(request, 'read:audits');
    if ('error' in authResult) return authResult.error;

    const { project, organization, isGlobal } = authResult as any;
    
    const url = new URL(request.url);
    const requestedProjectId = url.searchParams.get('projectId');
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    
    const projectResolution = await resolveTargetProject(authResult as AuthResult, requestedProjectId);
    if ('error' in projectResolution) return projectResolution.error;
    const targetProjectId = projectResolution.targetProjectId;

    const keywords = await db.query.keywordOpportunities.findMany({
      where: eq(keywordOpportunities.projectId, targetProjectId),
      orderBy: [desc(keywordOpportunities.volume)],
      limit,
    });

    return NextResponse.json({
      success: true,
      data: keywords,
      count: keywords.length
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authResult = await validateApiKey(request, 'write:audits'); // Assuming write:audits or write:projects
    if ('error' in authResult) return authResult.error;

    const { project, organization, isGlobal } = authResult as any;
    const body = await request.json().catch(() => ({}));

    const projectResolution = await resolveTargetProject(authResult as AuthResult, body.projectId);
    if ('error' in projectResolution) return projectResolution.error;
    const targetProjectId = projectResolution.targetProjectId;

    if (!body.keyword) {
      return NextResponse.json({ error: 'Missing required field: keyword' }, { status: 400 });
    }

    const [newKeyword] = await db.insert(keywordOpportunities).values({
      projectId: targetProjectId,
      keyword: body.keyword,
      volume: body.volume || null,
      intent: body.intent || null,
      kd: body.kd || null,
    }).returning();

    return NextResponse.json({
      success: true,
      message: 'Keyword added successfully',
      data: newKeyword
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
