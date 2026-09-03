import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/db'
import { projects, scans, projectPages, uptimeLogs, scanIssues } from '@/db/schema'
import { eq, desc, inArray } from 'drizzle-orm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Globe, Activity, ExternalLink, Palette } from 'lucide-react'
import { processScanJob } from '@/lib/scanner/queue'
import { revalidatePath } from 'next/cache'
import { after } from 'next/server'
import { TrendChart } from './TrendChart'
import { ScanHistoryList } from './ScanHistoryList'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RunScanButton } from './RunScanButton'
import { UptimeModalButton } from './UptimeModalButton'
import { ProjectPagesTab } from './ProjectPagesTab'
import { ProjectHeaderActions } from './ProjectHeaderActions'
import { ProjectAEOTab } from './ProjectAEOTab'
import { ActiveScanBanner } from './ActiveScanBanner'
import { assertScanAllowed } from '@/lib/billing/quota'
import { fetchRemoteProject, fetchRemoteScans, fetchRemotePages, fetchRemoteUptimeLogs } from '@/lib/supabase-admin'

export const maxDuration = 60;

export default async function ProjectDetailsPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params;

  if (projectId === 'new') {
    redirect('/dashboard/projects');
  }
  
  let project: any = null
  let projectScans: any[] = []
  let activeScan: any = null
  let pages: any[] = []
  let sortedLogs: any[] = []

  try {
    try {
      project = await db.query.projects.findFirst({
        where: eq(projects.id, projectId)
      })

      if (!project) {
        const [found] = await db.select().from(projects).where(eq(projects.id, projectId));
        project = found || null;
      }
    } catch (e) {
      console.warn('[Direct DB Project Query Warning]:', e);
    }

    if (!project) {
      project = await fetchRemoteProject(projectId);
    }

    if (!project) {
      notFound()
    }

    let allScansRaw: any[] = [];
    try {
      allScansRaw = await db.query.scans.findMany({
        where: eq(scans.projectId, projectId),
        orderBy: [desc(scans.createdAt)],
        limit: 50,
        columns: {
          screenshotBase64: false,
        }
      });
    } catch (e) {
      console.warn('[Direct DB Scans Query Warning]:', e);
    }

    if (allScansRaw.length === 0) {
      allScansRaw = await fetchRemoteScans(projectId);
    }

    // Exclude SEO Intelligence and AEO Intelligence scans from the main CRO dashboard
    const projectScansRaw = allScansRaw.filter(scan => {
      const scores = scan.scores as Record<string, any> || {};
      return scores.siteHealth === undefined && scores.technical === undefined && scores.aeo === undefined;
    });

    projectScans = projectScansRaw.map(s => ({
      ...s,
      createdAt: s.createdAt ? new Date(s.createdAt).toISOString() : null,
      startedAt: s.startedAt ? new Date(s.startedAt).toISOString() : null,
      completedAt: s.completedAt ? new Date(s.completedAt).toISOString() : null,
    }));

    // Find any scan currently executing in the background
    activeScan = projectScans.find(s => s.status === 'pending' || s.status === 'running') || null;

    let rawPages: any[] = [];
    try {
      rawPages = await db.query.projectPages.findMany({
        where: eq(projectPages.projectId, projectId),
        orderBy: [desc(projectPages.discoveredAt)],
        limit: 100
      });
    } catch {}

    if (rawPages.length === 0) {
      rawPages = await fetchRemotePages(projectId);
    }

    pages = rawPages.map(p => ({
      ...p,
      discoveredAt: p.discoveredAt ? new Date(p.discoveredAt).toISOString() : null,
    }));

    let logs: any[] = [];
    try {
      logs = await db.query.uptimeLogs.findMany({
        where: eq(uptimeLogs.projectId, projectId),
        orderBy: [desc(uptimeLogs.createdAt)],
        limit: 30
      });
    } catch {}

    if (logs.length === 0) {
      logs = await fetchRemoteUptimeLogs(projectId);
    }
    
    sortedLogs = logs
      .map(l => ({
        ...l,
        createdAt: l.createdAt ? new Date(l.createdAt).toISOString() : null,
      }))
      .sort((a, b) => (a.createdAt && b.createdAt ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() : 0));
  } catch (err: any) {
    if (err?.message === 'NEXT_NOT_FOUND' || err?.digest?.includes('NEXT_NOT_FOUND')) {
      notFound()
    }
    console.error('[ProjectDetailsPage fetch error]:', err)
    if (!project) {
      project = await fetchRemoteProject(projectId);
    }
  }

  if (!project) {
    notFound()
  }

  const hasActiveScan = Boolean(activeScan);

  async function triggerScan() {
    'use server'
    if (project?.organizationId) {
      await assertScanAllowed(project.organizationId);
    }

    // 1. Create a new pending scan in the DB
    const [newScan] = await db.insert(scans).values({
      projectId: projectId,
      status: 'pending',
      startedAt: new Date(),
    }).returning();

    // 2. Trigger background queue using Next.js after() to keep serverless container alive
    after(async () => {
      await processScanJob(newScan.id).catch(console.error);
    });

    revalidatePath(`/dashboard/projects/${projectId}`);
  }

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <Link href="/dashboard/projects">
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs font-medium bg-[#faf9f5] dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27] hover:border-[#cc785c]/40 hover:text-[#cc785c] transition-all">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Projects
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border mt-2 ${project.isUp !== false ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'}`}>
              <span className={`relative flex h-2 w-2`}>
                {project.isUp !== false && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${project.isUp !== false ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
              </span>
              {project.isUp !== false ? 'Operational' : 'Down'}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2 text-zinc-500">
            <Globe className="h-4 w-4" />
            <a href={project.websiteUrl} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
              {project.websiteUrl} <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/projects/${projectId}/brand-guide`}>
            <Button variant="outline" className="flex items-center gap-2 h-9 border-zinc-200 dark:border-zinc-800">
              <Palette className="h-4 w-4" /> View Brand Guide
            </Button>
          </Link>
          <UptimeModalButton 
            logs={sortedLogs} 
            projectId={projectId} 
            isUp={project.isUp} 
            lastPingedAt={project.lastPingedAt} 
          />
          <ProjectHeaderActions projectId={projectId} hasMultipleScans={projectScans.length > 1} />
          <RunScanButton action={triggerScan} hasActiveScan={hasActiveScan} />
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList variant="pill">
          <TabsTrigger value="overview">Overview & Scans</TabsTrigger>
          <TabsTrigger value="pages">Discovered Pages <Badge variant="secondary" className="ml-2 bg-zinc-200 dark:bg-zinc-800">{pages.length}</Badge></TabsTrigger>
          <TabsTrigger value="aeo">AEO / GEO Intelligence</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">

          {/* Active Persistent Background Scan Banner */}
          {activeScan && (
            <ActiveScanBanner 
              scan={activeScan} 
              projectId={projectId} 
              websiteUrl={project.websiteUrl} 
            />
          )}

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2 shadow-sm">
              <CardHeader>
                <CardTitle>Scan History</CardTitle>
                <CardDescription>
                  All automated and manual CRO scans run on this property.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScanHistoryList scans={projectScans} projectId={projectId} />
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Conversion Score Trend</CardTitle>
                <CardDescription>Historical performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <TrendChart scans={projectScans} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pages">
          <ProjectPagesTab projectId={projectId} initialPages={pages} />
        </TabsContent>

        <TabsContent value="aeo">
          <ProjectAEOTab projectId={projectId} initialData={project} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
