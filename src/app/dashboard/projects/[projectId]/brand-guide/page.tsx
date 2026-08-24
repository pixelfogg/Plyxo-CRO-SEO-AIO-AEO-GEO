import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/db'
import { projects } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { BrandGuideView } from './BrandGuideView'

export default async function BrandGuidePage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params;

  if (projectId === 'new') {
    redirect('/dashboard/projects');
  }
  
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId)
  })

  if (!project) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <Link href={`/dashboard/projects/${projectId}`}>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs font-medium bg-[#faf9f5] dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27] hover:border-[#cc785c]/40 hover:text-[#cc785c] transition-all">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Project
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Brand Guide: {project.name}</h1>
          <p className="text-zinc-500 mt-2">
            Automatically extracted design tokens and visual identity rules.
          </p>
        </div>
      </div>

      <BrandGuideView projectId={projectId} initialProject={project} />
    </div>
  )
}
