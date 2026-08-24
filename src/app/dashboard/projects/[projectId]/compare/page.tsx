import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/db';
import { scans, projects } from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { CoreWebVitals } from '@/lib/scanner/types';

export default async function CompareScansPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ scanA: string; scanB: string }>;
}) {
  const { projectId } = await params;
  const { scanA, scanB } = await searchParams;

  if (!scanA || !scanB) {
    notFound();
  }

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
  });

  if (!project) notFound();

  const fetchedScans = await db.query.scans.findMany({
    where: inArray(scans.id, [scanA, scanB]),
    orderBy: (scans, { asc }) => [asc(scans.createdAt)],
    columns: {
      screenshotBase64: false,
    }
  });

  if (fetchedScans.length !== 2) {
    return (
      <div className="p-8 text-center text-zinc-500">
        Could not load both scans for comparison.
      </div>
    );
  }

  // Older scan is Baseline (A), Newer scan is Target (B)
  const baseline = fetchedScans[0];
  const target = fetchedScans[1];

  const calculateOverallScore = (scan: typeof fetchedScans[0]) => {
    const s = (scan.scores as Record<string, number>) || {};
    const values = Object.values(s);
    if (values.length === 0) return 0;
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  };

  const scoreA = calculateOverallScore(baseline);
  const scoreB = calculateOverallScore(target);
  const scoreDelta = scoreB - scoreA;

  const vitalsA = baseline.coreWebVitals as CoreWebVitals | null;
  const vitalsB = target.coreWebVitals as CoreWebVitals | null;

  const renderDelta = (delta: number, suffix: string = '', invertGood: boolean = false) => {
    if (delta === 0) return <span className="text-zinc-500 flex items-center gap-1"><Minus className="h-4 w-4"/> 0{suffix}</span>;
    
    // For things like LCP, a negative delta (decrease) is GOOD.
    const isGood = invertGood ? delta < 0 : delta > 0;
    const color = isGood ? 'text-green-500' : 'text-red-500';
    const Icon = delta > 0 ? TrendingUp : TrendingDown;
    const sign = delta > 0 ? '+' : '';

    return (
      <span className={`${color} flex items-center gap-1 font-medium`}>
        <Icon className="h-4 w-4" /> {sign}{delta.toFixed(delta % 1 !== 0 ? 2 : 0)}{suffix}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="mb-4">
          <Link href={`/dashboard/projects/${projectId}`}>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs font-medium bg-[#faf9f5] dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27] hover:border-[#cc785c]/40 hover:text-[#cc785c] transition-all">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Project
            </Button>
          </Link>
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Scan Comparison</h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Comparing baseline scan ({baseline.id.split('-')[0]}) vs target scan ({target.id.split('-')[0]}).
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Overall Score</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{scoreB}</span>
              <span className="text-sm text-zinc-500 line-through">{scoreA}</span>
            </div>
            <div>
              {renderDelta(scoreDelta)}
            </div>
          </CardContent>
        </Card>

        {vitalsB && vitalsA && (
          <>
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-zinc-500">LCP (Largest Contentful Paint)</CardTitle>
              </CardHeader>
              <CardContent className="flex items-end justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{vitalsB.lcp != null ? `${(vitalsB.lcp / 1000).toFixed(1)}s` : 'N/A'}</span>
                  <span className="text-sm text-zinc-500 line-through">{vitalsA.lcp != null ? `${(vitalsA.lcp / 1000).toFixed(1)}s` : 'N/A'}</span>
                </div>
                <div>
                  {vitalsA.lcp != null && vitalsB.lcp != null && renderDelta((vitalsB.lcp - vitalsA.lcp) / 1000, 's', true)}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-zinc-500">CLS (Cumulative Layout Shift)</CardTitle>
              </CardHeader>
              <CardContent className="flex items-end justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{vitalsB.cls != null ? vitalsB.cls.toFixed(3) : 'N/A'}</span>
                  <span className="text-sm text-zinc-500 line-through">{vitalsA.cls != null ? vitalsA.cls.toFixed(3) : 'N/A'}</span>
                </div>
                <div>
                  {vitalsA.cls != null && vitalsB.cls != null && renderDelta(vitalsB.cls - vitalsA.cls, '', true)}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Category Scores</CardTitle>
          <CardDescription>Detailed breakdown of scoring differences.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border border-zinc-100 dark:border-zinc-800 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900/50">
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <th className="text-left py-3 px-4 font-medium text-zinc-500">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-zinc-500">Baseline ({new Date(baseline.createdAt!).toLocaleDateString('en-US')})</th>
                  <th className="text-left py-3 px-4 font-medium text-zinc-500">Target ({new Date(target.createdAt!).toLocaleDateString('en-US')})</th>
                  <th className="text-right py-3 px-4 font-medium text-zinc-500">Delta</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys((target.scores as Record<string, number>) || {}).map((category) => {
                  const sA = (baseline.scores as Record<string, number>)?.[category] || 0;
                  const sB = (target.scores as Record<string, number>)?.[category] || 0;
                  const delta = sB - sA;
                  
                  return (
                    <tr key={category} className="border-b border-zinc-100 dark:border-zinc-800 last:border-0 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20">
                      <td className="py-3 px-4 font-medium uppercase">{category}</td>
                      <td className="py-3 px-4">{sA}</td>
                      <td className="py-3 px-4 font-bold">{sB}</td>
                      <td className="py-3 px-4 text-right flex justify-end">
                        {renderDelta(delta)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
