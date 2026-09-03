import { db } from '@/db'
import { projects } from '@/db/schema'
import { desc } from 'drizzle-orm'
import { requireUser, getAccessibleProjects } from '@/lib/auth'
import { ProjectCard } from '@/components/ui/project-card'
import { Button } from '@/components/ui/button'
import { Globe, Plus } from 'lucide-react'
import { CreateProjectDialog } from './create-project-dialog'
import { RadialSpike } from '@/components/claude/RadialSpike'

export default async function ProjectsPage() {
  let safeProjects: any[] = []
  try {
    const user = await requireUser()
    let allProjects = await getAccessibleProjects(user.id)
    if (!allProjects || allProjects.length === 0) {
      allProjects = await db.select().from(projects).orderBy(desc(projects.createdAt))
    }
    safeProjects = (allProjects || []).map(p => ({
      id: String(p.id),
      name: String(p.name),
      websiteUrl: String(p.websiteUrl),
      industry: p.industry ? String(p.industry) : null,
      isUp: typeof p.isUp === 'boolean' ? p.isUp : true,
      createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : null,
    }))
  } catch (err) {
    console.error('[ProjectsPage Load Error]:', err)
    try {
      const fallback = await db.select().from(projects).orderBy(desc(projects.createdAt))
      safeProjects = (fallback || []).map(p => ({
        id: String(p.id),
        name: String(p.name),
        websiteUrl: String(p.websiteUrl),
        industry: p.industry ? String(p.industry) : null,
        isUp: typeof p.isUp === 'boolean' ? p.isUp : true,
        createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : null,
      }))
    } catch {
      safeProjects = []
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 border-b border-[#e6dfd8] dark:border-[#2e2b27] pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#efe9de] dark:bg-[#252320] text-[#cc785c] text-[12px] font-mono mb-2">
            <RadialSpike size={14} />
            <span>CONTINUOUS CRO ANALYTICS</span>
          </div>
          <h1 className="font-serif text-[36px] font-normal tracking-[-0.5px] text-[#141413] dark:text-[#faf9f5]">
            Audits &amp; Digital Properties
          </h1>
          <p className="text-[15px] text-[#3d3d3a] dark:text-[#a09d96] mt-1">
            Manage your monitored domains, inspect AI bounding box analytics, and configure scan frequency.
          </p>
        </div>
        <CreateProjectDialog />
      </div>

      {safeProjects.length === 0 ? (
        <div className="rounded-[16px] border border-dashed border-[#e6dfd8] dark:border-[#2e2b27] bg-[#efe9de]/30 dark:bg-[#252320]/30 p-12 text-center flex flex-col items-center justify-center min-h-[320px]">
          <div className="h-14 w-14 rounded-full bg-[#faf9f5] dark:bg-[#181715] border border-[#e6dfd8] dark:border-[#2e2b27] flex items-center justify-center mb-4 shadow-sm text-[#cc785c]">
            <Globe className="h-7 w-7" />
          </div>
          <h3 className="font-serif text-[24px] font-normal text-[#141413] dark:text-[#faf9f5] mb-2">No monitored domains in workspace</h3>
          <p className="text-[15px] text-[#6c6a64] dark:text-[#8e8b82] max-w-md mb-6 leading-relaxed">
            You haven&apos;t connected any target web architectures yet. Deploy your first property to enable autonomous AI CRO analysis.
          </p>
          <CreateProjectDialog>
            <Button className="bg-[#cc785c] hover:bg-[#a9583e] text-white font-medium px-6 py-2.5 rounded-[8px] h-[42px] shadow-none transition-colors">
              <Plus className="mr-2 h-4 w-4" /> Connect Property
            </Button>
          </CreateProjectDialog>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {safeProjects.map((project) => (
            <ProjectCard 
              key={project.id}
              project={project}
              actionLabel="View Dashboard"
              actionUrl={`/dashboard/projects/${project.id}`}
              actionIcon="arrow-up-right"
            />
          ))}
        </div>
      )}
    </div>
  )
}
