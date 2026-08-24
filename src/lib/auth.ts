import 'server-only'
import { db } from '@/db'
import { projects, organizationMembers, organizations, users } from '@/db/schema'
import { eq, and, inArray, or } from 'drizzle-orm'
import { createClient } from '@/lib/supabase/server'

const isCommunityEdition = () => process.env.NEXT_PUBLIC_IS_CLOUD_EDITION !== 'true';

/**
 * Returns the authenticated user or throws. Use at the top of every server
 * action / route handler that mutates or reads tenant-scoped data.
 */
export async function requireUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  return user
}

/**
 * Resolves the caller's organization id. In cloud mode this is the org the
 * user is a member of (throws if they have none). In community edition it
 * lazily provisions a single default workspace + membership for the local user.
 *
 * IMPORTANT: this never falls back to "the first org in the table" — doing so
 * leaked another tenant's integrations/automations.
 */
export async function getCurrentOrgId(userId: string): Promise<string> {
  const member = await db.query.organizationMembers.findFirst({
    where: eq(organizationMembers.userId, userId),
  })
  if (member) return member.organizationId

  if (isCommunityEdition()) {
    // Single-user local install: provision a default workspace on first use.
    const existing = await db.query.organizations.findFirst({
      where: eq(organizations.slug, 'default-workspace'),
    })
    const org = existing ?? (await db.insert(organizations).values({
      name: 'Default Workspace',
      slug: 'default-workspace',
    }).returning())[0]

    await db.insert(organizationMembers).values({
      organizationId: org.id,
      userId,
      role: 'admin',
    }).onConflictDoNothing()

    return org.id
  }

  throw new Error('No organization found for user')
}

/**
 * Verifies the user may access the given project and returns it. Throws
 * "Project not found" (404-ish) or "Forbidden" otherwise.
 *
 * Access = the user personally owns the project (community/personal projects)
 * OR the user is a member of the project's organization (cloud).
 */
export async function assertProjectAccess(projectId: string, userId: string) {
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
  })
  if (!project) throw new Error('Project not found')

  // Local single-user install: the mock user owns everything.
  if (isCommunityEdition()) return project

  if (project.userId && project.userId === userId) return project

  if (project.organizationId) {
    const member = await db.query.organizationMembers.findFirst({
      where: and(
        eq(organizationMembers.userId, userId),
        eq(organizationMembers.organizationId, project.organizationId),
      ),
    })
    if (member) return project
  }

  throw new Error('Forbidden: you do not have access to this project')
}

/**
 * Returns all projects the user may access (personal + every org they belong
 * to). In community edition this is simply all local projects.
 */
export async function getAccessibleProjects(userId: string) {
  if (isCommunityEdition()) {
    return db.query.projects.findMany()
  }

  const memberships = await db.query.organizationMembers.findMany({
    where: eq(organizationMembers.userId, userId),
  })
  const orgIds = memberships.map((m) => m.organizationId)

  if (orgIds.length === 0) {
    return db.query.projects.findMany({
      where: eq(projects.userId, userId),
    })
  }

  return db.query.projects.findMany({
    where: or(
      eq(projects.userId, userId),
      inArray(projects.organizationId, orgIds)
    ),
  })
}

/**
 * Determines whether a user is a superadmin. Superadmin status comes from the
 * user's DB role. An optional `SUPERADMIN_EMAILS` env var (comma-separated,
 * server-only) may bootstrap the first admin — no personal email is hardcoded.
 */
export function isSuperadmin(role: string | null | undefined, email: string | null | undefined): boolean {
  if (role === 'superadmin') return true
  const allowlist = (process.env.SUPERADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  return !!email && allowlist.includes(email.toLowerCase())
}

/**
 * Requires the caller to be a superadmin (cloud), or any local user in
 * community edition. Returns the user. Throws "Forbidden" otherwise.
 */
export async function requireSuperadmin() {
  const user = await requireUser()
  if (isCommunityEdition()) return user
  const dbUser = await db.query.users.findFirst({ where: eq(users.id, user.id) })
  if (!isSuperadmin(dbUser?.role, user.email)) {
    throw new Error('Forbidden: superadmin only')
  }
  return user
}

/** Convenience: require a user AND assert project access in one call. */
export async function requireProjectAccess(projectId: string) {
  const user = await requireUser()
  const project = await assertProjectAccess(projectId, user.id)
  return { user, project }
}

/** Maps an auth/access error to an HTTP status code for route handlers. */
export function authErrorStatus(error: unknown): number {
  const msg = (error as { message?: string })?.message || ''
  if (msg === 'Unauthorized') return 401
  if (msg.startsWith('Forbidden')) return 403
  if (msg === 'Project not found' || msg === 'Page not found') return 404
  return 500
}
