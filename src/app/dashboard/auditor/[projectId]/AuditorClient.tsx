'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Globe, Search, RefreshCw, AlertCircle, FileText, CheckCircle2, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { ShareLinkClient } from '@/components/report/ShareLinkClient';
import { PdfReportClient } from '@/components/report/PdfReportClient';

export function AuditorClient({ projectId, initialPages, websiteUrl }: { projectId: string, initialPages: any[], websiteUrl: string }) {
  const [pages, setPages] = useState(initialPages);
  const [isCrawling, setIsCrawling] = useState(false);
  const [analyzingPageId, setAnalyzingPageId] = useState<string | null>(null);
  const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const toggleExpand = (pageId: string) => {
    setExpandedPages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pageId)) newSet.delete(pageId);
      else newSet.add(pageId);
      return newSet;
    });
  };

  const handleCrawl = async () => {
    setIsCrawling(true);
    toast.loading('Crawling website...', { id: 'crawl' });
    try {
      const res = await fetch(`/api/auditor/${projectId}/crawl`, { method: 'POST' });
      if (!res.ok) throw new Error('Crawl failed');
      const data = await res.json();
      setPages(data.pages);
      toast.success(`Discovered ${data.pages.length} pages!`, { id: 'crawl' });
    } catch (error) {
      console.error(error);
      toast.error('Failed to crawl website', { id: 'crawl' });
    } finally {
      setIsCrawling(false);
    }
  };

  const handleAnalyze = async (pageId: string) => {
    setAnalyzingPageId(pageId);
    toast.loading('Analyzing content with AI...', { id: `analyze-${pageId}` });
    try {
      const res = await fetch(`/api/auditor/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId })
      });
      if (!res.ok) throw new Error('Analysis failed');
      
      const data = await res.json();
      
      // Update local state
      setPages(prev => prev.map(p => p.id === pageId ? { ...p, contentAnalysis: data.analysis } : p));
      setExpandedPages(prev => new Set(prev).add(pageId));
      
      toast.success('Analysis complete!', { id: `analyze-${pageId}` });
    } catch (error) {
      console.error(error);
      toast.error('Failed to analyze content', { id: `analyze-${pageId}` });
    } finally {
      setAnalyzingPageId(null);
    }
  };

  const filteredPages = pages.filter(p => {
    const query = searchQuery.toLowerCase();
    return (p.title && p.title.toLowerCase().includes(query)) || p.url.toLowerCase().includes(query);
  }).sort((a, b) => {
    // 1. Sort by URL depth (number of slashes) to put homepage and top-level pages first
    const depthA = a.url.split('/').length;
    const depthB = b.url.split('/').length;
    if (depthA !== depthB) return depthA - depthB;
    
    // 2. Fallback to alphabetical sorting for pages at the same depth
    return a.url.localeCompare(b.url);
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Discovered Pages ({pages.length})</h2>
          {pages.some(p => p.contentAnalysis) && (
            <div className="flex items-center gap-2 hidden md:flex">
              <ShareLinkClient url={`/dashboard/auditor/${projectId}/print`} />
              <PdfReportClient url={`/dashboard/auditor/${projectId}/print?download=true`} />
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {pages.length > 0 && (
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
              <Input
                type="text"
                placeholder="Search pages..."
                className="pl-9 h-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}
          <Button onClick={handleCrawl} disabled={isCrawling} className="h-9">
            <RefreshCw className={`mr-2 h-4 w-4 ${isCrawling ? 'animate-spin' : ''}`} />
            {pages.length === 0 ? 'Crawl Website' : 'Re-crawl'}
          </Button>
        </div>
      </div>

      {pages.length === 0 ? (
        <Card className="border-dashed border-2 shadow-none border-zinc-200 dark:border-zinc-800 bg-transparent">
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-zinc-400" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No pages discovered yet</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mb-4">
              Click the button above to crawl {websiteUrl} and find pages to audit.
            </p>
          </CardContent>
        </Card>
      ) : filteredPages.length === 0 ? (
        <div className="text-center py-12 text-zinc-500">
          No pages found matching "{searchQuery}"
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredPages.map(page => (
            <Card key={page.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="h-4 w-4 text-zinc-400" />
                      <h3 className="font-medium truncate">{page.title || page.url}</h3>
                      {page.contentAnalysis ? (
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                          <CheckCircle2 className="mr-1 h-3 w-3" /> Analyzed
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                          <Clock className="mr-1 h-3 w-3" /> Not Analyzed
                        </Badge>
                      )}
                    </div>
                    <a href={page.url} target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-500 hover:underline truncate block">
                      {page.url}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant={page.contentAnalysis ? "outline" : "default"}
                      onClick={() => handleAnalyze(page.id)} 
                      disabled={analyzingPageId === page.id}
                    >
                      {analyzingPageId === page.id ? (
                        <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
                      ) : (
                        page.contentAnalysis ? 'Re-analyze' : 'Analyze Content'
                      )}
                    </Button>
                    {page.contentAnalysis && (
                      <Button variant="ghost" size="icon" onClick={() => toggleExpand(page.id)}>
                        {expandedPages.has(page.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Analysis Results */}
                {page.contentAnalysis && expandedPages.has(page.id) && (
                  <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 border-t border-zinc-200 dark:border-zinc-800 text-sm">
                    <div className="grid md:grid-cols-3 gap-6">
                      
                      {/* SEO Score & Feedback */}
                      <div>
                        <div className="flex items-center gap-2 mb-2 font-medium">
                          <span className="text-lg">{page.contentAnalysis.seoScore}/10</span>
                          <span>SEO</span>
                        </div>
                        <p className="text-zinc-600 dark:text-zinc-400 mb-2">{page.contentAnalysis.seoFeedback}</p>
                        {page.contentAnalysis.seoIssues?.length > 0 && (
                          <ul className="list-disc pl-4 space-y-1 text-red-600 dark:text-red-400">
                            {page.contentAnalysis.seoIssues.map((issue: string, i: number) => <li key={i}>{issue}</li>)}
                          </ul>
                        )}
                      </div>

                      {/* Grammar Feedback */}
                      <div>
                        <div className="flex items-center gap-2 mb-2 font-medium">
                          <span className="text-lg">{page.contentAnalysis.grammarScore}/10</span>
                          <span>Grammar & Readability</span>
                        </div>
                        <p className="text-zinc-600 dark:text-zinc-400 mb-2">{page.contentAnalysis.grammarFeedback}</p>
                        {page.contentAnalysis.grammarIssues?.length > 0 && (
                          <ul className="list-disc pl-4 space-y-1 text-amber-600 dark:text-amber-400">
                            {page.contentAnalysis.grammarIssues.map((issue: string, i: number) => <li key={i}>{issue}</li>)}
                          </ul>
                        )}
                      </div>

                      {/* Content Structure */}
                      <div>
                        <div className="flex items-center gap-2 mb-2 font-medium">
                          <span className="text-lg">{page.contentAnalysis.structureScore}/10</span>
                          <span>Content Structure</span>
                        </div>
                        <p className="text-zinc-600 dark:text-zinc-400">{page.contentAnalysis.structureFeedback}</p>
                      </div>
                      
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
