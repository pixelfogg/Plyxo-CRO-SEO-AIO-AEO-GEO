import { NextResponse } from 'next/server';
import { db } from '@/db';
import { competitors, projects } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { validateApiKey, resolveTargetProject, AuthResult } from '@/lib/api-auth';

export async function GET(request: Request) {
  try {
    const authResult = await validateApiKey(request, 'read:audits');
    if ('error' in authResult) return authResult.error;

    const { project, organization, isGlobal } = authResult as any;
    
    const url = new URL(request.url);
    const requestedProjectId = url.searchParams.get('projectId');
    
    const projectResolution = await resolveTargetProject(authResult as AuthResult, requestedProjectId);
    if ('error' in projectResolution) return projectResolution.error;
    const targetProjectId = projectResolution.targetProjectId;

    const comps = await db.query.competitors.findMany({
      where: eq(competitors.projectId, targetProjectId),
      with: {
        keywordGaps: true
      }
    });

    return NextResponse.json({
      success: true,
      data: comps,
      count: comps.length
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

    const { project, organization, isGlobal } = authResult as any;
    const body = await request.json().catch(() => ({}));
    
    const projectResolution = await resolveTargetProject(authResult as AuthResult, body.projectId);
    if ('error' in projectResolution) return projectResolution.error;
    const targetProjectId = projectResolution.targetProjectId;

    if (!body.name || !body.url) {
      return NextResponse.json({ error: 'Missing required fields: name, url' }, { status: 400 });
    }

    const [newCompetitor] = await db.insert(competitors).values({
      projectId: targetProjectId,
      name: body.name,
      url: body.url,
      da: body.da || null,
    }).returning();

    return NextResponse.json({
      success: true,
      message: 'Competitor added successfully',
      data: newCompetitor
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
