"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Loader2, ArrowLeft, ArrowRight, Settings, Share, Download, RefreshCcw, FileText, CheckCircle, AlertTriangle, Info, ShieldAlert, BarChart, Check, ChevronsUpDown } from 'lucide-react';
import { toast } from 'sonner';
import { getProjects, getSeoScans, runSeoIntelligence, getProjectPages, crawlWebsite } from '../actions';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import Link from 'next/link';
import { SeoReportSkeleton } from '@/components/ui/animated-skeleton';
import { ShareLinkClient } from '@/components/report/ShareLinkClient';
import { PdfReportClient } from '@/components/report/PdfReportClient';
import { 
  LineChart, Line, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { THEME_CHECKS, calculateThemeScore } from '@/lib/seo-utils';

function IssueDetailsDialog({ issue }: { issue: any }) {
  return (
    <Dialog>
      <DialogTrigger className="text-xs text-zinc-400 underline decoration-dashed underline-offset-4 cursor-pointer hover:text-zinc-600 bg-transparent border-none p-0 outline-none text-left">
        How to fix
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {issue.severity === 'error' ? <ShieldAlert className="w-5 h-5 text-red-500" /> : <AlertTriangle className="w-5 h-5 text-orange-500" />}
            {issue.title}
          </DialogTitle>
          <DialogDescription>
            Detailed explanation and steps to resolve this issue.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg text-sm text-zinc-700 dark:text-zinc-300">
            {issue.description || 'No detailed description available.'}
          </div>
          <div className="flex gap-4 text-sm">
            <div>
              <span className="font-medium text-zinc-500">Priority: </span>
              <Badge variant="outline" className="uppercase">{issue.priority || 'Medium'}</Badge>
            </div>
            <div>
              <span className="font-medium text-zinc-500">Pages Affected: </span>
              <span className="font-semibold">{issue.businessImpact || 1}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}




function ThemeDetailedAnalysis({ themeKey, score, issues, onBack }: { themeKey: string, score: number, issues: any[], onBack: () => void }) {
  const themeName = themeKey.replace(/([A-Z])/g, ' $1').trim();
  const themeNameCapitalized = themeName.charAt(0).toUpperCase() + themeName.slice(1);
  
  const analysis = calculateThemeScore(themeKey, issues, score);
  const displayScore = analysis.score;
  const { checksStatus, passedCount, totalChecks, unmatchedIssues } = analysis;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-2">
        <Button variant="outline" size="sm" onClick={onBack} className="h-8 gap-1.5 text-xs font-medium bg-[#faf9f5] dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27] hover:border-[#cc785c]/40 hover:text-[#cc785c] transition-all">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Button>
      </div>
      
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <h2 className="text-3xl font-bold capitalize">{themeNameCapitalized} Report</h2>
          <p className="text-zinc-500 mt-2 text-sm">Detailed analysis and checklist for {themeNameCapitalized}.</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Theme Score</span>
          <span className={`text-4xl font-black ${displayScore >= 90 ? 'text-green-500' : displayScore >= 70 ? 'text-amber-500' : 'text-red-500'}`}>{displayScore}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
           <h3 className="text-xl font-bold flex items-center gap-2">Checks Performed {totalChecks > 0 && <Badge variant="secondary">{passedCount} / {totalChecks} Passed</Badge>}</h3>
           
           {checksStatus.length > 0 ? (
             <div className="space-y-4">
               {checksStatus.map((check, idx) => (
                 <Card key={idx} className={`border-l-4 ${check.passed ? 'border-l-green-500' : 'border-l-red-500'}`}>
                   <CardHeader className="pb-2">
                     <CardTitle className="text-base flex items-center gap-3 leading-snug">
                       {check.passed ? (
                         <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                       ) : (
                         <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                       )}
                       {check.label}
                     </CardTitle>
                   </CardHeader>
                   {!check.passed && check.failedIssues.length > 0 && (
                     <CardContent>
                       <div className="space-y-4 mt-2">
                         {check.failedIssues.map((issue, iIdx) => (
                           <div key={iIdx} className="bg-red-50/50 dark:bg-red-900/10 p-3 rounded-md border border-red-100 dark:border-red-900/30">
                             <div className="font-medium text-sm text-red-800 dark:text-red-400 mb-1">{issue.title}</div>
                             <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed mb-3">{issue.description}</p>
                             <div className="flex gap-2">
                                <Badge variant="outline" className="uppercase text-[9px] tracking-wider bg-white dark:bg-zinc-900">{issue.priority} Priority</Badge>
                                <Badge variant="secondary" className="uppercase text-[9px] tracking-wider bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                  {issue.severity}
                                </Badge>
                             </div>
                           </div>
                         ))}
                       </div>
                     </CardContent>
                   )}
                 </Card>
               ))}
               
               {/* Show any remaining related issues that didn't match a specific check */}
               {unmatchedIssues.length > 0 && (
                 <div className="pt-4 space-y-4">
                   <h4 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Other Discovered Issues</h4>
                   {unmatchedIssues.map((issue, idx) => (
                     <Card key={`unmatched-${idx}`} className="border-l-4 border-l-orange-500">
                       <CardHeader className="pb-2">
                         <CardTitle className="text-base flex items-start gap-3 leading-snug">
                           <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                           {issue.title}
                         </CardTitle>
                       </CardHeader>
                       <CardContent>
                         <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-4 leading-relaxed">{issue.description}</p>
                         <div className="flex gap-3">
                            <Badge variant="outline" className="uppercase text-[10px] tracking-wider">{issue.priority} Priority</Badge>
                            <Badge variant="secondary" className="uppercase text-[10px] tracking-wider bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                              {issue.severity}
                            </Badge>
                         </div>
                       </CardContent>
                     </Card>
                   ))}
                 </div>
               )}
             </div>
           ) : (
             <div className="space-y-4">
               {/* Fallback to old behavior if no predefined checks exist */}
               {unmatchedIssues.map((issue, idx) => (
                 <Card key={idx} className="border-l-4 border-l-[#5b8cce]">
                   <CardHeader className="pb-2">
                     <CardTitle className="text-base flex items-start gap-3 leading-snug">
                       {issue.severity === 'error' ? <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" /> : <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />}
                       {issue.title}
                     </CardTitle>
                   </CardHeader>
                   <CardContent>
                     <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-4 leading-relaxed">{issue.description}</p>
                     <div className="flex gap-3">
                        <Badge variant="outline" className="uppercase text-[10px] tracking-wider">{issue.priority} Priority</Badge>
                        <Badge variant="secondary" className={`uppercase text-[10px] tracking-wider ${issue.severity === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                          {issue.severity}
                        </Badge>
                     </div>
                   </CardContent>
                 </Card>
               ))}
               {unmatchedIssues.length === 0 && (
                 <Card className="border-dashed shadow-none bg-zinc-50/50 dark:bg-zinc-900/20">
                   <CardContent className="p-12 text-center text-zinc-500">
                     <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4 opacity-50" />
                     <p className="font-medium text-zinc-700 dark:text-zinc-300">No issues directly matched this theme.</p>
                     <p className="text-xs mt-2 max-w-sm mx-auto">This could mean the theme is perfectly healthy, or the AI did not explicitly tag any issues with these keywords.</p>
                   </CardContent>
                 </Card>
               )}
             </div>
           )}
        </div>
        
        <div className="space-y-6">
           <Card className="bg-zinc-50 dark:bg-zinc-900/50 border-none">
             <CardHeader>
               <CardTitle className="text-base flex items-center gap-2"><Info className="w-4 h-4 text-[#5b8cce]"/> About this Theme</CardTitle>
             </CardHeader>
             <CardContent className="text-sm text-zinc-600 dark:text-zinc-400 space-y-4">
               <p>This thematic report groups related SEO checks to give you a targeted view of your site's health in this specific area.</p>
               <p>A score of 100% means all checks passed. Lower scores indicate warnings or errors that should be prioritized based on severity.</p>
             </CardContent>
           </Card>
        </div>
      </div>
    </div>
  )
}

export default function SeoProjectDashboard() {
  const params = useParams();
  const projectId = params.projectId as string;
  
  const [project, setProject] = useState<any>(null);
  const [scans, setScans] = useState<any[]>([]);
  const [projectPages, setProjectPages] = useState<any[]>([]);
  
  const [url, setUrl] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [selectedScan, setSelectedScan] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTheme, setSelectedTheme] = useState<{key: string, score: number} | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [compareModalScan, setCompareModalScan] = useState<any | null>(null);

  useEffect(() => {
    async function loadProjectData() {
      setIsLoading(true);
      
      const [pResult, sResult, ppResult] = await Promise.all([
        getProjects(),
        getSeoScans(projectId),
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

  const hasScans = scans.length > 0;
  
  // Prepare Analytics Data
  const healthData = [...scans].reverse().map(scan => ({
    date: new Date(scan.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    siteHealth: scan.scores?.siteHealth || 0,
    aiHealth: scan.scores?.aiSearchHealth || 0,
  }));

  const issueData = [...scans].reverse().map(scan => {
    const issues = scan.issues || [];
    const errors = issues.filter((i: any) => i.severity === 'error' || i.priority === 'critical').length;
    const warnings = issues.filter((i: any) => i.severity === 'warning' || i.priority === 'high' || i.priority === 'medium').length;
    return {
      date: new Date(scan.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      errors,
      warnings,
    };
  });

  let radarData: any[] = [];
  if (hasScans) {
    const latestScan = scans[0];
    const prevScan = scans.length > 1 ? scans[1] : null;
    const themes = [
      { key: 'coreWebVitals', label: 'Performance' },
      { key: 'crawlability', label: 'Crawlability' },
      { key: 'internalLinking', label: 'Linking' },
      { key: 'markup', label: 'Markup' },
      { key: 'https', label: 'Security' },
      { key: 'robotsTxt', label: 'Robots.txt' }
    ];
    radarData = themes.map(t => ({
      subject: t.label,
      latest: latestScan.scores?.thematic?.[t.key] || 0,
      previous: prevScan ? (prevScan.scores?.thematic?.[t.key] || 0) : 0,
      fullMark: 100
    }));
  }

  const loadScans = async () => {
    const sResult = await getSeoScans(projectId);
    if (sResult.success && sResult.scans) {
      setScans(sResult.scans);
      if (sResult.scans.length > 0) {
        setSelectedScan(sResult.scans[0]);
      }
    }
  }

  const handleRunAnalysis = async () => {
    if (!url) {
      toast.error('Please enter a URL');
      return;
    }
    if (!url.startsWith('http')) {
      toast.error('Please enter a valid URL starting with http:// or https://');
      return;
    }

    setIsRunning(true);
    toast.info('Starting Site Audit...', { description: 'Evaluating Technical, Semantic, and Entity SEO.' });
    
    const result = await runSeoIntelligence(projectId, url);
    
    setIsRunning(false);
    
    if (result.success) {
      toast.success('Audit Complete!');
      await loadScans(); 
    } else {
      toast.error('Audit failed', { description: result.error });
    }
  };

  const handleCrawlWebsite = async () => {
    setIsRunning(true);
    toast.info('Starting Site Crawl...', { description: 'Discovering internal pages.' });
    
    // Default to the project's website URL if url is empty
    const startUrl = project?.websiteUrl || url;
    
    const result = await crawlWebsite(projectId, startUrl);
    
    setIsRunning(false);
    
    if (result.success) {
      toast.success('Crawl Complete!', { description: `Discovered ${result.count} pages.`});
      // reload project pages
      const ppResult = await getProjectPages(projectId);
      if (ppResult.success && ppResult.pages) {
        setProjectPages(ppResult.pages);
      }
    } else {
      toast.error('Crawl failed', { description: result.error });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-amber-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-amber-500';
    return 'bg-red-500';
  };

  // Calculate overall score from either siteHealth or fallback to seo
  const healthScore = selectedScan?.scores?.siteHealth ?? selectedScan?.scores?.seo ?? 0;

  // Helper to get issues safely
  const issues = selectedScan?.issues || [];
  const errors = issues.filter((i: any) => i.severity === 'error' || i.severity === 'critical' || i.severity === 'high');
  const warnings = issues.filter((i: any) => i.severity === 'warning' || i.severity === 'medium');
  const notices = issues.filter((i: any) => i.severity === 'notice' || i.severity === 'low');

  // Calculate project-wide statistics
  const totalCrawledPages = projectPages.length;
  const uniqueAnalyzedUrls = new Set(scans.map(s => s.url));
  const analyzedPagesCount = uniqueAnalyzedUrls.size;
  
  let passedPagesCount = 0;
  let failedPagesCount = 0;
  
  uniqueAnalyzedUrls.forEach(url => {
    // Scans are ordered by newest first, so find gets the latest
    const latestScanForUrl = scans.find(s => s.url === url);
    if (latestScanForUrl) {
      const score = latestScanForUrl.scores?.siteHealth ?? latestScanForUrl.scores?.seo ?? 0;
      if (score >= 70) {
        passedPagesCount++;
      } else {
        failedPagesCount++;
      }
    }
  });

  const analyzedPct = totalCrawledPages > 0 ? Math.round((analyzedPagesCount / totalCrawledPages) * 100) : 0;

  if (isLoading) {
    return <SeoReportSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Top Header matching screenshots */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl font-bold">Site Audit: <span className="text-[#5b8cce] font-semibold">{project?.websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '') || 'Project'}</span></h1>
            <Badge variant="outline" className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">Plyxo Intelligence</Badge>
          </div>
          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <span>{project?.websiteUrl}</span>
            <span suppressHydrationWarning>Updated: {selectedScan ? new Date(selectedScan.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never'}</span>
            <span>Mobile</span>
            <span>JS rendering: Disabled</span>
            <span>Pages crawled: {selectedScan?.scores?.statistics?.crawledPages || 0}/100</span>
          </div>
        </div>

        {selectedScan && (
          <div className="flex items-center gap-2 hidden md:flex">
            <ShareLinkClient url={`/dashboard/seo/${projectId}/print?scanId=${selectedScan.id}`} />
            <PdfReportClient url={`/dashboard/seo/${projectId}/print?scanId=${selectedScan.id}&download=true`} />
          </div>
        )}
      </div>

      {/* Simulator Control Panel */}
      {projectPages.length > 0 && (
        <Card className="border-dashed shadow-none bg-zinc-50/50 dark:bg-zinc-900/20">
          <CardContent className="p-4 flex items-end gap-4">
            <div className="flex-1">
              <Label className="text-xs mb-1 block">Select Page to Analyze</Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger 
                  className={cn(buttonVariants({ variant: "outline" }), "w-[500px] justify-between h-9 font-normal text-left truncate")}
                  role="combobox"
                  aria-expanded={open}
                >
                  {url
                    ? projectPages.find((p) => p.url === url)?.url
                    : "Select a discovered page..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </PopoverTrigger>
                <PopoverContent className="w-[500px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search pages..." />
                    <CommandList className="max-h-[300px]">
                      <CommandEmpty>No pages found.</CommandEmpty>
                      <CommandGroup>
                        {projectPages.map((p) => (
                          <CommandItem
                            key={p.url}
                            value={p.url}
                            onSelect={(currentValue) => {
                              setUrl(currentValue);
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4 shrink-0",
                                url === p.url ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <span className="truncate">{p.url}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <Button onClick={handleRunAnalysis} disabled={isRunning || !url} className="h-9">
              {isRunning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
              Run Analysis
            </Button>
          </CardContent>
        </Card>
      )}

      {selectedTheme ? (
        <ThemeDetailedAnalysis 
          themeKey={selectedTheme.key} 
          score={selectedTheme.score} 
          issues={issues} 
          onBack={() => setSelectedTheme(null)} 
        />
      ) : projectPages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 px-4 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="h-24 w-24 bg-[#5b8cce]/10 rounded-full flex items-center justify-center mb-6 ring-8 ring-[#5b8cce]/5">
            <Search className="h-10 w-10 text-[#5b8cce]" />
          </div>
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">Discover Pages</h3>
          <p className="max-w-md text-zinc-500 mb-8 leading-relaxed">
            Before we can analyze your SEO, we need to crawl your website to discover its pages.
          </p>
          <Button onClick={handleCrawlWebsite} disabled={isRunning} size="lg">
            {isRunning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCcw className="w-4 h-4 mr-2" />}
            Crawl Website
          </Button>
        </div>
      ) : !selectedScan ? (
        <div className="flex flex-col items-center justify-center py-32 px-4 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="h-24 w-24 bg-[#5b8cce]/10 rounded-full flex items-center justify-center mb-6 ring-8 ring-[#5b8cce]/5">
            <Search className="h-10 w-10 text-[#5b8cce]" />
          </div>
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">No Audit Data Yet</h3>
          <p className="max-w-md text-zinc-500 mb-8 leading-relaxed">
            Select a page from the dropdown above and click "Run Analysis" to generate your first comprehensive Site Audit dashboard.
          </p>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList variant="pill" className="flex-wrap mb-4 w-fit">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="issues">Issues</TabsTrigger>
            <TabsTrigger value="crawled">Crawled Pages</TabsTrigger>
            <TabsTrigger value="compare">Compare Crawls</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm">
              <div className="flex items-center gap-2 mb-2 md:mb-0">
                <span className="font-medium text-zinc-500">Analyzed Page:</span>
                <span className="font-semibold text-[#5b8cce] truncate max-w-[400px]">{selectedScan.pageUrl || selectedScan.url || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-zinc-500">Scan Time:</span>
                <span className="font-semibold">{new Date(selectedScan.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Site Health */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">Site Health</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <div className="relative w-40 h-40 flex items-center justify-center mb-4 mt-2">
                    <svg viewBox="0 0 100 50" className="w-full overflow-visible">
                      <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#e4e4e7" strokeWidth="12" strokeLinecap="round" />
                      <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#5b8cce" strokeWidth="12" strokeLinecap="round" strokeDasharray="125.6" strokeDashoffset={125.6 - (125.6 * healthScore) / 100} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-end pb-4">
                      <span className="text-3xl font-bold">{healthScore}%</span>
                      <span className="text-[10px] text-zinc-400">no changes</span>
                    </div>
                  </div>
                  <div className="w-full space-y-2 mt-4">
                    <div className="flex justify-between text-xs">
                      <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#5b8cce]" /> Your site</span>
                      <span>{healthScore}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Project Progress */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-1">Project Progress <Info className="w-3 h-3 text-zinc-400" /></CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-3xl font-bold text-[#5b8cce]">{analyzedPagesCount}</span>
                    <span className="text-[10px] text-zinc-400">/ {totalCrawledPages} crawled</span>
                  </div>
                  <div className="w-full h-4 flex rounded-sm overflow-hidden mb-6 bg-zinc-100 dark:bg-zinc-800">
                    <div className="bg-[#5b8cce]" style={{width: `${analyzedPct}%`}}></div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-600" /> Crawled Pages</span>
                      <span className="font-semibold">{totalCrawledPages}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#5b8cce]" /> Analyzed</span>
                      <span className="text-[#5b8cce] font-semibold">{analyzedPagesCount}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Passed (Health ≥ 70%)</span>
                      <span className="text-emerald-500 font-semibold">{passedPagesCount}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-400" /> Failed (Health &lt; 70%)</span>
                      <span className="text-red-500 font-semibold">{failedPagesCount}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Search Health */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-1">
                    AI Search Health <Badge variant="secondary" className="text-[9px] bg-orange-100 text-orange-700 px-1 py-0 h-4">beta</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <div className="relative w-40 h-40 flex items-center justify-center mb-4 mt-2">
                    <svg viewBox="0 0 100 50" className="w-full overflow-visible">
                      <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#e4e4e7" strokeWidth="12" strokeLinecap="round" />
                      <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#22d3ee" strokeWidth="12" strokeLinecap="round" strokeDasharray="125.6" strokeDashoffset={125.6 - (125.6 * (selectedScan.scores?.aiSearchHealth || 0)) / 100} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-end pb-4">
                      <span className="text-3xl font-bold text-emerald-500">{selectedScan.scores?.aiSearchHealth || 0}%</span>
                      <span className="text-[10px] text-zinc-400">no changes</span>
                    </div>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-900 rounded p-3 text-[11px] text-zinc-600 dark:text-zinc-400 w-full mb-4">
                    Website is better optimized for AI search engines
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Errors & Warnings Panel */}
              <div className="lg:col-span-1">
                <Card className="h-full bg-zinc-50/50 dark:bg-[#18181a] border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <CardContent className="p-6">
                    <div className="space-y-8">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Errors</span>
                          <Info className="w-3 h-3 text-zinc-400" />
                        </div>
                        <div className="text-3xl font-bold text-red-500 tracking-tight mb-3">{errors.length}</div>
                        <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500 rounded-full" style={{ width: `${Math.min(100, (errors.length / Math.max(1, issues.length)) * 100)}%` }} />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Warnings</span>
                          <Info className="w-3 h-3 text-zinc-400" />
                        </div>
                        <div className="text-3xl font-bold text-orange-500 tracking-tight mb-3">{warnings.length}</div>
                        <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-orange-500 rounded-full" style={{ width: `${Math.min(100, (warnings.length / Math.max(1, issues.length)) * 100)}%` }} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Top Issues List */}
              <div className="lg:col-span-2">
                <Card className="h-full flex flex-col bg-white dark:bg-[#18181a] border-zinc-200 dark:border-zinc-800 shadow-sm pb-0 gap-0">
                  <CardContent className="p-0 flex-1">
                    <div className="flex flex-col">
                      {issues.slice(0, 5).map((issue: any, idx: number) => {
                        const isCritical = issue.priority === 'critical' || issue.severity === 'critical';
                        const isHigh = issue.priority === 'high' || issue.severity === 'high' || issue.severity === 'error';
                        return (
                        <div key={idx} className="group px-6 py-4 flex flex-col md:flex-row md:items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors border-b border-zinc-100 dark:border-zinc-800/80 last:border-0 gap-4">
                          <div className="flex items-start md:items-center gap-4">
                            <div className="mt-0.5 md:mt-0">
                              {issue.severity === 'error' || issue.severity === 'critical' || issue.severity === 'high' 
                                ? <ShieldAlert className="w-4 h-4 text-red-500" /> 
                                : <AlertTriangle className="w-4 h-4 text-orange-500" />}
                            </div>
                            <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">{issue.title}</span>
                          </div>
                          <div className="flex items-center gap-6 shrink-0 ml-8 md:ml-0">
                            <Badge variant="outline" className={`uppercase text-[10px] px-2 py-0.5 h-5 font-semibold tracking-wider ${
                              isCritical ? 'border-red-500/30 text-red-500 bg-red-500/10' : 
                              isHigh ? 'border-orange-500/30 text-orange-500 bg-orange-500/10' : 
                              'border-zinc-500/30 text-zinc-500 bg-zinc-500/10'
                            }`}>
                              {issue.priority || (issue.severity === 'error' ? 'High' : 'Medium')}
                            </Badge>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium hover:text-indigo-500 transition-colors cursor-pointer border-b border-dashed border-zinc-400 hover:border-indigo-500">
                              <IssueDetailsDialog issue={issue} />
                            </div>
                          </div>
                        </div>
                      )})}
                    </div>
                  </CardContent>
                  <div className="p-2 bg-zinc-50/50 dark:bg-[#141416] border-t border-zinc-200 dark:border-zinc-800 text-center rounded-b-xl">
                    <Button variant="ghost" className="w-full text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-transparent h-8" onClick={() => setActiveTab('issues')}>
                      View all issues <ArrowRight className="w-3.5 h-3.5 ml-1.5 opacity-70" />
                    </Button>
                  </div>
                </Card>
              </div>
            </div>

            {/* Thematic Reports */}
            <div className="pt-4">
              <h3 className="font-semibold text-base mb-5 text-zinc-900 dark:text-zinc-100">Thematic Reports</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {Object.entries(selectedScan.scores?.thematic || {}).map(([key, rawScore]: [string, any]) => {
                  const analysis = calculateThemeScore(key, issues, rawScore);
                  const displayScore = analysis.score;
                  return (
                  <Card key={key} className="bg-white dark:bg-[#111111] border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-sm group pb-0 gap-0">
                    <CardContent className="px-4 pt-4 pb-3 flex flex-col h-full justify-between gap-4">
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[13px] font-bold text-zinc-500 dark:text-blue-200/60 uppercase tracking-wide">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <span className={`text-2xl font-bold tracking-tight leading-none ${getScoreColor(displayScore)}`}>{displayScore}</span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-orange-400 rounded-full" style={{ width: `${displayScore}%` }} />
                        </div>
                      </div>
                      
                      <div className="mt-1 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between cursor-pointer group/btn" onClick={() => setSelectedTheme({key, score: rawScore})}>
                        <span className="text-sm font-medium text-zinc-600 dark:text-blue-400/70 group-hover/btn:text-blue-400 transition-colors">View Details</span>
                        <ArrowRight className="w-4 h-4 text-zinc-400 dark:text-zinc-500 group-hover/btn:text-zinc-300 transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="issues" className="space-y-6">
            <Card>
              <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex gap-2">
                  <Input placeholder="Search" className="w-64 h-8" />
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="h-8 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-0">All {issues.length}</Badge>
                  <Badge variant="secondary" className="h-8 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-0">Errors {errors.length}</Badge>
                  <Badge variant="secondary" className="h-8 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-0">Warnings {warnings.length}</Badge>
                  <Badge variant="secondary" className="h-8 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-0">Notices {notices.length}</Badge>
                </div>
              </div>
              <CardContent className="p-0">
                {/* Errors Section */}
                <div className="border-t-4 border-t-red-500 bg-white dark:bg-[#141413] p-4 font-semibold text-sm flex items-center gap-2">
                  Errors ({errors.length}) <Info className="w-3 h-3 text-zinc-400" />
                </div>
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border-b border-zinc-200 dark:border-zinc-800">
                  {errors.map((issue: any, idx: number) => (
                    <div key={idx} className="p-4 flex flex-col lg:flex-row lg:items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-900/50 gap-4">
                      <div className="flex items-center gap-2 text-sm text-[#5b8cce]">
                        <span className="text-zinc-700 dark:text-zinc-300 font-medium">{issue.title}</span>
                        <IssueDetailsDialog issue={issue} />
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <Badge variant="outline" className="uppercase text-[10px] tracking-wider bg-white dark:bg-zinc-900">{issue.priority || 'Medium'}</Badge>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Warnings Section */}
                <div className="border-t-4 border-t-orange-500 bg-white dark:bg-[#141413] p-4 font-semibold text-sm flex items-center gap-2 mt-4">
                  Warnings ({warnings.length}) <Info className="w-3 h-3 text-zinc-400" />
                </div>
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border-b border-zinc-200 dark:border-zinc-800">
                  {warnings.map((issue: any, idx: number) => (
                    <div key={idx} className="p-4 flex flex-col lg:flex-row lg:items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-900/50 gap-4">
                      <div className="flex items-center gap-2 text-sm text-[#5b8cce]">
                        <span className="text-zinc-700 dark:text-zinc-300 font-medium">{issue.title}</span>
                        <IssueDetailsDialog issue={issue} />
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <Badge variant="outline" className="uppercase text-[10px] tracking-wider bg-white dark:bg-zinc-900">{issue.priority || 'Medium'}</Badge>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Notices Section */}
                <div className="border-t-4 border-t-blue-500 bg-white dark:bg-[#141413] p-4 font-semibold text-sm flex items-center gap-2 mt-4">
                  Notices ({notices.length}) <Info className="w-3 h-3 text-zinc-400" />
                </div>
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border-b border-zinc-200 dark:border-zinc-800">
                  {notices.map((issue: any, idx: number) => (
                    <div key={idx} className="p-4 flex flex-col lg:flex-row lg:items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-900/50 gap-4">
                      <div className="flex items-center gap-2 text-sm text-[#5b8cce]">
                        <span className="text-zinc-700 dark:text-zinc-300 font-medium">{issue.title}</span>
                        <IssueDetailsDialog issue={issue} />
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <Badge variant="outline" className="uppercase text-[10px] tracking-wider bg-white dark:bg-zinc-900">{issue.priority || 'Medium'}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>



          <TabsContent value="crawled" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Discovered & Crawled Pages</CardTitle>
                <CardDescription>Pages found during scans and their current status.</CardDescription>
              </CardHeader>
              <CardContent>
                {projectPages.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-zinc-500 bg-zinc-50 dark:bg-zinc-900 border-y border-zinc-200 dark:border-zinc-800">
                        <tr>
                          <th className="px-4 py-3 font-medium">URL</th>
                          <th className="px-4 py-3 font-medium">Status</th>
                          <th className="px-4 py-3 font-medium">Discovered At</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {projectPages.map((page, idx) => (
                          <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                            <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">{page.url}</td>
                            <td className="px-4 py-3">
                              <Badge variant="outline" className={page.status === 'scanned' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-zinc-50 text-zinc-700'}>
                                {page.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-zinc-500" suppressHydrationWarning>
                              {page.discoveredAt ? new Date(page.discoveredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="h-16 w-16 bg-zinc-100 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mb-4">
                      <Search className="w-8 h-8 text-zinc-400" />
                    </div>
                    <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-1">No Discovered Pages</h3>
                    <p className="text-sm text-zinc-500">Run an SEO Audit to automatically discover internal pages.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="compare" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Scan History</CardTitle>
                <CardDescription>Review past audit results to compare performance over time.</CardDescription>
              </CardHeader>
              <CardContent>
                {scans.length > 1 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-zinc-500 bg-zinc-50 dark:bg-zinc-900 border-y border-zinc-200 dark:border-zinc-800">
                        <tr>
                          <th className="px-4 py-3 font-medium">Date</th>
                          <th className="px-4 py-3 font-medium">Target URL</th>
                          <th className="px-4 py-3 font-medium">Site Health</th>
                          <th className="px-4 py-3 font-medium">Errors / Warnings</th>
                          <th className="px-4 py-3 font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {scans.map((scan, idx) => {
                          const scanErrors = (scan.issues || []).filter((i: any) => i.severity === 'error').length;
                          const scanWarnings = (scan.issues || []).filter((i: any) => i.severity === 'warning').length;
                          return (
                            <tr key={idx} className={`hover:bg-zinc-50 dark:hover:bg-zinc-900/50 ${selectedScan?.id === scan.id ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}>
                              <td className="px-4 py-3 text-zinc-500">{new Date(scan.createdAt).toLocaleString()}</td>
                              <td className="px-4 py-3 font-medium">{scan.pageUrl || 'Project Root'}</td>
                              <td className="px-4 py-3">
                                <span className={`font-bold ${getScoreColor(scan.scores?.siteHealth || 0)}`}>{scan.scores?.siteHealth || 0}%</span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-red-500 font-medium">{scanErrors}</span> / <span className="text-orange-500 font-medium">{scanWarnings}</span>
                              </td>
                              <td className="px-4 py-3">
                                <Button variant="outline" size="sm" onClick={() => setCompareModalScan(scan)}>
                                  View Issues
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="h-16 w-16 bg-zinc-100 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mb-4">
                      <RefreshCcw className="w-8 h-8 text-zinc-400" />
                    </div>
                    <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-1">Compare Historical Audits</h3>
                    <p className="text-sm text-zinc-500 max-w-sm">Run at least two scans on this property to unlock the comparison engine and track your optimization progress.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Dialog open={!!compareModalScan} onOpenChange={(isOpen) => !isOpen && setCompareModalScan(null)}>
              <DialogContent className="sm:max-w-4xl w-[95vw] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Issues for {compareModalScan?.pageUrl || compareModalScan?.url}</DialogTitle>
                  <DialogDescription>
                    Scanned at {compareModalScan && new Date(compareModalScan.createdAt).toLocaleString()}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  {(compareModalScan?.issues || []).map((issue: any, idx: number) => (
                    <div key={idx} className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-4">
                        <span className="font-semibold text-sm">{issue.title}</span>
                        <Badge variant="outline" className="uppercase text-[10px] tracking-wider shrink-0">{issue.severity || issue.priority || 'Medium'}</Badge>
                      </div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">{issue.description || issue.howToFix || "No additional description available."}</p>
                    </div>
                  ))}
                  {(!compareModalScan?.issues || compareModalScan.issues.length === 0) && (
                    <p className="text-sm text-zinc-500 text-center py-4">No issues found in this scan.</p>
                  )}
                </div>
                <DialogFooter className="mt-6 border-t border-zinc-200 dark:border-zinc-800 pt-4">
                  <Button 
                    className="w-full sm:w-auto"
                    onClick={() => {
                      setSelectedScan(compareModalScan);
                      setActiveTab('overview');
                      setCompareModalScan(null);
                    }}
                  >
                    View Full Report
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>
          
          <TabsContent value="progress" className="space-y-6">
            {!hasScans ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="h-16 w-16 bg-zinc-100 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mb-4">
                    <BarChart className="w-8 h-8 text-zinc-400" />
                  </div>
                  <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-1">No Analytics Data</h3>
                  <p className="text-sm text-zinc-500">Run your first audit to establish a baseline for tracking.</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Top Row: Dual Line Chart & Radar */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Health Trajectory */}
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle>Health Trajectory</CardTitle>
                      <CardDescription>Track your Site Health and AI Search Optimization over time.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={healthData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                            <RechartsTooltip 
                              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Line type="monotone" name="Site Health" dataKey="siteHealth" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            <Line type="monotone" name="AI Search Health" dataKey="aiHealth" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Thematic Radar */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Thematic Analysis</CardTitle>
                      <CardDescription>Latest scan vs Previous scan across core technical pillars.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px] w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                            <PolarGrid stroke="#e5e7eb" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 11 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar name="Latest Scan" dataKey="latest" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                            {scans.length > 1 && (
                              <Radar name="Previous Scan" dataKey="previous" stroke="#9ca3af" fill="#9ca3af" fillOpacity={0.2} />
                            )}
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <RechartsTooltip />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Bottom Row: Issue Resolution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Issue Resolution Trend</CardTitle>
                    <CardDescription>Monitor your technical debt. Stacked view of critical errors and warnings.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={issueData} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                          <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                          <RechartsTooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          />
                          <Legend wrapperStyle={{ paddingTop: '20px' }} />
                          <Area type="monotone" name="Errors (Critical/High)" dataKey="errors" stackId="1" stroke="#ef4444" fill="#fecaca" />
                          <Area type="monotone" name="Warnings (Medium/Low)" dataKey="warnings" stackId="1" stroke="#f97316" fill="#fed7aa" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Scan History</CardTitle>
                <CardDescription>View all past SEO scans run on this project.</CardDescription>
              </CardHeader>
              <CardContent>
                {scans.length === 0 ? (
                  <p className="text-sm text-zinc-500 text-center py-8">No history available yet.</p>
                ) : (
                  <div className="rounded-md border border-zinc-200 dark:border-zinc-800">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                        <tr>
                          <th className="p-3 font-medium text-zinc-500">Date</th>
                          <th className="p-3 font-medium text-zinc-500">URL Analyzed</th>
                          <th className="p-3 font-medium text-zinc-500 text-center">Health Score</th>
                          <th className="p-3 font-medium text-zinc-500 text-center">Issues</th>
                          <th className="p-3 font-medium text-zinc-500 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {scans.map((scan) => {
                          const scanHealth = scan.scores?.siteHealth ?? scan.scores?.seo ?? 0;
                          const scanIssues = scan.issues || [];
                          return (
                            <tr key={scan.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                              <td className="p-3">{new Date(scan.createdAt).toLocaleString()}</td>
                              <td className="p-3 truncate max-w-[200px] text-zinc-900 dark:text-zinc-100">{scan.pageUrl || scan.url}</td>
                              <td className="p-3 text-center">
                                <Badge className={getScoreBg(scanHealth) + " text-white border-none"}>{scanHealth}%</Badge>
                              </td>
                              <td className="p-3 text-center">
                                <span className="text-zinc-500">{scanIssues.length} found</span>
                              </td>
                              <td className="p-3 text-right">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    setSelectedScan(scan);
                                    setActiveTab('overview');
                                  }}
                                >
                                  View Report
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
