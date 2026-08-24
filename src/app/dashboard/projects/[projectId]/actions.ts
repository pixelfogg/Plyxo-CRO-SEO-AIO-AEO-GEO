'use server'

import { db } from '@/db'
import { scans, projectPages, projects, uptimeLogs } from '@/db/schema'
import { processScanJob } from '@/lib/scanner/queue'
import { revalidatePath } from 'next/cache'
import { eq, and } from 'drizzle-orm'
import { logActivity } from '@/lib/audit'
import { requireProjectAccess } from '@/lib/auth'
import { assertUrlAllowed } from '@/lib/security'
import { performUptimeCheck } from '@/lib/uptime'

export async function triggerPageScan(projectId: string, pageId: string, url: string) {
  try {
    const { project } = await requireProjectAccess(projectId)

    // The page must belong to this project (prevents cross-project pageId use).
    const page = await db.query.projectPages.findFirst({
      where: and(eq(projectPages.id, pageId), eq(projectPages.projectId, projectId)),
    })
    if (!page) throw new Error('Page not found')

    // Scan the page's own stored URL, not a caller-supplied one.
    const [newScan] = await db.insert(scans).values({
      projectId: projectId,
      pageUrl: page.url,
      status: 'pending',
      startedAt: new Date(),
    }).returning();

    await db.update(projectPages)
      .set({ status: 'scanned' })
      .where(eq(projectPages.id, pageId));

    // Trigger background queue (Simulation)
    processScanJob(newScan.id).catch(console.error);

    await logActivity('Page Scan Triggered', 'Project', 'success', undefined, projectId);

    revalidatePath(`/dashboard/projects/${projectId}`);
    return { success: true, scanId: newScan.id };
  } catch (error: any) {
    console.error('Failed to trigger page scan:', error);
    return { success: false, error: error.message };
  }
}

export async function pingProject(projectId: string) {
  const { project } = await requireProjectAccess(projectId)

  if (!project.websiteUrl) {
    throw new Error('Project has no website URL')
  }

  await performUptimeCheck(projectId, project.websiteUrl, project.organizationId)

  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath(`/dashboard/projects`);
}
