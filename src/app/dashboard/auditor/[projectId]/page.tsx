import { db } from '@/db'
import { projects, projectPages } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { AuditorClient } from './AuditorClient'

export default async function AuditorProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
  });

  if (!project) {
    notFound();
  }

  const pages = await db.query.projectPages.findMany({
    where: eq(projectPages.projectId, projectId),
    orderBy: (projectPages, { desc }) => [desc(projectPages.discoveredAt), desc(projectPages.id)]
  });

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <Link href="/dashboard/auditor">
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs font-medium bg-[#faf9f5] dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27] hover:border-[#cc785c]/40 hover:text-[#cc785c] transition-all">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Content Auditor
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">{project.name} - Content Auditor</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          Analyze {project.websiteUrl} for SEO, grammar, and spelling issues.
        </p>
      </div>

      <AuditorClient projectId={project.id} initialPages={pages} websiteUrl={project.websiteUrl} />
    </div>
  )
}
