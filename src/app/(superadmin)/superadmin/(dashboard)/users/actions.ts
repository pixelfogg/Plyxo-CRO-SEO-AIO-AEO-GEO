'use server'

import { db } from '@/db'
import { users, organizationMembers, projects, blogs, auditLogs } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { requireSuperadmin } from '@/lib/auth'
import { logActivity } from '@/lib/audit'

async function superadminCount(): Promise<number> {
  const admins = await db.query.users.findMany({ where: eq(users.role, 'superadmin') })
  return admins.length
}

export async function setUserRole(userId: string, role: 'user' | 'superadmin') {
  try {
    const actor = await requireSuperadmin()
    const safeRole = role === 'superadmin' ? 'superadmin' : 'user'

    const target = await db.query.users.findFirst({ where: eq(users.id, userId) })
    if (!target) throw new Error('User not found')

    // Don't allow removing the last superadmin (including self-demotion).
    if (target.role === 'superadmin' && safeRole !== 'superadmin' && (await superadminCount()) <= 1) {
      throw new Error('Cannot demote the last superadmin.')
    }

    await db.update(users).set({ role: safeRole, updatedAt: new Date() }).where(eq(users.id, userId))
    await logActivity('Changed User Role', `${target.email} -> ${safeRole}`, 'success', actor.email ?? undefined)

    revalidatePath('/superadmin/users')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteUser(userId: string) {
  try {
    const actor = await requireSuperadmin()

    if (actor.id === userId) throw new Error('You cannot delete your own account.')

    const target = await db.query.users.findFirst({ where: eq(users.id, userId) })
    if (!target) throw new Error('User not found')

    if (target.role === 'superadmin' && (await superadminCount()) <= 1) {
      throw new Error('Cannot delete the last superadmin.')
    }

    // Clear/relocate references before deleting (nullable FKs are set null;
    // NOT NULL memberships are removed) so the delete doesn't violate FKs.
    await db.transaction(async (tx) => {
      await tx.delete(organizationMembers).where(eq(organizationMembers.userId, userId))
      await tx.update(projects).set({ userId: null }).where(eq(projects.userId, userId))
      await tx.update(blogs).set({ authorId: null }).where(eq(blogs.authorId, userId))
      await tx.update(auditLogs).set({ actorId: null }).where(eq(auditLogs.actorId, userId))
      await tx.delete(users).where(eq(users.id, userId))
    })

    await logActivity('Deleted User', target.email, 'success', actor.email ?? undefined)

    revalidatePath('/superadmin/users')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
