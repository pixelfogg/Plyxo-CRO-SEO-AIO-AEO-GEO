"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { getProjects } from "../../seo/actions";
import { Loader2, Crosshair, ArrowLeft, Search, Users, Trophy, Target, Plus, AlertCircle, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

import { getCompetitors, getCompetitorKeywordGaps, analyzeCompetitor } from "../actions";

export default function CompetitorProjectDashboard() {
  const params = useParams();
  const projectId = params.projectId as string;
  
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [competitors, setCompetitors] = useState<any[]>([]);
  const [keywordGaps, setKeywordGaps] = useState<any[]>([]);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [competitorUrlInput, setCompetitorUrlInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    async function load() {
      const result = await getProjects();
      if (result.success && result.projects) {
        const found = result.projects.find((p: any) => p.id === projectId);
        if (found) {
          setProject(found);
        }
      }
      
      const compResult = await getCompetitors(projectId);
      if (compResult.success) setCompetitors(compResult.competitors || []);
      
      const gapResult = await getCompetitorKeywordGaps(projectId);
      if (gapResult.success) setKeywordGaps(gapResult.gaps || []);
      
      setIsLoading(false);
    }
    load();
  }, [projectId]);

  const handleAddCompetitor = async () => {
    if (!competitorUrlInput) return;
    setIsAnalyzing(true);
    const result = await analyzeCompetitor(projectId, competitorUrlInput);
    if (result.success) {
      const compResult = await getCompetitors(projectId);
      if (compResult.success) setCompetitors(compResult.competitors || []);
      
      const gapResult = await getCompetitorKeywordGaps(projectId);
      if (gapResult.success) setKeywordGaps(gapResult.gaps || []);
      
      setIsAddModalOpen(false);
      setCompetitorUrlInput("");
    } else {
      alert("Failed to analyze competitor: " + result.error);
    }
    setIsAnalyzing(false);
  };

  // KPIs
  const totalGaps = keywordGaps.length;
  const topCompetitor = competitors.length > 0 ? competitors[0] : null;

  if (isLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-zinc-400" /></div>;
  }

  if (!project) {
    return <div className="p-12 text-center text-zinc-500">Project not found.</div>;
  }

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case 'informational': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200';
      case 'commercial': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200';
      case 'transactional': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200';
      default: return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-900/30 dark:text-zinc-400 border-zinc-200';
    }
  };

  const getKdColor = (kd: number) => {
    if (kd < 40) return 'text-emerald-500';
    if (kd < 70) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <div className="mb-2">
            <Link href="/dashboard/competitors">
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs font-medium bg-[#faf9f5] dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27] hover:border-[#cc785c]/40 hover:text-[#cc785c] transition-all">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Competitor Intelligence
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl font-bold">Competitor Intelligence: <span className="text-[#e85a5a] font-semibold">{project.name}</span></h1>
            <Badge variant="outline" className="bg-[#e85a5a]/10 text-[#e85a5a] border-[#e85a5a]/20">Pro</Badge>
          </div>
          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <span>{project.websiteUrl}</span>
            <span>Database: US (English)</span>
            <span>Competitors Tracked: {competitors.length}/5</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button className="bg-[#e85a5a] hover:bg-[#d44848] text-white" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Competitor
          </Button>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-2xl">
            <CardHeader>
              <CardTitle>Add Competitor</CardTitle>
              <CardDescription>Enter the URL of your competitor to run an AI-powered gap analysis.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input 
                placeholder="https://competitor.com" 
                value={competitorUrlInput}
                onChange={(e) => setCompetitorUrlInput(e.target.value)}
                disabled={isAnalyzing}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddModalOpen(false)} disabled={isAnalyzing}>Cancel</Button>
                <Button className="bg-[#e85a5a] hover:bg-[#d44848] text-white" onClick={handleAddCompetitor} disabled={isAnalyzing}>
                  {isAnalyzing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  {isAnalyzing ? "Analyzing..." : "Analyze Competitor"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* KPI Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="shadow-sm border-[#e6dfd8] dark:border-[#2e2b27] bg-[#faf9f5] dark:bg-[#181715]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 flex items-center justify-between">
              Your Domain Authority <Trophy className="w-4 h-4 text-[#e85a5a]" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">42</span>
              <span className="text-xs text-zinc-500">/ 100</span>
            </div>
            <div className="text-xs text-zinc-500 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-500" /> +2 points this month
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-[#e6dfd8] dark:border-[#2e2b27] bg-[#faf9f5] dark:bg-[#181715]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 flex items-center justify-between">
              Top Competitor <Users className="w-4 h-4 text-zinc-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-xl font-bold text-zinc-900 dark:text-zinc-50 truncate max-w-[200px]">{topCompetitor ? topCompetitor.name : 'None'}</span>
            </div>
            <div className="text-xs text-zinc-500 flex items-center gap-1">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">{topCompetitor ? topCompetitor.da : '-'}</span> Domain Authority
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-[#e6dfd8] dark:border-[#2e2b27] bg-[#faf9f5] dark:bg-[#181715]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 flex items-center justify-between">
              Missing Opportunities <Target className="w-4 h-4 text-[#e85a5a]" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">{totalGaps.toLocaleString()}</span>
            </div>
            <div className="text-xs text-zinc-500 flex items-center gap-1">
              Keywords they rank for, but you don't.
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Competitor Overview */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-sm border-none bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Competitor Overview</CardTitle>
              <CardDescription>Tracked rivals in your semantic space.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {competitors.map((comp) => (
                  <div key={comp.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">{comp.name}</span>
                      <span className="text-zinc-500">DA: {comp.da}</span>
                    </div>
                    <div className="flex justify-between text-xs text-zinc-500 mb-1">
                      <span>Traffic Share</span>
                      <span className="font-semibold text-[#e85a5a]">{comp.trafficShare}%</span>
                    </div>
                    <Progress value={comp.trafficShare} className="h-2 [&>div]:bg-[#e85a5a]" />
                    <p className="text-[10px] text-zinc-400 text-right mt-1">{(comp.overlap || 0).toLocaleString()} overlapping keywords</p>
                  </div>
                ))}
                {competitors.length === 0 && (
                  <div className="text-center py-8 text-zinc-500">
                    No competitors tracked yet. Add one above.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Keyword Gap Analysis */}
        <div className="lg:col-span-2">
          <Card className="shadow-sm border-none bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm h-full">
            <CardHeader className="pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Keyword Gap Analysis</CardTitle>
                  <CardDescription>High-value keywords your competitors rank for.</CardDescription>
                </div>
                <Button variant="outline" size="sm">Export CSV</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto rounded-b-xl border-x border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                <Table>
                  <TableHeader className="bg-zinc-50/80 dark:bg-zinc-900/50 backdrop-blur-sm">
                    <TableRow>
                      <TableHead>Keyword</TableHead>
                      <TableHead>Intent</TableHead>
                      <TableHead className="text-right">Volume</TableHead>
                      <TableHead className="text-right">KD %</TableHead>
                      <TableHead className="text-center">Your Pos</TableHead>
                      <TableHead className="text-center">Comp Pos</TableHead>
                      <TableHead>Top Competitor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {keywordGaps.map((gap) => (
                      <TableRow key={gap.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                        <TableCell className="font-medium text-zinc-900 dark:text-zinc-100">
                          {gap.keyword}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`capitalize text-[10px] font-medium tracking-wide ${getIntentColor(gap.intent || 'informational')}`}>
                            {(gap.intent || 'informational').charAt(0)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-zinc-600 dark:text-zinc-400">
                          {(gap.volume || 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          <span className={`font-medium ${getKdColor(gap.kd || 0)}`}>{gap.kd || 0}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          {gap.myPosition ? (
                            <span className="text-zinc-600 dark:text-zinc-400">{gap.myPosition}</span>
                          ) : (
                            <span className="text-zinc-300 dark:text-zinc-700">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-bold text-zinc-900 dark:text-zinc-100">{gap.compTopPosition || '-'}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-zinc-500">{gap.competitor?.name}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                    {keywordGaps.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="h-32 text-center text-zinc-500">
                          No keyword gaps found. Add a competitor to analyze gaps.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
