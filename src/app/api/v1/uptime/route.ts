import { NextResponse } from 'next/server';
import { db } from '@/db';
import { uptimeLogs, projects } from '@/db/schema';
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

    const logs = await db.query.uptimeLogs.findMany({
      where: eq(uptimeLogs.projectId, targetProjectId),
      orderBy: [desc(uptimeLogs.createdAt)],
      limit,
    });

    return NextResponse.json({
      success: true,
      data: logs,
      count: logs.length
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
