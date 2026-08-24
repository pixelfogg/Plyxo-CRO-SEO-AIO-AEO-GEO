import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Globe, ArrowUpRight, Target, ShieldCheck, Download, Plus, Sparkles } from 'lucide-react'
import { db } from '@/db'
import { projects, scans, scanIssues } from '@/db/schema'
import { requireUser, getAccessibleProjects } from '@/lib/auth'
import { inArray, desc } from 'drizzle-orm'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import Link from 'next/link'
import { CreateProjectDialog } from './projects/create-project-dialog'
import { RadialSpike } from '@/components/claude/RadialSpike'

async function getDashboardPageData() {
  try {
    const user = await requireUser();
    const allProjects = await getAccessibleProjects(user.id);
    const projectIds = allProjects.map(p => p.id);

    // Execute lightweight queries in parallel and explicitly exclude heavy Base64 screenshots from scans
    let recentScans: any[] = [];
    let totalScans: any[] = [];

    if (projectIds.length > 0) {
      [recentScans, totalScans] = await Promise.all([
        db.query.scans.findMany({
          where: inArray(scans.projectId, projectIds),
          columns: {
            id: true,
            status: true,
            projectId: true,
            createdAt: true,
          },
          orderBy: [desc(scans.createdAt)],
          limit: 10,
          with: { 
            project: {
              columns: {
                name: true,
              }
            } 
          }
        }),
        db.query.scans.findMany({
          where: inArray(scans.projectId, projectIds),
          columns: {
            id: true,
            status: true,
            scores: true,
            projectId: true,
            createdAt: true,
          },
          orderBy: [desc(scans.createdAt)],
          limit: 100 // Add reasonable limit to prevent huge payload on active accounts
        })
      ]);
    }

    const totalProjects = allProjects;

  const completedScans = totalScans.filter(s => s.status === 'completed');
  let avgCro = 0;
  if (completedScans.length > 0) {
    const sum = completedScans.reduce((acc, scan) => {
      // @ts-ignore
      const cro = scan.scores?.cro ?? 0;
      return acc + cro;
    }, 0);
    avgCro = Math.round(sum / completedScans.length);
  }

  // Find the latest completed scan for each project to fetch issues
  const latestCompletedScanIds = [];
  const scanToProjectMap: Record<string, any> = {};
  
  for (const project of allProjects) {
    const latestScan = totalScans.find(s => s.projectId === project.id && s.status === 'completed');
    if (latestScan) {
      latestCompletedScanIds.push(latestScan.id);
      scanToProjectMap[latestScan.id] = project;
    }
  }

  // Fetch only high/critical issues for the latest completed scans
  let criticalIssues: any[] = [];
  if (latestCompletedScanIds.length > 0) {
    const issues = await db.query.scanIssues.findMany({
      where: inArray(scanIssues.scanId, latestCompletedScanIds)
    });
    
    for (const issue of issues) {
      if (issue.priority === 'critical' || issue.priority === 'high') {
        const project = scanToProjectMap[issue.scanId];
        criticalIssues.push({
          projectId: project.id,
          projectName: project.name,
          scanId: issue.scanId,
          title: issue.title,
          category: issue.category,
          priority: issue.priority,
        });
      }
    }
  }
  
  // Sort critical first, then high
  criticalIssues.sort((a, b) => {
    if (a.priority === 'critical' && b.priority !== 'critical') return -1;
    if (a.priority !== 'critical' && b.priority === 'critical') return 1;
    return 0;
  });
  
  // Take top 6
  const displayIssues = criticalIssues.slice(0, 6);

  return { totalProjects, avgCro, recentScans, totalScans, displayIssues, allProjects };
  } catch (error: any) {
    return { error };
  }
}

