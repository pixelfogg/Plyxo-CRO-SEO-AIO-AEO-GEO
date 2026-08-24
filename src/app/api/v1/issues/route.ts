import { NextResponse } from 'next/server';
import { db } from '@/db';
import { scanIssues, projects, scans } from '@/db/schema';
import { eq, desc, and, inArray } from 'drizzle-orm';
import { validateApiKey, resolveTargetProject, AuthResult } from '@/lib/api-auth';

export async function GET(request: Request) {
  try {
    const authResult = await validateApiKey(request, 'read:audits');
    if ('error' in authResult) return authResult.error;

    const { project, organization, isGlobal } = authResult as any;
    
    const url = new URL(request.url);
    const requestedProjectId = url.searchParams.get('projectId');
    const severity = url.searchParams.get('severity'); // "critical", "warning", "info"
    
    const projectResolution = await resolveTargetProject(authResult as AuthResult, requestedProjectId);
    if ('error' in projectResolution) return projectResolution.error;
    const targetProjectId = projectResolution.targetProjectId;

    // First find the latest scan for this project
    const latestScan = await db.query.scans.findFirst({
      where: eq(scans.projectId, targetProjectId),
      orderBy: [desc(scans.createdAt)],
      columns: { id: true },
    });

    if (!latestScan) {
       return NextResponse.json({ success: true, data: [], count: 0 });
    }

    // Build query conditions for issues belonging to this latest scan
    const conditions = [eq(scanIssues.scanId, latestScan.id)];
    
    if (severity) {
      conditions.push(eq(scanIssues.severity, severity));
    }

    const issues = await db.query.scanIssues.findMany({
      where: and(...conditions),
      orderBy: [desc(scanIssues.createdAt)],
      limit: 100, // Hard limit for safety
    });

    return NextResponse.json({
      success: true,
      data: issues,
      count: issues.length
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
