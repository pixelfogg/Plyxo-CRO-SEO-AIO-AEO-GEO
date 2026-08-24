'use client';

import { useState } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { Activity, ChevronLeft, ChevronRight, SplitSquareHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScanTracker } from './scan-tracker';

interface ScanHistoryListProps {
  scans: any[];
  projectId: string;
}

export function ScanHistoryList({ scans, projectId }: ScanHistoryListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [currentPage, setCurrentPage] = useState(1);
  
  const isCompareMode = searchParams.get('compare') === 'true';
  const selectedScans = searchParams.getAll('scan');

  const itemsPerPage = 10;
  const totalPages = Math.ceil(scans.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentScans = scans.slice(startIndex, startIndex + itemsPerPage);

  const handleSelectScan = (scanId: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    const scans = current.getAll('scan');
    
    current.delete('scan');
    
    if (scans.includes(scanId)) {
      scans.filter(id => id !== scanId).forEach(id => current.append('scan', id));
    } else if (scans.length < 2) {
      [...scans, scanId].forEach(id => current.append('scan', id));
    } else {
      scans.forEach(id => current.append('scan', id));
    }
    
    router.push(`${pathname}?${current.toString()}`);
  };

  if (scans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="h-16 w-16 bg-zinc-100 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mb-4 ring-8 ring-zinc-50 dark:ring-zinc-900/50">
          <Activity className="w-8 h-8 text-zinc-400" />
        </div>
        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-1">No Scans Recorded</h3>
        <p className="text-sm text-zinc-500 max-w-sm">Click "Run New Scan" above to analyze this property and generate your first report.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {currentScans.map((scan) => (
          <div key={scan.id} className={`flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4 last:border-0 last:pb-0 ${isCompareMode && scan.status !== 'completed' ? 'opacity-50' : ''}`}>
            <div className="flex items-center gap-4">
              {isCompareMode && (
                <Checkbox 
                  checked={selectedScans.includes(scan.id)}
                  onCheckedChange={() => handleSelectScan(scan.id)}
                  disabled={scan.status !== 'completed' || (selectedScans.length >= 2 && !selectedScans.includes(scan.id))}
                />
              )}
              <div className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">Scan {scan.id.split('-')[0]}</p>
                  {scan.pageUrl && (
                    <span className="text-[10px] bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 px-1.5 py-0.5 rounded truncate max-w-[200px]" title={scan.pageUrl}>
                      {new URL(scan.pageUrl).pathname}
                    </span>
                  )}
                </div>
                <p suppressHydrationWarning className="text-xs text-zinc-500 mt-1">
                  {new Date(scan.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            {!isCompareMode && (
              <ScanTracker 
                scanId={scan.id} 
                projectId={projectId} 
                initialStatus={scan.status} 
                initialScores={scan.scores} 
                startedAt={scan.startedAt || scan.createdAt}
              />
            )}
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <p className="text-sm text-zinc-500">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, scans.length)} of {scans.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium">
              {currentPage} / {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
