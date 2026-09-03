import { db } from '@/db'
import { projects, uptimeLogs } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { assertUrlAllowed } from '@/lib/security'
import { runAutomationsForEvent } from '@/lib/automations/engine'

export async function performUptimeCheck(projectId: string, websiteUrl: string, organizationId: string | null) {
  // Real uptime ping (SSRF-guarded). No mock/random history is ever seeded —
  // the uptime chart reflects only genuine checks.
  const startTime = Date.now();
  let isUp = false;
  let responseTime = 0;

  try {
    const safeUrl = await assertUrlAllowed(websiteUrl)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const res = await fetch(safeUrl, {
      method: 'GET',
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timeoutId);

    isUp = res.ok;
    responseTime = Date.now() - startTime;
  } catch (error) {
    isUp = false;
    responseTime = 0;
  }

  await db.insert(uptimeLogs).values({
    projectId,
    status: isUp ? 'up' : 'down',
    responseTime,
    createdAt: new Date(),
  });

  await db.update(projects)
    .set({ isUp, lastPingedAt: new Date() })
    .where(eq(projects.id, projectId));

  // Emit a downtime event so uptime automations can fire.
  if (!isUp && organizationId) {
    await runAutomationsForEvent(organizationId, 'uptime.down', { projectId, url: websiteUrl });
  }

  return isUp;
}
