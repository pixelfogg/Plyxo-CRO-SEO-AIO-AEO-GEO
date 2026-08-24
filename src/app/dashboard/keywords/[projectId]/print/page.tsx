import { notFound } from 'next/navigation'
import { AutoPrint } from '@/components/report/AutoPrint'
import { db } from '@/db'
import { projects, keywordOpportunities, rankingSuggestions } from '@/db/schema'
import { eq, asc } from 'drizzle-orm'
import { PlyxoLogo } from '@/components/ui/logo'
import { cn } from '@/lib/utils'

export default async function KeywordsPrintPage({
  params
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params;

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
  });

  if (!project) notFound();

  const keywords = await db.query.keywordOpportunities.findMany({
    where: eq(keywordOpportunities.projectId, projectId),
  });

  const suggestions = await db.query.rankingSuggestions.findMany({
    where: eq(rankingSuggestions.projectId, projectId),
    orderBy: [asc(rankingSuggestions.createdAt)]
  });

  const totalKeywords = keywords.length;
  const estTraffic = keywords.reduce((sum: number, k: any) => {
    let ctr = 0;
    if (k.position === 1) ctr = 0.3;
    else if (k.position === 2) ctr = 0.15;
    else if (k.position === 3) ctr = 0.1;
    else if (k.position && k.position > 3 && k.position <= 10) ctr = 0.03;
    else if (k.position && k.position > 10 && k.position <= 20) ctr = 0.01;
    return sum + ((k.volume || 0) * ctr);
  }, 0);
  
  const estValue = keywords.reduce((sum: number, k: any) => {
    let ctr = 0;
    if (k.position === 1) ctr = 0.3;
    else if (k.position === 2) ctr = 0.15;
    else if (k.position === 3) ctr = 0.1;
    else if (k.position && k.position > 3 && k.position <= 10) ctr = 0.03;
    else if (k.position && k.position > 10 && k.position <= 20) ctr = 0.01;
    return sum + ((k.volume || 0) * ctr * (k.cpc || 0));
  }, 0);

  const avgKd = totalKeywords > 0 ? (keywords.reduce((sum: number, k: any) => sum + (k.kd || 0), 0) / totalKeywords) : 0;
  const visibilityScore = totalKeywords > 0 ? Math.min(100, Math.max(0, 100 - avgKd + (estTraffic > 100 ? 10 : 0))) : 0;

  const getIntentColor = (intent: string | null) => {
    switch (intent) {
      case 'informational': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'commercial': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'transactional': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'navigational': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-zinc-100 text-zinc-700 border-zinc-200';
    }
  };

  const getKdColor = (kd: number) => {
    if (kd < 40) return 'text-emerald-600';
    if (kd < 70) return 'text-amber-600';
    return 'text-red-600';
  };

  keywords.sort((a: any, b: any) => (b.volume || 0) - (a.volume || 0));

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
              <h1 className="text-2xl font-black tracking-tight text-zinc-900 border-l-2 border-zinc-200 pl-3">Keyword Intelligence Report</h1>
           </div>
           <p className="text-sm font-medium text-zinc-500 mt-1">{project.websiteUrl}</p>
        </div>
        <div className="text-right">
           <div className="text-xs text-zinc-400 uppercase tracking-widest mb-1">Report Date</div>
           <div className="text-sm font-semibold">{new Date().toLocaleDateString()}</div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8 avoid-break">
        <div className="p-4 border-2 border-zinc-900 rounded-lg bg-zinc-50 flex flex-col shadow-[2px_2px_0_0_rgba(24,24,27,1)]">
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Tracked Keywords</p>
          <div className="text-3xl font-black tracking-tighter text-zinc-900">{totalKeywords.toLocaleString()}</div>
        </div>
        <div className="p-4 border border-zinc-200 rounded-lg bg-white flex flex-col">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Visibility Score</p>
          <div className="text-3xl font-black tracking-tighter text-emerald-600">{visibilityScore.toFixed(1)}%</div>
        </div>
        <div className="p-4 border border-zinc-200 rounded-lg bg-white flex flex-col">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Est. Traffic / mo</p>
          <div className="text-3xl font-black tracking-tighter text-purple-600">{Math.round(estTraffic).toLocaleString()}</div>
        </div>
        <div className="p-4 border border-zinc-200 rounded-lg bg-white flex flex-col">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Traffic Value / mo</p>
          <div className="text-3xl font-black tracking-tighter text-emerald-600">${Math.round(estValue).toLocaleString()}</div>
        </div>
      </div>

      {suggestions.length > 0 && (
        <div className="avoid-break mb-8 border border-[#5b8cce]/30 rounded-lg overflow-hidden">
          <div className="bg-[#5b8cce]/10 p-4 border-b border-[#5b8cce]/20">
             <h3 className="text-base font-bold text-[#5b8cce] flex items-center gap-2">
               Suggested Edits for Better Ranking
             </h3>
             <p className="text-xs text-zinc-600 mt-1">AI-generated, page-specific changes to help you rank for your target keywords.</p>
          </div>
          <div className="p-4 bg-white grid grid-cols-2 gap-4">
            {suggestions.map((s, i) => (
              <div key={i} className="border border-zinc-200 rounded p-3 text-xs bg-zinc-50">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-zinc-900 leading-tight">{s.title}</h4>
                  <span className={cn("px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider shrink-0", 
                    s.priority === 'high' ? 'bg-red-100 text-red-700' :
                    s.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-zinc-200 text-zinc-700'
                  )}>
                    {s.priority}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-1.5 py-0.5 bg-white border border-zinc-200 rounded text-[9px] font-mono font-medium text-zinc-600">{s.area}</span>
                  {s.impact && <span className="text-[9px] text-emerald-600 font-bold">{s.impact}</span>}
                </div>
                <p className="text-zinc-700 mb-2 leading-relaxed">{s.recommendation}</p>
                {s.example && (
                  <pre className="bg-white border border-zinc-200 p-2 rounded whitespace-pre-wrap font-mono text-[9px] text-zinc-800 leading-normal">
                    {s.example}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4 page-break-before">
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 border-b-2 border-zinc-900 pb-2 mb-4">Keyword Opportunities</h3>
        {keywords.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 font-medium bg-zinc-50 border border-dashed rounded-lg">
            No keywords tracked.
          </div>
        ) : (
          <div className="border border-zinc-200 rounded-lg overflow-hidden bg-white">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 text-[10px] uppercase tracking-wider text-zinc-500 font-bold border-b border-zinc-200">
                  <th className="p-3 w-[35%]">Keyword</th>
                  <th className="p-3">Intent</th>
                  <th className="p-3 text-right">Volume</th>
                  <th className="p-3 text-right">KD %</th>
                  <th className="p-3 text-right">CPC</th>
                  <th className="p-3 text-center">Pos</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {keywords.map((k: any) => (
                  <tr key={k.id} className="border-b border-zinc-100 last:border-0 avoid-break">
                    <td className="p-3 font-semibold text-zinc-900">{k.keyword}</td>
                    <td className="p-3">
                      <span className={cn("px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border", getIntentColor(k.intent))}>
                        {(k.intent || 'informational')}
                      </span>
                    </td>
                    <td className="p-3 text-right tabular-nums font-medium text-zinc-700">{(k.volume || 0).toLocaleString()}</td>
                    <td className="p-3 text-right tabular-nums font-bold">
                      <span className={getKdColor(k.kd || 0)}>{k.kd || 0}</span>
                    </td>
                    <td className="p-3 text-right tabular-nums text-zinc-600">${(k.cpc || 0).toFixed(2)}</td>
                    <td className="p-3 text-center">
                       {k.position ? (
                         <span className="font-bold text-zinc-900">{k.position}</span>
                       ) : <span className="text-zinc-300">-</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="mt-8 pt-6 border-t border-zinc-200 text-center text-xs text-zinc-400 font-medium">
        Analyzed and Compiled by Plyxo Keyword Intelligence
      </div>
    </div>
  );
}
