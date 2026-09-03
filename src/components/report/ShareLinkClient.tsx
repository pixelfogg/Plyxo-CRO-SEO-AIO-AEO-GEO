'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Share2, Check } from 'lucide-react';

export function ShareLinkClient({ projectId, scanId, url }: { projectId?: string; scanId?: string; url?: string }) {
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    if (typeof window !== 'undefined') {
      const base = window.location.origin;
      if (url) return url.startsWith('http') ? url : `${base}${url}`;
      if (scanId) return `${base}/report/${scanId}`;
      if (projectId) return `${base}/dashboard/projects/${projectId}`;
    }
    return url || (scanId ? `/report/${scanId}` : '#');
  };

  const handleShare = async () => {
    const shareUrl = getShareUrl();
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
        return;
      } catch {}
    }
    window.open(shareUrl, '_blank');
  };

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={handleShare}
      className={cn(
        "flex items-center gap-1.5 h-8 text-xs font-medium transition-all duration-200",
        copied
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800"
          : "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 hover:text-indigo-800"
      )}
      title="Copy public report link to clipboard"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
      <span>{copied ? 'Link Copied!' : 'Share Report'}</span>
    </Button>
  );
}

