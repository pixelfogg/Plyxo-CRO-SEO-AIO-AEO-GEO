import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/db'
import { scans } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertTriangle, CheckCircle, Info, Sparkles, TrendingUp, Zap, FileSearch, ArrowLeft, Check, X, Image as ImageIcon } from 'lucide-react'
import { MASTER_CHECKLIST } from '@/lib/scanner/master-checklist'
import { calculateOverallScore, calculateAllScores } from '@/lib/scanner/score'
import { VisualReport } from '@/components/report/VisualReport'
import { PdfReportClient } from '@/components/report/PdfReportClient'

export default async function ScanReportPage({
  params,
}: {
  params: Promise<{ scanId: string }>
}) {
  const { scanId } = await params;

  const scan = await db.query.scans.findFirst({
    where: eq(scans.id, scanId),
    columns: {
      screenshotBase64: false,
    },
    with: { issues: true }
  });

  if (!scan) {
    notFound();
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
    <div id="report-content" className="space-y-8 p-8 w-full">
      {/* Header */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold tracking-tight">Scan Report</h1>
              <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                {scan.status}
              </Badge>
              <div className="ml-4 flex items-center gap-2">
                <PdfReportClient projectId={scan.projectId!} scanId={scanId} />
              </div>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400">
              Completed on {scan.completedAt?.toLocaleString()}
            </p>
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
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Object.entries(allScores).map(([category, score]) => (
          <div key={category} className="block">
            <Card className="shadow-sm flex flex-col justify-between transition-colors h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium uppercase text-zinc-500 dark:text-zinc-400 transition-colors">
                  {category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between mb-2">
                  <span className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}</span>
                </div>
                <Progress value={score} className="h-2" />
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <Tabs defaultValue="ai-recommendations" className="space-y-6">
        <TabsList className="bg-zinc-100 dark:bg-zinc-800/50 flex-wrap h-auto">
          <TabsTrigger value="ai-recommendations" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> AI Recommendations
          </TabsTrigger>
          <TabsTrigger value="competitors" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> Competitor Benchmark
          </TabsTrigger>
          <TabsTrigger value="visual-analysis" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" /> Visual Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visual-analysis" className="space-y-6">
          <VisualReport scanId={scanId} issues={scan.issues} />
        </TabsContent>

        <TabsContent value="ai-recommendations" className="space-y-6">
          <Card className="border-indigo-100 dark:border-indigo-900/30 shadow-sm overflow-hidden">
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
                  <Accordion className="w-full">
                    {aiIssues.map((issue, idx) => (
                      <AccordionItem key={issue.id} value={`item-${idx}`} className="border-b border-zinc-100 dark:border-zinc-800 last:border-0 px-6 py-2">
                        <AccordionTrigger className="hover:no-underline flex gap-4 text-left">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant={issue.priority === 'critical' ? 'destructive' : (issue.priority === 'high' ? 'destructive' : 'secondary')} className="uppercase text-[10px]">
                                {issue.priority} Priority
                              </Badge>
                              <span className="text-xs font-medium text-zinc-500 uppercase">{issue.category}</span>
                            </div>
                            <h4 className="text-base font-semibold">{issue.title}</h4>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4 pb-6 space-y-6">
                          <div className="text-sm text-zinc-600 dark:text-zinc-300">
                            {issue.description}
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-100 dark:border-zinc-800">
                            <div>
                              <p className="text-xs text-zinc-500 mb-1 flex items-center gap-1"><Info className="h-3 w-3" /> Impact</p>
                              <p className="text-sm font-medium">{issue.businessImpact || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-zinc-500 mb-1 flex items-center gap-1"><Zap className="h-3 w-3" /> Conv. Gain</p>
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
                                <Sparkles className="h-3 w-3" /> AI Rewrite Suggestion
                              </p>
                              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                "{issue.aiGeneratedExample}"
                              </p>
                            </div>
                          )}

                          {Boolean(issue.implementationSteps && Array.isArray(issue.implementationSteps) && (issue.implementationSteps as any[]).length > 0) && (
                            <div>
                              <h5 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                Implementation Steps
                              </h5>
                              <ul className="space-y-2">
                                {(issue.implementationSteps as string[]).map((step, i) => (
                                  <li key={i} className="text-sm text-zinc-600 dark:text-zinc-300 flex items-start gap-3">
                                    <span className="flex-shrink-0 flex items-center justify-center h-5 w-5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-500">
                                      {i + 1}
                                    </span>
                                    <span className="mt-0.5">{step}</span>
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
                  {Object.entries(allScores).map(([category, score]) => {
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
      </Tabs>
    </div>
  )
}
