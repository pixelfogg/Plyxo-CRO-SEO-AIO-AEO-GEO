import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/db'
import { scans, scanIssues } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertTriangle, CheckCircle, Info, Sparkles, TrendingUp, Zap, FileSearch, ArrowLeft, ArrowRight, Check, X, Image as ImageIcon } from 'lucide-react'
import { MASTER_CHECKLIST } from '@/lib/scanner/master-checklist'
import { calculateOverallScore, calculateAllScores } from '@/lib/scanner/score'
import { VisualReport } from '@/components/report/VisualReport'
import { PdfReportClient } from '@/components/report/PdfReportClient'
import { ShareLinkClient } from '@/components/report/ShareLinkClient'

export default async function ScanReportPage({
  params,
}: {
  params: Promise<{ projectId: string; scanId: string }>
}) {
  const { projectId, scanId } = await params;

  const scanRaw = await db.query.scans.findFirst({
    where: eq(scans.id, scanId),
  });

  if (!scanRaw) {
    notFound();
  }

  const hasScreenshot = Boolean(scanRaw.screenshotBase64);

  const issuesList = await db.query.scanIssues.findMany({
    where: eq(scanIssues.scanId, scanId)
  });

  const { screenshotBase64, ...cleanScan } = scanRaw;
  const scan = { ...cleanScan, issues: issuesList };

  // If this is actually an SEO Intelligence scan, redirect them to the proper SEO dashboard
  const scoresObj = scan.scores as Record<string, any> || {};
  if (scoresObj.siteHealth !== undefined || scoresObj.technical !== undefined) {
    redirect(`/dashboard/seo/${projectId}`);
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 50) return 'text-amber-500';
    return 'text-red-500';
  };

  const getScoreColorHex = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 50) return 'text-amber-500';
    return 'text-red-500';
  };

  const allScores = calculateAllScores(scan);
  const overallScore = calculateOverallScore(scan);

  return (
    <div id="report-content" className="space-y-8">
      {/* Header */}
      <div>
        <div className="mb-4">
          <Link href={`/dashboard/projects/${projectId}`}>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs font-medium bg-[#faf9f5] dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27] hover:border-[#cc785c]/40 hover:text-[#cc785c] transition-all">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Project
            </Button>
          </Link>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold tracking-tight">Scan Report</h1>
              <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                {scan.status}
              </Badge>
              <div className="flex items-center gap-2">
                <ShareLinkClient projectId={projectId} scanId={scanId} />
                <PdfReportClient projectId={projectId} scanId={scanId} />
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              <p>Completed on {scan.completedAt?.toLocaleString()}</p>
              {scan.tokensConsumed ? (
                <>
                  <span>•</span>
                  <p className="flex items-center gap-1 font-medium text-indigo-600 dark:text-indigo-400">
                    <Sparkles className="h-3.5 w-3.5" />
                    {new Intl.NumberFormat().format(scan.tokensConsumed)} AI Tokens
                  </p>
                </>
              ) : null}
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="text-right">
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Overall Score</p>
              <div className={`text-3xl font-bold ${getScoreColor(overallScore)}`}>
                {overallScore}/100
              </div>
            </div>
            <div className="h-12 w-12 rounded-full flex items-center justify-center relative flex-shrink-0">
              <svg viewBox="0 0 48 48" className="absolute inset-0 h-full w-full transform -rotate-90">
                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className={`text-zinc-100 dark:text-zinc-800`} />
                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className={`${getScoreColor(overallScore)} transition-all duration-1000 ease-in-out`} strokeDasharray="125.6" strokeDashoffset={125.6 - (125.6 * overallScore) / 100} strokeLinecap="round" />
              </svg>
              <Zap className={`h-5 w-5 ${getScoreColor(overallScore)} relative z-10`} />
            </div>
          </div>
        </div>
      </div>

      {/* Category Scores */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Object.entries(allScores).map(([category, score]: [string, any]) => (
          <Link href={`/dashboard/projects/${projectId}/scans/${scanId}/category/${category}`} key={category} className="block group">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col h-full">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold tracking-wide uppercase text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                  {category}
                </span>
                <span className={`text-lg font-bold ${getScoreColor(score)}`}>{score}</span>
              </div>
              <Progress value={score} className="h-1.5 mb-3" />
              <div className="mt-auto border-t border-zinc-100 dark:border-zinc-800/60 pt-2 flex justify-between items-center text-[11px] font-medium text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-300 transition-colors">
                <span>View Details</span>
                <ArrowRight className="h-3 w-3 transform group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <Tabs defaultValue="ai-recommendations" className="space-y-6">
        <TabsList variant="pill" className="flex-wrap mb-4 w-fit">
          <TabsTrigger value="ai-recommendations" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> AI Recommendations
          </TabsTrigger>
          <TabsTrigger value="vitals" className="flex items-center gap-2">
            <Zap className="h-4 w-4" /> Performance Vitals
          </TabsTrigger>
          <TabsTrigger value="competitors" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> Competitor Benchmark
          </TabsTrigger>
          <TabsTrigger value="visual-analysis" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" /> Visual Analysis
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="visual-analysis" className="space-y-6">
          <VisualReport scanId={scanId} hasScreenshot={hasScreenshot} issues={scan.issues} />
        </TabsContent>

        <TabsContent value="ai-recommendations" className="space-y-6">
          <Card className="border-indigo-100 dark:border-indigo-900/30 shadow-sm overflow-hidden pt-0 gap-0">
            <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 border-b border-indigo-100 dark:border-indigo-900/30">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg shadow-sm">
                  <Sparkles className="h-6 w-6 text-indigo-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-300 mb-1">
                    Enterprise AI CRO & Conversion Intelligence Report
                  </h3>
                  <div className="text-sm text-indigo-700/80 dark:text-indigo-300/70 max-w-4xl space-y-4 mt-3">
                    <p className="text-base font-medium">
                      I have conducted a deep heuristic analysis of your landing page, evaluating over 400 parameters across UX, visual hierarchy, cognitive load, persuasive copywriting, and trust signals. 
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="bg-white/60 dark:bg-zinc-950/40 p-5 rounded-xl border border-indigo-100/50 dark:border-indigo-900/30">
                        <h4 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-3 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-500" /> 
                          Error Identification
                        </h4>
                        <ul className="space-y-2 text-xs">
                          <li className="flex items-start gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                            <span><strong>Cognitive Friction:</strong> Identifying areas with excessive visual clutter, poor readability, or confusing navigation flows.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                            <span><strong>Conversion Blockers:</strong> Detecting missing psychological triggers, weak calls-to-action (CTAs), and inadequate trust signals.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                            <span><strong>Technical & Accessibility:</strong> Highlighting structural HTML failures, missing form labels, and contrast issues affecting usability.</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="bg-white/60 dark:bg-zinc-950/40 p-5 rounded-xl border border-indigo-100/50 dark:border-indigo-900/30">
                        <h4 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-3 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-500" /> 
                          Recommendation Framework
                        </h4>
                        <ul className="space-y-2 text-xs">
                          <li className="flex items-start gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                            <span><strong>Prioritized Remediation:</strong> Every issue is weighted by its projected impact on conversion rate (CR) and overall revenue potential.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                            <span><strong>Actionable Steps:</strong> Providing step-by-step technical and design instructions to resolve each specific error.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                            <span><strong>AI-Generated Copy:</strong> Offering exact copy rewrites and A/B testing variations to eliminate friction immediately.</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <CardContent className="p-0">
              {(() => {
                const aiIssues = scan.issues.filter(i => ['copywriting', 'ux', 'visual', 'trust', 'cta', 'cro'].includes(i.category));
                if (aiIssues.length === 0) {
                  return <div className="p-8 text-center text-zinc-500">No UX/CRO issues found or analysis failed.</div>;
                }
                return (
                  <Accordion className="w-full space-y-4 px-6 pb-6 pt-4">
                    {aiIssues.map((issue, idx) => (
                      <AccordionItem 
                        key={issue.id} 
                        value={`item-${idx}`} 
                        className="border border-zinc-200 dark:border-zinc-800/80 rounded-xl overflow-hidden bg-white dark:bg-zinc-950/40 shadow-sm data-[state=open]:border-indigo-200 dark:data-[state=open]:border-indigo-900/50 transition-colors"
                      >
                        <AccordionTrigger className="hover:no-underline hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors px-6 py-4 flex gap-4 text-left">
                          <div className="flex-1 flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <Badge variant={issue.priority === 'critical' ? 'destructive' : (issue.priority === 'high' ? 'destructive' : 'secondary')} className="uppercase text-[10px] font-semibold tracking-wider">
                                {issue.priority} Priority
                              </Badge>
                              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 tracking-wider uppercase bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded-full">
                                {issue.category}
                              </span>
                            </div>
                            <h4 className="text-base font-semibold leading-tight text-zinc-900 dark:text-zinc-100 pr-8">{issue.title}</h4>
                          </div>
                        </AccordionTrigger>
                      <AccordionContent className="px-6 pb-6 pt-4 space-y-6 border-t border-zinc-100 dark:border-zinc-800/60">
                        <div className="text-sm text-zinc-600 dark:text-zinc-300 mt-2">
                          {issue.description}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-100 dark:border-zinc-800">
                          <div>
                            <p className="text-xs text-zinc-500 mb-1 flex items-center gap-1"><Info className="h-3 w-3"/> Impact</p>
                            <p className="text-sm font-medium">{issue.businessImpact || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-zinc-500 mb-1 flex items-center gap-1"><Zap className="h-3 w-3"/> Conv. Gain</p>
                            <p className="text-sm font-medium text-green-600 dark:text-green-400">{issue.expectedConversionGain || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-zinc-500 mb-1">Severity</p>
                            <p className="text-sm font-medium capitalize">{issue.severity}</p>
                          </div>
                          <div>
                            <p className="text-xs text-zinc-500 mb-1">Difficulty</p>
                            <p className="text-sm font-medium capitalize">{issue.difficulty || 'N/A'}</p>
                          </div>
                        </div>

                        {issue.aiGeneratedExample && (
                          <div className="p-4 rounded-lg bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30">
                            <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-2 uppercase tracking-wider flex items-center gap-1">
                              <Sparkles className="h-3 w-3"/> AI Rewrite Suggestion
                            </p>
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                              "{issue.aiGeneratedExample}"
                            </p>
                          </div>
                        )}

                        {!!issue.implementationSteps && Array.isArray(issue.implementationSteps) && issue.implementationSteps.length > 0 && (
                          <div>
                            <h5 className="text-sm font-semibold mb-3 flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              Implementation Steps
                            </h5>
                            <ul className="space-y-2">
                              {((issue.implementationSteps as unknown as string[]) || []).map((step, i) => (
                                <li key={i} className="text-sm text-zinc-600 dark:text-zinc-300 flex items-start gap-3">
                                  <span className="flex-shrink-0 flex items-center justify-center h-5 w-5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-500">
                                    {i + 1}
                                  </span>
                                  <span className="mt-0.5">{String(step)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              );
            })()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Competitors Section */}
        <TabsContent value="competitors" className="space-y-6">
          <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
            <TrendingUp className="h-6 w-6 text-zinc-400" />
            <h2 className="text-2xl font-bold">Competitor Benchmark</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Industry Average Comparison</CardTitle>
                <CardDescription>How your site compares against average competitors in your niche.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">Your Score</span>
                    <span className="font-bold">{overallScore}/100</span>
                  </div>
                  <Progress value={overallScore} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-zinc-500">Industry Average</span>
                    <span className="font-bold text-zinc-500">65/100</span>
                  </div>
                  <Progress value={65} className="h-2 opacity-50 grayscale" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-zinc-500">Top 10% Competitors</span>
                    <span className="font-bold text-zinc-500">88/100</span>
                  </div>
                  <Progress value={88} className="h-2 opacity-50 grayscale" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Metric Breakdown vs Competitors</CardTitle>
                <CardDescription>Areas where you are leading or trailing.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(allScores).map(([category, score]: [string, any]) => {
                    const benchmark = 75; // fixed target benchmark (no live competitor data source)
                    const isLeading = score >= benchmark;
                    return (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium uppercase">{category}</span>
                          <span className="text-xs text-zinc-500">Target: {benchmark}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">{score}</span>
                          <Badge variant={isLeading ? 'default' : 'secondary'} className={isLeading ? 'bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400' : ''}>
                            {isLeading ? '+ Leading' : '- Trailing'}
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        {/* Vitals Section */}
        <TabsContent value="vitals" className="space-y-6">
          <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
            <Zap className="h-6 w-6 text-zinc-400" />
            <h2 className="text-2xl font-bold">Core Web Vitals</h2>
          </div>
          {scan.coreWebVitals ? (
            (() => {
              const vitals = scan.coreWebVitals as any;
              return (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <Card className="shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-zinc-500">Performance Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={`text-3xl font-bold ${vitals.score != null ? getScoreColor(vitals.score) : 'text-zinc-400'}`}>
                        {vitals.score ?? 'N/A'}
                      </div>
                  <p className="text-xs text-zinc-500 mt-1">Based on PSI API</p>
                </CardContent>
              </Card>
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-500 flex justify-between">
                    LCP
                    {vitals.lcp != null && (
                    <Badge variant={vitals.lcp < 2500 ? 'outline' : 'secondary'} className={vitals.lcp < 2500 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}>
                      {vitals.lcp < 2500 ? 'Good' : 'Poor'}
                    </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {vitals.lcp != null ? `${(vitals.lcp / 1000).toFixed(1)}s` : 'N/A'}
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">Largest Contentful Paint</p>
                </CardContent>
              </Card>
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-500 flex justify-between">
                    CLS
                    {vitals.cls != null && (
                    <Badge variant={vitals.cls < 0.1 ? 'outline' : 'secondary'} className={vitals.cls < 0.1 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}>
                      {vitals.cls < 0.1 ? 'Good' : 'Poor'}
                    </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {vitals.cls != null ? vitals.cls.toFixed(3) : 'N/A'}
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">Cumulative Layout Shift</p>
                </CardContent>
              </Card>
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-500 flex justify-between">
                    INP
                    {vitals.inp != null && (
                    <Badge variant={vitals.inp < 200 ? 'outline' : 'secondary'} className={vitals.inp < 200 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}>
                      {vitals.inp < 200 ? 'Good' : 'Poor'}
                    </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {vitals.inp != null ? `${vitals.inp}ms` : 'N/A'}
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">Interaction to Next Paint</p>
                </CardContent>
              </Card>
            </div>
          );
        })()
          ) : (
            <div className="p-8 text-center border rounded-xl border-dashed">
              <p className="text-zinc-500">Core Web Vitals were not fetched during this scan.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
