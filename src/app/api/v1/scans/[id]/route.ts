import { NextResponse } from 'next/server';
import { db } from '@/db';
import { scans } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { validateApiKey, resolveTargetProject, AuthResult } from '@/lib/api-auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const authResult = await validateApiKey(request, 'read:audits');
    if ('error' in authResult) return authResult.error;
    
    const resolvedParams = await params;
    const scanId = resolvedParams.id;
    
    // Fetch the scan first to check its projectId
    const scan = await db.query.scans.findFirst({
      where: eq(scans.id, scanId),
      columns: {
        screenshotBase64: false,
      },
      with: {
        issues: true
      }
    });

    if (!scan) {
      return NextResponse.json({ error: 'Scan not found' }, { status: 404 });
    }

    const projectResolution = await resolveTargetProject(authResult as AuthResult, scan.projectId);
    if ('error' in projectResolution || projectResolution.targetProjectId !== scan.projectId) {
      return NextResponse.json({ error: 'Scan not found or access denied' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: scan
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
