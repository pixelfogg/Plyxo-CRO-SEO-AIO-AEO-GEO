'use client';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Download } from 'lucide-react';
import Link from 'next/link';

export function PdfReportClient({ projectId, scanId, url }: { projectId?: string; scanId?: string; url?: string }) {
  const targetUrl = url || `/dashboard/projects/${projectId}/scans/${scanId}/print?download=true`;
  return (
    <Link href={targetUrl} target="_blank" className={cn(buttonVariants({ variant: "outline" }), "flex items-center gap-2 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800")}><Download className="h-4 w-4" /><span>Save as PDF</span></Link>
  );
}
