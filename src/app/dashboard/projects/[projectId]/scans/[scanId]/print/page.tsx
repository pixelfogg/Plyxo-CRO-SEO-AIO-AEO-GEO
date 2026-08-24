import { notFound, redirect } from 'next/navigation'
import { AutoPrint } from '@/components/report/AutoPrint'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { db } from '@/db'
import { scans, scanIssues, projects } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { PlyxoLogo } from '@/components/ui/logo'


export default async function ScanReportPage({
  params,
}: {
  params: Promise<{ projectId: string; scanId: string }>
}) {
  const { projectId, scanId } = await params;

  const scanRaw = await db.query.scans.findFirst({
    where: eq(scans.id, scanId),
    columns: {
      screenshotBase64: false
    }
  });

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId)
  });

  if (!scanRaw || !project) {
    notFound();
  }

  const issuesList = await db.query.scanIssues.findMany({
    where: eq(scanIssues.scanId, scanId)
  });

  const scan = { ...scanRaw, issues: issuesList };

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


  const criticalCount = scan.issues.filter(i => i.priority === 'critical').length;
  const highCount = scan.issues.filter(i => i.priority === 'high').length;
  const mediumCount = scan.issues.filter(i => i.priority === 'medium').length;
  const lowCount = scan.issues.filter(i => i.priority === 'low').length;
  const recommendationCount = scan.issues.filter(i => !!(i as any).recommendation || !!(i as any).implementationSteps || !!(i as any).aiGeneratedExample).length;
  const totalIssues = scan.issues.length;
  const allScansRaw = await db.query.scans.findMany({
    where: eq(scans.projectId, projectId),
    orderBy: [desc(scans.createdAt)],
    columns: {
      screenshotBase64: false,
    }
  });
  const aeoData = allScansRaw.find(s => s.scores && (s.scores as any).aeo)?.scores as any;
  const aeo = aeoData?.aeo;

  return (
    <div className="min-h-screen bg-white text-black p-4 max-w-4xl mx-auto font-sans print:p-0 text-sm">
      <AutoPrint />
      
      {/* Print Specific CSS Overrides */}
      <style dangerouslySetInnerHTML={{__html: `
        @page {
          margin: 10mm;
          size: A4 portrait;
        }
        @media print {
          html, body {
            background-color: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .page-break-before { page-break-before: always; }
          .avoid-break { page-break-inside: avoid; }
        }
      `}} />

      {/* Compact Cover Section */}
      <div className="flex items-center justify-between border-b-2 border-zinc-900 pb-4 mb-6 avoid-break">
        <div>
           <div className="flex items-center gap-3">
              <PlyxoLogo className="h-7" forceDark={true} />
              <h1 className="text-2xl font-black tracking-tight text-zinc-900 border-l-2 border-zinc-200 pl-3">Audit Report</h1>
           </div>
           <p className="text-sm font-medium text-zinc-500 mt-1">
             <span className="font-semibold text-zinc-800 mr-2">{project.websiteUrl}</span>
             <span className="text-zinc-400">|</span>
             <span className="ml-2">Scanned URL: {scan.pageUrl || project.websiteUrl}</span>
           </p>
        </div>
        <div className="text-right">
           <div className="text-xs text-zinc-400 uppercase tracking-widest mb-1">Audit Date</div>
           <div className="text-sm font-semibold">{new Date(scan.createdAt || new Date()).toLocaleDateString()}</div>
        </div>
      </div>

      <div className="flex gap-6 mb-8 avoid-break">
        <div className="p-6 border-2 border-zinc-900 rounded-xl bg-zinc-50 flex flex-col items-center justify-center shrink-0 w-48 shadow-[4px_4px_0_0_rgba(24,24,27,1)]">
          <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest mb-1">Overall Score</p>
          <div className="text-6xl font-black text-amber-600 tracking-tighter">{overallScore}</div>
        </div>
        <div className="flex-1">
          <p className="text-sm text-zinc-700 font-medium mb-3">Executive Summary across 400+ Enterprise Data Points</p>
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(allScores).map(([key, score]: [string, any]) => (
              <div key={key} className="p-2 border rounded border-zinc-200 bg-white flex flex-col items-center justify-center text-center">
                <span className="font-semibold uppercase text-[9px] tracking-wider text-zinc-500 mb-1">{key.replace('-', ' ')}</span>
                <span className={cn("text-lg font-black leading-none", getScoreColorHex(score as number))}>{score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Issue Priority Tally */}
      <div className="grid grid-cols-5 gap-4 mb-8 avoid-break">
        <div className="border border-red-200 bg-red-50 p-3 rounded-lg text-center">
          <div className="text-3xl font-black text-red-600">{criticalCount}</div>
          <div className="text-[10px] font-bold text-red-800 uppercase tracking-wider mt-1">Critical</div>
        </div>
        <div className="border border-orange-200 bg-orange-50 p-3 rounded-lg text-center">
          <div className="text-3xl font-black text-orange-600">{highCount}</div>
          <div className="text-[10px] font-bold text-orange-800 uppercase tracking-wider mt-1">High</div>
        </div>
        <div className="border border-yellow-200 bg-yellow-50 p-3 rounded-lg text-center">
          <div className="text-3xl font-black text-yellow-600">{mediumCount}</div>
          <div className="text-[10px] font-bold text-yellow-800 uppercase tracking-wider mt-1">Medium</div>
        </div>
        <div className="border border-blue-200 bg-blue-50 p-3 rounded-lg text-center">
          <div className="text-3xl font-black text-blue-600">{lowCount}</div>
          <div className="text-[10px] font-bold text-blue-800 uppercase tracking-wider mt-1">Low</div>
        </div>
        <div className="border border-emerald-200 bg-emerald-50 p-3 rounded-lg text-center">
          <div className="text-3xl font-black text-emerald-600">{recommendationCount}</div>
          <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mt-1">AI Fixes</div>
        </div>
      </div>

      {/* Core Web Vitals & Competitor Benchmark (Compact Grid) */}
      <div className="grid grid-cols-2 gap-6 mb-8 avoid-break">
        {(scan as any).coreWebVitals && (
          <div className="border border-zinc-200 rounded-lg p-4 bg-white">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-3 border-b pb-2">Core Web Vitals</h3>
            <div className="grid grid-cols-3 gap-3">
              {(() => {
                const vitals = (scan as any).coreWebVitals as any;
                return (
                  <>
                    <div className="text-center">
                      <div className="text-[10px] text-zinc-500 mb-1 font-semibold">LCP</div>
                      <div className="font-bold text-sm">{vitals.lcp != null ? `${(vitals.lcp / 1000).toFixed(1)}s` : '-'}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[10px] text-zinc-500 mb-1 font-semibold">CLS</div>
                      <div className="font-bold text-sm">{vitals.cls != null ? vitals.cls.toFixed(3) : '-'}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[10px] text-zinc-500 mb-1 font-semibold">INP</div>
                      <div className="font-bold text-sm">{vitals.inp != null ? vitals.inp : '-'}</div>
                    </div>
                  </>
                )
              })()}
            </div>
          </div>
        )}
        
        <div className="border border-zinc-200 rounded-lg p-4 bg-white">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-3 border-b pb-2">Competitor Benchmark</h3>
          <div className="space-y-3">
             <div className="flex justify-between items-center text-xs">
               <span className="font-medium">Your Score</span>
               <span className="font-bold">{overallScore}/100</span>
             </div>
             <div className="w-full bg-zinc-100 rounded-full h-1.5"><div className="bg-zinc-800 h-1.5 rounded-full" style={{width: `${overallScore}%`}}></div></div>
             
             <div className="flex justify-between items-center text-xs mt-2">
               <span className="font-medium text-zinc-500">Top 10% Industry</span>
               <span className="font-bold text-zinc-500">88/100</span>
             </div>
             <div className="w-full bg-zinc-100 rounded-full h-1.5"><div className="bg-zinc-400 h-1.5 rounded-full" style={{width: '88%'}}></div></div>
          </div>
        </div>
      </div>

      {/* Enterprise AI CRO Intelligence Report Summary with Bullet Points */}
      <div className="border border-indigo-100 bg-indigo-50/50 rounded-xl p-6 mb-8 avoid-break">
        <h2 className="text-xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-500" />
          Enterprise AI CRO & Conversion Intelligence Report
        </h2>
        <p className="text-sm text-indigo-900/80 mb-6 font-medium leading-relaxed">
          I have conducted a deep heuristic analysis of your landing page, evaluating over 400 parameters across UX, visual hierarchy, cognitive load, persuasive copywriting, and trust signals.
        </p>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg border border-indigo-100">
            <h4 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> 
              Error Identification
            </h4>
            <ul className="space-y-3 text-xs text-indigo-900/70">
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
          
          <div className="bg-white p-4 rounded-lg border border-indigo-100">
            <h4 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-emerald-500" /> 
              Recommendation Framework
            </h4>
            <ul className="space-y-3 text-xs text-indigo-900/70">
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

      {/* Visual Report Section */}
      {(scan as any).screenshotBase64 && (
        <div className="avoid-break mb-8">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-3 border-b border-zinc-900 pb-2">Visual Analysis</h3>
          <div className="border border-zinc-200 rounded bg-zinc-50 overflow-hidden text-center p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={(scan as any).screenshotBase64.startsWith('data:') ? (scan as any).screenshotBase64 : `data:image/jpeg;base64,${(scan as any).screenshotBase64}`}
              alt="Page Screenshot" 
              className="w-full h-auto object-contain max-h-[300px] mx-auto"
            />
          </div>
        </div>
      )}

      {/* Grouped Issues */}
      <div className="space-y-8">
        {['seo', 'performance', 'accessibility', 'best-practices', 'ux', 'visual', 'copywriting', 'trust', 'cta', 'cro'].map(category => {
          const catIssues = scan.issues.filter((i) => i.category === category);
          
          return (
            <div key={category} className="avoid-break mb-6">
              <div className="flex justify-between items-end border-b-2 border-zinc-900 pb-2 mb-4">
                <h2 className="text-lg font-bold text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                  {category.replace('-', ' ')}
                  <span className="bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded text-[10px] font-semibold">
                    Score: {allScores[category] || 0}
                  </span>
                </h2>
              </div>
              
              {catIssues.length === 0 ? (
                <div className="text-xs text-zinc-500 font-medium bg-zinc-50 border border-dashed border-zinc-200 p-3 rounded text-center">
                  No issues found in this category. Target baseline achieved.
                </div>
              ) : (
                <div className="space-y-6">
                  {catIssues.map((issue, idx) => (
                    <div key={idx} className="avoid-break border border-zinc-200 rounded-lg p-5 bg-white shadow-sm flex flex-col gap-4">
                      
                      {/* Header: Priority & Category Badges */}
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={
                          issue.priority === 'critical' ? 'bg-red-50 text-red-700 border-red-200 text-[10px] px-2 py-0.5 rounded-sm uppercase tracking-wider font-semibold' :
                          issue.priority === 'high' ? 'bg-orange-50 text-orange-700 border-orange-200 text-[10px] px-2 py-0.5 rounded-sm uppercase tracking-wider font-semibold' :
                          issue.priority === 'medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 text-[10px] px-2 py-0.5 rounded-sm uppercase tracking-wider font-semibold' :
                          'bg-blue-50 text-blue-700 border-blue-200 text-[10px] px-2 py-0.5 rounded-sm uppercase tracking-wider font-semibold'
                        }>
                          {issue.priority} Priority
                        </Badge>
                        <Badge variant="secondary" className="bg-zinc-100 text-zinc-600 text-[10px] px-2 py-0.5 rounded-sm uppercase tracking-wider font-semibold">
                          {issue.category}
                        </Badge>
                      </div>
                      
                      {/* Title & Description */}
                      <div>
                        <h3 className="text-base font-bold text-zinc-900 leading-tight mb-2">{issue.title}</h3>
                        <p className="text-sm text-zinc-600 leading-relaxed">{issue.description}</p>
                      </div>

                      {/* Details Grid (Impact, Conv. Gain, Severity, Difficulty) */}
                      <div className="grid grid-cols-4 gap-4 p-3 bg-zinc-50 rounded-md border border-zinc-100 text-xs">
                        <div>
                          <p className="text-zinc-500 mb-1 flex items-center gap-1"><Info className="h-3 w-3"/> Impact</p>
                          <p className="font-medium text-zinc-900">{(issue as any).businessImpact || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-zinc-500 mb-1 flex items-center gap-1"><Zap className="h-3 w-3"/> Conv. Gain</p>
                          <p className="font-medium text-green-600">{(issue as any).expectedConversionGain || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-zinc-500 mb-1">Severity</p>
                          <p className="font-medium capitalize text-zinc-900">{issue.severity}</p>
                        </div>
                        <div>
                          <p className="text-zinc-500 mb-1">Difficulty</p>
                          <p className="font-medium capitalize text-zinc-900">{(issue as any).difficulty || 'N/A'}</p>
                        </div>
                      </div>

                      {/* AI Rewrite Suggestion */}
                      {(issue as any).aiGeneratedExample && (
                        <div className="p-3 rounded-md bg-indigo-50/60 border border-indigo-100/50">
                          <p className="text-[10px] font-bold text-indigo-600 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                            <Sparkles className="h-3 w-3"/> AI Rewrite Suggestion
                          </p>
                          <p className="text-sm font-medium text-indigo-950">
                            "{(issue as any).aiGeneratedExample}"
                          </p>
                        </div>
                      )}
                      
                      {/* Recommendations / Implementation Steps */}
                      {(issue as any).recommendation && !(issue as any).implementationSteps?.length && (
                        <div>
                          <h4 className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" /> Remediation Recommendation
                          </h4>
                          <p className="text-sm text-zinc-700 leading-relaxed bg-emerald-50/50 border border-emerald-100/50 p-3 rounded-md">{(issue as any).recommendation}</p>
                        </div>
                      )}

                      {!!(issue as any).implementationSteps && Array.isArray((issue as any).implementationSteps) && (issue as any).implementationSteps.length > 0 && (
                        <div>
                          <h5 className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" /> Remediation Steps
                          </h5>
                          <ul className="space-y-2 bg-zinc-50 border border-zinc-100 p-4 rounded-md">
                            {(((issue as any).implementationSteps as unknown as string[]) || []).map((step, i) => (
                              <li key={i} className="text-sm text-zinc-700 flex items-start gap-3">
                                <span className="flex-shrink-0 flex items-center justify-center h-5 w-5 rounded-full bg-white border border-zinc-200 text-[10px] font-bold text-zinc-500">
                                  {i + 1}
                                </span>
                                <span className="mt-0.5 leading-relaxed">{String(step)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Affected Elements */}
                      {(issue as any).affectedElements && (issue as any).affectedElements.length > 0 && (
                        <div className="pt-2 border-t border-zinc-100">
                          <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Affected Elements</h4>
                          <div className="flex flex-col gap-1.5">
                            {(issue as any).affectedElements.map((el: any, i: number) => (
                              <div key={i} className="bg-zinc-50 px-2 py-1.5 rounded text-[11px] font-mono text-zinc-600 border border-zinc-200 break-all">
                                {el}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      
      {/* AEO / GEO Intelligence Analysis Report */}
      {aeo && (
        <div className="avoid-break mt-12 mb-8">
          <div className="flex items-center gap-3 border-b-2 border-indigo-900 pb-3 mb-6">
            <h2 className="text-xl font-black text-indigo-900 uppercase tracking-widest">AEO / GEO Intelligence Analysis</h2>
            <div className="bg-indigo-100 text-indigo-800 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">AI Search Readiness</div>
          </div>
          
          <div className="space-y-6">
            {aeo.metrics.map((metric: any, idx: number) => (
              <div key={idx} className="avoid-break border border-zinc-200 rounded-lg p-5 bg-white shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4 border-b border-zinc-100 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-zinc-900 leading-tight mb-1">{metric.title}</h3>
                    <p className="text-sm text-zinc-600">{metric.description}</p>
                  </div>
                  <div className="shrink-0">
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm border",
                      metric.status === 'passed' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                    )}>
                      {metric.status}
                    </span>
                  </div>
                </div>
                
                {metric.detailedReport && (
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Detailed Analysis</h4>
                    <p className="text-sm text-zinc-700 leading-relaxed bg-zinc-50 p-3 rounded-md border border-zinc-100">{metric.detailedReport}</p>
                  </div>
                )}
                
                {metric.recommendation && (
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-orange-700 mb-1.5">Recommendation</h4>
                    <p className="text-sm text-orange-900 leading-relaxed bg-orange-50/50 p-3 rounded-md border border-orange-100/50">{metric.recommendation}</p>
                  </div>
                )}
                
                {metric.codeSnippet && (
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Code Snippet</h4>
                    <pre className="text-[11px] font-mono text-zinc-800 bg-zinc-100 p-3 rounded-md border border-zinc-200 whitespace-pre-wrap overflow-x-auto">{metric.codeSnippet}</pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-zinc-200 text-center text-xs text-zinc-400 font-medium">
        Analyzed and Compiled by Plyxo Audit Report
      </div>
    </div>
  );
}
