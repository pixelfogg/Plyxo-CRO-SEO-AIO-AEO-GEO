"use client";

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Loader2, Search, ArrowRight, BrainCircuit, Lightbulb, Target, ArrowLeft, Download, Printer, TrendingUp, CheckCircle2, AlertTriangle, LayoutList } from 'lucide-react';
import { toast } from 'sonner';
import { getProjects, getAioScans, runAioAnalysis, getProjectPages } from '../actions';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AioReportSkeleton } from '@/components/ui/animated-skeleton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format } from 'date-fns';

export default function AioProjectDashboard() {
  const params = useParams();
  const projectId = params.projectId as string;
  
  const [project, setProject] = useState<any>(null);
  const [scans, setScans] = useState<any[]>([]);
  const [projectPages, setProjectPages] = useState<any[]>([]);
  
  const [url, setUrl] = useState('');
  const [targetQuery, setTargetQuery] = useState('');
  const [targetEngine, setTargetEngine] = useState('ChatGPT (GPT-4)');
  const [targetPersona, setTargetPersona] = useState('General Audience');
  
  const [isRunning, setIsRunning] = useState(false);
  const [selectedScan, setSelectedScan] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProjectData() {
      setIsLoading(true);
      
      const [pResult, sResult, ppResult] = await Promise.all([
        getProjects(),
        getAioScans(projectId),
        getProjectPages(projectId)
      ]);

      if (pResult.success && pResult.projects) {
        const found = pResult.projects.find((p: any) => p.id === projectId);
        if (found) {
          setProject(found);
          setUrl(found.websiteUrl);
        }
      }
      
      if (sResult.success && sResult.scans) {
        setScans(sResult.scans);
        if (sResult.scans.length > 0) {
          setSelectedScan(sResult.scans[0]);
        }
      }

      if (ppResult.success && ppResult.pages) {
        setProjectPages(ppResult.pages);
      }
      
      setIsLoading(false);
    }
    loadProjectData();
  }, [projectId]);

  const loadScans = async () => {
    const sResult = await getAioScans(projectId);
    if (sResult.success && sResult.scans) {
      setScans(sResult.scans);
      if (sResult.scans.length > 0) {
        setSelectedScan(sResult.scans[0]);
      }
    }
  }

  const handleRunAnalysis = async () => {
    if (!url || !targetQuery) {
      toast.error('Please fill in all fields');
      return;
    }
    if (!url.startsWith('http')) {
      toast.error('Please enter a valid URL starting with http:// or https://');
      return;
    }

    setIsRunning(true);
    toast.info('Starting AIO Analysis...', { description: 'Simulating Answer Engine queries.' });
    
    const result = await runAioAnalysis(projectId, url, targetQuery, targetEngine, targetPersona);
    
    setIsRunning(false);
    
    if (result.success) {
      toast.success('Analysis Complete!');
      await loadScans(); 
    } else {
      toast.error('Analysis failed', { description: result.error });
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!selectedScan) return;
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Query,Engine,Score,Status,URL\n"
      + `"${selectedScan.targetQuery}","${targetEngine}","${selectedScan.citationScore}","${selectedScan.status}","${selectedScan.url}"`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `aio_scan_${selectedScan.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Exported to CSV');
  };

  const chartData = useMemo(() => {
    if (!selectedScan || scans.length === 0) return [];
    const relatedScans = scans
      .filter(s => s.targetQuery.toLowerCase() === selectedScan.targetQuery.toLowerCase())
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    return relatedScans.map(s => ({
      date: format(new Date(s.createdAt), 'MMM dd HH:mm'),
      score: s.citationScore || 0,
    }));
  }, [selectedScan, scans]);

  if (isLoading) {
    return <AioReportSkeleton />;
  }

  return (
    <div className="space-y-6 print:m-0 print:p-0">
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/aio">
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs font-medium bg-[#faf9f5] dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27] hover:border-[#cc785c]/40 hover:text-[#cc785c] transition-all">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to AIO Intelligence
            </Button>
          </Link>
          <div>
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              AIO Intelligence {project ? `- ${project.name}` : ''}
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Optimize your content to be cited by AI search engines.
            </p>
          </div>
        </div>
        {selectedScan && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="w-4 h-4 mr-2" /> Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <Printer className="w-4 h-4 mr-2" /> Print PDF
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Left Sidebar: Form & History */}
        <div className="space-y-6 xl:col-span-1 print:hidden">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">New Analysis</CardTitle>
              <CardDescription>Simulate an AI search query.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Page URL</Label>
                {projectPages.length > 0 && (
                  <div className="mb-2">
                    <Select onValueChange={(val: string | null) => { if (val) setUrl(val) }}>
                      <SelectTrigger className="w-full text-xs h-9">
                        <SelectValue placeholder="Quick select a crawled page..." />
                      </SelectTrigger>
                      <SelectContent>
                        {projectPages.map(p => (
                          <SelectItem key={p.id} value={p.url} className="text-xs">{p.url.replace(/^https?:\/\//, '')}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <Input 
                  placeholder="https://example.com/blog/cro-tips" 
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  className={projectPages.length > 0 ? "mt-2" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label>Target Query</Label>
                <Input 
                  placeholder="What are the best CRO tips for 2024?" 
                  value={targetQuery}
                  onChange={e => setTargetQuery(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Target Engine</Label>
                  <Select value={targetEngine} onValueChange={(val: string | null) => { if (val) setTargetEngine(val) }}>
                    <SelectTrigger className="w-full text-xs h-9">
                      <SelectValue placeholder="Select Engine" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ChatGPT (GPT-4o)" className="text-xs">ChatGPT (GPT-4o)</SelectItem>
                      <SelectItem value="ChatGPT (GPT-4)" className="text-xs">ChatGPT (GPT-4)</SelectItem>
                      <SelectItem value="Perplexity (Sonar Pro)" className="text-xs">Perplexity (Sonar Pro)</SelectItem>
                      <SelectItem value="Perplexity (Default)" className="text-xs">Perplexity (Default)</SelectItem>
                      <SelectItem value="Google (AI Overviews / Gemini)" className="text-xs">Google (AI Overviews / Gemini)</SelectItem>
                      <SelectItem value="Microsoft Copilot (Bing Chat)" className="text-xs">Microsoft Copilot (Bing Chat)</SelectItem>
                      <SelectItem value="Claude 3.5 Sonnet" className="text-xs">Claude 3.5 Sonnet</SelectItem>
                      <SelectItem value="Claude 3 Opus" className="text-xs">Claude 3 Opus</SelectItem>
                      <SelectItem value="Meta AI (Llama 3)" className="text-xs">Meta AI (Llama 3)</SelectItem>
                      <SelectItem value="xAI Grok" className="text-xs">xAI Grok</SelectItem>
                      <SelectItem value="OpenAI SearchGPT" className="text-xs">OpenAI SearchGPT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Target Persona</Label>
                  <Select value={targetPersona} onValueChange={(val: string | null) => { if (val) setTargetPersona(val) }}>
                    <SelectTrigger className="w-full text-xs h-9">
                      <SelectValue placeholder="Select Persona" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General Audience" className="text-xs">General Audience</SelectItem>
                      <SelectItem value="Technical Expert" className="text-xs">Technical Expert</SelectItem>
                      <SelectItem value="B2B Buyer" className="text-xs">B2B Buyer</SelectItem>
                      <SelectItem value="C-Level Executive" className="text-xs">C-Level Executive</SelectItem>
                      <SelectItem value="Software Developer / Engineer" className="text-xs">Software Developer / Engineer</SelectItem>
                      <SelectItem value="Marketer / SEO Specialist" className="text-xs">Marketer / SEO Specialist</SelectItem>
                      <SelectItem value="Student / Beginner" className="text-xs">Student / Beginner</SelectItem>
                      <SelectItem value="Small Business Owner" className="text-xs">Small Business Owner</SelectItem>
                      <SelectItem value="Researcher / Academic" className="text-xs">Researcher / Academic</SelectItem>
                      <SelectItem value="Consumer / Shopper" className="text-xs">Consumer / Shopper</SelectItem>
                      <SelectItem value="Healthcare Professional" className="text-xs">Healthcare Professional</SelectItem>
                      <SelectItem value="Financial Analyst" className="text-xs">Financial Analyst</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button 
                className="w-full" 
                onClick={handleRunAnalysis} 
                disabled={isRunning || !url || !targetQuery}
              >
                {isRunning ? (
                  <span className="flex items-center"><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</span>
                ) : (
                  <span className="flex items-center"><Search className="w-4 h-4 mr-2" /> Run Analysis</span>
                )}
              </Button>
            </CardContent>
          </Card>

          {scans.length > 0 && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Recent Scans</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {scans.slice(0, 5).map(scan => (
                  <div 
                    key={scan.id}
                    onClick={() => setSelectedScan(scan)}
                    className={`p-3 rounded-lg border text-sm cursor-pointer transition-colors ${selectedScan?.id === scan.id ? 'bg-amber-50/50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-900/30' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}`}
                  >
                    <div className="font-medium truncate">{scan.targetQuery}</div>
                    <div className="text-xs text-zinc-500 truncate mt-1">{new URL(scan.url).pathname}</div>
                    <div className="mt-3 flex items-center justify-between">
                      <Badge variant="secondary" className={scan.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}>
                        {scan.status}
                      </Badge>
                      {scan.status === 'completed' && <span className="font-mono font-bold text-amber-600">{scan.citationScore}</span>}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Dashboard Area */}
        <div className="xl:col-span-3">
          {!selectedScan ? (
            <Card className="h-full flex flex-col items-center justify-center p-12 text-center border-dashed border-2 bg-zinc-50/50 dark:bg-zinc-900/20">
              <div className="p-4 rounded-full bg-white dark:bg-zinc-900 shadow-sm border mb-6">
                <Sparkles className="w-12 h-12 text-amber-500" />
              </div>
              <h3 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">Enterprise AIO Intelligence</h3>
              <p className="text-sm text-zinc-500 max-w-md mt-3 leading-relaxed">
                Run an analysis to simulate how Large Language Models like ChatGPT, Perplexity, or Google SGE retrieve and cite your content. Find semantic gaps and optimize for the AI-first web.
              </p>
            </Card>
          ) : selectedScan.status === 'running' ? (
            <Card className="h-full flex flex-col items-center justify-center p-12 text-center">
              <Loader2 className="w-12 h-12 text-amber-500 animate-spin mb-4" />
              <h3 className="text-lg font-medium">Analyzing Content...</h3>
              <p className="text-sm text-zinc-500 max-w-sm mt-2">
                Running advanced semantic extraction and simulating LLM retrieval for "{selectedScan.targetQuery}".
              </p>
            </Card>
          ) : (
            <Tabs defaultValue="overview" className="w-full">
              <div className="flex items-center justify-between mb-6 print:hidden">
                <TabsList variant="pill">
                  <TabsTrigger value="overview"><LayoutList className="w-4 h-4 mr-2" /> Overview</TabsTrigger>
                  <TabsTrigger value="deepdive"><BrainCircuit className="w-4 h-4 mr-2" /> Semantic Deep Dive</TabsTrigger>
                  <TabsTrigger value="recommendations"><Lightbulb className="w-4 h-4 mr-2" /> Recommendations ({selectedScan.recommendations?.length || 0})</TabsTrigger>
                  <TabsTrigger value="history"><TrendingUp className="w-4 h-4 mr-2" /> History</TabsTrigger>
                </TabsList>
              </div>

              {/* OVERVIEW TAB */}
              <TabsContent value="overview" className="space-y-6 m-0 print:block">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Scorecard */}
                  <Card className="md:col-span-1 bg-white dark:bg-zinc-950 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-zinc-500">Citation Probability</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-end gap-2 mb-4">
                        <span className="text-6xl font-bold tracking-tighter text-zinc-900 dark:text-zinc-50">{selectedScan.citationScore}</span>
                        <span className="text-zinc-500 font-medium mb-2">/ 100</span>
                      </div>
                      <Progress value={selectedScan.citationScore} className="h-2 mb-4" />
                      <div className="flex items-start gap-2 text-sm">
                        {selectedScan.citationScore >= 80 ? (
                          <><CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /><span className="text-green-700 dark:text-green-400">Excellent probability of citation. Content is well-structured and dense.</span></>
                        ) : selectedScan.citationScore >= 50 ? (
                          <><AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" /><span className="text-amber-700 dark:text-amber-400">Moderate chance. Needs clearer formatting or deeper entity coverage.</span></>
                        ) : (
                          <><AlertTriangle className="w-5 h-5 text-red-500 shrink-0" /><span className="text-red-700 dark:text-red-400">Low probability. The content lacks direct answers and strong entities.</span></>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Mock AI Answer */}
                  <Card className="md:col-span-2 bg-zinc-900 text-zinc-50 border-none relative shadow-md">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-amber-500"></div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center text-zinc-400">
                        <Sparkles className="w-4 h-4 mr-2 text-amber-400" /> Simulated AI Response Snippet
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-lg leading-relaxed font-serif tracking-tight">
                        "{selectedScan.simulatedAnswer}"
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Semantic Density */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-zinc-500">Semantic Density</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl font-bold">{selectedScan.entities?.length || 0}</span>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">Entities Extracted</Badge>
                      </div>
                      <p className="text-sm text-zinc-500 mt-2">
                        Higher entity density gives LLMs more concrete facts to cite.
                      </p>
                    </CardContent>
                  </Card>

                  {/* Optimization Progress */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-zinc-500">Optimization Tasks</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl font-bold">{selectedScan.recommendations?.length || 0}</span>
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">Action Items</Badge>
                      </div>
                      <p className="text-sm text-zinc-500 mt-2">
                        Complete the recommendations in the deep dive tab to improve scores.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* DEEP DIVE TAB */}
              <TabsContent value="deepdive" className="space-y-6 m-0 print:hidden">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Target className="w-5 h-5 text-blue-500" /> Entity Analysis</CardTitle>
                    <CardDescription>Concepts, brands, and statistics the LLM successfully identified in your content.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-900">
                          <tr>
                            <th className="px-4 py-3 rounded-tl-lg">Entity / Concept</th>
                            <th className="px-4 py-3">Category</th>
                            <th className="px-4 py-3 rounded-tr-lg">Relevance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedScan.entities && selectedScan.entities.length > 0 ? (
                            selectedScan.entities.map((entity: any, i: number) => {
                              const isString = typeof entity === 'string';
                              const name = isString ? entity : entity.name;
                              const category = isString ? 'Concept' : (entity.category || 'Concept');
                              const relevance = isString ? 'Moderate' : (entity.relevance || 'Moderate');
                              
                              return (
                                <tr key={i} className="border-b dark:border-zinc-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">{name}</td>
                                  <td className="px-4 py-3 text-zinc-500">{category}</td>
                                  <td className="px-4 py-3">
                                    <Badge variant="outline" className={
                                      relevance === 'Strong' ? 'bg-green-50 text-green-700 border-green-200' :
                                      relevance === 'Missing' ? 'bg-red-50 text-red-700 border-red-200' :
                                      'bg-amber-50 text-amber-700 border-amber-200'
                                    }>
                                      {relevance}
                                    </Badge>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={3} className="px-4 py-8 text-center text-zinc-500">No entities identified.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* RECOMMENDATIONS TAB */}
              <TabsContent value="recommendations" className="space-y-6 m-0 print:hidden">
                <div className="space-y-4">
                  {selectedScan.recommendations && selectedScan.recommendations.length > 0 ? (
                    selectedScan.recommendations.map((rec: any, i: number) => {
                      if (typeof rec === 'string') {
                        // Fallback for old scans
                        return (
                          <Card key={i} className="bg-white dark:bg-zinc-950">
                            <CardContent className="p-4 flex gap-3 text-sm">
                              <ArrowRight className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                              <span className="font-medium text-zinc-900 dark:text-zinc-100">{rec}</span>
                            </CardContent>
                          </Card>
                        )
                      }
                      
                      return (
                        <details key={i} className="group border rounded-xl shadow-sm border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden" open={i === 0}>
                          <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50 list-none [&::-webkit-details-marker]:hidden transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 group-open:bg-amber-100 group-open:text-amber-600 transition-colors">
                                <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-open:rotate-90" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">{rec.title}</h4>
                                {rec.rationale && <p className="text-xs text-zinc-500 mt-1">{rec.rationale}</p>}
                              </div>
                            </div>
                            <Badge variant="outline" className={
                              rec.impact === 'High' ? 'bg-red-50 text-red-700 border-red-200 shadow-sm' : 
                              rec.impact === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm' : 
                              'bg-blue-50 text-blue-700 border-blue-200 shadow-sm'
                            }>
                              {rec.impact} Impact
                            </Badge>
                          </summary>
                          <div className="p-5 pt-0 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
                            <ol className="space-y-6 mt-6 relative border-l-2 border-zinc-200 dark:border-zinc-800 ml-4">
                              {rec.tutorial?.map((step: any, j: number) => (
                                <li key={j} className="pl-8 relative">
                                  <span className="absolute -left-[17px] top-0 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 border-zinc-200 dark:border-zinc-700 shadow-sm">
                                    {step.stepNumber || (j+1)}
                                  </span>
                                  <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 pt-1 leading-relaxed">{step.instruction}</p>
                                  {step.codeSnippet && (
                                    <pre className="mt-3 p-4 bg-[#0d1117] text-zinc-100 rounded-lg text-sm overflow-x-auto border border-zinc-800 shadow-inner">
                                      <code>{step.codeSnippet}</code>
                                    </pre>
                                  )}
                                </li>
                              ))}
                            </ol>
                          </div>
                        </details>
                      )
                    })
                  ) : (
                    <Card className="flex flex-col items-center justify-center p-12 text-center bg-zinc-50/50 border-dashed">
                      <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
                      <h3 className="font-medium text-lg">No Recommendations</h3>
                      <p className="text-sm text-zinc-500">Your content is fully optimized for this query.</p>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* HISTORY TAB */}
              <TabsContent value="history" className="space-y-6 m-0 print:hidden">
                <Card>
                  <CardHeader>
                    <CardTitle>Score History</CardTitle>
                    <CardDescription>Citation probability over time for "{selectedScan.targetQuery}"</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {chartData.length > 0 ? (
                      <div className="h-[300px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} domain={[0, 100]} />
                            <Tooltip 
                              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                              cursor={{ stroke: '#f59e0b', strokeWidth: 1, strokeDasharray: '4 4' }}
                            />
                            <ReferenceLine y={80} stroke="#10b981" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Excellent (80)', fill: '#10b981', fontSize: 12 }} />
                            <Line 
                              type="monotone" 
                              dataKey="score" 
                              stroke="#f59e0b" 
                              strokeWidth={3}
                              activeDot={{ r: 6, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }}
                              dot={{ r: 4, fill: '#fff', stroke: '#f59e0b', strokeWidth: 2 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-[200px] flex items-center justify-center border-dashed border-2 rounded-lg text-sm text-zinc-500 bg-zinc-50/50">
                        Run this analysis again in the future to see historical trends.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}
