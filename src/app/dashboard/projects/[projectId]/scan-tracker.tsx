"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

interface ScanTrackerProps {
  scanId: string;
  projectId: string;
  initialStatus: string;
  initialScores: any;
  startedAt?: Date | string;
}

export function ScanTracker({ scanId, projectId, initialStatus, initialScores, startedAt }: ScanTrackerProps) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [scores, setScores] = useState(initialScores);

  const getInitialProgress = () => {
    if (!startedAt) return 15;
    const start = new Date(startedAt).getTime();
    const elapsedSeconds = Math.max(0, (Date.now() - start) / 1000);
    const calculated = Math.floor((elapsedSeconds / 25) * 90);
    return Math.min(95, Math.max(15, calculated));
  };

  const [progress, setProgress] = useState(getInitialProgress);

  useEffect(() => {
    // If not running/pending, we don't need to poll
    if (status !== 'pending' && status !== 'running') {
      return;
    }

    // Mock progress bar that slowly fills up while waiting
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 95; // cap at 95% until actually done
        return prev + 3;
      });
    }, 800);

    // Poll the server for actual status every 2.5 seconds
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/scans/${scanId}/status`);
        if (res.ok) {
          const data = await res.json();
          if (data.status !== 'pending' && data.status !== 'running') {
            setStatus(data.status);
            setScores(data.scores);
            setProgress(100);
            clearInterval(pollInterval);
            clearInterval(progressInterval);
            // Wait a moment so user sees 100%, then refresh page
            setTimeout(() => {
              router.refresh();
            }, 1000);
          }
        }
      } catch (err) {
        console.error("Failed to poll scan status", err);
      }
    }, 2500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(pollInterval);
    };
  }, [scanId, status, router]);

  if (status === 'completed') {
    return (
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-semibold text-[#141413] dark:text-[#faf9f5]">
            {scores?.seo ?? (scores?.siteHealth ?? 0)}% Health
          </p>
          <p className="text-[11px] text-[#6c6a64] dark:text-[#8e8b82]">
            {scores?.performance ?? 100}% Perf
          </p>
        </div>
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 text-[10px]">
          Completed
        </Badge>
        <Link href={`/dashboard/projects/${projectId}/scans/${scanId}`}>
          <Button variant="outline" size="sm" className="h-7 text-xs">
            View Report
          </Button>
        </Link>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="flex items-center gap-4">
        <Badge variant="destructive" className="text-[10px]">Failed</Badge>
        <Button variant="outline" size="sm" disabled className="h-7 text-xs">
          View Report
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1.5 w-48">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200 text-[10px]">
          Analyzing... {progress}%
        </Badge>
        <Button variant="outline" size="sm" disabled className="h-7 text-xs">
          View Report
        </Button>
      </div>
      <Progress value={progress} className="h-1.5 w-full bg-[#efe9de] dark:bg-[#252320]" />
    </div>
  );
}
