import { NextResponse } from 'next/server';
import { db } from '@/db';
import { scans } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { processScanJob } from '@/lib/scanner/queue';
import { requireUser, assertProjectAccess } from '@/lib/auth';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ scanId: string }> }
) {
  const { scanId } = await params;

  try {
    const user = await requireUser();

    const scan = await db.query.scans.findFirst({
      where: eq(scans.id, scanId),
      columns: {
        id: true,
        projectId: true,
        status: true,
      }
    });

    if (!scan) {
      return NextResponse.json({ error: 'Scan not found' }, { status: 404 });
    }

    await assertProjectAccess(scan.projectId, user.id);

    if (scan.status === 'completed') {
      return NextResponse.json({ success: true, message: 'Scan already completed' });
    }

    // Run the scan job synchronously in this dedicated HTTP function
    await processScanJob(scanId);

    return NextResponse.json({ success: true, message: 'Scan processed successfully' });
  } catch (error: any) {
    console.error(`[Process Route] Error executing scan ${scanId}:`, error);
    return NextResponse.json({ error: error.message || 'Failed to process scan' }, { status: 500 });
  }
}
