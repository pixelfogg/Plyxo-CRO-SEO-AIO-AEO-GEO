import { NextResponse } from 'next/server';
import { db } from '@/db';
import { scans, aeoScans } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { validateApiKey, resolveTargetProject, AuthResult } from '@/lib/api-auth';

export async function GET(request: Request) {
  try {
    const authResult = await validateApiKey(request, 'read:audits');
    if ('error' in authResult) return authResult.error;

    const url = new URL(request.url);
    const requestedProjectId = url.searchParams.get('projectId');
    
    const projectResolution = await resolveTargetProject(authResult as AuthResult, requestedProjectId);
    if ('error' in projectResolution) return projectResolution.error;
    
    const targetProjectId = projectResolution.targetProjectId!;

    // Fetch the latest SEO Scan
    const latestSeoScans = await db.query.scans.findMany({
      where: eq(scans.projectId, targetProjectId),
      orderBy: [desc(scans.createdAt)],
      limit: 1,
      columns: {
        screenshotBase64: false,
      },
      with: {
        issues: true
      }
    });

    // Fetch the latest AIO Scan
    const latestAioScans = await db.query.aeoScans.findMany({
      where: eq(aeoScans.projectId, targetProjectId),
      orderBy: [desc(aeoScans.createdAt)],
      limit: 1
    });

    return NextResponse.json({
      success: true,
      projectId: targetProjectId,
      seoScan: latestSeoScans[0] || null,
      aioScan: latestAioScans[0] || null,
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
