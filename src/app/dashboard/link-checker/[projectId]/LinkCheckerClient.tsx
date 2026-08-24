'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, RefreshCw, Link as LinkIcon, ExternalLink, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function LinkCheckerClient({ projectId, initialDeadLinks, websiteUrl }: { projectId: string, initialDeadLinks: any[], websiteUrl: string }) {
  const [deadLinks, setDeadLinks] = useState(initialDeadLinks);
  const [isChecking, setIsChecking] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleRunChecker = async () => {
    setIsChecking(true);
    toast.loading('Crawling website and checking links...', { id: 'link-checker' });
    try {
      const res = await fetch(`/api/link-checker/${projectId}/run`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to run link checker');
      const data = await res.json();
      setDeadLinks(data.deadLinks);
      if (data.deadLinks.length > 0) {
        toast.warning(`Found ${data.deadLinks.length} broken links!`, { id: 'link-checker' });
      } else {
        toast.success(`Scan complete! No broken links found.`, { id: 'link-checker' });
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while checking links.', { id: 'link-checker' });
    } finally {
      setIsChecking(false);
    }
  };

  const filteredLinks = deadLinks.filter(l => {
    const query = searchQuery.toLowerCase();
    return l.targetUrl.toLowerCase().includes(query) || l.foundOnUrl.toLowerCase().includes(query);
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-xl font-semibold">Broken Links Found ({deadLinks.length})</h2>
        <div className="flex items-center gap-2">
          {deadLinks.length > 0 && (
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
              <Input
                type="text"
                placeholder="Search URLs..."
                className="pl-9 h-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}
          <Button onClick={handleRunChecker} disabled={isChecking} className="h-9">
            <RefreshCw className={`mr-2 h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
            Run Link Checker
          </Button>
        </div>
      </div>

      {deadLinks.length === 0 ? (
        <Card className="border-dashed border-2 shadow-none border-zinc-200 dark:border-zinc-800 bg-transparent">
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
              <LinkIcon className="h-6 w-6 text-zinc-400" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No broken links found</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mb-4">
              Click the button above to crawl {websiteUrl} and find broken internal or external links.
            </p>
          </CardContent>
        </Card>
      ) : filteredLinks.length === 0 ? (
        <div className="text-center py-12 text-zinc-500">
          No broken links found matching "{searchQuery}"
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Broken URL</th>
                  <th className="px-4 py-3 font-medium">Found On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredLinks.map(link => (
                  <tr key={link.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                    <td className="px-4 py-3">
                      <Badge variant="destructive" className="font-mono">
                        {link.statusCode || 'ERR'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 max-w-xs md:max-w-md truncate">
                      <div className="font-medium text-zinc-900 dark:text-zinc-100 truncate" title={link.targetUrl}>
                        {link.targetUrl}
                      </div>
                      {link.errorMessage && (
                        <div className="text-xs text-red-500 mt-1 truncate" title={link.errorMessage}>
                          {link.errorMessage}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 max-w-xs md:max-w-md truncate">
                      <a href={link.foundOnUrl} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:underline inline-flex items-center gap-1 truncate" title={link.foundOnUrl}>
                        {link.foundOnUrl} <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
