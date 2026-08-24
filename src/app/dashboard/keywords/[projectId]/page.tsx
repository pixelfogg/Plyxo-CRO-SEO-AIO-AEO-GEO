"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { getProjects } from "../../seo/actions";
import { Loader2, Key, ArrowLeft, Search, TrendingUp, TrendingDown, Eye, Filter, Plus, Info } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { getKeywordOpportunities, runKeywordDiscovery, getRankingSuggestions, getSavedRankingSuggestions } from "../actions";
import { toast } from "sonner";
import { Sparkles, Wand2 } from "lucide-react";
import { ShareLinkClient } from "@/components/report/ShareLinkClient";
import { PdfReportClient } from "@/components/report/PdfReportClient";

export default function KeywordProjectDashboard() {
  const params = useParams();
  const projectId = params.projectId as string;
  
  const [project, setProject] = useState<any>(null);
  const [keywords, setKeywords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dataSource, setDataSource] = useState<string>("estimated");
  const [suggestions, setSuggestions] = useState<any[] | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);

  useEffect(() => {
    async function load() {
      const result = await getProjects();
      if (result.success && result.projects) {
        const found = result.projects.find((p: any) => p.id === projectId);
        if (found) {
          setProject(found);
        }
      }
      const kwResult = await getKeywordOpportunities(projectId);
      if (kwResult.success && kwResult.keywords) {
        setKeywords(kwResult.keywords);
      }
      if (kwResult.dataSource) setDataSource(kwResult.dataSource);

      // Load saved suggestions
      const suggResult = await getSavedRankingSuggestions(projectId);
      if (suggResult.success && suggResult.suggestions && suggResult.suggestions.length > 0) {
        setSuggestions(suggResult.suggestions);
      }

      setIsLoading(false);
    }
    load();
  }, [projectId]);

  const handleGenerateSuggestions = async () => {
    setIsSuggesting(true);
    const res = await getRankingSuggestions(projectId);
    if (res.success && res.suggestions) {
      setSuggestions(res.suggestions);
      toast.success("Ranking suggestions ready");
    } else {
      toast.error(res.error || "Could not generate suggestions");
    }
    setIsSuggesting(false);
  };

  const handleDiscover = async () => {
    setIsAnalyzing(true);
    const result = await runKeywordDiscovery(projectId);
    if (result.success) {
      const kwResult = await getKeywordOpportunities(projectId);
      if (kwResult.success && kwResult.keywords) {
        setKeywords(kwResult.keywords);
        if (kwResult.dataSource) setDataSource(kwResult.dataSource);
      }
      toast.success("Keyword discovery complete");
    } else {
      toast.error("Keyword discovery failed", { description: result.error });
    }
    setIsAnalyzing(false);
  };

  const totalKeywords = keywords.length;
  const estTraffic = keywords.reduce((sum, k) => {
    let ctr = 0;
    if (k.position === 1) ctr = 0.3;
    else if (k.position === 2) ctr = 0.15;
    else if (k.position === 3) ctr = 0.1;
    else if (k.position > 3 && k.position <= 10) ctr = 0.03;
    else if (k.position > 10 && k.position <= 20) ctr = 0.01;
    return sum + (k.volume * ctr);
  }, 0);
  
  const estValue = keywords.reduce((sum, k) => {
    let ctr = 0;
    if (k.position === 1) ctr = 0.3;
    else if (k.position === 2) ctr = 0.15;
    else if (k.position === 3) ctr = 0.1;
    else if (k.position > 3 && k.position <= 10) ctr = 0.03;
    else if (k.position > 10 && k.position <= 20) ctr = 0.01;
    return sum + (k.volume * ctr * (k.cpc || 0));
  }, 0);

  const avgKd = totalKeywords > 0 ? (keywords.reduce((sum, k) => sum + (k.kd || 0), 0) / totalKeywords) : 0;
  const visibilityScore = totalKeywords > 0 ? Math.min(100, Math.max(0, 100 - avgKd + (estTraffic > 100 ? 10 : 0))) : 0;

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
      case 'navigational': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200';
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
            <Link href="/dashboard/keywords">
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs font-medium bg-[#faf9f5] dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27] hover:border-[#cc785c]/40 hover:text-[#cc785c] transition-all">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Keyword Intelligence
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl font-bold">Keyword Intelligence: <span className="text-[#5b8cce] font-semibold">{project.name}</span></h1>
            <Badge variant="outline" className="bg-[#5b8cce]/10 text-[#5b8cce] border-[#5b8cce]/20">Pro</Badge>
          </div>
          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <span>{project.websiteUrl}</span>
            <span>Database: US (English)</span>
            {dataSource === 'live' ? (
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 inline-block" /> Live data (DataForSEO)
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400">
                <Info className="w-3 h-3 mr-1" /> AI-estimated
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2 items-center">
          {keywords.length > 0 && (
            <div className="hidden md:flex items-center gap-2 mr-2 border-r border-zinc-200 dark:border-zinc-800 pr-4">
              <ShareLinkClient url={`/dashboard/keywords/${projectId}/print`} />
              <PdfReportClient url={`/dashboard/keywords/${projectId}/print?download=true`} />
            </div>
          )}
          <Button variant="outline"><Plus className="w-4 h-4 mr-2" /> Add</Button>
          <Button 
            className="bg-[#5b8cce] hover:bg-[#4a77b4] text-white"
            onClick={handleDiscover}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
            {isAnalyzing ? 'Analyzing...' : 'Discover'}
          </Button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border-[#e6dfd8] dark:border-[#2e2b27] bg-[#faf9f5] dark:bg-[#181715]">
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-medium text-zinc-500">Tracked Keywords</span>
              <Key className="w-4 h-4 text-[#5b8cce]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{totalKeywords.toLocaleString()}</span>
              {totalKeywords > 0 && <span className="text-xs text-emerald-500 flex items-center"><TrendingUp className="w-3 h-3 mr-1" /> Active</span>}
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-[#e6dfd8] dark:border-[#2e2b27] bg-[#faf9f5] dark:bg-[#181715]">
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-medium text-zinc-500">Visibility Score</span>
              <Eye className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{visibilityScore.toFixed(1)}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-[#e6dfd8] dark:border-[#2e2b27] bg-[#faf9f5] dark:bg-[#181715]">
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-medium text-zinc-500">Est. Organic Traffic</span>
              <TrendingUp className="w-4 h-4 text-purple-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{Math.round(estTraffic).toLocaleString()}</span>
              <span className="text-xs text-zinc-500">visits / mo</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-[#e6dfd8] dark:border-[#2e2b27] bg-[#faf9f5] dark:bg-[#181715]">
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-medium text-zinc-500">Est. Traffic Value</span>
              <span className="w-4 h-4 text-emerald-500 font-bold">$</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">${Math.round(estValue).toLocaleString()}</span>
              <span className="text-xs text-zinc-400">/ mo</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Suggested Edits for Better Ranking */}
      <Card className="shadow-sm border-[#5b8cce]/20 bg-gradient-to-br from-[#5b8cce]/5 to-transparent">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wand2 className="w-5 h-5 text-[#5b8cce]" /> Suggested Edits for Better Ranking
            </CardTitle>
            <CardDescription>AI-generated, page-specific changes to help you rank for your target keywords.</CardDescription>
          </div>
          <Button onClick={handleGenerateSuggestions} disabled={isSuggesting} className="bg-[#5b8cce] hover:bg-[#4a77b4] text-white shrink-0">
            {isSuggesting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            {isSuggesting ? 'Analyzing…' : suggestions ? 'Regenerate' : 'Generate suggestions'}
          </Button>
        </CardHeader>
        <CardContent>
          {!suggestions && !isSuggesting && (
            <p className="text-sm text-zinc-500">Click “Generate suggestions” to get concrete, prioritized on-page edits based on your content and tracked keywords.</p>
          )}
          {isSuggesting && (
            <div className="flex items-center gap-2 text-sm text-zinc-500"><Loader2 className="w-4 h-4 animate-spin" /> Reading your page and keywords…</div>
          )}
          {suggestions && suggestions.length > 0 && (
            <div className="grid gap-3 md:grid-cols-2">
              {suggestions.map((s, i) => (
                <div key={i} className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 leading-snug">{s.title}</h4>
                    <Badge variant="outline" className={
                      s.priority === 'high' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 shrink-0'
                      : s.priority === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 shrink-0'
                      : 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 shrink-0'
                    }>{s.priority}</Badge>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-[10px] font-mono">{s.area}</Badge>
                    {s.impact && <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">{s.impact}</span>}
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{s.recommendation}</p>
                  {s.example && (
                    <pre className="mt-2 text-[11px] bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded p-2 whitespace-pre-wrap font-mono text-zinc-700 dark:text-zinc-300">{s.example}</pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Table */}

      {keywords.length > 0 && (
        <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-lg p-4 flex gap-3 text-sm text-blue-800 dark:text-blue-300">
          <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-blue-900 dark:text-blue-200">
              {dataSource === 'live'
                ? 'How to read this data (live metrics from DataForSEO):'
                : 'How to read this data (AI-estimated from your page — connect DataForSEO for live search metrics):'}
            </p>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>Volume:</strong> The estimated number of times people search for this exact keyword every month.</li>
              <li><strong>KD % (Keyword Difficulty):</strong> A score from 0 to 100 representing how hard it is to rank on the first page of Google. Higher means more difficult.</li>
              <li><strong>CPC (Cost Per Click):</strong> How much advertisers are willing to pay for a single click on this keyword. High CPC indicates high commercial value.</li>
              <li><strong>Intent:</strong> Why the user is searching. <strong>Informational</strong> (learning), <strong>Commercial</strong> (researching options), <strong>Transactional</strong> (ready to buy), or <strong>Navigational</strong> (looking for a specific site).</li>
            </ul>
          </div>
        </div>
      )}

      <Card className="shadow-sm border-none bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input 
              placeholder="Filter keywords..." 
              className="pl-9 h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-9"><Filter className="w-4 h-4 mr-2"/> Filters</Button>
          </div>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto rounded-b-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
            <Table>
              <TableHeader className="bg-zinc-50/80 dark:bg-zinc-900/50 backdrop-blur-sm">
                <TableRow>
                  <TableHead className="w-[30%]">Keyword</TableHead>
                  <TableHead>Intent</TableHead>
                  <TableHead className="text-right">Volume</TableHead>
                  <TableHead className="text-right">KD %</TableHead>
                  <TableHead className="text-right">CPC</TableHead>
                  <TableHead className="text-center">Position</TableHead>
                  <TableHead className="text-right">URL</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keywords.filter(k => k.keyword.toLowerCase().includes(searchQuery.toLowerCase())).map((k) => (
                  <TableRow key={k.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                    <TableCell className="font-medium text-zinc-900 dark:text-zinc-100">
                      {k.keyword}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`capitalize text-[10px] font-medium tracking-wide ${getIntentColor(k.intent || 'informational')}`}>
                        {(k.intent || 'informational').charAt(0)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-zinc-600 dark:text-zinc-400">
                      {(k.volume || 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      <span className={`font-medium ${getKdColor(k.kd || 0)}`}>{k.kd || 0}</span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-zinc-600 dark:text-zinc-400">
                      ${(k.cpc || 0).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        {k.position ? (
                          <>
                            <span className="font-bold text-zinc-900 dark:text-zinc-100">{k.position}</span>
                            {k.trend === 'up' && <TrendingUp className="w-3 h-3 text-emerald-500" />}
                            {k.trend === 'down' && <TrendingDown className="w-3 h-3 text-red-500" />}
                            {k.trend === 'flat' && <span className="text-zinc-300 dark:text-zinc-700">-</span>}
                          </>
                        ) : (
                          <span className="text-zinc-400">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-xs text-zinc-500 truncate max-w-[150px] inline-block" title={k.url}>{k.url}</span>
                    </TableCell>
                  </TableRow>
                ))}
                {keywords.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-zinc-500">
                      No keywords found. Click "Discover Opportunities" to run an AI analysis.
                    </TableCell>
                  </TableRow>
                )}
                {keywords.length > 0 && keywords.filter(k => k.keyword.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-zinc-500">
                      No keywords found matching "{searchQuery}"
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
