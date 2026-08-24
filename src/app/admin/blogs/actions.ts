'use server'

import { db } from '@/db'
import { blogs } from '@/db/schema'
import { eq, desc, isNotNull } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { requireSuperadmin } from '@/lib/auth'
import { logActivity } from '@/lib/audit'

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

/** All posts (admin view — includes drafts), newest first. */
export async function getBlogs() {
  try {
    await requireSuperadmin()
    const rows = await db.query.blogs.findMany({ orderBy: [desc(blogs.updatedAt)] })
    return { success: true, blogs: rows }
  } catch (error: any) {
    return { success: false, error: error.message, blogs: [] as typeof blogs.$inferSelect[] }
  }
}

/** Create or update a post. `publish` toggles publishedAt. */
export async function saveBlog(input: {
  id?: string
  title: string
  slug?: string
  content: string
  publish: boolean
}) {
  try {
    const user = await requireSuperadmin()

    const title = input.title?.trim()
    const content = input.content?.trim()
    if (!title || !content) throw new Error('Title and content are required')

    const slug = slugify(input.slug?.trim() || title)
    if (!slug) throw new Error('Could not derive a valid slug')

    // Enforce unique slug (excluding the post being edited).
    const existing = await db.query.blogs.findFirst({ where: eq(blogs.slug, slug) })
    if (existing && existing.id !== input.id) {
      throw new Error(`A post with slug "${slug}" already exists`)
    }

    const publishedAt = input.publish ? new Date() : null

    if (input.id) {
      await db.update(blogs)
        .set({ title, slug, content, publishedAt, updatedAt: new Date() })
        .where(eq(blogs.id, input.id))
    } else {
      await db.insert(blogs).values({ title, slug, content, authorId: user.id, publishedAt })
    }

    await logActivity(input.publish ? 'Published Blog Post' : 'Saved Blog Draft', title)

    revalidatePath('/admin/blogs')
    revalidatePath('/blog')
    revalidatePath(`/blog/${slug}`)
    return { success: true, slug }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteBlog(id: string) {
  try {
    await requireSuperadmin()
    await db.delete(blogs).where(eq(blogs.id, id))
    await logActivity('Deleted Blog Post', 'Blog ID: ' + id)
    revalidatePath('/admin/blogs')
    revalidatePath('/blog')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/** Published posts for the public site, newest first. */
export async function getPublishedBlogs() {
  return db.query.blogs.findMany({
    where: isNotNull(blogs.publishedAt),
    orderBy: [desc(blogs.publishedAt)],
  })
}

export async function getBlogBySlug(slug: string) {
  return db.query.blogs.findFirst({ where: eq(blogs.slug, slug) })
}
