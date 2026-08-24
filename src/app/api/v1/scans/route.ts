import { NextResponse, after } from 'next/server';
import { db } from '@/db';
import { scans, projects } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { validateApiKey, resolveTargetProject, AuthResult } from '@/lib/api-auth';
import { processScanJob } from '@/lib/scanner/queue';

export const maxDuration = 60;

export async function GET(request: Request) {
  try {
    const authResult = await validateApiKey(request, 'read:audits');
    if ('error' in authResult) return authResult.error;

    const { project, organization, isGlobal } = authResult as any;
    
    const url = new URL(request.url);
    const requestedProjectId = url.searchParams.get('projectId');
    const limitParam = url.searchParams.get('limit') || '10';
    const limit = parseInt(limitParam, 10);
    
    const projectResolution = await resolveTargetProject(authResult as AuthResult, requestedProjectId);
    if ('error' in projectResolution) return projectResolution.error;
    const targetProjectId = projectResolution.targetProjectId;

    const pastScans = await db.query.scans.findMany({
      where: eq(scans.projectId, targetProjectId),
      orderBy: [desc(scans.createdAt)],
      limit: limit,
      columns: {
        screenshotBase64: false,
      }
    });

    return NextResponse.json({
      success: true,
      data: pastScans,
      count: pastScans.length
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    let authResult = await validateApiKey(request, 'trigger:scan');
    if ('error' in authResult) {
      authResult = await validateApiKey(request, 'write:audits');
      if ('error' in authResult) return authResult.error;
    }

    const { project, organization, isGlobal } = authResult as any;
    
    const body = await request.json().catch(() => ({}));
    
    const projectResolution = await resolveTargetProject(authResult as AuthResult, body.projectId);
    if ('error' in projectResolution) return projectResolution.error;
    const targetProjectId = projectResolution.targetProjectId;

    // Trigger scan logic - insert a new scan record marked as pending
    const [newScan] = await db.insert(scans).values({
      projectId: targetProjectId,
      status: 'pending',
    }).returning();

    // Kick off the background worker safely using after() to prevent premature serverless teardown
    after(async () => {
      await processScanJob(newScan.id).catch(console.error);
    });

    return NextResponse.json({
      success: true,
      message: 'Scan triggered successfully and is running in the background',
      data: newScan
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