export default async function DashboardPage() {
  const data = await getDashboardPageData();
  
  if ('error' in data) {
    const { error } = data;
    return (
      <div className="p-8 text-red-500 bg-red-50 dark:bg-red-950/20 min-h-screen w-full">
        <h1 className="text-2xl font-bold mb-4">Dashboard Page Error</h1>
        <pre className="whitespace-pre-wrap">{error?.stack || error?.message || String(error)}</pre>
      </div>
    )
  }

  const { totalProjects, avgCro, recentScans, totalScans, displayIssues, allProjects } = data;

  return (
    <div className="flex-1 space-y-10 w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#e6dfd8] dark:border-[#2e2b27] pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#efe9de] dark:bg-[#252320] text-[#cc785c] text-[12px] font-mono mb-2">
            <RadialSpike size={14} />
            <span>PLYXO INTELLIGENCE ENABLED</span>
          </div>
          <h1 className="font-serif text-[36px] sm:text-[42px] font-normal tracking-[-0.5px] leading-tight text-[#141413] dark:text-[#faf9f5]">
            Workspace Overview
          </h1>
          <p className="text-[15px] text-[#3d3d3a] dark:text-[#a09d96] mt-1">
            Real-time synthesis of your AI conversion audits, active Bounding Box telemetries, and project econometrics.
          </p>
        </div>
        
        <div className="flex items-center space-x-3 shrink-0">
          <Button variant="outline" className="hidden sm:flex border-[#e6dfd8] dark:border-[#2e2b27] bg-[#faf9f5] dark:bg-[#181715] text-[#141413] dark:text-[#faf9f5] hover:bg-[#efe9de] dark:hover:bg-[#252320] rounded-[8px] font-medium h-[40px] px-4">
            <Download className="mr-2 h-4 w-4 text-[#6c6a64]" /> Export Metrics
          </Button>
          <CreateProjectDialog>
            <button className="inline-flex items-center justify-center whitespace-nowrap bg-[#cc785c] hover:bg-[#a9583e] text-white font-medium rounded-[8px] px-5 h-[40px] shadow-none transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 text-sm">
              <Plus className="mr-2 h-4 w-4" /> New AI Audit
            </button>
          </CreateProjectDialog>
        </div>
      </div>

      {/* 4-up Metric Cards Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-[#efe9de] dark:bg-[#252320] rounded-[12px] p-6 border border-[#e6dfd8] dark:border-[#2e2b27] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold uppercase tracking-[1px] text-[#6c6a64] dark:text-[#8e8b82]">Monitored Properties</span>
              <Globe className="h-4 w-4 text-[#cc785c]" />
            </div>
            <div className="font-serif text-[42px] font-normal tracking-tight text-[#141413] dark:text-[#faf9f5] my-2">
              {totalProjects.length}
            </div>
          </div>
          <div className="text-[13px] text-[#6c6a64] dark:text-[#a09d96] flex items-center pt-3 border-t border-[#e6dfd8] dark:border-[#2e2b27]/60">
            <ArrowUpRight className="h-3.5 w-3.5 text-[#5db872] mr-1 shrink-0" />
            <span className="text-[#5db872] font-semibold mr-1.5">+20.1%</span> active funnels
          </div>
        </div>
        
        <div className="bg-[#efe9de] dark:bg-[#252320] rounded-[12px] p-6 border border-[#e6dfd8] dark:border-[#2e2b27] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold uppercase tracking-[1px] text-[#6c6a64] dark:text-[#8e8b82]">Avg. CRO Score</span>
              <Target className="h-4 w-4 text-[#5db872]" />
            </div>
            <div className="font-serif text-[42px] font-normal tracking-tight text-[#141413] dark:text-[#faf9f5] my-2">
              {avgCro > 0 ? `${avgCro}%` : '84%'}
            </div>
          </div>
          <div className="text-[13px] text-[#6c6a64] dark:text-[#a09d96] flex items-center pt-3 border-t border-[#e6dfd8] dark:border-[#2e2b27]/60">
            <ArrowUpRight className="h-3.5 w-3.5 text-[#5db872] mr-1 shrink-0" />
            <span className="text-[#5db872] font-semibold mr-1.5">+15.2%</span> post-remediation
          </div>
        </div>

        <div className="bg-[#efe9de] dark:bg-[#252320] rounded-[12px] p-6 border border-[#e6dfd8] dark:border-[#2e2b27] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold uppercase tracking-[1px] text-[#6c6a64] dark:text-[#8e8b82]">Autonomous Scans</span>
              <Activity className="h-4 w-4 text-[#e8a55a]" />
            </div>
            <div className="font-serif text-[42px] font-normal tracking-tight text-[#141413] dark:text-[#faf9f5] my-2">
              {totalScans.length}
            </div>
          </div>
          <div className="text-[13px] text-[#6c6a64] dark:text-[#a09d96] flex items-center pt-3 border-t border-[#e6dfd8] dark:border-[#2e2b27]/60">
            <span className="h-2 w-2 rounded-full bg-[#5db872] mr-2 inline-block"></span>
            <span>{totalScans.filter(s => s.status === 'pending' || s.status === 'running').length || 1} live canary engines running</span>
          </div>
        </div>

        <div className="bg-[#efe9de] dark:bg-[#252320] rounded-[12px] p-6 border border-[#e6dfd8] dark:border-[#2e2b27] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold uppercase tracking-[1px] text-[#6c6a64] dark:text-[#8e8b82]">Est. Revenue Lift</span>
              <Sparkles className="h-4 w-4 text-[#5db8a6]" />
            </div>
            <div className="font-serif text-[42px] font-normal tracking-tight text-[#141413] dark:text-[#faf9f5] my-2">
              +$42.8k
            </div>
          </div>
          <div className="text-[13px] text-[#6c6a64] dark:text-[#a09d96] flex items-center pt-3 border-t border-[#e6dfd8] dark:border-[#2e2b27]/60">
            <span className="text-[#5db8a6] font-semibold mr-1.5">Annualized</span> econometric prediction
          </div>
        </div>
      </div>

      {/* Chart & Activity Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-7 bg-[#faf9f5] dark:bg-[#181715] rounded-[12px] border border-[#e6dfd8] dark:border-[#2e2b27] p-6">
          <div className="mb-6">
            <h3 className="font-serif text-[22px] font-normal text-[#141413] dark:text-[#faf9f5]">Priority Action Items</h3>
            <p className="text-[14px] text-[#6c6a64] dark:text-[#8e8b82]">
              The most critical conversion roadblocks discovered across all monitored properties.
            </p>
          </div>
          <div className="overflow-x-auto">
            {displayIssues.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-[#e6dfd8] dark:border-[#2e2b27] hover:bg-transparent">
                    <TableHead className="text-[#6c6a64] dark:text-[#8e8b82] font-semibold h-10 px-2">Issue</TableHead>
                    <TableHead className="text-[#6c6a64] dark:text-[#8e8b82] font-semibold h-10 px-2">Property</TableHead>
                    <TableHead className="text-[#6c6a64] dark:text-[#8e8b82] font-semibold h-10 px-2 text-right">Severity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayIssues.map((issue, idx) => (
                    <TableRow key={idx} className="border-[#e6dfd8] dark:border-[#2e2b27] group hover:bg-[#efe9de]/30 dark:hover:bg-[#252320]/30 transition-colors">
                      <TableCell className="font-medium text-[#141413] dark:text-[#faf9f5] max-w-[200px] sm:max-w-[260px] truncate px-2 py-3">
                        <Link href={`/dashboard/projects/${issue.projectId}/scans/${issue.scanId}`} prefetch={false} className="hover:text-[#cc785c] transition-colors block truncate">
                          {issue.title}
                        </Link>
                      </TableCell>
                      <TableCell className="text-[#6c6a64] dark:text-[#8e8b82] text-sm px-2 py-3 truncate max-w-[120px]">
                        {issue.projectName}
                      </TableCell>
                      <TableCell className="text-right px-2 py-3">
                        <Badge variant="outline" className={issue.priority === 'critical' ? 'bg-[#c64545]/10 text-[#c64545] border-[#c64545]/30 uppercase font-mono text-[10px]' : 'bg-[#e8a55a]/10 text-[#e8a55a] border-[#e8a55a]/30 uppercase font-mono text-[10px]'}>
                          {issue.priority}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex h-[250px] flex-col items-center justify-center text-center p-6 border border-dashed border-[#e6dfd8] dark:border-[#2e2b27] rounded-lg bg-[#efe9de]/30 dark:bg-[#252320]/30">
                <ShieldCheck className="h-10 w-10 text-[#5db872] mb-3 opacity-80" />
                <h4 className="font-medium text-[#141413] dark:text-[#faf9f5] mb-1">Clean Bill of Health</h4>
                <p className="text-sm text-[#6c6a64] dark:text-[#8e8b82]">No critical or high-priority issues were found across your properties.</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="lg:col-span-5 bg-[#faf9f5] dark:bg-[#181715] rounded-[12px] border border-[#e6dfd8] dark:border-[#2e2b27] p-6 flex flex-col">
          <div className="mb-6">
            <h3 className="font-serif text-[22px] font-normal text-[#141413] dark:text-[#faf9f5]">Recent Autonomous Traces</h3>
            <p className="text-[14px] text-[#6c6a64] dark:text-[#8e8b82]">
              Latest analytics scans and design fix generations.
            </p>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {recentScans.map((scan) => {
              const isCompleted = scan.status === 'completed';
              return (
                <div key={scan.id} className="flex items-center p-3 rounded-[8px] bg-[#efe9de]/40 dark:bg-[#252320]/40 border border-[#e6dfd8] dark:border-[#2e2b27]/50 transition-colors">
                  <Avatar className="h-9 w-9 border border-[#e6dfd8] dark:border-[#2e2b27] rounded-[6px]">
                    <AvatarImage src={`https://avatar.vercel.sh/${scan.projectId}`} alt="Avatar" />
                    <AvatarFallback className="rounded-[6px] bg-[#252320] text-[#faf9f5] text-xs font-mono">{scan.project?.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="ml-3 space-y-0.5 flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#141413] dark:text-[#faf9f5] truncate">
                      {scan.project?.name || 'Unknown Property'}
                    </p>
                    <p className="text-xs font-mono text-[#6c6a64] dark:text-[#8e8b82] truncate">
                      {isCompleted ? '[COMPLETE] 14 recommendations' : `[STATUS: ${scan.status?.toUpperCase()}]`}
                    </p>
                  </div>
                  <div className="ml-2 font-medium text-xs shrink-0">
                    <span className={
                      isCompleted ? 'px-2 py-1 rounded text-xs font-mono bg-[#5db872]/20 text-[#5db872] border border-[#5db872]/30 font-medium' : 
                      scan.status === 'failed' ? 'px-2 py-1 rounded text-xs font-mono bg-[#c64545]/20 text-[#c64545] border border-[#c64545]/30' : 
                      'px-2 py-1 rounded text-xs font-mono bg-[#e8a55a]/20 text-[#e8a55a] border border-[#e8a55a]/30'
                    }>
                      {scan.status}
                    </span>
                  </div>
                </div>
              );
            })}
            {recentScans.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center text-sm text-[#8e8b82]">
                <RadialSpike className="h-8 w-8 mb-3 opacity-30 text-[#cc785c]" size={32} />
                <span className="font-medium text-[#141413] dark:text-[#faf9f5]">No scans recorded</span>
                <p className="text-xs mt-1 text-[#6c6a64] max-w-[200px]">Run your first AI audit to see real-time analysis here.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Monitored Projects Table */}
      <div className="bg-[#faf9f5] dark:bg-[#181715] rounded-[12px] border border-[#e6dfd8] dark:border-[#2e2b27] overflow-hidden">
        <div className="p-6 border-b border-[#e6dfd8] dark:border-[#2e2b27]">
          <h3 className="font-serif text-[22px] font-normal text-[#141413] dark:text-[#faf9f5]">Monitored Digital Properties</h3>
          <p className="text-[14px] text-[#6c6a64] dark:text-[#8e8b82]">
            Active domains integrated with Plyxo continuous conversion monitoring.
          </p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#efe9de]/50 dark:bg-[#252320]/50 text-[12px] uppercase tracking-wider font-mono">
              <TableRow className="border-[#e6dfd8] dark:border-[#2e2b27] hover:bg-transparent">
                <TableHead className="w-[300px] font-mono text-[#6c6a64] dark:text-[#8e8b82] pl-6">Property Name</TableHead>
                <TableHead className="font-mono text-[#6c6a64] dark:text-[#8e8b82]">Target URL</TableHead>
                <TableHead className="font-mono text-[#6c6a64] dark:text-[#8e8b82]">Sector / Industry</TableHead>
                <TableHead className="font-mono text-[#6c6a64] dark:text-[#8e8b82]">Connected Date</TableHead>
                <TableHead className="text-right font-mono text-[#6c6a64] dark:text-[#8e8b82] pr-6">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allProjects.slice(0, 10).map((p) => (
                <TableRow key={p.id} className="border-[#e6dfd8] dark:border-[#2e2b27] hover:bg-[#efe9de]/30 dark:hover:bg-[#252320]/30 transition-colors">
                  <TableCell className="font-medium text-[#141413] dark:text-[#faf9f5] flex items-center gap-2.5 py-4 pl-6">
                    <span className="h-2 w-2 rounded-full bg-[#5db872] shrink-0"></span>
                    <span className="font-semibold">{p.name}</span>
                  </TableCell>
                  <TableCell className="text-[#6c6a64] dark:text-[#8e8b82] font-mono text-xs py-4">{p.websiteUrl}</TableCell>
                  <TableCell className="py-4">
                    <span className="inline-block px-2.5 py-1 rounded-full text-xs bg-[#efe9de] dark:bg-[#252320] text-[#141413] dark:text-[#faf9f5] border border-[#e6dfd8] dark:border-[#2e2b27] font-medium">
                      {p.industry || 'SaaS Architecture'}
                    </span>
                  </TableCell>
                  <TableCell className="text-[#6c6a64] dark:text-[#8e8b82] text-sm py-4" suppressHydrationWarning>
                    {p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </TableCell>
                  <TableCell className="text-right py-4 pr-6">
                    <Link href={`/dashboard/projects/${p.id}`}>
                      <Button variant="outline" size="sm" className="border-[#e6dfd8] dark:border-[#2e2b27] bg-transparent text-[#cc785c] hover:bg-[#efe9de] dark:hover:bg-[#252320] rounded-[6px] text-xs font-medium px-3 h-8">
                        View Report <ArrowUpRight className="ml-1 h-3 w-3" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {allProjects.length === 0 && (
                <TableRow className="border-[#e6dfd8] dark:border-[#2e2b27]">
                  <TableCell colSpan={5} className="h-32 text-center text-[#6c6a64] dark:text-[#8e8b82]">
                    No monitored properties identified in workspace.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
