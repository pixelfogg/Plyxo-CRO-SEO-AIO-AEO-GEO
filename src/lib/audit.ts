import { db } from '@/db'
import { auditLogs, organizations, organizationMembers, projects } from '@/db/schema'
import { eq } from 'drizzle-orm'

/**
 * Records an entry in the tenant audit log.
 *
 * The org is resolved from the acting user's membership (NOT the first org in
 * the table, which cross-attributed every log). If the org cannot be
 * determined the entry is skipped rather than misattributed.
 */
export async function logActivity(
  action: string,
  resource: string,
  status: 'success' | 'error' = 'success',
  actorOverride?: string,
  projectId?: string,
) {
  try {
    let actorEmail = actorOverride
    let orgId: string | undefined
    let userId: string | undefined

    if (!actorEmail) {
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      actorEmail = user?.email || 'system@plyxo.com'
      userId = user?.id
    }

    // Prefer the org that owns the referenced project.
    if (projectId) {
      const project = await db.query.projects.findFirst({ where: eq(projects.id, projectId) })
      if (project) {
        if (project.organizationId) orgId = project.organizationId
        if (resource === 'Project') resource = project.name
      }
    }

    // Otherwise fall back to the acting user's own org membership.
    if (!orgId && userId) {
      const member = await db.query.organizationMembers.findFirst({
        where: eq(organizationMembers.userId, userId),
      })
      if (member) orgId = member.organizationId
    }

    // Community edition single-tenant fallback: only when exactly one org exists.
    if (!orgId && process.env.NEXT_PUBLIC_IS_CLOUD_EDITION === 'false') {
      const orgs = await db.query.organizations.findMany({ limit: 2 })
      if (orgs.length === 1) orgId = orgs[0].id
    }

    if (!orgId) {
      // No reliable tenant to attribute this to — skip rather than mislabel.
      return
    }

    await db.insert(auditLogs).values({
      orgId,
      actorId: userId,
      actorEmail,
      action,
      resource,
      status,
    })
  } catch (error) {
    console.error('Failed to log activity:', error)
  }
}
