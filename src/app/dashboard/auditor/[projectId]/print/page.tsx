import { notFound } from 'next/navigation'
import { AutoPrint } from '@/components/report/AutoPrint'
import { db } from '@/db'
import { projects, projectPages } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { PlyxoLogo } from '@/components/ui/logo'
import { cn } from '@/lib/utils'

export default async function AuditorPrintPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
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

  const analyzedPages = pages.filter(p => p.contentAnalysis);

  const getScoreColorHex = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 50) return 'text-amber-500';
    return 'text-red-500';
  };

  // calculate overall averages
  let avgSeo = 0, avgGrammar = 0, avgStructure = 0;
  if (analyzedPages.length > 0) {
    avgSeo = Math.round(analyzedPages.reduce((acc, p) => acc + ((p.contentAnalysis as any).seoScore || 0), 0) / analyzedPages.length);
    avgGrammar = Math.round(analyzedPages.reduce((acc, p) => acc + ((p.contentAnalysis as any).grammarScore || 0), 0) / analyzedPages.length);
    avgStructure = Math.round(analyzedPages.reduce((acc, p) => acc + ((p.contentAnalysis as any).structureScore || 0), 0) / analyzedPages.length);
  }
  const overallScore = Math.round((avgSeo + avgGrammar + avgStructure) / 3) || 0;

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
              <h1 className="text-2xl font-black tracking-tight text-zinc-900 border-l-2 border-zinc-200 pl-3">Content Audit Report</h1>
           </div>
           <p className="text-sm font-medium text-zinc-500 mt-1">{project.websiteUrl}</p>
        </div>
        <div className="text-right">
           <div className="text-xs text-zinc-400 uppercase tracking-widest mb-1">Audit Date</div>
           <div className="text-sm font-semibold">{new Date().toLocaleDateString()}</div>
        </div>
      </div>

      <div className="flex gap-6 mb-8 avoid-break">
        <div className="p-6 border-2 border-zinc-900 rounded-xl bg-zinc-50 flex flex-col items-center justify-center shrink-0 w-48 shadow-[4px_4px_0_0_rgba(24,24,27,1)]">
          <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest mb-1">Overall Score</p>
          <div className="text-6xl font-black text-amber-600 tracking-tighter">{overallScore}</div>
        </div>
        <div className="flex-1">
          <p className="text-sm text-zinc-700 font-medium mb-3">Executive Summary across {analyzedPages.length} Analyzed Pages</p>
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 border rounded border-zinc-200 bg-white flex flex-col items-center justify-center text-center">
              <span className="font-semibold uppercase text-[9px] tracking-wider text-zinc-500 mb-1">SEO</span>
              <span className={cn("text-lg font-black leading-none", getScoreColorHex(avgSeo))}>{avgSeo}</span>
            </div>
            <div className="p-2 border rounded border-zinc-200 bg-white flex flex-col items-center justify-center text-center">
              <span className="font-semibold uppercase text-[9px] tracking-wider text-zinc-500 mb-1">Grammar & Readability</span>
              <span className={cn("text-lg font-black leading-none", getScoreColorHex(avgGrammar))}>{avgGrammar}</span>
            </div>
            <div className="p-2 border rounded border-zinc-200 bg-white flex flex-col items-center justify-center text-center">
              <span className="font-semibold uppercase text-[9px] tracking-wider text-zinc-500 mb-1">Structure</span>
              <span className={cn("text-lg font-black leading-none", getScoreColorHex(avgStructure))}>{avgStructure}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {analyzedPages.map((page) => {
          const analysis = page.contentAnalysis as any;
          return (
            <div key={page.id} className="avoid-break mb-6 border border-zinc-200 rounded-lg p-5 bg-white shadow-sm flex flex-col gap-4">
              <div className="flex justify-between items-start border-b border-zinc-100 pb-3">
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="text-base font-bold text-zinc-900 leading-tight mb-1 truncate">{page.title || page.url}</h3>
                  <p className="text-xs text-zinc-500 truncate">{page.url}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                   <div className="text-center">
                     <div className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">SEO</div>
                     <div className={cn("font-bold text-sm", getScoreColorHex(analysis.seoScore))}>{analysis.seoScore}</div>
                   </div>
                   <div className="text-center">
                     <div className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Grammar</div>
                     <div className={cn("font-bold text-sm", getScoreColorHex(analysis.grammarScore))}>{analysis.grammarScore}</div>
                   </div>
                   <div className="text-center">
                     <div className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Structure</div>
                     <div className={cn("font-bold text-sm", getScoreColorHex(analysis.structureScore))}>{analysis.structureScore}</div>
                   </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6 text-xs">
                <div>
                  <h4 className="font-bold text-zinc-900 uppercase tracking-widest text-[10px] mb-2 border-b pb-1">SEO Analysis</h4>
                  <p className="text-zinc-700 leading-relaxed mb-2">{analysis.seoFeedback}</p>
                  {analysis.seoIssues?.length > 0 && (
                    <ul className="list-disc pl-4 space-y-1 text-red-700 font-medium">
                      {analysis.seoIssues.map((issue: string, i: number) => <li key={i}>{issue}</li>)}
                    </ul>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-zinc-900 uppercase tracking-widest text-[10px] mb-2 border-b pb-1">Grammar & Readability</h4>
                  <p className="text-zinc-700 leading-relaxed mb-2">{analysis.grammarFeedback}</p>
                  {analysis.grammarIssues?.length > 0 && (
                    <ul className="list-disc pl-4 space-y-1 text-amber-700 font-medium">
                      {analysis.grammarIssues.map((issue: string, i: number) => <li key={i}>{issue}</li>)}
                    </ul>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-zinc-900 uppercase tracking-widest text-[10px] mb-2 border-b pb-1">Content Structure</h4>
                  <p className="text-zinc-700 leading-relaxed">{analysis.structureFeedback}</p>
                </div>
              </div>
            </div>
          );
        })}

        {analyzedPages.length === 0 && (
          <div className="text-sm text-zinc-500 text-center py-12 border-2 border-dashed border-zinc-200 rounded-lg">
            No pages have been analyzed yet for this project.
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-zinc-200 text-center text-xs text-zinc-400 font-medium">
        Analyzed and Compiled by Plyxo Content Auditor
      </div>
    </div>
  );
}
