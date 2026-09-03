"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PanelLeft, Sparkles, FileText, Search, Key, Crosshair, Unlink } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SidebarNav() {
  const pathname = usePathname();

  const isDashboardActive = pathname === '/dashboard';
  const isProjectsActive = pathname.startsWith('/dashboard/projects');
  const isAuditorActive = pathname.startsWith('/dashboard/auditor');
  const isLinkCheckerActive = pathname.startsWith('/dashboard/link-checker');
  const isAioActive = pathname.startsWith('/dashboard/aio');
  const isSeoActive = pathname.startsWith('/dashboard/seo');
  const isKeywordsActive = pathname.startsWith('/dashboard/keywords');
  const isCompetitorsActive = pathname.startsWith('/dashboard/competitors');

  const navItemClass = (active: boolean) => cn(
    "flex items-center space-x-3 rounded-[8px] px-3.5 py-2.5 text-[14px] font-medium transition-all",
    active 
      ? "bg-[#efe9de] dark:bg-[#252320] text-[#141413] dark:text-[#faf9f5] font-semibold border border-[#e6dfd8] dark:border-[#2e2b27] shadow-sm" 
      : "text-[#6c6a64] dark:text-[#8e8b82] hover:bg-[#efe9de]/50 dark:hover:bg-[#252320]/50 hover:text-[#141413] dark:hover:text-[#faf9f5] border border-transparent"
  );

  return (
    <nav className="flex-1 space-y-1.5 p-4">
      <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8e8b82]">
        Workspace
      </div>

      <Link href="/dashboard" className={navItemClass(isDashboardActive)}>
        <LayoutDashboard className={cn("h-4 w-4", isDashboardActive ? "text-[#cc785c]" : "text-[#6c6a64] dark:text-[#8e8b82]")} />
        <span>Overview</span>
      </Link>
      
      <Link href="/dashboard/projects" className={navItemClass(isProjectsActive)}>
        <PanelLeft className={cn("h-4 w-4", isProjectsActive ? "text-[#cc785c]" : "text-[#6c6a64] dark:text-[#8e8b82]")} />
        <span>CRO Audits</span>
      </Link>

      <Link href="/dashboard/auditor" className={navItemClass(isAuditorActive)}>
        <FileText className={cn("h-4 w-4", isAuditorActive ? "text-[#5db872]" : "text-[#6c6a64] dark:text-[#8e8b82]")} />
        <span>Content Auditor</span>
      </Link>
      
      <Link href="/dashboard/link-checker" className={navItemClass(isLinkCheckerActive)}>
        <Unlink className={cn("h-4 w-4", isLinkCheckerActive ? "text-[#e85a5a]" : "text-[#6c6a64] dark:text-[#8e8b82]")} />
        <span>Dead Link Checker</span>
      </Link>
      
      <Link href="/dashboard/aio" className={navItemClass(isAioActive)}>
        <Sparkles className={cn("h-4 w-4", isAioActive ? "text-[#e8a55a]" : "text-[#6c6a64] dark:text-[#8e8b82]")} />
        <span>AIO Intelligence</span>
      </Link>

      <Link href="/dashboard/seo" className={navItemClass(isSeoActive)}>
        <Search className={cn("h-4 w-4", isSeoActive ? "text-[#5b8cce]" : "text-[#6c6a64] dark:text-[#8e8b82]")} />
        <span>SEO Intelligence</span>
      </Link>

      <Link href="/dashboard/keywords" className={navItemClass(isKeywordsActive)}>
        <Key className={cn("h-4 w-4", isKeywordsActive ? "text-[#5b8cce]" : "text-[#6c6a64] dark:text-[#8e8b82]")} />
        <span>Keyword Intelligence</span>
      </Link>

      <Link href="/dashboard/competitors" className={navItemClass(isCompetitorsActive)}>
        <Crosshair className={cn("h-4 w-4", isCompetitorsActive ? "text-[#e85a5a]" : "text-[#6c6a64] dark:text-[#8e8b82]")} />
        <span>Competitor Intelligence</span>
      </Link>
    </nav>
  );
}
