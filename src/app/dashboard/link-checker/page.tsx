import { db } from '@/db'
import { projects } from '@/db/schema'
import Link from 'next/link'
import { ProjectCard } from '@/components/ui/project-card'
import { ExternalLink, ChevronRight, Activity, Link as LinkIcon } from 'lucide-react'
import { RadialSpike } from '@/components/claude/RadialSpike'

export const dynamic = 'force-dynamic';

export default async function LinkCheckerPage() {
  const allProjects = await db.query.projects.findMany({
    orderBy: (projects, { desc }) => [desc(projects.createdAt)]
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 border-b border-[#e6dfd8] dark:border-[#2e2b27] pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#efe9de] dark:bg-[#252320] text-zinc-500 dark:text-zinc-400 text-[12px] font-mono mb-2">
            <RadialSpike size={14} />
            <span>DEAD LINK CRAWLER</span>
          </div>
          <h1 className="font-serif text-[36px] font-normal tracking-[-0.5px] text-[#141413] dark:text-[#faf9f5]">
            Dead Link Checker
          </h1>
          <p className="text-[15px] text-[#3d3d3a] dark:text-[#a09d96] mt-1">
            Select a project to crawl its website and find broken internal or external links.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {allProjects.map(project => (
          <ProjectCard 
            key={project.id}
            project={project}
            actionLabel="Open Link Checker"
            actionUrl={`/dashboard/link-checker/${project.id}`}
            actionIcon="arrow-right"
          />
        ))}

        {allProjects.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg border-zinc-200 dark:border-zinc-800">
            <Activity className="h-8 w-8 text-zinc-400 mb-4" />
            <h3 className="text-lg font-medium mb-1">No projects found</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 text-center max-w-sm">
              You need to create a project first before you can check for dead links.
            </p>
            <Link href="/dashboard/projects">
              <span className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-[#181715] text-[#faf9f5] hover:bg-[#181715]/90 dark:bg-[#faf9f5] dark:text-[#141413] dark:hover:bg-[#faf9f5]/90 h-10 px-4 py-2">
                Create Project
              </span>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
