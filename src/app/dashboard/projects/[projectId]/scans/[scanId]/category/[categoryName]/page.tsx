import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/db'
import { scans } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, CheckCircle, Check, X, FileSearch } from 'lucide-react'
import { MASTER_CHECKLIST } from '@/lib/scanner/master-checklist'
import { calculateAllScores } from '@/lib/scanner/score'

export default async function CategoryReportPage({
  params,
}: {
  params: Promise<{ projectId: string; scanId: string; categoryName: string }>
}) {
  const { projectId, scanId, categoryName } = await params;

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

  const category = categoryName.toLowerCase();

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 50) return 'text-amber-500';
    return 'text-red-500';
  };

  const allScores = calculateAllScores(scan);

  if (allScores[category] === undefined) {
    notFound(); // Invalid category
  }

  const score = allScores[category];
  const relevantCategoriesForPage = category === 'cro' ? ['copywriting', 'ux', 'visual', 'trust', 'cta', 'cro'] : [category];
  const categoryIssues = scan.issues.filter(i => relevantCategoriesForPage.includes(i.category));
  const categoryMaster = MASTER_CHECKLIST.filter(c => c.category === category && c.isCore);
  const passedChecks = categoryMaster.length > 0
    ? categoryMaster.filter(m => !categoryIssues.some(i => i.title.toLowerCase().includes(m.title.toLowerCase()) || m.title.toLowerCase().includes(i.title.toLowerCase())))
    : [];

  return (
    <div className="space-y-8 w-full py-8">
      <div>
        <div className="mb-6">
          <Link href={`/dashboard/projects/${projectId}/scans/${scanId}`}>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs font-medium bg-[#faf9f5] dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27] hover:border-[#cc785c]/40 hover:text-[#cc785c] transition-all">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Scan Overview
            </Button>
          </Link>
        </div>
        
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <FileSearch className="h-8 w-8 text-indigo-500" />
            <h1 className="text-3xl font-bold uppercase tracking-tight">{category} Analysis</h1>
          </div>
          <div className={`text-xl font-bold px-6 py-2 border rounded-full ${getScoreColor(score)} bg-zinc-50 dark:bg-zinc-900/50 shadow-sm`}>
            Score: {score}/100
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Failed Checks Column */}
        <Card className="shadow-md border-red-100 dark:border-red-900/30 overflow-hidden h-fit pt-0">
          <div className="bg-red-50 dark:bg-red-950/20 p-5 border-b border-red-100 dark:border-red-900/30">
            <h2 className="text-lg font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
              <X className="h-6 w-6" /> Failed Parameters ({categoryIssues.length})
            </h2>
          </div>
          <CardContent className="p-0">
            {categoryIssues.length === 0 ? (
              <div className="p-12 text-center text-zinc-500 italic">
                No issues detected! Perfect score.
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {categoryIssues.map(issue => (
                  <div key={issue.id} className="p-6">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge variant={issue.priority === 'critical' ? 'destructive' : (issue.priority === 'high' ? 'destructive' : 'secondary')} className="uppercase text-[10px]">
                        {issue.priority} Impact
                      </Badge>
                      <h3 className="font-semibold text-base">{issue.title}</h3>
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-5 leading-relaxed">{issue.description}</p>
                    
                    {!!issue.implementationSteps && Array.isArray(issue.implementationSteps) && issue.implementationSteps.length > 0 && (
                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-5 rounded-xl border border-zinc-100 dark:border-zinc-800">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Remediation Steps
                        </h4>
                        <ul className="space-y-3">
                          {((issue.implementationSteps as unknown as string[]) || []).map((step, i) => (
                            <li key={i} className="text-sm text-zinc-600 dark:text-zinc-300 flex items-start gap-3">
                              <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-zinc-200 dark:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                {i + 1}
                              </span>
                              <span className="mt-1">{String(step)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Passed Checks Column */}
        <Card className="shadow-md border-green-100 dark:border-green-900/30 overflow-hidden h-fit pt-0">
          <div className="bg-green-50 dark:bg-green-950/20 p-5 border-b border-green-100 dark:border-green-900/30">
            <h2 className="text-lg font-bold text-green-600 dark:text-green-500 flex items-center gap-2">
              <CheckCircle className="h-6 w-6" /> Passed Parameters {passedChecks.length > 0 && `(${passedChecks.length})`}
            </h2>
          </div>
          <CardContent className="p-0">
            {passedChecks.length > 0 ? (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {passedChecks.map(check => (
                  <div key={check.id} className="p-5 flex items-start gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/20 transition-colors">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold mb-1">{check.title}</p>
                      <p className="text-xs text-zinc-500 leading-relaxed">{check.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-zinc-500 italic">
                {categoryMaster.length === 0 
                  ? "All AI heuristic patterns evaluated successfully without flags." 
                  : "No explicitly passed checks documented."}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
