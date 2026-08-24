"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  PanelLeftClose, 
  PanelLeftOpen, 
  Search, 
  Bell, 
  ChevronDown, 
  LogOut, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  ExternalLink, 
  LayoutDashboard, 
  FileText, 
  Globe,
  Settings,
  X,
  Loader2,
  Calendar,
  ArrowUpRight
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/theme-toggle';
import { SidebarNav } from './SidebarNav';
import { BrandLogo, RadialSpike } from '@/components/claude/RadialSpike';
import { logout } from '@/app/auth/actions';

interface WorkspaceClientLayoutProps {
  children: React.ReactNode;
  email: string;
  userInitial: string;
  isSuperadmin: boolean;
  organizations?: { id: string, name: string, slug: string }[];
  currentOrg?: { id: string, name: string, slug: string } | null;
  subscription?: {
    plan: string;
    planName?: string;
    status: string;
    currentPeriodEnd: string | null;
    isTopTier?: boolean;
    nextPlanName?: string;
  } | null;
}

function LogoutSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="px-4 py-2 text-sm font-medium rounded-[8px] bg-[#cc785c] hover:bg-[#a9583e] text-white transition-colors flex items-center justify-center min-w-[84px] disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : "Log out"}
    </button>
  );
}

export function WorkspaceClientLayout({
  children,
  email,
  userInitial,
  isSuperadmin,
  organizations = [],
  currentOrg,
  subscription,
}: WorkspaceClientLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [hasUnreadNotifs, setHasUnreadNotifs] = useState(true);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const plan = subscription?.plan || (isSuperadmin ? 'pro' : 'free');
  const status = subscription?.status || (isSuperadmin ? 'active' : 'inactive');
  const isPaid = plan === 'pro' || isSuperadmin || status === 'active';
  const isTrial = (status === 'trialing' || status === 'trial') && !isPaid;
  const isTopTier = subscription ? subscription.isTopTier : isSuperadmin;
  const nextPlanName = subscription?.nextPlanName;
  const isCommunity = process.env.NEXT_PUBLIC_IS_CLOUD_EDITION === 'false' || plan === 'community';
  const planDisplayName = isCommunity ? 'Community Edition' : (subscription?.planName || (isPaid ? 'Pro' : 'Free Tier'));

  let statusBadge = 'Free';
  if (isCommunity) statusBadge = 'Local Mode';
  else if (isTopTier) statusBadge = '⭐ Premium';
  else if (isPaid) statusBadge = 'Pro';
  else if (isTrial) statusBadge = '7-Day Trial';
  else if (status === 'past_due') statusBadge = 'Past Due';
  else if (status === 'canceled') statusBadge = 'Canceled';

  let buttonText = 'Upgrade to Pro';
  if (isCommunity) {
    buttonText = 'Unlimited Access';
  } else if (isTopTier) {
    buttonText = 'Manage Subscription';
  } else if (isPaid && nextPlanName) {
    buttonText = `Upgrade to ${nextPlanName}`;
  } else if (isPaid) {
    buttonText = 'Upgrade Tier';
  }

  let expiryDisplay = isCommunity ? 'Unlimited Scans & Projects' : (isSuperadmin ? 'Unlimited admin access' : 'Standard scan limits');
  if (subscription?.currentPeriodEnd) {
    const d = new Date(subscription.currentPeriodEnd);
    const formatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    if (isTrial) expiryDisplay = `Trial ends ${formatted}`;
    else if (status === 'canceled') expiryDisplay = `Access until ${formatted}`;
    else expiryDisplay = `Renews ${formatted}`;
  }

  // Quick Nav Search Items
  const searchItems = [
    { label: 'Workspace Overview & Activity', href: '/dashboard', category: 'General', icon: LayoutDashboard },
    { label: 'CRO AI Conversion Audits', href: '/dashboard/projects', category: 'Audits', icon: Globe },
    { label: 'Content & SEO Auditor', href: '/dashboard/auditor', category: 'Audits', icon: FileText },
    { label: 'AEO Intelligence & LLM Visibility', href: '/dashboard/aio', category: 'Intelligence', icon: Sparkles },
  ];

  const filteredSearch = searchItems.filter(item => 
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle Ctrl+K / Cmd+K search shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const input = document.getElementById('global-workspace-search');
        if (input) input.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSearchResult = (href: string) => {
    setSearchQuery('');
    setIsSearchFocused(false);
    router.push(href);
  };

  const isPrintRoute = pathname?.endsWith('/print');
  if (isPrintRoute) {
    return <div className="min-h-screen w-full bg-white text-black print:bg-white">{children}</div>;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground font-sans selection:bg-[#cc785c]/20">
      {/* Collapsible Sticky Sidebar */}
      <aside 
        className={`hidden flex-col border-r border-[#e6dfd8] dark:border-[#2e2b27] bg-[#faf9f5] dark:bg-[#181715] md:flex z-30 h-full transition-all duration-300 ease-in-out shrink-0 overflow-hidden ${
          isSidebarOpen ? 'w-[250px] opacity-100' : 'w-0 border-r-0 opacity-0 pointer-events-none mr-0'
        }`}
      >
        {/* Fixed Top Brand Logo */}
        <div className="flex h-16 shrink-0 items-center border-b border-[#e6dfd8] dark:border-[#2e2b27] px-6 w-[250px]">
          <Link href="/dashboard" className="transition-opacity hover:opacity-90">
            <BrandLogo />
          </Link>
        </div>
        
        {/* Independently Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto custom-scrollbar w-[250px]">
          <SidebarNav />
        </div>

        {/* Pinned Community Edition Status Card */}
        <div className="shrink-0 p-3.5 m-2 rounded-[12px] bg-[#efe9de] dark:bg-[#252320] text-[#141413] dark:text-[#faf9f5] border border-[#e6dfd8] dark:border-[#2e2b27] w-[234px] relative overflow-hidden shadow-xs">
          <div className="flex items-center justify-between mb-1 relative z-10">
            <div className="flex items-center gap-1.5 font-semibold text-[13px] tracking-tight">
              <Sparkles className="h-3.5 w-3.5 text-[#cc785c]" />
              <span className="truncate">Community Edition</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#5db872]/20 text-[#5db872] border border-[#5db872]/30">
              Local
            </span>
          </div>

          <div className="text-[11px] text-[#6c6a64] dark:text-[#8e8b82] font-medium">
            <span>Unlimited Scans &amp; Projects</span>
          </div>
        </div>
      </aside>

      {/* Workspace Main Column */}
      <div className="flex flex-1 flex-col overflow-hidden h-full relative min-w-0">
        {/* Sticky Glassmorphic Header */}
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-[#e6dfd8] dark:border-[#2e2b27] bg-[#faf9f5]/90 dark:bg-[#181715]/90 backdrop-blur-md px-5 md:px-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3 shrink-0">
            {/* Sidebar Collapse Toggle Button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden md:flex items-center justify-center h-9 w-9 rounded-[8px] bg-[#efe9de] dark:bg-[#252320] border border-[#e6dfd8] dark:border-[#2e2b27] text-[#141413] dark:text-[#faf9f5] hover:bg-[#efe9de]/80 dark:hover:bg-[#252320]/80 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
              title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
              aria-label="Toggle Navigation Sidebar"
            >
              {isSidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
            </button>

            {/* Logo shown when sidebar is collapsed or on mobile */}
            <div className={`flex items-center transition-opacity duration-300 ${isSidebarOpen ? 'md:hidden' : 'flex'}`}>
              <Link href="/dashboard">
                <BrandLogo />
              </Link>
            </div>

            {/* Organization Switcher */}
            {!isSuperadmin && currentOrg && organizations.length > 0 && (
              <div className="hidden sm:flex items-center ml-2">
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-1.5 h-8 px-2.5 rounded-[6px] hover:bg-[#efe9de] dark:hover:bg-[#252320] transition-colors focus:outline-none">
                    <span className="text-[13px] font-medium text-[#141413] dark:text-[#faf9f5] truncate max-w-[140px]">
                      {currentOrg.name}
                    </span>
                    <ChevronDown className="h-3 w-3 text-[#8e8b82]" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[200px] bg-[#faf9f5] dark:bg-[#181715] border border-[#e6dfd8] dark:border-[#2e2b27] shadow-xl rounded-[10px]">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="text-[11px] font-mono text-[#8e8b82] uppercase px-3 py-2">
                        Workspaces
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-[#e6dfd8] dark:bg-[#2e2b27]" />
                      {organizations.map((org) => (
                        <DropdownMenuItem
                          key={org.id}
                          className="px-3 py-2 cursor-pointer flex items-center justify-between"
                          onClick={() => {
                            if (org.id !== currentOrg.id) {
                              document.cookie = `current_org_id=${org.id}; path=/; max-age=31536000`;
                              window.location.href = "/dashboard";
                            }
                          }}
                        >
                          <span className="text-[13px] text-[#141413] dark:text-[#faf9f5] truncate">{org.name}</span>
                          {org.id === currentOrg.id && <CheckCircle2 className="h-3.5 w-3.5 text-[#cc785c]" />}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator className="bg-[#e6dfd8] dark:bg-[#2e2b27]" />
                    <DropdownMenuItem render={<Link href="/onboarding" className="px-3 py-2 cursor-pointer text-[13px] text-[#cc785c] flex items-center gap-2" />}>
                      + Create Workspace
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          {/* Global Search Bar */}
          <div className="flex-1 max-w-[440px] relative mr-auto ml-4" ref={searchRef}>
            <div className="relative flex items-center w-full">
              <Search className="absolute left-3.5 h-4 w-4 text-[#8e8b82] pointer-events-none" />
              <input
                id="global-workspace-search"
                name="global_search_prevent_autofill"
                type="search"
                role="presentation"
                autoComplete="off"
                spellCheck="false"
                placeholder="Search audits, domains & analytics..."
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchFocused(true);
                }}
                className="w-full h-[38px] pl-10 pr-12 rounded-[10px] bg-[#efe9de]/60 dark:bg-[#252320]/60 hover:bg-[#efe9de] dark:hover:bg-[#252320] text-[#141413] dark:text-[#faf9f5] placeholder:text-[#8e8b82] text-[13px] border border-[#e6dfd8] dark:border-[#2e2b27] focus:outline-none focus:ring-1 focus:ring-[#cc785c] focus:bg-[#faf9f5] dark:focus:bg-[#181715] transition-all"
              />
              <div className="absolute right-2.5 flex items-center pointer-events-none">
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-medium text-[#8e8b82] bg-[#faf9f5] dark:bg-[#181715] border border-[#e6dfd8] dark:border-[#3d3b36] rounded-[6px]">
                  ⌘K
                </kbd>
              </div>
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-9 text-[#8e8b82] hover:text-[#141413] dark:hover:text-[#faf9f5] p-0.5"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Interactive Search Results Dropdown */}
            {isSearchFocused && (
              <div className="absolute top-11 left-0 right-0 z-50 rounded-[12px] bg-[#faf9f5] dark:bg-[#181715] border border-[#e6dfd8] dark:border-[#2e2b27] shadow-xl p-2 max-h-[360px] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-150">
                <div className="px-2.5 py-1.5 text-[11px] font-mono uppercase text-[#8e8b82] border-b border-[#e6dfd8] dark:border-[#2e2b27]/60 mb-1">
                  {searchQuery ? `Searching "${searchQuery}"` : 'Quick Workspace Navigation'}
                </div>
                {filteredSearch.length > 0 ? (
                  <div className="space-y-1 mt-1">
                    {filteredSearch.map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleSelectSearchResult(item.href)}
                          className="w-full flex items-center justify-between px-3 py-2.5 rounded-[8px] hover:bg-[#efe9de] dark:hover:bg-[#252320] text-left transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-[6px] bg-[#efe9de]/70 dark:bg-[#252320]/70 flex items-center justify-center text-[#cc785c] group-hover:bg-[#cc785c] group-hover:text-white transition-colors">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="text-[13px] font-semibold text-[#141413] dark:text-[#faf9f5]">
                                {item.label}
                              </div>
                              <div className="text-[11px] font-mono text-[#8e8b82]">
                                [{item.category}]
                              </div>
                            </div>
                          </div>
                          <span className="text-[12px] font-mono text-[#cc785c] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            Jump &rarr;
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 text-center text-sm text-[#8e8b82]">
                    No scans or properties matching query.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Header Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <ThemeToggle />

            {/* Notification Bell with Panel */}
            <DropdownMenu>
              <DropdownMenuTrigger className="relative h-9 w-9 rounded-[8px] flex items-center justify-center bg-[#efe9de] dark:bg-[#252320] border border-[#e6dfd8] dark:border-[#2e2b27] text-[#141413] dark:text-[#faf9f5] hover:bg-[#efe9de]/80 dark:hover:bg-[#252320]/80 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] focus:outline-none">
                <Bell className="h-4 w-4" />
                {hasUnreadNotifs && (
                  <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#cc785c] border border-[#faf9f5] dark:border-[#181715] animate-pulse"></span>
                )}
                <span className="sr-only">View notifications</span>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent className="w-[340px] sm:w-[380px] bg-[#faf9f5] dark:bg-[#181715] border border-[#e6dfd8] dark:border-[#2e2b27] shadow-2xl rounded-[14px] p-0 overflow-hidden z-50" align="end">
                {/* Editorial Header */}
                <div className="bg-[#181715] dark:bg-[#252320] text-[#faf9f5] px-4 py-3 border-b border-[#2e2b27] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RadialSpike size={14} className="text-[#cc785c]" />
                    <span className="font-serif text-[17px] tracking-tight">Recent Notifications</span>
                  </div>
                  {hasUnreadNotifs ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#cc785c]/20 text-[#cc785c] border border-[#cc785c]/30 font-semibold">
                      3 UNREAD
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono text-[#8e8b82]">ALL READ</span>
                  )}
                </div>

                {/* Notification Items */}
                <div className="divide-y divide-[#e6dfd8] dark:divide-[#2e2b27] max-h-[340px] overflow-y-auto">
                  <div className="p-4 hover:bg-[#efe9de]/40 dark:hover:bg-[#252320]/40 transition-colors flex items-start gap-3.5">
                    <div className="h-8 w-8 rounded-[6px] bg-[#5db872]/15 border border-[#5db872]/30 flex items-center justify-center text-[#5db872] shrink-0 mt-0.5">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-semibold font-mono text-[#5db872]">AUDIT COMPLETE</span>
                        <span className="text-[11px] text-[#8e8b82] font-mono">2m ago</span>
                      </div>
                      <p className="text-xs font-medium text-[#141413] dark:text-[#faf9f5]">Autonomous Canary Scan Finished</p>
                      <p className="text-[12px] text-[#6c6a64] dark:text-[#a09d96] leading-snug">
                        14 high-impact conversion recommendations synthesized for domain <span className="font-mono text-[#cc785c]">Pixelfogg</span>.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 hover:bg-[#efe9de]/40 dark:hover:bg-[#252320]/40 transition-colors flex items-start gap-3.5">
                    <div className="h-8 w-8 rounded-[6px] bg-[#e8a55a]/15 border border-[#e8a55a]/30 flex items-center justify-center text-[#e8a55a] shrink-0 mt-0.5">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-semibold font-mono text-[#e8a55a]">AEO VISIBILITY LIFT</span>
                        <span className="text-[11px] text-[#8e8b82] font-mono">1h ago</span>
                      </div>
                      <p className="text-xs font-medium text-[#141413] dark:text-[#faf9f5]">LLM Crawler Ready</p>
                      <p className="text-[12px] text-[#6c6a64] dark:text-[#a09d96] leading-snug">
                        robots.txt indexing rules verified for ChatGPT-User &amp; Anthropic-ai parsers.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 hover:bg-[#efe9de]/40 dark:hover:bg-[#252320]/40 transition-colors flex items-start gap-3.5">
                    <div className="h-8 w-8 rounded-[6px] bg-[#cc785c]/15 border border-[#cc785c]/30 flex items-center justify-center text-[#cc785c] shrink-0 mt-0.5">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-semibold font-mono text-[#cc785c]">CONTENT AUDIT</span>
                        <span className="text-[11px] text-[#8e8b82] font-mono">3h ago</span>
                      </div>
                      <p className="text-xs font-medium text-[#141413] dark:text-[#faf9f5]">Semantic Inspection Saved</p>
                      <p className="text-[12px] text-[#6c6a64] dark:text-[#a09d96] leading-snug">
                        Content Auditor evaluated copywriting readability across 8 secondary project routes.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="bg-[#efe9de]/50 dark:bg-[#252320]/50 px-4 py-2.5 border-t border-[#e6dfd8] dark:border-[#2e2b27] flex items-center justify-between">
                  <button 
                    onClick={() => setHasUnreadNotifs(false)} 
                    className="text-xs font-mono text-[#cc785c] hover:underline font-semibold"
                  >
                    Mark all reviewed
                  </button>
                  <Link href="/dashboard/projects" className="text-xs font-mono text-[#6c6a64] dark:text-[#8e8b82] hover:text-[#141413] dark:hover:text-[#faf9f5] flex items-center gap-1">
                    <span>Audit history</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center justify-center gap-1 h-9 px-2 rounded-[8px] bg-[#efe9de] dark:bg-[#252320] border border-[#e6dfd8] dark:border-[#2e2b27] text-[#141413] dark:text-[#faf9f5] hover:bg-[#efe9de]/80 dark:hover:bg-[#252320]/80 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] focus:outline-none">
                <Avatar className="h-6 w-6 bg-[#cc785c] text-white rounded-[5px]">
                  <AvatarFallback className="bg-[#cc785c] text-white font-mono font-bold text-[11px] rounded-[5px] flex items-center justify-center">{userInitial}</AvatarFallback>
                </Avatar>
                <ChevronDown className="h-3.5 w-3.5 text-[#6c6a64] dark:text-[#8e8b82] shrink-0" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-[#faf9f5] dark:bg-[#181715] border border-[#e6dfd8] dark:border-[#2e2b27] shadow-lg rounded-[12px] p-2 z-50" align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal px-2 py-1.5">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-[#141413] dark:text-[#faf9f5]">Local Workspace</p>
                      <p className="text-xs leading-none text-[#6c6a64] dark:text-[#8e8b82] truncate">
                        {email} · Community Edition
                      </p>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Independently Scrollable Workspace Viewport */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar bg-background relative z-0">
          {children}
        </main>
      </div>
    </div>
  );
}

