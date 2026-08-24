import { db } from '@/db'
import { projects, deadLinks } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { LinkCheckerClient } from './LinkCheckerClient'

export default async function LinkCheckerProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
  });

  if (!project) {
    notFound();
  }

  const existingDeadLinks = await db.query.deadLinks.findMany({
    where: eq(deadLinks.projectId, projectId),
    orderBy: [desc(deadLinks.createdAt)]
  });

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <Link href="/dashboard/link-checker">
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs font-medium bg-[#faf9f5] dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27] hover:border-[#cc785c]/40 hover:text-[#cc785c] transition-all">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Link Checker
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">{project.name} - Dead Link Checker</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          Crawl {project.websiteUrl} to automatically find broken internal and external links.
        </p>
      </div>

      <LinkCheckerClient projectId={project.id} initialDeadLinks={existingDeadLinks} websiteUrl={project.websiteUrl} />
    </div>
  )
}
