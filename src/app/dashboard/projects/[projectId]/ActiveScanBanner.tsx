'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2, Sparkles, CheckCircle2, AlertCircle, Eye, Activity, Cpu, RotateCw, X } from 'lucide-react';
import { toast } from 'sonner';

interface ActiveScanBannerProps {
  scan: {
    id: string;
    status: string;
    startedAt: Date | string | null;
    pageUrl?: string | null;
  };
  projectId: string;
  websiteUrl: string;
}

export function ActiveScanBanner({ scan, projectId, websiteUrl }: ActiveScanBannerProps) {
  const router = useRouter();
  const [status, setStatus] = useState(scan.status);
  
  // Calculate starting progress based on real elapsed time since startedAt
  const getInitialProgress = () => {
    const start = scan.startedAt ? new Date(scan.startedAt).getTime() : Date.now();
    const elapsedSeconds = Math.max(0, (Date.now() - start) / 1000);
    // Estimated scan duration is ~25 seconds
    const calculated = Math.floor((elapsedSeconds / 25) * 90);
    return Math.min(95, Math.max(12, calculated));
  };

  const [progress, setProgress] = useState(getInitialProgress);
  const [stage, setStage] = useState('Initializing background analysis...');
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (status !== 'pending' && status !== 'running') {
      return;
    }

    // Trigger process route to ensure serverless containers actively execute the job
    if (status === 'pending') {
      fetch(`/api/scans/${scan.id}/process`, { method: 'POST' }).catch(() => {});
    }

    // Dynamic stage updates based on progress
    const updateStage = (prog: number) => {
      if (prog < 25) {
        setStage('Crawling website DOM & resolving structure...');
      } else if (prog < 50) {
        setStage('Capturing high-resolution viewport & assets...');
      } else if (prog < 75) {
        setStage('Diagnosing conversion friction & UX psychology with Gemini AI...');
      } else if (prog < 95) {
        setStage('Measuring Core Web Vitals & prioritizing high-impact fixes...');
      } else {
        setStage('Finalizing intelligence report...');
      }
    };

    updateStage(progress);

    // Smooth progress increment
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 95; // Hold at 95% until server confirms completion
        const next = prev + 2;
        updateStage(next);
        return next;
      });
    }, 800);

    // Server polling every 2 seconds
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/scans/${scan.id}/status`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'completed') {
            setStatus('completed');
            setProgress(100);
            setStage('Audit complete! Refreshing report view...');
            clearInterval(pollInterval);
            clearInterval(progressInterval);
            toast.success('Analysis completed successfully!', { id: `scan-${scan.id}` });
            setTimeout(() => {
              router.refresh();
            }, 1000);
          } else if (data.status === 'failed') {
            setStatus('failed');
            clearInterval(pollInterval);
            clearInterval(progressInterval);
            toast.error('Analysis failed or timed out.', { id: `scan-${scan.id}` });
          }
        }
      } catch (err) {
        console.error('Active scan polling error:', err);
      }
    }, 2000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(pollInterval);
    };
  }, [scan.id, status, router]);

  if (isDismissed || (status !== 'pending' && status !== 'running' && status !== 'failed')) {
    return null;
  }

  if (status === 'failed') {
    return (
      <Card className="border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 shadow-xs animate-in fade-in duration-300">
        <CardContent className="p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-red-100 dark:bg-red-900/40 text-red-600 flex items-center justify-center shrink-0">
              <AlertCircle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-red-900 dark:text-red-300">
                Scan timed out or encountered a network error
              </p>
              <p className="text-[11px] text-red-700 dark:text-red-400">
                The background worker was unable to reach the target URL. Click Run New Scan to retry.
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setIsDismissed(true);
              router.refresh();
            }} 
            className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30"
          >
            <X className="w-3.5 h-3.5 mr-1" /> Dismiss
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[#cc785c]/30 bg-gradient-to-r from-[#cc785c]/10 via-[#faf9f5] to-[#cc785c]/5 dark:from-[#cc785c]/15 dark:via-[#181715] dark:to-[#cc785c]/10 shadow-sm animate-in fade-in slide-in-from-top-3 duration-500 overflow-hidden">
      <CardContent className="p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-[#cc785c]/15 text-[#cc785c] flex items-center justify-center shrink-0 animate-pulse">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm text-[#141413] dark:text-[#faf9f5]">
                  AI Conversion Analysis In Progress
                </h4>
                <Badge variant="outline" className="text-[10px] font-mono bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700/50">
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Background Job #{scan.id.split('-')[0]}
                </Badge>
              </div>
              <p className="text-xs text-[#6c6a64] dark:text-[#8e8b82] mt-0.5">
                Analyzing <span className="font-medium text-[#141413] dark:text-[#faf9f5]">{scan.pageUrl || websiteUrl}</span> — you can navigate away or refresh safely.
              </p>
            </div>
          </div>

          <div className="text-right flex items-center gap-2 self-end sm:self-center">
            <span className="text-xs font-mono font-bold text-[#cc785c]">{progress}%</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <Progress value={progress} className="h-2 w-full bg-[#efe9de] dark:bg-[#252320]" />
          <div className="flex items-center justify-between text-[11px] text-[#8e8b82]">
            <span className="flex items-center gap-1.5 font-medium text-[#3d3d3a] dark:text-[#d1cfc7]">
              <Cpu className="w-3.5 h-3.5 text-[#cc785c] animate-spin" /> {stage}
            </span>
            <span>Est. ~25s</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
