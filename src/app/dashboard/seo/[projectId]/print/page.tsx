import { notFound } from 'next/navigation'
import { AutoPrint } from '@/components/report/AutoPrint'
import { db } from '@/db'
import { projects, scans } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { PlyxoLogo } from '@/components/ui/logo'
import { cn } from '@/lib/utils'
import { calculateThemeScore } from '@/lib/seo-utils'

export default async function SeoPrintPage({
  params,
  searchParams
}: {
  params: Promise<{ projectId: string }>,
  searchParams: Promise<{ scanId?: string }>
}) {
  const { projectId } = await params;
  const { scanId } = await searchParams;

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
  });

  if (!project) notFound();

  let scanRaw;
  if (scanId) {
    scanRaw = await db.query.scans.findFirst({
      where: eq(scans.id, scanId),
      with: { issues: true }
    });
  } else {
    scanRaw = await db.query.scans.findFirst({
      where: eq(scans.projectId, projectId),
      orderBy: [desc(scans.createdAt)],
      with: { issues: true }
    });
  }

  if (!scanRaw) notFound();

  const healthScore = (scanRaw.scores as any)?.siteHealth ?? (scanRaw.scores as any)?.seo ?? 0;
  const issues = (scanRaw.issues as any[]) || [];
  
  const errors = issues.filter(i => i.severity === 'error' || i.severity === 'critical' || i.severity === 'high');
  const warnings = issues.filter(i => i.severity === 'warning' || i.severity === 'medium');

  const getScoreColorHex = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-amber-500';
    return 'text-red-500';
  };

  const getScoreColorHexBg = (score: number) => {
    if (score >= 90) return 'bg-green-50 border-green-200';
    if (score >= 70) return 'bg-amber-50 border-amber-200';
    return 'bg-red-50 border-red-200';
  };

  const themes = [
    { key: 'coreWebVitals', label: 'Performance' },
    { key: 'crawlability', label: 'Crawlability' },
    { key: 'internalLinking', label: 'Linking' },
    { key: 'markup', label: 'Markup' },
    { key: 'https', label: 'Security' },
    { key: 'robotsTxt', label: 'Robots.txt' }
  ];

  const thematicScores = (scanRaw.scores as any)?.thematic || {};

  return (
    <div className="min-h-screen bg-white text-black p-4 max-w-4xl mx-auto font-sans print:p-0 text-sm">
      <AutoPrint />
      
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

      {/* Cover */}
      <div className="flex items-center justify-between border-b-2 border-zinc-900 pb-4 mb-6 avoid-break">
        <div>
           <div className="flex items-center gap-3">
              <PlyxoLogo className="h-7" forceDark={true} />
              <h1 className="text-2xl font-black tracking-tight text-zinc-900 border-l-2 border-zinc-200 pl-3">Technical SEO Report</h1>
           </div>
           <p className="text-sm font-medium text-zinc-500 mt-1">{project.websiteUrl}</p>
        </div>
        <div className="text-right">
           <div className="text-xs text-zinc-400 uppercase tracking-widest mb-1">Scan Date</div>
           <div className="text-sm font-semibold">{scanRaw.createdAt ? new Date(scanRaw.createdAt).toLocaleDateString() : 'N/A'}</div>
        </div>
      </div>

      <div className="flex gap-6 mb-8 avoid-break">
        <div className="p-6 border-2 border-zinc-900 rounded-xl bg-zinc-50 flex flex-col items-center justify-center shrink-0 w-48 shadow-[4px_4px_0_0_rgba(24,24,27,1)]">
          <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest mb-1">Site Health</p>
          <div className={cn("text-6xl font-black tracking-tighter", getScoreColorHex(healthScore))}>{healthScore}</div>
        </div>
        <div className="flex-1">
          <p className="text-sm text-zinc-700 font-medium mb-3">Executive Summary</p>
          <div className="grid grid-cols-2 gap-4">
             <div className="p-3 border rounded border-red-200 bg-red-50 text-center">
                <span className="font-semibold uppercase text-[10px] tracking-wider text-red-700 mb-1 block">Errors (Critical)</span>
                <span className="text-2xl font-black text-red-600 leading-none">{errors.length}</span>
             </div>
             <div className="p-3 border rounded border-orange-200 bg-orange-50 text-center">
                <span className="font-semibold uppercase text-[10px] tracking-wider text-orange-700 mb-1 block">Warnings</span>
                <span className="text-2xl font-black text-orange-600 leading-none">{warnings.length}</span>
             </div>
          </div>
        </div>
      </div>

      <div className="space-y-10">
        {themes.map(t => {
          const rawScore = thematicScores[t.key] || 0;
          const analysis = calculateThemeScore(t.key, issues, rawScore);
          const { checksStatus, passedCount, totalChecks, unmatchedIssues, score } = analysis;

          return (
            <div key={t.key} className="avoid-break mb-8">
              <div className={cn("flex justify-between items-center p-4 border rounded-t-lg", getScoreColorHexBg(score))}>
                <h3 className="text-lg font-bold uppercase tracking-wider text-zinc-900">{t.label}</h3>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-0.5">Theme Score</span>
                  <span className={cn("text-2xl font-black", getScoreColorHex(score))}>{score}%</span>
                </div>
              </div>
              
              <div className="border border-t-0 border-zinc-200 rounded-b-lg p-5 bg-white">
                <p className="text-xs font-semibold text-zinc-500 mb-4 uppercase tracking-widest">
                  Checks Performed ({passedCount}/{totalChecks} Passed)
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {checksStatus.map((check, idx) => (
                    <div key={idx} className={cn("p-3 rounded border", check.passed ? "bg-green-50/50 border-green-200" : "bg-red-50 border-red-200")}>
                      <div className="flex items-start gap-2">
                        <span className={cn("text-base font-bold", check.passed ? "text-green-600" : "text-red-600")}>
                          {check.passed ? "✓" : "✗"}
                        </span>
                        <div>
                          <p className="font-semibold text-sm text-zinc-900">{check.label}</p>
                          {!check.passed && check.failedIssues.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {check.failedIssues.map((issue, iIdx) => (
                                <div key={iIdx} className="bg-white p-2 rounded text-xs border border-red-100 shadow-sm">
                                  <p className="font-bold text-red-800 mb-1">{issue.title}</p>
                                  <p className="text-zinc-700 leading-relaxed">{issue.description}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {unmatchedIssues.length > 0 && (
                     <div className="col-span-full mt-4">
                       <p className="text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-widest">Other Discovered Issues</p>
                       <div className="grid grid-cols-1 gap-3">
                         {unmatchedIssues.map((issue, idx) => (
                            <div key={'unmatched'+idx} className="p-3 rounded border bg-orange-50 border-orange-200 flex items-start gap-2">
                               <span className="text-base font-bold text-orange-600">!</span>
                               <div>
                                 <p className="font-semibold text-sm text-zinc-900">{issue.title}</p>
                                 <p className="text-zinc-700 text-xs mt-1 leading-relaxed bg-white p-2 rounded shadow-sm">{issue.description}</p>
                               </div>
                            </div>
                         ))}
                       </div>
                     </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="page-break-before mt-12 pt-6">
        <h3 className="text-xl font-bold uppercase tracking-wider text-zinc-900 mb-4 border-b-2 border-zinc-900 pb-2">Full Issue Log & How to Fix</h3>
        {issues.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 font-medium bg-zinc-50 border border-dashed rounded-lg">
            No technical SEO issues were found. Excellent!
          </div>
        ) : (
          issues.map((issue, idx) => {
            const isError = issue.severity === 'error' || issue.priority === 'critical' || issue.priority === 'high';
            return (
              <div key={idx} className="avoid-break border border-zinc-200 rounded-lg p-5 bg-white shadow-sm flex flex-col gap-3 mb-4">
                <div className="flex items-center gap-2 mb-1">
                   <span className={cn(
                     "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded",
                     isError ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"
                   )}>
                     {issue.priority || (isError ? 'High' : 'Medium')} Priority
                   </span>
                   <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-100 text-zinc-600">
                     {issue.severity}
                   </span>
                </div>
                <h4 className="text-lg font-bold text-zinc-900 leading-tight">{issue.title}</h4>
                
                <div className="mt-2 space-y-3">
                  <div>
                    <h5 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Description</h5>
                    <p className="text-sm text-zinc-700 leading-relaxed">
                      {issue.description}
                    </p>
                  </div>
                  
                  <div className="bg-zinc-50 border border-zinc-200 rounded p-4">
                    <h5 className="text-[10px] font-bold uppercase tracking-widest text-zinc-800 mb-1 flex items-center gap-1">
                      <span className="text-indigo-600">🛠</span> How to fix
                    </h5>
                    <p className="text-sm text-zinc-700 leading-relaxed">
                      {issue.recommendation || issue.description}
                    </p>
                  </div>
                </div>

                {issue.businessImpact && (
                  <div className="mt-2 text-xs">
                    <span className="font-semibold text-zinc-500 mr-2">Pages Affected:</span>
                    <span className="font-bold text-zinc-900">{issue.businessImpact}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      
      <div className="mt-8 pt-6 border-t border-zinc-200 text-center text-xs text-zinc-400 font-medium">
        Analyzed and Compiled by Plyxo Technical SEO Intelligence
      </div>
    </div>
  );
}
