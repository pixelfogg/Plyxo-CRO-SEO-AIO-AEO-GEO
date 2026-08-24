import { NextResponse } from "next/server";
import { db } from "@/db";
import { scans } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireUser, assertProjectAccess } from "@/lib/auth";
import { processScanJob } from "@/lib/scanner/queue";

export async function GET(
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
        scores: true,
        startedAt: true,
        createdAt: true,
      }
    });

    if (!scan) {
      return NextResponse.json({ error: "Scan not found" }, { status: 404 });
    }

    // Only return status for scans belonging to a project the caller can access.
    await assertProjectAccess(scan.projectId, user.id);

    // Auto-heal: If a scan is still in pending state when status is polled, ensure background worker is kicked off
    if (scan.status === 'pending') {
      processScanJob(scanId).catch((err) => console.error('[Status Route Auto-Heal Error]:', err));
    }

    // Guard against dangling/stalled in-memory promises if the server restarted
    if (scan.status === 'pending' || scan.status === 'running') {
      const startTime = scan.startedAt || scan.createdAt;
      if (startTime) {
        const elapsedSeconds = (Date.now() - new Date(startTime).getTime()) / 1000;
        // If a scan has exceeded 120 seconds without completing, mark as failed
        if (elapsedSeconds > 120) {
          await db.update(scans).set({
            status: 'failed',
            completedAt: new Date(),
          }).where(eq(scans.id, scanId));

          return NextResponse.json({
            status: 'failed',
            scores: scan.scores,
            error: 'Scan timed out',
          });
        }
      }
    }

    return NextResponse.json({
      status: scan.status,
      scores: scan.scores,
    });
  } catch (error: any) {
    const status = error?.message === "Unauthorized" ? 401
      : error?.message?.startsWith("Forbidden") ? 403
      : 500;
    return NextResponse.json({ error: status === 500 ? "Failed to fetch status" : error.message }, { status });
  }
}
