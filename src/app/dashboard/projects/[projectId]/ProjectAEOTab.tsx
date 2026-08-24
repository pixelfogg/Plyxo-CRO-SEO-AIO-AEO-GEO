"use client";

import { useState, useEffect } from "react";
import { 
  ShieldCheck, AlertTriangle, FileText, FileCode2,
  BrainCircuit, Database, FileDigit, ScanSearch, XCircle, Search, Activity, Loader2, CheckCircle2, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { runAeoScan } from "../actions";

const ICON_MAP: Record<string, any> = {
  FileCode2,
  Database,
  FileText,
  ShieldCheck,
  FileDigit,
  Search,
  BrainCircuit,
  ScanSearch
};

export function ProjectAEOTab({ projectId, initialData }: { projectId: string, initialData?: any }) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<any>(initialData?.aeo || null);

  useEffect(() => {
    if (initialData?.aeo) {
      setScanResults(initialData.aeo);
    }
  }, [initialData]);

  const handleRunScan = async () => {
    setIsScanning(true);
    await runAeoScan(projectId);
    // Since runAeoScan calls revalidatePath, the page will automatically refresh with the new initialData.
    // However, to make it feel snappy, we can stop the loading state. 
    // In Next.js App Router, the server action revalidatePath causes a transparent re-render.
    setIsScanning(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "passed":
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200"><CheckCircle2 className="w-3 h-3 mr-1" /> Passed</Badge>;
      case "warning":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200"><AlertTriangle className="w-3 h-3 mr-1" /> Warning</Badge>;
      case "failed":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" /> Failed</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Answer Engine Optimization</h2>
          <p className="text-sm text-zinc-500">Analyze your site's readiness for LLMs and AI search engines.</p>
        </div>
        <Button onClick={handleRunScan} disabled={isScanning} className="flex items-center gap-2 h-9">
          {isScanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />}
          {isScanning ? "Running Analysis..." : "Run AEO Analysis"}
        </Button>
      </div>

      {!scanResults && !isScanning && (
        <Card className="shadow-sm border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <BrainCircuit className="h-12 w-12 text-zinc-300 mb-4" />
            <h3 className="text-lg font-medium text-zinc-900 mb-1">No AEO Analysis Found</h3>
            <p className="text-sm text-zinc-500 max-w-sm mb-4">Run an analysis to see how visible your project is to AI agents like ChatGPT, Perplexity, and Gemini.</p>
            <Button onClick={handleRunScan} variant="outline" className="flex items-center gap-2">
              <Activity className="h-4 w-4" /> Start Analysis
            </Button>
          </CardContent>
        </Card>
      )}

      {isScanning && (
        <Card className="shadow-sm border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
             <Loader2 className="h-8 w-8 text-zinc-400 animate-spin" />
             <div>
               <h3 className="text-lg font-medium text-zinc-900">Analyzing AI Readiness...</h3>
               <p className="text-sm text-zinc-500">Checking schemas, entity coverage, and crawlability.</p>
             </div>
          </CardContent>
        </Card>
      )}

      {scanResults && !isScanning && (
        <div className="grid gap-6 md:grid-cols-3">
          
          {/* Main Results Column */}
          <div className="md:col-span-2 space-y-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Parameter Analysis</CardTitle>
                <CardDescription>Detailed breakdown of your site's structural readiness for AI.</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion className="space-y-4">
                  {scanResults.metrics.map((metric: any, idx: number) => {
                    const MetricIcon = ICON_MAP[metric.icon] || Info;
                    return (
                      <AccordionItem key={idx} value={`item-${idx}`} className="border-none rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 overflow-hidden">
                        <AccordionTrigger className="p-4 hover:no-underline hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 transition-colors">
                          <div className="flex items-start justify-between w-full text-left gap-4 pr-4">
                            <div className="flex gap-3 flex-1 items-start">
                              <MetricIcon className="w-5 h-5 text-zinc-400 mt-0.5 shrink-0" />
                              <div>
                                <p className="font-medium text-sm text-zinc-900 dark:text-zinc-100">{metric.title}</p>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 font-normal leading-relaxed">{metric.description}</p>
                              </div>
                            </div>
                            <div className="shrink-0 pt-0.5">
                              {getStatusBadge(metric.status)}
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4 pt-0 text-zinc-700 dark:text-zinc-300">
                          <div className="pl-8 pr-4">
                            {metric.detailedReport && (
                              <div className="mb-4">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-500 mb-2">Detailed Analysis</h4>
                                <p className="text-sm leading-relaxed">{metric.detailedReport}</p>
                              </div>
                            )}
                            {metric.recommendation && (
                              <div className="mb-4 bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 p-4 rounded-lg">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-orange-700 dark:text-orange-400 mb-2">Recommendation</h4>
                                <p className="text-sm leading-relaxed text-orange-900 dark:text-orange-100">{metric.recommendation}</p>
                              </div>
                            )}
                            {metric.codeSnippet && (
                              <div className="bg-zinc-900 dark:bg-black p-4 rounded-lg overflow-hidden border border-zinc-800">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">Code Snippet</h4>
                                <pre className="text-xs font-mono text-zinc-300 whitespace-pre-wrap overflow-x-auto">{metric.codeSnippet}</pre>
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle>AI Visibility Score</CardTitle>
                <CardDescription>Latest scan: {scanResults.timestamp}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center py-6">
                <div className="relative w-32 h-32 flex items-center justify-center mb-2">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-zinc-100 dark:text-zinc-800"
                      strokeWidth="3"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={scanResults.score < 50 ? "text-red-500" : scanResults.score < 80 ? "text-amber-500" : "text-emerald-500"}
                      strokeDasharray={`${scanResults.score}, 100`}
                      strokeWidth="3"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{scanResults.score}</span>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium uppercase tracking-wider">/100</span>
                  </div>
                </div>
                <p className="text-sm font-medium text-amber-600 dark:text-amber-500">Needs Improvement</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Action Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {scanResults.actionItems.map((item: any, idx: number) => (
                  <div key={idx} className="flex gap-3 text-sm">
                    {item.type === 'critical' ? (
                      <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">{item.title}</p>
                      <p className="text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            
          </div>
        </div>
      )}
    </div>
  );
}
