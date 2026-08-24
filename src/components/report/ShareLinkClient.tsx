'use client';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Share2 } from 'lucide-react';
import Link from 'next/link';

export function ShareLinkClient({ projectId, scanId, url }: { projectId?: string; scanId?: string; url?: string }) {
  const targetUrl = url || `/dashboard/projects/${projectId}/scans/${scanId}/print`;
  return (
    <Link href={targetUrl} target="_blank" className={cn(buttonVariants({ variant: "outline" }), "flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 hover:text-indigo-800")}><Share2 className="h-4 w-4" /><span>Share Report</span></Link>
  );
}
