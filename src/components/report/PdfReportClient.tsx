'use client';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Download } from 'lucide-react';
import Link from 'next/link';

export function PdfReportClient({ projectId, scanId, url }: { projectId?: string; scanId?: string; url?: string }) {
  let targetUrl = url || `/dashboard/projects/${projectId}/scans/${scanId}/print?download=true`;
  if (!targetUrl.includes('download=true')) {
    targetUrl += targetUrl.includes('?') ? '&download=true' : '?download=true';
  }
  return (
    <Link 
      href={targetUrl} 
      target="_blank" 
      className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex items-center gap-1.5 h-8 text-xs bg-white dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27] hover:bg-zinc-50 dark:hover:bg-zinc-800")}
    >
      <Download className="h-3.5 w-3.5 text-zinc-500" />
      <span>Save as PDF</span>
    </Link>
  );
}

