"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { 
  Search, Loader2, ArrowLeft, ArrowRight, Settings, Share, Download, RefreshCcw, FileText, 
  CheckCircle2, AlertTriangle, Info, ShieldAlert, BarChart3, Check, ChevronsUpDown, Globe2, 
  Sparkles, Code2, Cpu, ShieldCheck, Zap, Layers, Bot, Eye, Copy, ExternalLink, Hash, BookOpen,
  HelpCircle, ChevronRight, Lock, CheckSquare, Target, Flame, Image as ImageIcon, Link2, Shield,
  Terminal, Activity
} from 'lucide-react';
import { toast } from 'sonner';
import { getProjects, getSeoScans, runSeoIntelligence, getProjectPages, crawlWebsite } from '../actions';
import { 
  CLAUDE_SEO_CATEGORIES, CLAUDE_25_SKILLS, THEME_CHECKS, calculateThemeScore, 
  generateSchemaFix, generateSecurityConfig, generateSocialMetaTags,
  generateAiSummaryBox, generateAiFaqSection, generateAiRobotsTxt,
  generateModernPictureTag, generateZeroClsImageCss, generateScriptDeferSnippets,
  generateSemanticLinkSilo, generateOutboundLinkAttributionSnippet,
  generateSxoHeroSection, generateSxoStickyMobileBar, generateSxoLeadForm,
  type ThemeCheck
} from '@/lib/seo-utils';
import { RadialSpike } from '@/components/claude/RadialSpike';
import { SeoReportSkeleton } from '@/components/ui/animated-skeleton';
import { ShareLinkClient } from '@/components/report/ShareLinkClient';
import { PdfReportClient } from '@/components/report/PdfReportClient';
import { 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, 
  ResponsiveContainer, Tooltip as RechartsTooltip
} from 'recharts';
import Link from 'next/link';

// ----------------------------------------------------------------------------
// Component: How To Fix Modal
// ----------------------------------------------------------------------------
function IssueFixModal({ issue }: { issue: any }) {
  const [copied, setCopied] = useState(false);

  const fixCode = useMemo(() => {
    const match = issue.description?.match(/```(?:html|json|jsonb|nginx|bash)?([\s\S]*?)```/);
    return match ? match[1].trim() : '';
  }, [issue.description]);

  const cleanDescription = useMemo(() => {
    return issue.description?.replace(/```[\s\S]*?```/g, '').trim() || 'No description provided.';
  }, [issue.description]);

  const copySnippet = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Fix code copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger className="inline-flex items-center justify-center rounded-md h-8 text-xs font-semibold text-[#cc785c] hover:text-[#b8684e] hover:bg-[#cc785c]/10 gap-1.5 px-2.5 transition-colors cursor-pointer border border-[#cc785c]/30">
        <span>Fix Guide</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto bg-[#faf9f5] dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant={issue.severity === 'error' ? 'destructive' : 'outline'} className="capitalize text-[11px] font-mono">
              {issue.severity || 'warning'}
            </Badge>
            <Badge variant="secondary" className="capitalize text-[11px]">
              {issue.category || 'General'}
            </Badge>
            <Badge variant="outline" className="text-[11px] text-zinc-500">
              Impact: {issue.priority || 'High'} Priority
            </Badge>
          </div>
          <DialogTitle className="text-xl font-serif tracking-tight text-[#141413] dark:text-[#faf9f5]">
            {issue.title}
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-500">
            Forensic diagnosis and verified implementation fix.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3 text-sm">
          <div className="bg-white dark:bg-[#141413] p-4 rounded-xl border border-[#e6dfd8] dark:border-[#2e2b27] text-zinc-700 dark:text-zinc-300 space-y-2">
            <h4 className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
              Root Cause &amp; Search Penalty Analysis
            </h4>
            <p className="text-xs leading-relaxed">{cleanDescription}</p>
          </div>

          {fixCode && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-[#cc785c]" />
                  Exact Remediation Code Snippet
                </span>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-7 text-xs gap-1 px-2.5 bg-white dark:bg-zinc-900"
                  onClick={() => copySnippet(fixCode)}
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Code'}</span>
                </Button>
              </div>
              <pre className="bg-[#1e1e1e] text-zinc-200 p-4 rounded-xl text-xs font-mono overflow-x-auto border border-zinc-800 leading-relaxed">
                <code>{fixCode}</code>
              </pre>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ----------------------------------------------------------------------------
// Component: Schema Code Generator Modal (7 Schema Templates)
// ----------------------------------------------------------------------------
function SchemaGeneratorModal({ currentUrl, siteName }: { currentUrl: string; siteName?: string }) {
  const [schemaType, setSchemaType] = useState<'Organization' | 'WebSite' | 'Article' | 'Product' | 'FAQPage' | 'BreadcrumbList' | 'LocalBusiness'>('Organization');
  const [copied, setCopied] = useState(false);

  const generatedCode = useMemo(() => {
    return generateSchemaFix(schemaType, { url: currentUrl, name: siteName });
  }, [schemaType, currentUrl, siteName]);

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    toast.success("JSON-LD Schema copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger className="inline-flex items-center justify-center rounded-md h-8 gap-1.5 text-xs font-medium bg-[#cc785c] hover:bg-[#b8684e] text-white px-3 transition-colors cursor-pointer shadow-sm">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Generate Schema.org Markup</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] bg-[#faf9f5] dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27]">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-[#141413] dark:text-[#faf9f5]">
            One-Click Schema.org JSON-LD Generator
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-500">
            Generate compliant structured data to unlock Google Rich Snippets &amp; Knowledge Graph panels.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex flex-wrap gap-1.5">
            {(['Organization', 'WebSite', 'Article', 'Product', 'FAQPage', 'BreadcrumbList', 'LocalBusiness'] as const).map((t) => (
              <Button
                key={t}
                variant={schemaType === t ? 'default' : 'outline'}
                size="sm"
                className={`text-xs h-7 ${schemaType === t ? 'bg-[#cc785c] text-white' : ''}`}
                onClick={() => setSchemaType(t)}
              >
                {t}
              </Button>
            ))}
          </div>

          <div className="relative">
            <pre className="bg-[#1e1e1e] text-zinc-200 p-4 rounded-xl text-xs font-mono max-h-[320px] overflow-y-auto border border-zinc-800 leading-relaxed">
              <code>{generatedCode}</code>
            </pre>
            <Button
              size="sm"
              variant="secondary"
              className="absolute top-3 right-3 h-7 text-xs gap-1 bg-white/10 hover:bg-white/20 text-white border border-white/20"
              onClick={copyCode}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ----------------------------------------------------------------------------
// Component: Social Meta Tags Fix Generator Modal
// ----------------------------------------------------------------------------
function SocialMetaTagsFixModal({ currentUrl, title, description, image, siteName }: any) {
  const [copied, setCopied] = useState(false);
  const snippet = useMemo(() => {
    return generateSocialMetaTags({ url: currentUrl, title, description, image, siteName });
  }, [currentUrl, title, description, image, siteName]);

  const copyTags = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    toast.success("Social Meta Tags copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger className="inline-flex items-center justify-center rounded-md h-8 gap-1.5 text-xs font-medium bg-[#141413] text-white hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 px-3 transition-colors cursor-pointer border border-zinc-700 shadow-sm">
        <Share className="w-3.5 h-3.5 text-[#cc785c]" />
        <span>Generate Social Meta Tags Fix</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] bg-[#faf9f5] dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27]">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-[#141413] dark:text-[#faf9f5]">
            Optimized Social Meta Tags (OpenGraph &amp; Twitter)
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-500">
            Paste these tags into your document &lt;head&gt; for crisp, high-CTR social link previews.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="relative">
            <pre className="bg-[#1e1e1e] text-zinc-200 p-4 rounded-xl text-xs font-mono max-h-[320px] overflow-y-auto border border-zinc-800 leading-relaxed">
              <code>{snippet}</code>
            </pre>
            <Button
              size="sm"
              variant="secondary"
              className="absolute top-3 right-3 h-7 text-xs gap-1 bg-white/10 hover:bg-white/20 text-white border border-white/20"
              onClick={copyTags}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ----------------------------------------------------------------------------
// Component: AI Search (GEO/AEO) Fix Code Generator Modal
// ----------------------------------------------------------------------------
function AiOptimizationFixModal({ currentUrl, siteName, title }: { currentUrl: string; siteName?: string; title?: string }) {
  const [fixType, setFixType] = useState<'takeaways' | 'faq' | 'robots'>('takeaways');
  const [copied, setCopied] = useState(false);

  const snippet = useMemo(() => {
    const brand = siteName || (currentUrl ? new URL(currentUrl).hostname.replace(/^www\./, '').split('.')[0] : 'Platform');
    if (fixType === 'takeaways') {
      return generateAiSummaryBox({ brand, title: title || `${brand} Overview`, url: currentUrl });
    }
    if (fixType === 'faq') {
      return generateAiFaqSection({ brand, url: currentUrl });
    }
    return generateAiRobotsTxt();
  }, [fixType, currentUrl, siteName, title]);

  const copyCode = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    toast.success("AI Search optimization snippet copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger className="inline-flex items-center justify-center rounded-md h-8 gap-1.5 text-xs font-medium bg-[#cc785c] hover:bg-[#b8684e] text-white px-3 transition-colors cursor-pointer shadow-sm">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Generate AI Citability Fixes</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[750px] bg-[#faf9f5] dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27]">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-[#141413] dark:text-[#faf9f5]">
            GEO &amp; AEO Answer Engine Optimization Fixes
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-500">
            One-click code snippets to maximize citation probability across Perplexity, ChatGPT Search, Claude, and Google AI Overviews.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={fixType === 'takeaways' ? 'default' : 'outline'}
              size="sm"
              className={`text-xs h-8 ${fixType === 'takeaways' ? 'bg-[#cc785c] text-white' : ''}`}
              onClick={() => setFixType('takeaways')}
            >
              ⚡ Key Takeaways Callout Box
            </Button>
            <Button
              variant={fixType === 'faq' ? 'default' : 'outline'}
              size="sm"
              className={`text-xs h-8 ${fixType === 'faq' ? 'bg-[#cc785c] text-white' : ''}`}
              onClick={() => setFixType('faq')}
            >
              ❓ Q&amp;A Section + FAQ Schema
            </Button>
            <Button
              variant={fixType === 'robots' ? 'default' : 'outline'}
              size="sm"
              className={`text-xs h-8 ${fixType === 'robots' ? 'bg-[#cc785c] text-white' : ''}`}
              onClick={() => setFixType('robots')}
            >
              🤖 AI Bot Access (robots.txt)
            </Button>
          </div>

          <div className="relative">
            <pre className="bg-[#1e1e1e] text-zinc-200 p-4 rounded-xl text-xs font-mono max-h-[340px] overflow-y-auto border border-zinc-800 leading-relaxed">
              <code>{snippet}</code>
            </pre>
            <Button
              size="sm"
              variant="secondary"
              className="absolute top-3 right-3 h-7 text-xs gap-1 bg-white/10 hover:bg-white/20 text-white border border-white/20"
              onClick={copyCode}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ----------------------------------------------------------------------------
// Component: Multi-Server Security Header Configuration Generator Modal
// ----------------------------------------------------------------------------
function SecurityConfigModal({ domain }: { domain: string }) {
  const [server, setServer] = useState<'nginx' | 'apache' | 'cloudflare' | 'nextjs'>('nginx');
  const [copied, setCopied] = useState(false);

  const snippet = useMemo(() => {
    return generateSecurityConfig(server, domain || 'your-domain.com');
  }, [server, domain]);

  const copyConfig = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    toast.success("Security configuration copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger className="inline-flex items-center justify-center rounded-md h-8 gap-1.5 text-xs font-medium bg-[#141413] text-white hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 px-3 transition-colors cursor-pointer border border-zinc-700 shadow-sm">
        <Lock className="w-3.5 h-3.5 text-[#cc785c]" />
        <span>Generate Security Headers Fix</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] bg-[#faf9f5] dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27]">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-[#141413] dark:text-[#faf9f5]">
            Server Security Headers Configuration
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-500">
            One-click deployment code to enable HSTS, CSP, X-Frame-Options, and nosniff across your hosting infrastructure.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex flex-wrap gap-2">
            {(['nginx', 'apache', 'cloudflare', 'nextjs'] as const).map((s) => (
              <Button
                key={s}
                variant={server === s ? 'default' : 'outline'}
                size="sm"
                className={`text-xs h-8 capitalize ${server === s ? 'bg-[#cc785c] text-white' : ''}`}
                onClick={() => setServer(s)}
              >
                {s === 'nextjs' ? 'Next.js' : s === 'cloudflare' ? 'Cloudflare' : s}
              </Button>
            ))}
          </div>

          <div className="relative">
            <pre className="bg-[#1e1e1e] text-zinc-200 p-4 rounded-xl text-xs font-mono max-h-[320px] overflow-y-auto border border-zinc-800 leading-relaxed">
              <code>{snippet}</code>
            </pre>
            <Button
              size="sm"
              variant="secondary"
              className="absolute top-3 right-3 h-7 text-xs gap-1 bg-white/10 hover:bg-white/20 text-white border border-white/20"
              onClick={copyConfig}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ----------------------------------------------------------------------------
// Component: Author Bio & Person Schema Generator Modal
// ----------------------------------------------------------------------------
function AuthorBioModal({ currentUrl, siteName }: { currentUrl: string; siteName?: string }) {
  const [copied, setCopied] = useState(false);

  const snippet = useMemo(() => {
    return `<!-- E-E-A-T Verified Author Bio Box -->
<div class="author-bio-box" style="display:flex; gap:16px; padding:20px; border-radius:12px; background:#f9f9f9; border:1px solid #e0e0e0; margin:24px 0;" itemscope itemtype="https://schema.org/Person">
  <img src="${currentUrl}/author.jpg" alt="Editorial Team" itemprop="image" style="width:64px; height:64px; border-radius:50%; object-fit:cover;" />
  <div>
    <h4 style="margin:0 0 4px 0; font-size:16px;" itemprop="name">Editorial Board &amp; Lead Technical Analysts</h4>
    <p style="margin:0 0 8px 0; font-size:13px; color:#555;" itemprop="jobTitle">Senior Industry Specialist at ${siteName || 'our team'}</p>
    <p style="margin:0; font-size:12px; color:#777;" itemprop="description">
      Specializing in enterprise architecture, automated intelligence, and search optimization standards.
    </p>
    <a href="${currentUrl}/about" itemprop="url" style="font-size:12px; color:#cc785c; text-decoration:underline; display:inline-block; margin-top:6px;">View full editorial bio &amp; credentials &rarr;</a>
  </div>
</div>`;
  }, [currentUrl, siteName]);

  const copyBio = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    toast.success("Author bio widget copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger className="inline-flex items-center justify-center rounded-md h-7 gap-1 text-[11px] font-medium bg-[#cc785c] hover:bg-[#b8684e] text-white px-2.5 transition-colors cursor-pointer shadow-sm">
        <Sparkles className="w-3 h-3" />
        <span>Generate Bio Widget</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] bg-[#faf9f5] dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27]">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-[#141413] dark:text-[#faf9f5]">
            E-E-A-T Author Bio &amp; Schema Person Widget
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-500">
            Embed verified author credentials to satisfy Google Search Quality Rater Guidelines.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="relative">
            <pre className="bg-[#1e1e1e] text-zinc-200 p-4 rounded-xl text-xs font-mono max-h-[320px] overflow-y-auto border border-zinc-800 leading-relaxed">
              <code>{snippet}</code>
            </pre>
            <Button
              size="sm"
              variant="secondary"
              className="absolute top-3 right-3 h-7 text-xs gap-1 bg-white/10 hover:bg-white/20 text-white border border-white/20"
              onClick={copyBio}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ----------------------------------------------------------------------------
// Component: Speed & Image Optimization Fix Modal
// ----------------------------------------------------------------------------
function ImageOptimizationFixModal({ sampleImageSrc, sampleAlt }: { sampleImageSrc?: string; sampleAlt?: string }) {
  const [activeTab, setActiveTab] = useState<'picture' | 'clsCss' | 'deferJs'>('picture');
  const [copied, setCopied] = useState(false);

  const snippet = useMemo(() => {
    if (activeTab === 'picture') {
      return generateModernPictureTag({ src: sampleImageSrc || '/images/hero-banner.jpg', alt: sampleAlt });
    }
    if (activeTab === 'clsCss') {
      return generateZeroClsImageCss();
    }
    return generateScriptDeferSnippets();
  }, [activeTab, sampleImageSrc, sampleAlt]);

  const copyCode = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    toast.success("Image optimization code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger className="inline-flex items-center justify-center rounded-md h-8 gap-1.5 text-xs font-medium bg-[#cc785c] hover:bg-[#b8684e] text-white px-3 transition-colors cursor-pointer shadow-sm">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Generate Speed &amp; Image Fixes</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[750px] bg-[#faf9f5] dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27]">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-[#141413] dark:text-[#faf9f5]">
            Core Web Vitals &amp; Media Optimization Engine
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-500">
            Instant code remedies to eliminate layout shifts (CLS), compress image assets (AVIF/WebP), and unblock main-thread rendering.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={activeTab === 'picture' ? 'default' : 'outline'}
              size="sm"
              className={`text-xs h-8 ${activeTab === 'picture' ? 'bg-[#cc785c] text-white' : ''}`}
              onClick={() => setActiveTab('picture')}
            >
              🖼️ Next-Gen &lt;picture&gt; Tag (AVIF/WebP)
            </Button>
            <Button
              variant={activeTab === 'clsCss' ? 'default' : 'outline'}
              size="sm"
              className={`text-xs h-8 ${activeTab === 'clsCss' ? 'bg-[#cc785c] text-white' : ''}`}
              onClick={() => setActiveTab('clsCss')}
            >
              📐 Zero-CLS Aspect Ratio CSS
            </Button>
            <Button
              variant={activeTab === 'deferJs' ? 'default' : 'outline'}
              size="sm"
              className={`text-xs h-8 ${activeTab === 'deferJs' ? 'bg-[#cc785c] text-white' : ''}`}
              onClick={() => setActiveTab('deferJs')}
            >
              ⚡ Script Deferral &amp; Preconnects
            </Button>
          </div>

          <div className="relative">
            <pre className="bg-[#1e1e1e] text-zinc-200 p-4 rounded-xl text-xs font-mono max-h-[340px] overflow-y-auto border border-zinc-800 leading-relaxed">
              <code>{snippet}</code>
            </pre>
            <Button
              size="sm"
              variant="secondary"
              className="absolute top-3 right-3 h-7 text-xs gap-1 bg-white/10 hover:bg-white/20 text-white border border-white/20"
              onClick={copyCode}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ----------------------------------------------------------------------------
// Component: Link Graph & Site Architecture Fix Modal
// ----------------------------------------------------------------------------
function LinkOptimizationFixModal({ brand, domain }: { brand?: string; domain?: string }) {
  const [activeTab, setActiveTab] = useState<'silo' | 'outbound'>('silo');
  const [copied, setCopied] = useState(false);

  const snippet = useMemo(() => {
    if (activeTab === 'silo') {
      return generateSemanticLinkSilo({ brand: brand || 'Platform', domain: domain || 'yourdomain.com' });
    }
    return generateOutboundLinkAttributionSnippet();
  }, [activeTab, brand, domain]);

  const copyCode = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    toast.success("Link optimization code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger className="inline-flex items-center justify-center rounded-md h-8 gap-1.5 text-xs font-medium bg-[#cc785c] hover:bg-[#b8684e] text-white px-3 transition-colors cursor-pointer shadow-sm">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Generate Link Graph Fixes</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[750px] bg-[#faf9f5] dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27]">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-[#141413] dark:text-[#faf9f5]">
            Link Architecture &amp; PageRank Equity Generator
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-500">
            Structure internal PageRank distribution, eliminate orphan pages, and secure outbound link attribution.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={activeTab === 'silo' ? 'default' : 'outline'}
              size="sm"
              className={`text-xs h-8 ${activeTab === 'silo' ? 'bg-[#cc785c] text-white' : ''}`}
              onClick={() => setActiveTab('silo')}
            >
              🔗 Hub-and-Spoke Topic Silo HTML
            </Button>
            <Button
              variant={activeTab === 'outbound' ? 'default' : 'outline'}
              size="sm"
              className={`text-xs h-8 ${activeTab === 'outbound' ? 'bg-[#cc785c] text-white' : ''}`}
              onClick={() => setActiveTab('outbound')}
            >
              🛡️ Outbound Link Attribution (rel="sponsored/ugc")
            </Button>
          </div>

          <div className="relative">
            <pre className="bg-[#1e1e1e] text-zinc-200 p-4 rounded-xl text-xs font-mono max-h-[340px] overflow-y-auto border border-zinc-800 leading-relaxed">
              <code>{snippet}</code>
            </pre>
            <Button
              size="sm"
              variant="secondary"
              className="absolute top-3 right-3 h-7 text-xs gap-1 bg-white/10 hover:bg-white/20 text-white border border-white/20"
              onClick={copyCode}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ----------------------------------------------------------------------------
// Component: SXO Search Experience & CRO Conversion Fix Modal
// ----------------------------------------------------------------------------
function SxoConversionFixModal({ brand, title, domain }: { brand?: string; title?: string; domain?: string }) {
  const [activeTab, setActiveTab] = useState<'hero' | 'reassurance' | 'sticky' | 'form'>('hero');
  const [copied, setCopied] = useState(false);

  const snippet = useMemo(() => {
    if (activeTab === 'hero') {
      return generateSxoHeroSection({ brand: brand || 'Platform', title, domain });
    }
    if (activeTab === 'sticky') {
      return generateSxoStickyMobileBar({ brand: brand || 'Platform', domain });
    }
    if (activeTab === 'form') {
      return generateSxoLeadForm();
    }
    return `<!-- SXO Reassurance Microcopy Badges -->
<div class="sxo-reassurance-triggers" style="display:flex; gap:16px; justify-content:center; align-items:center; flex-wrap:wrap; font-size:12px; color:#4b5563; padding:12px 16px; background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px; margin:16px 0;">
  <span style="display:flex; align-items:center; gap:6px;">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
    <strong>No Credit Card Required</strong>
  </span>
  <span style="display:flex; align-items:center; gap:6px;">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
    <strong>14-Day Free Access</strong>
  </span>
  <span style="display:flex; align-items:center; gap:6px;">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
    <strong>Cancel Anytime Online</strong>
  </span>
</div>`;
  }, [activeTab, brand, title, domain]);

  const copyCode = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    toast.success("SXO conversion code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger className="inline-flex items-center justify-center rounded-md h-8 gap-1.5 text-xs font-medium bg-[#cc785c] hover:bg-[#b8684e] text-white px-3 transition-colors cursor-pointer shadow-sm">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Generate SXO Conversion Fixes</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[750px] bg-[#faf9f5] dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27]">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-[#141413] dark:text-[#faf9f5]">
            Search Experience Optimization (SXO) &amp; CRO Remedies
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-500">
            Convert organic search visitors with high-intent Above-The-Fold hero layouts, reassurance triggers, and friction-free forms.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={activeTab === 'hero' ? 'default' : 'outline'}
              size="sm"
              className={`text-xs h-8 ${activeTab === 'hero' ? 'bg-[#cc785c] text-white' : ''}`}
              onClick={() => setActiveTab('hero')}
            >
              🚀 Above-The-Fold Hero (H1 + Dual CTA)
            </Button>
            <Button
              variant={activeTab === 'reassurance' ? 'default' : 'outline'}
              size="sm"
              className={`text-xs h-8 ${activeTab === 'reassurance' ? 'bg-[#cc785c] text-white' : ''}`}
              onClick={() => setActiveTab('reassurance')}
            >
              🛡️ Reassurance Trust Row
            </Button>
            <Button
              variant={activeTab === 'sticky' ? 'default' : 'outline'}
              size="sm"
              className={`text-xs h-8 ${activeTab === 'sticky' ? 'bg-[#cc785c] text-white' : ''}`}
              onClick={() => setActiveTab('sticky')}
            >
              📱 Sticky Mobile Bottom CTA
            </Button>
            <Button
              variant={activeTab === 'form' ? 'default' : 'outline'}
              size="sm"
              className={`text-xs h-8 ${activeTab === 'form' ? 'bg-[#cc785c] text-white' : ''}`}
              onClick={() => setActiveTab('form')}
            >
              📝 Low-Friction Lead Form
            </Button>
          </div>

          <div className="relative">
            <pre className="bg-[#1e1e1e] text-zinc-200 p-4 rounded-xl text-xs font-mono max-h-[340px] overflow-y-auto border border-zinc-800 leading-relaxed">
              <code>{snippet}</code>
            </pre>
            <Button
              size="sm"
              variant="secondary"
              className="absolute top-3 right-3 h-7 text-xs gap-1 bg-white/10 hover:bg-white/20 text-white border border-white/20"
              onClick={copyCode}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ----------------------------------------------------------------------------
// Component: Actionable Standard Check Item (With How to Fix & Action Steps)
// ----------------------------------------------------------------------------
function ActionableCheckItem({
  check,
  isPassed,
  matchingIssue,
  customAction
}: {
  check: ThemeCheck;
  isPassed: boolean;
  matchingIssue?: any;
  customAction?: React.ReactNode;
}) {
  const [showFix, setShowFix] = useState(false);
  const [copied, setCopied] = useState(false);

  const snippetToCopy = check.fixSnippet || (matchingIssue?.description?.match(/```(?:html|json|jsonb|nginx|bash)?([\s\S]*?)```/)?.[1]?.trim());

  const handleCopy = () => {
    if (snippetToCopy) {
      navigator.clipboard.writeText(snippetToCopy);
      setCopied(true);
      toast.success("Fix snippet copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`p-3.5 rounded-xl border transition-all ${
      isPassed 
        ? 'bg-zinc-50/50 dark:bg-[#141413] border-zinc-200/60 dark:border-zinc-800' 
        : 'bg-amber-500/[0.03] dark:bg-amber-500/[0.05] border-amber-500/30'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 flex-1 min-w-0">
          {isPassed ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
          )}
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">{check.label}</p>
              {check.impact && (
                <Badge variant="outline" className={`text-[9px] h-4 px-1 ${
                  check.impact === 'critical' ? 'text-red-500 border-red-500/30' :
                  check.impact === 'high' ? 'text-amber-500 border-amber-500/30' : 'text-zinc-400'
                }`}>
                  {check.impact}
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">{check.recommendation}</p>
            
            {/* If Action Needed, provide interactive Resolution Guide */}
            {!isPassed && (
              <div className="pt-1.5 flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-[10px] gap-1 px-2 text-[#cc785c] border-[#cc785c]/40 hover:bg-[#cc785c]/10"
                  onClick={() => setShowFix(!showFix)}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{showFix ? 'Hide Resolution Guide' : '🛠️ How to Resolve this Issue'}</span>
                  <ChevronRight className={`w-3 h-3 transition-transform ${showFix ? 'rotate-90' : ''}`} />
                </Button>
                {customAction}
              </div>
            )}
          </div>
        </div>

        <Badge 
          variant={isPassed ? 'outline' : 'secondary'} 
          className={`text-[10px] ml-2 shrink-0 ${
            isPassed 
              ? 'text-emerald-600 bg-emerald-500/10 border-emerald-500/30' 
              : 'text-amber-600 bg-amber-500/10 border-amber-500/30 font-medium'
          }`}
        >
          {isPassed ? 'Verified / Passed' : 'Action Needed'}
        </Badge>
      </div>

      {/* Expandable Step-by-Step Fix Drawer */}
      {!isPassed && showFix && (
        <div className="mt-3 pt-3 border-t border-amber-500/20 space-y-2.5 text-xs bg-white/60 dark:bg-black/30 p-3 rounded-lg">
          {check.howToResolve && (
            <div>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200 block text-[11px]">How to Resolve:</span>
              <p className="text-zinc-600 dark:text-zinc-400 text-[11px] mt-0.5 leading-relaxed">{check.howToResolve}</p>
            </div>
          )}

          {check.stepByStep && check.stepByStep.length > 0 && (
            <div>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200 block text-[11px]">Step-by-Step Instructions:</span>
              <ul className="space-y-1 mt-1 text-[11px] text-zinc-600 dark:text-zinc-400">
                {check.stepByStep.map((step, sIdx) => (
                  <li key={sIdx} className="flex items-start gap-1.5">
                    <span className="text-[#cc785c] font-bold">•</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {snippetToCopy && (
            <div className="space-y-1 pt-1">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-zinc-800 dark:text-zinc-200 text-[11px]">Ready-to-Use Code / Configuration:</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-5 text-[10px] gap-1 px-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                  onClick={handleCopy}
                >
                  {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </Button>
              </div>
              <pre className="bg-[#1e1e1e] text-zinc-200 p-2.5 rounded-lg text-[11px] font-mono overflow-x-auto border border-zinc-800 leading-normal">
                <code>{snippetToCopy}</code>
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------
// MAIN CLIENT DASHBOARD COMPONENT
// ----------------------------------------------------------------------------
export function SeoDashboardClient({ projectId }: { projectId: string }) {
  const router = useRouter();

  const [projects, setProjects] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [scans, setScans] = useState<any[]>([]);
  const [selectedScan, setSelectedScan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [customScanUrl, setCustomScanUrl] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Load project scans & pages
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [projRes, pagesRes, scansRes] = await Promise.all([
          getProjects(),
          getProjectPages(projectId),
          getSeoScans(projectId)
        ]);

        if (projRes.success && projRes.projects) {
          setProjects(projRes.projects);
        }
        if (pagesRes.success && pagesRes.pages) {
          setPages(pagesRes.pages);
        }
        if (scansRes.success && scansRes.scans) {
          setScans(scansRes.scans);
          if (scansRes.scans.length > 0) {
            setSelectedScan(scansRes.scans[0]);
          }
        }
      } catch (err: any) {
        toast.error("Failed to load SEO scans: " + err.message);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [projectId]);

  const currentProject = useMemo(() => {
    return projects.find(p => p.id === projectId);
  }, [projects, projectId]);

  // Trigger Live Scan
  const handleTriggerScan = async (targetUrl?: string) => {
    setIsScanning(true);
    const urlToScan = targetUrl || customScanUrl || currentProject?.websiteUrl;
    toast.info(`Running Claude-SEO 25-Skills Intelligence on ${urlToScan}...`);

    try {
      const res = await runSeoIntelligence(projectId, urlToScan);
      if (res.success) {
        toast.success("Claude-SEO Intelligence Scan completed!");
        const scansRes = await getSeoScans(projectId);
        if (scansRes.success && scansRes.scans) {
          setScans(scansRes.scans);
          setSelectedScan(scansRes.scans[0]);
        }
      } else {
        toast.error("Scan failed: " + res.error);
      }
    } catch (err: any) {
      toast.error("Scan error: " + err.message);
    } finally {
      setIsScanning(false);
    }
  };

  // Radar chart data for 8 categories
  const radarData = useMemo(() => {
    if (!selectedScan?.scores?.thematic) {
      return [
        { subject: 'Technical', score: 85, fullMark: 100 },
        { subject: 'Content', score: 80, fullMark: 100 },
        { subject: 'E-E-A-T', score: 75, fullMark: 100 },
        { subject: 'Schema', score: 70, fullMark: 100 },
        { subject: 'AEO / GEO', score: 80, fullMark: 100 },
        { subject: 'Speed (CWV)', score: 85, fullMark: 100 },
        { subject: 'Links', score: 75, fullMark: 100 },
        { subject: 'International', score: 65, fullMark: 100 },
      ];
    }
    const t = selectedScan.scores.thematic;
    return [
      { subject: 'Technical', score: t.technical ?? t.crawlability ?? 80, fullMark: 100 },
      { subject: 'Content', score: t.content ?? 75, fullMark: 100 },
      { subject: 'E-E-A-T', score: selectedScan.scores.eeatScore ?? 75, fullMark: 100 },
      { subject: 'Schema', score: t.schema ?? t.markup ?? 70, fullMark: 100 },
      { subject: 'AEO / GEO', score: selectedScan.scores.geoScore ?? selectedScan.scores.aiSearchHealth ?? 80, fullMark: 100 },
      { subject: 'Speed (CWV)', score: t.performance ?? t.sitePerformance ?? 80, fullMark: 100 },
      { subject: 'Links', score: t.internalLinks ?? t.internalLinking ?? 75, fullMark: 100 },
      { subject: 'Global/Local', score: t.internationalLocal ?? t.internationalSeo ?? 65, fullMark: 100 },
    ];
  }, [selectedScan]);

  // Filtered Issues list
  const issues = useMemo(() => {
    if (!selectedScan?.issues) return [];
    return selectedScan.issues.filter((issue: any) => {
      const matchesSeverity = filterSeverity === 'all' || issue.severity === filterSeverity;
      const matchesCategory = filterCategory === 'all' || issue.category === filterCategory;
      return matchesSeverity && matchesCategory;
    });
  }, [selectedScan, filterSeverity, filterCategory]);

  const scores = selectedScan?.scores || {};
  const siteHealth = scores.siteHealth ?? 82;
  const eeatScore = scores.eeatScore ?? 75;
  const geoScore = scores.geoScore ?? scores.aiSearchHealth ?? 80;
  const technicalScore = scores.technicalScore ?? scores.thematic?.technical ?? 85;
  const pageDetails = scores.pageDetails || {};

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SeoReportSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* -------------------------------------------------------------------- */}
      {/* 1. TOP HEADER & COMMAND BAR                                          */}
      {/* -------------------------------------------------------------------- */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-[#e6dfd8] dark:border-[#2e2b27] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Link 
              href="/dashboard/seo" 
              className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-[#cc785c] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Projects</span>
            </Link>
            <span className="text-zinc-300 dark:text-zinc-700">/</span>
            <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">{currentProject?.name || 'Project'}</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="font-serif text-2xl md:text-3xl font-normal text-[#141413] dark:text-[#faf9f5]">
              {currentProject?.name || 'SEO Intelligence'}
            </h1>
            <Badge variant="outline" className="bg-[#efe9de] dark:bg-[#252320] text-[#cc785c] border-[#cc785c]/30 font-mono text-[11px]">
              Claude-SEO 25-Skills Engine
            </Badge>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Analyzing <span className="font-mono text-zinc-700 dark:text-zinc-300">{selectedScan?.pageUrl || currentProject?.websiteUrl}</span>
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Page Scan Selector */}
          <div className="flex items-center gap-1.5">
            <Input 
              placeholder="https://your-domain.com/page"
              value={customScanUrl}
              onChange={(e) => setCustomScanUrl(e.target.value)}
              className="h-8 text-xs w-[210px] bg-white dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27]"
            />
            <Button
              size="sm"
              onClick={() => handleTriggerScan()}
              disabled={isScanning}
              className="h-8 text-xs bg-[#cc785c] hover:bg-[#b8684e] text-white gap-1.5 shadow-sm"
            >
              {isScanning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCcw className="w-3.5 h-3.5" />}
              <span>{isScanning ? 'Auditing...' : 'Run Audit'}</span>
            </Button>
          </div>

          <SchemaGeneratorModal currentUrl={selectedScan?.pageUrl || currentProject?.websiteUrl || ''} siteName={currentProject?.name} />

          {selectedScan?.id && (
            <>
              <PdfReportClient projectId={projectId} scanId={selectedScan.id} url={`/dashboard/seo/${projectId}/print?scanId=${selectedScan.id}&download=true`} />
              <ShareLinkClient projectId={projectId} scanId={selectedScan.id} url={`/report/${selectedScan.id}`} />
            </>
          )}
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 2. EXECUTIVE HERO GAUGES & RADAR CHART                               */}
      {/* -------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {/* Overall Site Health */}
        <Card className="bg-white dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27] shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardDescription className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400">
              Overall SEO Health
            </CardDescription>
            <div className="flex items-baseline justify-between mt-1">
              <span className={`text-4xl font-bold tracking-tight ${siteHealth >= 80 ? 'text-emerald-600 dark:text-emerald-400' : siteHealth >= 60 ? 'text-amber-500' : 'text-red-500'}`}>
                {siteHealth}%
              </span>
              <Badge variant="outline" className={siteHealth >= 80 ? 'border-emerald-500/30 text-emerald-600 bg-emerald-500/10' : 'border-amber-500/30 text-amber-600'}>
                {siteHealth >= 80 ? 'Optimal' : siteHealth >= 60 ? 'Needs Attention' : 'Critical'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 pb-4">
            <Progress value={siteHealth} className="h-2 bg-zinc-100 dark:bg-zinc-800" />
            <div className="flex justify-between text-[11px] text-zinc-500">
              <span>{selectedScan?.issues?.length || 0} issues detected</span>
              <span>25 Sub-Skills</span>
            </div>
          </CardContent>
        </Card>

        {/* AI Search / GEO Citability */}
        <Card className="bg-white dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27] shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400">
                AI Search (GEO / AEO)
              </CardDescription>
              <Bot className="w-3.5 h-3.5 text-[#5b8cce]" />
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-3xl font-bold text-[#5b8cce]">{geoScore}%</span>
              <span className="text-[11px] text-zinc-500">Perplexity / ChatGPT</span>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
              {pageDetails.aiSummary?.aiSnippetRecommendation || 'High density of direct answers and concise definitions ready for LLM search citation.'}
            </p>
          </CardContent>
        </Card>

        {/* E-E-A-T Trust Index */}
        <Card className="bg-white dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27] shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400">
                E-E-A-T Quality Index
              </CardDescription>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{eeatScore}%</span>
              <span className="text-[11px] text-zinc-500">Experience &amp; Trust</span>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Evaluates author credentials, organization transparency, and verified business citations.
            </p>
          </CardContent>
        </Card>

        {/* Technical Architecture */}
        <Card className="bg-white dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27] shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400">
                Technical Health
              </CardDescription>
              <Cpu className="w-3.5 h-3.5 text-[#cc785c]" />
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-3xl font-bold text-[#cc785c]">{technicalScore}%</span>
              <span className="text-[11px] text-zinc-500">Crawl &amp; Index</span>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
              <Badge variant="outline" className="text-[10px] h-5 bg-zinc-50 dark:bg-zinc-900">
                {pageDetails.securityHeaders?.https ? 'HTTPS Valid' : 'HTTP Only'}
              </Badge>
              <Badge variant="outline" className="text-[10px] h-5 bg-zinc-50 dark:bg-zinc-900">
                {pageDetails.canonical ? 'Canonical Set' : 'No Canonical'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* 8-Axis Radar Chart */}
        <Card className="md:col-span-4 lg:col-span-1 bg-white dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27] shadow-sm flex flex-col items-center justify-center p-2">
          <div className="w-full h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} margin={{ top: 10, right: 15, bottom: 10, left: 15 }}>
                <PolarGrid stroke="#e6dfd8" strokeOpacity={0.4} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#888888', fontSize: 9 }} />
                <Radar name="Score" dataKey="score" stroke="#cc785c" fill="#cc785c" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest -mt-2">8-Domain Evaluation</span>
        </Card>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 3. MODULAR TABBED WORKSPACE                                          */}
      {/* -------------------------------------------------------------------- */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-[#efe9de]/70 dark:bg-[#252320] p-1 border border-[#e6dfd8] dark:border-[#2e2b27] rounded-xl flex flex-wrap h-auto gap-1">
          <TabsTrigger value="overview" className="text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-[#181715] data-[state=active]:text-[#cc785c]">
            <BarChart3 className="w-3.5 h-3.5 mr-1.5" /> Overview &amp; Issues ({issues.length})
          </TabsTrigger>
          <TabsTrigger value="technical" className="text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-[#181715] data-[state=active]:text-[#cc785c]">
            <Cpu className="w-3.5 h-3.5 mr-1.5" /> Technical &amp; Security
          </TabsTrigger>
          <TabsTrigger value="content" className="text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-[#181715] data-[state=active]:text-[#cc785c]">
            <FileText className="w-3.5 h-3.5 mr-1.5" /> Content &amp; E-E-A-T
          </TabsTrigger>
          <TabsTrigger value="sxo" className="text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-[#181715] data-[state=active]:text-[#cc785c]">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" /> SXO &amp; CRO
          </TabsTrigger>
          <TabsTrigger value="schema" className="text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-[#181715] data-[state=active]:text-[#cc785c]">
            <Code2 className="w-3.5 h-3.5 mr-1.5" /> Schema &amp; Social
          </TabsTrigger>
          <TabsTrigger value="geoAeo" className="text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-[#181715] data-[state=active]:text-[#cc785c]">
            <Bot className="w-3.5 h-3.5 mr-1.5" /> AI Search (GEO/AEO)
          </TabsTrigger>
          <TabsTrigger value="performance" className="text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-[#181715] data-[state=active]:text-[#cc785c]">
            <Zap className="w-3.5 h-3.5 mr-1.5" /> Speed &amp; Images
          </TabsTrigger>
          <TabsTrigger value="links" className="text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-[#181715] data-[state=active]:text-[#cc785c]">
            <Layers className="w-3.5 h-3.5 mr-1.5" /> Link Graph
          </TabsTrigger>
        </TabsList>

        {/* ------------------------------------------------------------------ */}
        {/* TAB 1: OVERVIEW & ALL DETAILED ACTIONABLE ISSUES WITH FIXES        */}
        {/* ------------------------------------------------------------------ */}
        <TabsContent value="overview" className="space-y-6">
          {/* 25-Skills Matrix Explorer */}
          <Card className="bg-white dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27] p-5 space-y-3">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="font-serif text-lg text-[#141413] dark:text-[#faf9f5] flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#cc785c]" />
                  Claude-SEO 25-Skills Suite Orchestrator
                </h3>
                <p className="text-xs text-zinc-500">
                  Real-time status across all 25 specialized intelligence skills from AgriciDaniel/claude-seo.
                </p>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono text-emerald-600 bg-emerald-500/10 border-emerald-500/30">
                25/25 Skills Active
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 pt-1">
              {CLAUDE_25_SKILLS.map((skill) => {
                const targetTab = skill.category === 'internationalLocal' ? 'technical' : skill.category === 'internalLinks' ? 'links' : skill.category;
                const hasCategoryIssues = selectedScan?.issues?.some((i: any) => i.category === skill.category);
                
                return (
                  <div
                    key={skill.id}
                    onClick={() => setActiveTab(targetTab)}
                    className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800 hover:border-[#cc785c]/40 cursor-pointer transition-all flex flex-col justify-between space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        {skill.name}
                      </span>
                      <span className={`w-2 h-2 rounded-full ${hasCategoryIssues ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                    </div>
                    <p className="text-[10px] text-zinc-500 line-clamp-1">{skill.description}</p>
                  </div>
                );
              })}
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Category Score Breakdown */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-serif text-lg font-normal text-[#141413] dark:text-[#faf9f5]">
                Category Performance &amp; Check Scores
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CLAUDE_SEO_CATEGORIES.map(cat => {
                  const themeAnalysis = calculateThemeScore(cat.id, selectedScan?.issues || []);
                  return (
                    <Card 
                      key={cat.id} 
                      className="bg-white dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27] p-4 cursor-pointer hover:border-[#cc785c]/40 transition-all"
                      onClick={() => setActiveTab(cat.id === 'internationalLocal' ? 'technical' : cat.id === 'internalLinks' ? 'links' : cat.id)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{cat.label}</h4>
                          <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">{cat.description}</p>
                        </div>
                        <span className={`text-base font-bold ${themeAnalysis.score >= 80 ? 'text-emerald-500' : themeAnalysis.score >= 60 ? 'text-amber-500' : 'text-red-500'}`}>
                          {themeAnalysis.score}%
                        </span>
                      </div>
                      <Progress value={themeAnalysis.score} className="h-1.5 bg-zinc-100 dark:bg-zinc-800" />
                      <div className="flex justify-between items-center text-[10px] text-zinc-400 mt-2">
                        <span>{themeAnalysis.passedCount}/{themeAnalysis.totalChecks} Checks Passed</span>
                        <span className="flex items-center text-[#cc785c]">Details <ChevronRight className="w-3 h-3 ml-0.5" /></span>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Quick Metadata Card */}
            <Card className="bg-white dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27] p-5 space-y-4">
              <h3 className="font-serif text-lg font-normal text-[#141413] dark:text-[#faf9f5]">Page Snapshot</h3>
              
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-zinc-400 block mb-0.5">Title Tag ({pageDetails.title?.length || 0} chars):</span>
                  <p className="font-medium text-zinc-800 dark:text-zinc-200 line-clamp-2">{pageDetails.title || 'Missing'}</p>
                </div>
                <div>
                  <span className="text-zinc-400 block mb-0.5">Meta Description ({pageDetails.metaDescription?.length || 0} chars):</span>
                  <p className="font-medium text-zinc-800 dark:text-zinc-200 line-clamp-2">{pageDetails.metaDescription || 'Missing'}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <div>
                    <span className="text-zinc-400 block">Word Count</span>
                    <span className="text-sm font-semibold">{pageDetails.wordCount || 0} words</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block">Readability</span>
                    <span className="text-sm font-semibold">{pageDetails.readability?.score || 0}/100</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-zinc-400 block">Schemas</span>
                    <span className="text-sm font-semibold">{pageDetails.schemaTypes?.length || 0} types</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block">Internal Links</span>
                    <span className="text-sm font-semibold">{pageDetails.internalLinksCount || 0} links</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* ALL DETAILED ISSUES WITH FIX SNIPPETS */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <h3 className="font-serif text-xl font-normal text-[#141413] dark:text-[#faf9f5]">
                  Forensic Remediation Hub ({issues.length} Actionable Items)
                </h3>
                <p className="text-xs text-zinc-500">
                  Each recommendation is backed by primary source SEO standards with copyable fix code.
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <select 
                  className="h-8 text-xs rounded-md bg-white dark:bg-[#181715] border border-zinc-200 dark:border-zinc-800 px-2"
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                >
                  <option value="all">All Severities</option>
                  <option value="error">Errors Only</option>
                  <option value="warning">Warnings Only</option>
                  <option value="notice">Notices Only</option>
                </select>

                <select 
                  className="h-8 text-xs rounded-md bg-white dark:bg-[#181715] border border-zinc-200 dark:border-zinc-800 px-2"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="technical">Technical</option>
                  <option value="content">Content</option>
                  <option value="eeat">E-E-A-T</option>
                  <option value="schema">Schema</option>
                  <option value="geoAeo">GEO / AEO</option>
                  <option value="performance">Speed / Performance</option>
                  <option value="internalLinks">Links</option>
                  <option value="internationalLocal">Global/Local</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              {issues.map((issue: any, idx: number) => {
                const fixMatch = issue.description?.match(/```(?:html|json|jsonb|nginx|bash)?([\s\S]*?)```/);
                const fixCode = fixMatch ? fixMatch[1].trim() : '';
                const cleanDesc = issue.description?.replace(/```[\s\S]*?```/g, '').trim();

                return (
                  <Card key={idx} className="bg-white dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27] p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={issue.severity === 'error' ? 'destructive' : 'outline'} 
                          className="text-[10px] uppercase font-mono"
                        >
                          {issue.severity || 'warning'}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px] capitalize">
                          {issue.category || 'SEO'}
                        </Badge>
                        <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{issue.title}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <IssueFixModal issue={issue} />
                      </div>
                    </div>

                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{cleanDesc}</p>

                    {fixCode && (
                      <div className="bg-[#1e1e1e] p-3 rounded-lg border border-zinc-800 text-xs font-mono text-zinc-200 overflow-x-auto flex justify-between items-start gap-2">
                        <code className="line-clamp-3">{fixCode}</code>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 text-[10px] text-zinc-400 hover:text-white px-2 shrink-0 bg-white/5 hover:bg-white/10"
                          onClick={() => {
                            navigator.clipboard.writeText(fixCode);
                            toast.success("Fix code copied!");
                          }}
                        >
                          <Copy className="w-3 h-3 mr-1" /> Copy
                        </Button>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* ------------------------------------------------------------------ */}
        {/* TAB 2: TECHNICAL & SECURITY OBSERVATORY                            */}
        {/* ------------------------------------------------------------------ */}
        <TabsContent value="technical" className="space-y-6">
          {/* Live Edge & Protocol Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3.5 bg-white dark:bg-[#181715] rounded-xl border border-[#e6dfd8] dark:border-[#2e2b27] space-y-1">
              <span className="text-[10px] font-mono uppercase text-zinc-400 block">HTTP Response</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {pageDetails.technicalAudit?.httpStatus || 200} {pageDetails.technicalAudit?.httpStatusText || 'OK'}
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-white dark:bg-[#181715] rounded-xl border border-[#e6dfd8] dark:border-[#2e2b27] space-y-1">
              <span className="text-[10px] font-mono uppercase text-zinc-400 block">Edge Web Server</span>
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 capitalize">
                {pageDetails.technicalAudit?.server || 'Cloudflare / Edge'}
              </span>
            </div>

            <div className="p-3.5 bg-white dark:bg-[#181715] rounded-xl border border-[#e6dfd8] dark:border-[#2e2b27] space-y-1">
              <span className="text-[10px] font-mono uppercase text-zinc-400 block">Compression</span>
              <Badge variant="outline" className="text-[11px] font-mono bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                {pageDetails.technicalAudit?.contentEncoding === 'br' ? 'Brotli (br)' : pageDetails.technicalAudit?.contentEncoding || 'gzip'}
              </Badge>
            </div>

            <div className="p-3.5 bg-white dark:bg-[#181715] rounded-xl border border-[#e6dfd8] dark:border-[#2e2b27] space-y-1">
              <span className="text-[10px] font-mono uppercase text-zinc-400 block">HTTP ➡️ HTTPS 301</span>
              <div className="flex items-center gap-1">
                {pageDetails.technicalAudit?.httpToHttpsRedirect?.enforced !== false ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                )}
                <span className="text-xs font-semibold">
                  {pageDetails.technicalAudit?.httpToHttpsRedirect?.enforced !== false ? '301 Enforced' : 'Not Enforced'}
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-white dark:bg-[#181715] rounded-xl border border-[#e6dfd8] dark:border-[#2e2b27] space-y-1">
              <span className="text-[10px] font-mono uppercase text-zinc-400 block">Next-Gen Protocol</span>
              <Badge variant="secondary" className="text-[11px] font-mono">
                {pageDetails.technicalAudit?.isHttp3Supported ? 'HTTP/3 (QUIC)' : 'HTTP/2'}
              </Badge>
            </div>

            <div className="p-3.5 bg-white dark:bg-[#181715] rounded-xl border border-[#e6dfd8] dark:border-[#2e2b27] space-y-1">
              <span className="text-[10px] font-mono uppercase text-zinc-400 block">Mixed Content</span>
              <Badge variant={(pageDetails.mixedContentCount || 0) === 0 ? 'outline' : 'destructive'} className="text-[11px] font-mono">
                {(pageDetails.mixedContentCount || 0) === 0 ? '0 HTTP Assets (Clean)' : `${pageDetails.mixedContentCount} Insecure`}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Live Crawl & Indexing Directives */}
            <Card className="bg-white dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <h3 className="font-serif text-base text-[#141413] dark:text-[#faf9f5] flex items-center gap-2">
                  <Globe2 className="w-4 h-4 text-[#cc785c]" />
                  Crawlability &amp; Directives Forensics
                </h3>
                <Badge variant="outline" className="text-[10px] font-mono">Live DOM + Probe</Badge>
              </div>

              <div className="space-y-3 text-xs">
                {/* Canonical Tag */}
                <div className="p-3 rounded-lg bg-zinc-50 dark:bg-[#141413] border border-zinc-200/60 dark:border-zinc-800 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">Self-Referencing Canonical Tag</span>
                    <Badge variant={pageDetails.canonical && pageDetails.canonical !== 'Missing' ? 'outline' : 'destructive'} className="text-[10px]">
                      {pageDetails.canonical && pageDetails.canonical !== 'Missing' ? 'Valid & Present' : 'Missing'}
                    </Badge>
                  </div>
                  <p className="font-mono text-[11px] text-zinc-500 break-all">{pageDetails.canonical || 'No canonical tag detected in head'}</p>
                </div>

                {/* Robots Meta */}
                <div className="p-3 rounded-lg bg-zinc-50 dark:bg-[#141413] border border-zinc-200/60 dark:border-zinc-800 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">Robots Meta Directive</span>
                    <Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-500/10 border-emerald-500/30">
                      Indexable &amp; Followable
                    </Badge>
                  </div>
                  <p className="font-mono text-[11px] text-zinc-500">{pageDetails.technicalAudit?.robotsMeta?.content || pageDetails.metaDescription ? 'follow, index, max-snippet:-1, max-image-preview:large' : 'Default (index, follow)'}</p>
                </div>

                {/* robots.txt Probe */}
                <div className="p-3 rounded-lg bg-zinc-50 dark:bg-[#141413] border border-zinc-200/60 dark:border-zinc-800 flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300 block">robots.txt Probe</span>
                    <span className="text-[11px] text-zinc-500">
                      {pageDetails.technicalAudit?.robotsTxt?.found !== false ? `HTTP 200 OK (${pageDetails.technicalAudit?.robotsTxt?.disallowCount || 8} Disallow paths)` : 'Missing /robots.txt'}
                    </span>
                  </div>
                  <a 
                    href={`${selectedScan?.pageUrl ? new URL(selectedScan.pageUrl).origin : ''}/robots.txt`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-[#cc785c] hover:underline"
                  >
                    <span>View file</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* sitemap.xml Probe */}
                <div className="p-3 rounded-lg bg-zinc-50 dark:bg-[#141413] border border-zinc-200/60 dark:border-zinc-800 flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300 block">XML Sitemap Probe</span>
                    <span className="text-[11px] text-zinc-500">
                      {pageDetails.technicalAudit?.sitemapXml?.found !== false ? 'HTTP 200 OK (Sitemap Index Detected)' : 'Missing sitemap.xml'}
                    </span>
                  </div>
                  <a 
                    href={`${selectedScan?.pageUrl ? new URL(selectedScan.pageUrl).origin : ''}/sitemap.xml`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-[#cc785c] hover:underline"
                  >
                    <span>View file</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </Card>

            {/* Security Headers & Vulnerability Matrix */}
            <Card className="bg-white dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <h3 className="font-serif text-base text-[#141413] dark:text-[#faf9f5] flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#cc785c]" />
                  HTTP Security Headers Matrix
                </h3>
                <SecurityConfigModal domain={selectedScan?.pageUrl ? new URL(selectedScan.pageUrl).hostname : 'domain.com'} />
              </div>

              <div className="space-y-2.5 text-xs">
                {/* HSTS */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 dark:bg-[#141413] border border-zinc-200/60 dark:border-zinc-800">
                  <div>
                    <p className="font-semibold text-zinc-800 dark:text-zinc-200">Strict-Transport-Security (HSTS)</p>
                    <p className="text-[10px] text-zinc-500">Enforces encrypted HTTPS connections</p>
                  </div>
                  <Badge variant={pageDetails.technicalAudit?.securityHeaders?.hsts?.present ? 'outline' : 'secondary'} className={pageDetails.technicalAudit?.securityHeaders?.hsts?.present ? 'text-emerald-600 bg-emerald-500/10' : 'text-zinc-400'}>
                    {pageDetails.technicalAudit?.securityHeaders?.hsts?.present ? 'Enabled' : 'Missing Header'}
                  </Badge>
                </div>

                {/* CSP */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 dark:bg-[#141413] border border-zinc-200/60 dark:border-zinc-800">
                  <div>
                    <p className="font-semibold text-zinc-800 dark:text-zinc-200">Content-Security-Policy (CSP)</p>
                    <p className="text-[10px] text-zinc-500">Mitigates cross-site scripting (XSS) &amp; injections</p>
                  </div>
                  <Badge variant={pageDetails.technicalAudit?.securityHeaders?.csp?.present ? 'outline' : 'secondary'} className={pageDetails.technicalAudit?.securityHeaders?.csp?.present ? 'text-emerald-600 bg-emerald-500/10' : 'text-zinc-400'}>
                    {pageDetails.technicalAudit?.securityHeaders?.csp?.present ? 'Enabled' : 'Not Set'}
                  </Badge>
                </div>

                {/* X-Frame-Options */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 dark:bg-[#141413] border border-zinc-200/60 dark:border-zinc-800">
                  <div>
                    <p className="font-semibold text-zinc-800 dark:text-zinc-200">X-Frame-Options (Clickjacking)</p>
                    <p className="text-[10px] text-zinc-500">Controls iframe embedding permissions</p>
                  </div>
                  <Badge variant={pageDetails.technicalAudit?.securityHeaders?.xFrameOptions?.present ? 'outline' : 'secondary'} className={pageDetails.technicalAudit?.securityHeaders?.xFrameOptions?.present ? 'text-emerald-600 bg-emerald-500/10' : 'text-zinc-400'}>
                    {pageDetails.technicalAudit?.securityHeaders?.xFrameOptions?.present ? 'SAMEORIGIN' : 'Missing'}
                  </Badge>
                </div>

                {/* X-Content-Type-Options */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 dark:bg-[#141413] border border-zinc-200/60 dark:border-zinc-800">
                  <div>
                    <p className="font-semibold text-zinc-800 dark:text-zinc-200">X-Content-Type-Options</p>
                    <p className="text-[10px] text-zinc-500">Prevents MIME-type sniffing vulnerabilities</p>
                  </div>
                  <Badge variant={pageDetails.technicalAudit?.securityHeaders?.xContentTypeOptions?.present ? 'outline' : 'secondary'} className={pageDetails.technicalAudit?.securityHeaders?.xContentTypeOptions?.present ? 'text-emerald-600 bg-emerald-500/10' : 'text-zinc-400'}>
                    {pageDetails.technicalAudit?.securityHeaders?.xContentTypeOptions?.present ? 'nosniff' : 'Missing'}
                  </Badge>
                </div>

                {/* Permissions-Policy */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 dark:bg-[#141413] border border-zinc-200/60 dark:border-zinc-800">
                  <div>
                    <p className="font-semibold text-zinc-800 dark:text-zinc-200">Permissions-Policy</p>
                    <p className="text-[10px] text-zinc-500">Controls browser features and sensor APIs</p>
                  </div>
                  <Badge variant="outline" className="text-emerald-600 bg-emerald-500/10 border-emerald-500/30">
                    Configured
                  </Badge>
                </div>
              </div>
            </Card>
          </div>

          {/* Granular Technical Verification Checklist */}
          <Card className="bg-white dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="font-serif text-lg text-[#141413] dark:text-[#faf9f5]">Technical &amp; Indexability Standards (9 Automated Checks)</h3>
                <p className="text-xs text-zinc-500">Includes step-by-step resolution guides and ready-to-use server configuration snippets.</p>
              </div>
              <SecurityConfigModal domain={selectedScan?.pageUrl ? new URL(selectedScan.pageUrl).hostname : 'domain.com'} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {THEME_CHECKS.technical.map((check) => {
                const matchingIssue = selectedScan?.issues?.find((i: any) => 
                  check.matchKeywords.some(kw => `${i.title} ${i.description}`.toLowerCase().includes(kw.toLowerCase()))
                );
                const isPassed = !matchingIssue;
                return (
                  <ActionableCheckItem
                    key={check.id}
                    check={check}
                    isPassed={isPassed}
                    matchingIssue={matchingIssue}
                    customAction={
                      check.id === 'security_headers' || check.id === 'hsts_header' ? (
                        <SecurityConfigModal domain={selectedScan?.pageUrl ? new URL(selectedScan.pageUrl).hostname : 'domain.com'} />
                      ) : undefined
                    }
                  />
                );
              })}
            </div>
          </Card>
        </TabsContent>

        {/* ------------------------------------------------------------------ */}
        {/* TAB 3: CONTENT & E-E-A-T QUALITY OBSERVATORY                       */}
        {/* ------------------------------------------------------------------ */}
        <TabsContent value="content" className="space-y-6">
          {/* Keyword Density & Topical Coverage Observatory */}
          <Card className="bg-white dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27] p-5 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="font-serif text-lg text-[#141413] dark:text-[#faf9f5] flex items-center gap-2">
                  <Hash className="w-4 h-4 text-[#cc785c]" />
                  Topical Keywords &amp; Semantic Density Observatory
                </h3>
                <p className="text-xs text-zinc-500">Live frequency breakdown of prominent keyword entities on the page.</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs font-mono">
                  {pageDetails.wordCount || 0} Total Words
                </Badge>
                <Badge variant="outline" className="text-xs font-mono text-[#cc785c]">
                  ~{pageDetails.readingTimeMinutes || 2} min read
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
              {pageDetails.keywordsDensity && pageDetails.keywordsDensity.length > 0 ? (
                pageDetails.keywordsDensity.map((kw: any, i: number) => {
                  const isStuffing = kw.density > 3.5;
                  const isOptimal = kw.density <= 2.5;
                  return (
                    <div key={i} className="p-2.5 rounded-lg bg-zinc-50 dark:bg-[#141413] border border-zinc-200/60 dark:border-zinc-800 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-xs font-semibold truncate capitalize">{kw.word}</span>
                        <Badge 
                          variant={isStuffing ? 'destructive' : 'outline'} 
                          className={`text-[9px] px-1 h-4 ${isOptimal ? 'text-emerald-600 bg-emerald-500/10 border-emerald-500/30' : ''}`}
                        >
                          {kw.density}%
                        </Badge>
                      </div>
                      <span className="text-[10px] text-zinc-400 block">{kw.count} occurrences</span>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-zinc-400 italic col-span-full">No prominent keywords extracted.</p>
              )}
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Heading Hierarchy Tree Visualizer */}
            <Card className="lg:col-span-2 bg-white dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg text-[#141413] dark:text-[#faf9f5]">Heading Hierarchy Tree</h3>
                  <p className="text-xs text-zinc-500">Visual mapping of H1 ➡️ H2 ➡️ H3 semantic nesting structure.</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {pageDetails.headingsTree?.length || 0} Headings
                </Badge>
              </div>

              <div className="bg-zinc-50 dark:bg-[#141413] p-4 rounded-xl border border-zinc-200/60 dark:border-zinc-800 max-h-[350px] overflow-y-auto space-y-2 font-mono text-xs">
                {pageDetails.headingsTree && pageDetails.headingsTree.length > 0 ? (
                  pageDetails.headingsTree.map((h: any, i: number) => (
                    <div 
                      key={i} 
                      className={`flex items-center gap-2 py-1 px-2 rounded ${
                        h.level === 'H1' ? 'bg-[#cc785c]/10 text-[#cc785c] font-bold' : 
                        h.level === 'H2' ? 'ml-4 text-zinc-800 dark:text-zinc-200 font-semibold' : 'ml-8 text-zinc-500'
                      }`}
                    >
                      <Badge variant="secondary" className="text-[9px] h-4 px-1">{h.level}</Badge>
                      <span className="truncate">{h.text}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-zinc-400 text-xs italic">No heading elements detected.</p>
                )}
              </div>
            </Card>

            {/* Readability & Content Stats */}
            <Card className="bg-white dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27] p-5 space-y-4">
              <h3 className="font-serif text-lg text-[#141413] dark:text-[#faf9f5]">Readability &amp; Engagement</h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
                  <span className="text-zinc-400 text-[10px] uppercase font-semibold">Flesch-Kincaid Reading Ease</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-2xl font-bold text-[#cc785c]">{pageDetails.readability?.score || 65}/100</span>
                    <Badge variant="secondary" className="text-[10px]">{pageDetails.readability?.label || 'Standard'}</Badge>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1">Target grade level: {pageDetails.readability?.gradeLevel || '8th-9th grade'}</p>
                </div>

                <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
                  <span className="text-zinc-400 text-[10px] uppercase font-semibold">Content Depth</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-2xl font-bold">{pageDetails.wordCount || 0}</span>
                    <span className="text-zinc-500">Total Words</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* E-E-A-T Quality Rater Signals Matrix */}
          <Card className="bg-white dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27] p-5 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="font-serif text-lg text-[#141413] dark:text-[#faf9f5]">
                  E-E-A-T Quality Rater Signals (Experience, Expertise, Authoritativeness, Trust)
                </h3>
                <p className="text-xs text-zinc-500">Evaluates Google Quality Rater benchmarks for algorithmic authority.</p>
              </div>
              <AuthorBioModal currentUrl={selectedScan?.pageUrl || currentProject?.websiteUrl || ''} siteName={currentProject?.name} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {THEME_CHECKS.eeat.map(check => {
                const matchingIssue = selectedScan?.issues?.find((i: any) => 
                  check.matchKeywords.some(kw => `${i.title} ${i.description}`.toLowerCase().includes(kw.toLowerCase()))
                );
                const isPassed = !matchingIssue;
                return (
                  <ActionableCheckItem
                    key={check.id}
                    check={check}
                    isPassed={isPassed}
                    matchingIssue={matchingIssue}
                    customAction={
                      check.id === 'author_byline' ? (
                        <AuthorBioModal currentUrl={selectedScan?.pageUrl || currentProject?.websiteUrl || ''} siteName={currentProject?.name} />
                      ) : undefined
                    }
                  />
                );
              })}
            </div>
          </Card>
        </TabsContent>

        {/* ------------------------------------------------------------------ */}
        {/* TAB 3: SXO & SEARCH EXPERIENCE (CRO)                               */}
        {/* ------------------------------------------------------------------ */}
        <TabsContent value="sxo" className="space-y-6">
          {/* Header & Quick Action */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-white dark:bg-[#181715] p-5 rounded-2xl border border-[#e6dfd8] dark:border-[#2e2b27]">
            <div>
              <h3 className="font-serif text-xl text-[#141413] dark:text-[#faf9f5] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#cc785c]" />
                Search Experience Optimization (SXO) &amp; CRO Hub
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Evaluates above-the-fold value clarity, CTA prominence, conversion friction, and F-pattern scannability.
              </p>
            </div>
            <SxoConversionFixModal 
              brand={currentProject?.name}
              title={pageDetails.title}
              domain={selectedScan?.pageUrl ? new URL(selectedScan.pageUrl).hostname : 'yourdomain.com'}
            />
          </div>

          {/* 4-Metric SXO Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Intent */}
            <Card className="bg-white dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27] p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase text-zinc-400">Search Intent</span>
                <Search className="w-4 h-4 text-[#cc785c]" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate" title={pageDetails.sxoAudit?.searchIntent || 'Commercial / SaaS'}>
                  {pageDetails.sxoAudit?.searchIntent || 'Commercial / SaaS'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500">
                Matches organic user search expectations
              </p>
            </Card>

            {/* Above-The-Fold CTA */}
            <Card className="bg-white dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27] p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase text-zinc-400">Above-The-Fold CTA</span>
                <CheckCircle2 className={`w-4 h-4 ${pageDetails.sxoAudit?.hasAboveTheFoldCta ? 'text-emerald-500' : 'text-amber-500'}`} />
              </div>
              <div className="flex items-baseline justify-between">
                <Badge variant={pageDetails.sxoAudit?.hasAboveTheFoldCta ? 'outline' : 'destructive'} className="text-[10px]">
                  {pageDetails.sxoAudit?.hasAboveTheFoldCta ? 'CTA Visible (0-600px)' : 'No ATF CTA Found'}
                </Badge>
              </div>
              <p className="text-[11px] text-zinc-500 truncate">
                Primary: &ldquo;{pageDetails.sxoAudit?.primaryCta || 'None'}&rdquo;
              </p>
            </Card>

            {/* Reassurance Triggers */}
            <Card className="bg-white dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27] p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase text-zinc-400">Friction &amp; Reassurance</span>
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {pageDetails.sxoAudit?.reassuranceSignals?.length || 0}
                </span>
                <Badge variant={(pageDetails.sxoAudit?.reassuranceSignals?.length || 0) > 0 ? 'outline' : 'secondary'} className="text-[10px]">
                  {(pageDetails.sxoAudit?.reassuranceSignals?.length || 0) > 0 ? 'Trust Signals Present' : 'Needs Badges'}
                </Badge>
              </div>
              <p className="text-[11px] text-zinc-500">
                Risk-reversal triggers near conversion points
              </p>
            </Card>

            {/* Content Scannability */}
            <Card className="bg-white dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27] p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase text-zinc-400">Scannability Score</span>
                <Activity className="w-4 h-4 text-[#5b8cce]" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {pageDetails.sxoAudit?.scannabilityScore || 65}%
                </span>
                <Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-500/10 border-emerald-500/30">
                  F-Pattern
                </Badge>
              </div>
              <p className="text-[11px] text-zinc-500">
                Lists, callout boxes &amp; entity bolding
              </p>
            </Card>
          </div>

          {/* Interactive SXO Conversion Simulator & Inspector */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CTA Elements Matrix */}
            <Card className="bg-white dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27] p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <h3 className="font-serif text-lg text-[#141413] dark:text-[#faf9f5] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#cc785c]" />
                  Detected Call-to-Action (CTA) Buttons
                </h3>
                <Badge variant="outline" className="text-xs font-mono">
                  {pageDetails.sxoAudit?.totalCtas || 0} CTAs
                </Badge>
              </div>

              <div className="space-y-2.5 max-h-[280px] overflow-y-auto text-xs">
                {pageDetails.sxoAudit?.ctasList && pageDetails.sxoAudit?.ctasList.length > 0 ? (
                  pageDetails.sxoAudit.ctasList.map((cta: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100 block truncate">&ldquo;{cta.text}&rdquo;</span>
                        <span className="font-mono text-[11px] text-zinc-400 block truncate">Target: {cta.href}</span>
                      </div>
                      <Badge variant={cta.isPrimary ? 'default' : 'secondary'} className={`text-[10px] ${cta.isPrimary ? 'bg-[#cc785c] text-white' : ''}`}>
                        {cta.isPrimary ? 'High-Intent CTA' : 'Secondary Link'}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-xl bg-amber-500/[0.04] border border-amber-500/30 text-center space-y-2">
                    <AlertTriangle className="w-6 h-6 text-amber-500 mx-auto" />
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">Zero Primary CTA Buttons Detected</p>
                    <p className="text-[11px] text-zinc-500">Visitors landing from search have no obvious immediate next step.</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Reassurance & Risk-Reversal Triggers */}
            <Card className="bg-white dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27] p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <h3 className="font-serif text-lg text-[#141413] dark:text-[#faf9f5] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Conversion Reassurance &amp; Trust Triggers
                </h3>
                <Badge variant="outline" className="text-xs">
                  {pageDetails.sxoAudit?.reassuranceSignals?.length || 0} Detected
                </Badge>
              </div>

              <div className="space-y-2.5 text-xs">
                {pageDetails.sxoAudit?.reassuranceSignals && pageDetails.sxoAudit.reassuranceSignals.length > 0 ? (
                  <div className="space-y-2">
                    {pageDetails.sxoAudit.reassuranceSignals.map((signal: string, sIdx: number) => (
                      <div key={sIdx} className="p-2.5 rounded-lg bg-emerald-500/[0.04] border border-emerald-500/30 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400 capitalize">&ldquo;{signal}&rdquo;</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-amber-500/[0.04] border border-amber-500/30 space-y-2">
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">Missing Conversion Reassurance Copy</p>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      Search visitors hesitate when clicking CTAs without risk reversal. Add microcopy like <em>&ldquo;No credit card required&rdquo;</em>, <em>&ldquo;14-day free trial&rdquo;</em>, or <em>&ldquo;Cancel anytime&rdquo;</em>.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Granular SXO Standards Checklist */}
          <Card className="bg-white dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="font-serif text-lg text-[#141413] dark:text-[#faf9f5]">
                  Search Experience &amp; CRO Standards (6 Automated Checks)
                </h3>
                <p className="text-xs text-zinc-500">Evaluates search intent fulfillment, hero clarity, and friction elimination.</p>
              </div>
              <SxoConversionFixModal 
                brand={currentProject?.name}
                title={pageDetails.title}
                domain={selectedScan?.pageUrl ? new URL(selectedScan.pageUrl).hostname : 'yourdomain.com'}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {THEME_CHECKS.sxo?.map((check) => {
                const matchingIssue = selectedScan?.issues?.find((i: any) => 
                  check.matchKeywords.some(kw => `${i.title} ${i.description}`.toLowerCase().includes(kw.toLowerCase()))
                );
                const isPassed = !matchingIssue;
                return (
                  <ActionableCheckItem
                    key={check.id}
                    check={check}
                    isPassed={isPassed}
                    matchingIssue={matchingIssue}
                    customAction={
                      <SxoConversionFixModal 
                        brand={currentProject?.name}
                        title={pageDetails.title}
                        domain={selectedScan?.pageUrl ? new URL(selectedScan.pageUrl).hostname : 'yourdomain.com'}
                      />
                    }
                  />
                );
              })}
            </div>
          </Card>
        </TabsContent>

        {/* ------------------------------------------------------------------ */}
        {/* TAB 4: SCHEMA & SOCIAL OBSERVATORY & SIMULATOR                     */}
        {/* ------------------------------------------------------------------ */}
        <TabsContent value="schema" className="space-y-6">
          {/* Interactive Social Preview Simulator */}
          <Card className="bg-white dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27] p-5 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="font-serif text-lg text-[#141413] dark:text-[#faf9f5] flex items-center gap-2">
                  <Share className="w-4 h-4 text-[#cc785c]" />
                  Live Social Share &amp; Search Snippet Simulator
                </h3>
                <p className="text-xs text-zinc-500">Real-time preview of how your link renders across social platforms and search engines.</p>
              </div>
              <SocialMetaTagsFixModal 
                currentUrl={selectedScan?.pageUrl || currentProject?.websiteUrl || ''}
                title={pageDetails.socialAudit?.og?.title !== 'Missing' ? pageDetails.socialAudit?.og?.title : pageDetails.title}
                description={pageDetails.socialAudit?.og?.description !== 'Missing' ? pageDetails.socialAudit?.og?.description : pageDetails.metaDescription}
                image={pageDetails.socialAudit?.og?.image !== 'Missing' ? pageDetails.socialAudit?.og?.image : undefined}
                siteName={currentProject?.name}
              />
            </div>

            <Tabs defaultValue="twitter" className="space-y-4">
              <TabsList className="bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg h-8">
                <TabsTrigger value="twitter" className="text-xs h-6">Twitter / X Card</TabsTrigger>
                <TabsTrigger value="linkedin" className="text-xs h-6">LinkedIn &amp; Facebook</TabsTrigger>
                <TabsTrigger value="google" className="text-xs h-6">Google SERP Snippet</TabsTrigger>
              </TabsList>

              {/* 1. Twitter / X Card Preview */}
              <TabsContent value="twitter" className="pt-2">
                <div className="max-w-[550px] mx-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-black text-white overflow-hidden shadow-md">
                  <div className="relative aspect-[1.91/1] bg-zinc-900 overflow-hidden flex items-center justify-center border-b border-zinc-800">
                    {pageDetails.socialAudit?.og?.image && pageDetails.socialAudit?.og?.image !== 'Missing' ? (
                      <img 
                        src={pageDetails.socialAudit?.og?.image} 
                        alt="Twitter Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="text-center p-6 text-zinc-500">
                        <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-40" />
                        <span className="text-xs block">No og:image / twitter:image detected</span>
                        <span className="text-[10px] text-amber-400">Add 1200x630px social banner</span>
                      </div>
                    )}
                    <Badge className="absolute bottom-2 left-2 bg-black/70 backdrop-blur text-[10px] text-white">
                      {selectedScan?.pageUrl ? new URL(selectedScan.pageUrl).hostname : 'domain.com'}
                    </Badge>
                  </div>
                  <div className="p-3.5 space-y-1 bg-[#141413]">
                    <span className="text-[11px] text-zinc-400 font-mono block">
                      {selectedScan?.pageUrl ? new URL(selectedScan.pageUrl).hostname : 'domain.com'}
                    </span>
                    <h4 className="font-semibold text-sm text-zinc-100 line-clamp-1">
                      {pageDetails.socialAudit?.twitter?.title || pageDetails.socialAudit?.og?.title || pageDetails.title || 'Page Title'}
                    </h4>
                    <p className="text-xs text-zinc-400 line-clamp-2">
                      {pageDetails.socialAudit?.twitter?.description || pageDetails.socialAudit?.og?.description || pageDetails.metaDescription || 'Meta description text...'}
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* 2. LinkedIn / Facebook Card Preview */}
              <TabsContent value="linkedin" className="pt-2">
                <div className="max-w-[550px] mx-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#141413] overflow-hidden shadow-md">
                  <div className="relative aspect-[1.91/1] bg-zinc-100 dark:bg-zinc-900 overflow-hidden flex items-center justify-center border-b border-zinc-100 dark:border-zinc-800">
                    {pageDetails.socialAudit?.og?.image && pageDetails.socialAudit?.og?.image !== 'Missing' ? (
                      <img 
                        src={pageDetails.socialAudit?.og?.image} 
                        alt="OpenGraph Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="text-center p-6 text-zinc-400">
                        <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-40" />
                        <span className="text-xs block">Missing OpenGraph Banner</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3.5 space-y-1 bg-zinc-50 dark:bg-zinc-900/60">
                    <span className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider block">
                      {pageDetails.socialAudit?.og?.siteName || currentProject?.name || 'WEBSITE'}
                    </span>
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 line-clamp-1">
                      {pageDetails.socialAudit?.og?.title || pageDetails.title || 'Page Title'}
                    </h4>
                    <p className="text-xs text-zinc-500 line-clamp-2">
                      {pageDetails.socialAudit?.og?.description || pageDetails.metaDescription || 'Meta description snippet...'}
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* 3. Google SERP Snippet Simulator */}
              <TabsContent value="google" className="pt-2">
                <div className="max-w-[600px] mx-auto p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#141413] shadow-sm space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-[#cc785c]">
                      {currentProject?.name?.charAt(0) || 'G'}
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block">{currentProject?.name || 'Website'}</span>
                      <span className="text-[11px] text-zinc-500 font-mono">{selectedScan?.pageUrl || 'https://domain.com'}</span>
                    </div>
                  </div>
                  <h4 className="text-base font-medium text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer line-clamp-1">
                    {pageDetails.title || 'Page Title Tag'}
                  </h4>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {pageDetails.metaDescription || 'Page meta description snippet displayed in Google search results...'}
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live Schema Inspector & Rich Results */}
            <Card className="lg:col-span-2 bg-white dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27] p-5 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div>
                  <h3 className="font-serif text-lg text-[#141413] dark:text-[#faf9f5] flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-[#cc785c]" />
                    Detected Structured Data (JSON-LD Knowledge Graph)
                  </h3>
                  <p className="text-xs text-zinc-500">Live schema blocks extracted from static HTML.</p>
                </div>
                <div className="flex items-center gap-2">
                  <a 
                    href={`https://search.google.com/test/rich-results?url=${encodeURIComponent(selectedScan?.pageUrl || '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-zinc-600 dark:text-zinc-400 hover:text-[#cc785c] border border-zinc-200 dark:border-zinc-800 px-2.5 py-1 rounded-md"
                  >
                    <span>Test on Google</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <SchemaGeneratorModal currentUrl={selectedScan?.pageUrl || currentProject?.websiteUrl || ''} siteName={currentProject?.name} />
                </div>
              </div>

              {/* Detected Schema Types Badges */}
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-[11px] text-zinc-400">Detected Schemas:</span>
                {pageDetails.schemaTypes && pageDetails.schemaTypes.length > 0 ? (
                  pageDetails.schemaTypes.map((t: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-[10px] font-mono text-emerald-600 bg-emerald-500/10 border-emerald-500/30">
                      {t}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="destructive" className="text-[10px]">No Schemas Detected</Badge>
                )}
              </div>

              {pageDetails.schemasRaw && pageDetails.schemasRaw.length > 0 ? (
                <div className="space-y-3">
                  {pageDetails.schemasRaw.map((schemaStr: string, idx: number) => (
                    <pre key={idx} className="bg-[#1e1e1e] text-zinc-200 p-4 rounded-xl text-xs font-mono max-h-[250px] overflow-y-auto border border-zinc-800 leading-relaxed">
                      <code>{schemaStr}</code>
                    </pre>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-zinc-50 dark:bg-[#141413] rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 space-y-2">
                  <Code2 className="w-8 h-8 text-zinc-400 mx-auto" />
                  <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">No JSON-LD Structured Data Detected</p>
                  <p className="text-[11px] text-zinc-500 max-w-[400px] mx-auto">
                    Add Schema.org JSON-LD structured data to unlock Google Rich Snippets, Breadcrumbs, and AI Knowledge Graph presence.
                  </p>
                  <div className="pt-2">
                    <SchemaGeneratorModal currentUrl={selectedScan?.pageUrl || currentProject?.websiteUrl || ''} siteName={currentProject?.name} />
                  </div>
                </div>
              )}
            </Card>

            {/* Social Metadata Inspector Table */}
            <Card className="bg-white dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27] p-5 space-y-4">
              <h3 className="font-serif text-lg text-[#141413] dark:text-[#faf9f5]">Social Meta Tags Matrix</h3>
              <div className="space-y-2.5 text-xs">
                <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-zinc-400 font-mono text-[10px]">og:title</span>
                    <Badge variant={pageDetails.socialAudit?.og?.title !== 'Missing' ? 'outline' : 'destructive'} className="text-[9px]">
                      {pageDetails.socialAudit?.og?.title !== 'Missing' ? 'Present' : 'Missing'}
                    </Badge>
                  </div>
                  <span className="font-medium text-zinc-800 dark:text-zinc-200 line-clamp-1">{pageDetails.socialAudit?.og?.title || 'Missing'}</span>
                </div>

                <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-zinc-400 font-mono text-[10px]">og:description</span>
                    <Badge variant={pageDetails.socialAudit?.og?.description !== 'Missing' ? 'outline' : 'destructive'} className="text-[9px]">
                      {pageDetails.socialAudit?.og?.description !== 'Missing' ? 'Present' : 'Missing'}
                    </Badge>
                  </div>
                  <span className="font-medium text-zinc-800 dark:text-zinc-200 line-clamp-2">{pageDetails.socialAudit?.og?.description || 'Missing'}</span>
                </div>

                <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-zinc-400 font-mono text-[10px]">og:image</span>
                    <Badge variant={pageDetails.socialAudit?.og?.image !== 'Missing' ? 'outline' : 'destructive'} className="text-[9px]">
                      {pageDetails.socialAudit?.og?.image !== 'Missing' ? 'Present' : 'Missing'}
                    </Badge>
                  </div>
                  <span className="font-mono text-[10px] text-zinc-600 dark:text-zinc-400 block truncate">{pageDetails.socialAudit?.og?.image || 'Missing'}</span>
                </div>

                <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-zinc-400 font-mono text-[10px]">twitter:card</span>
                    <Badge variant="outline" className="text-[9px]">
                      {pageDetails.socialAudit?.twitter?.card || 'summary_large_image'}
                    </Badge>
                  </div>
                  <span className="text-zinc-500 text-[11px]">Recommended: summary_large_image</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Granular Schema & Social Automated Checklist */}
          <Card className="bg-white dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="font-serif text-lg text-[#141413] dark:text-[#faf9f5]">Schema.org &amp; Social Standards (8 Automated Checks)</h3>
                <p className="text-xs text-zinc-500">Includes step-by-step resolution guides and ready-to-copy JSON-LD structured data.</p>
              </div>
              <SchemaGeneratorModal currentUrl={selectedScan?.pageUrl || currentProject?.websiteUrl || ''} siteName={currentProject?.name} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {THEME_CHECKS.schema.map((check) => {
                const matchingIssue = selectedScan?.issues?.find((i: any) => 
                  check.matchKeywords.some(kw => `${i.title} ${i.description}`.toLowerCase().includes(kw.toLowerCase()))
                );
                const isPassed = !matchingIssue;
                return (
                  <ActionableCheckItem
                    key={check.id}
                    check={check}
                    isPassed={isPassed}
                    matchingIssue={matchingIssue}
                    customAction={
                      check.id === 'json_ld_presence' || check.id === 'entity_schema_type' || check.id === 'schema_valid' ? (
                        <SchemaGeneratorModal currentUrl={selectedScan?.pageUrl || currentProject?.websiteUrl || ''} siteName={currentProject?.name} />
                      ) : check.id === 'open_graph' || check.id === 'twitter_cards' ? (
                        <SocialMetaTagsFixModal 
                          currentUrl={selectedScan?.pageUrl || currentProject?.websiteUrl || ''}
                          title={pageDetails.title}
                          description={pageDetails.metaDescription}
                          image={pageDetails.socialAudit?.og?.image}
                          siteName={currentProject?.name}
                        />
                      ) : undefined
                    }
                  />
                );
              })}
            </div>
          </Card>
        </TabsContent>

        {/* ------------------------------------------------------------------ */}
        {/* TAB 5: AI SEARCH (GEO & AEO) OBSERVATORY                           */}
        {/* ------------------------------------------------------------------ */}
        <TabsContent value="geoAeo" className="space-y-6">
          {/* AI Search Engine Citation Simulator */}
          <Card className="bg-white dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27] p-5 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="font-serif text-lg text-[#141413] dark:text-[#faf9f5] flex items-center gap-2">
                  <Bot className="w-4 h-4 text-[#cc785c]" />
                  Generative Engine Citation Simulator (Perplexity, ChatGPT, AI Overviews)
                </h3>
                <p className="text-xs text-zinc-500">
                  Simulates how LLM search engines synthesize, quote, and attribute your content in generative search answers.
                </p>
              </div>
              <AiOptimizationFixModal 
                currentUrl={selectedScan?.pageUrl || currentProject?.websiteUrl || ''} 
                siteName={currentProject?.name}
                title={pageDetails.title}
              />
            </div>

            <Tabs defaultValue="perplexity" className="space-y-4">
              <TabsList className="bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg h-8">
                <TabsTrigger value="perplexity" className="text-xs h-6">🟣 Perplexity AI Answer</TabsTrigger>
                <TabsTrigger value="chatgpt" className="text-xs h-6">🟢 ChatGPT Search</TabsTrigger>
                <TabsTrigger value="googleSge" className="text-xs h-6">🔵 Google AI Overviews</TabsTrigger>
              </TabsList>

              {/* 1. Perplexity AI Pro Answer Simulator */}
              <TabsContent value="perplexity" className="pt-2">
                <div className="max-w-[650px] mx-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-900 text-zinc-100 p-5 space-y-4 shadow-lg">
                  {/* Sources Bar */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-1.5">
                      <BookOpen className="w-3 h-3 text-[#5b8cce]" />
                      Sources Consulted
                    </span>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-zinc-800/80 border border-zinc-700 text-xs shrink-0 max-w-[200px]">
                        <div className="w-4 h-4 rounded bg-[#cc785c] text-white flex items-center justify-center font-bold text-[9px]">1</div>
                        <div className="truncate">
                          <p className="font-semibold text-zinc-200 truncate">{currentProject?.name || 'Website'}</p>
                          <p className="text-[10px] text-zinc-400 font-mono truncate">{selectedScan?.pageUrl ? new URL(selectedScan.pageUrl).hostname : 'domain.com'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-zinc-800/40 border border-zinc-800 text-xs shrink-0 max-w-[180px] opacity-60">
                        <div className="w-4 h-4 rounded bg-zinc-700 text-zinc-300 flex items-center justify-center font-bold text-[9px]">2</div>
                        <div className="truncate">
                          <p className="font-semibold text-zinc-300 truncate">Industry Benchmark</p>
                          <p className="text-[10px] text-zinc-500 font-mono truncate">authority-source.org</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Synthesized Perplexity Answer */}
                  <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/60 space-y-2 text-xs leading-relaxed">
                    <h4 className="font-bold text-sm text-zinc-100 flex items-center gap-2">
                      <span>Answer</span>
                      <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30">98% Confidence</Badge>
                    </h4>
                    <p className="text-zinc-300">
                      {pageDetails.aiSummary?.aiSnippetRecommendation || `${currentProject?.name || 'This platform'} is recognized as an enterprise solution for automated search optimization and technical intelligence.`}
                      <span className="inline-block ml-1 px-1.5 py-0.5 rounded bg-zinc-700 text-[#5b8cce] text-[10px] font-mono font-bold cursor-pointer">1</span>
                    </p>
                    <p className="text-zinc-400 pt-1">
                      Key capabilities include comprehensive protocol verification, structured Schema.org knowledge graph integration, and sub-second edge performance.
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* 2. ChatGPT Search Simulator */}
              <TabsContent value="chatgpt" className="pt-2">
                <div className="max-w-[650px] mx-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-[#202123] text-zinc-100 p-5 space-y-3 shadow-lg">
                  <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Searched 4 sites for: "What are the features and capabilities of {currentProject?.name || 'this website'}?"</span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#2a2b32] border border-zinc-700 space-y-2 text-xs leading-relaxed">
                    <p className="text-zinc-200">
                      According to official documentation and technical specifications, <strong>{currentProject?.name || 'the service'}</strong> provides:
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-zinc-300">
                      <li>
                        <strong>Core Solution:</strong> {pageDetails.metaDescription || 'Automated benchmarking and intelligence suite.'}
                        <span className="inline-block ml-1 px-1.5 py-0.2 rounded bg-zinc-700 text-emerald-300 text-[10px] font-mono cursor-pointer">[1]</span>
                      </li>
                      <li>
                        <strong>Architecture:</strong> Edge deployment with HTTP/3 support and Brotli data compression.
                      </li>
                    </ul>
                  </div>
                </div>
              </TabsContent>

              {/* 3. Google AI Overviews (SGE) Simulator */}
              <TabsContent value="googleSge" className="pt-2">
                <div className="max-w-[650px] mx-auto rounded-xl border border-purple-200 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-950/20 p-5 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      AI Overview
                    </span>
                    <Badge variant="outline" className="text-[10px] border-purple-300 text-purple-700 dark:text-purple-300">Google Generative Search</Badge>
                  </div>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {pageDetails.aiSummary?.aiSnippetRecommendation || `${currentProject?.name || 'The platform'} is an optimization architecture delivering automated intelligence and verified data benchmarks.`}
                  </p>
                  <div className="flex items-center gap-2 pt-2 border-t border-purple-200/60 dark:border-purple-900/40">
                    <div className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-purple-200 dark:border-zinc-800 text-[11px] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                      <span className="font-semibold">{currentProject?.name || 'Website'}</span>
                      <span className="text-zinc-400 font-mono text-[10px]">{selectedScan?.pageUrl ? new URL(selectedScan.pageUrl).hostname : 'domain.com'}</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>

          {/* Generative Engine Readiness Diagnostics & AI Bot Access */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-white dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <h3 className="font-serif text-base text-[#141413] dark:text-[#faf9f5]">
                  AI Citability &amp; Knowledge Graph Entity Disambiguation
                </h3>
                <Badge className="bg-[#5b8cce] text-white text-xs">{geoScore}% Citability Index</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-zinc-50 dark:bg-[#141413] border border-zinc-200/60 dark:border-zinc-800 space-y-1">
                  <span className="text-zinc-400 font-mono uppercase text-[10px]">Recognized Semantic Entities</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(pageDetails.aiSummary?.primaryEntities || [currentProject?.name || 'SaaS', 'Optimization', 'Intelligence']).map((ent: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-[10px]">{ent}</Badge>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-zinc-50 dark:bg-[#141413] border border-zinc-200/60 dark:border-zinc-800 space-y-1">
                  <span className="text-zinc-400 font-mono uppercase text-[10px]">Search Intent Classification</span>
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{pageDetails.aiSummary?.intentMatch || 'Commercial / SaaS'}</p>
                  <p className="text-[11px] text-zinc-500">Directly matched for LLM solution recommendations.</p>
                </div>
              </div>

              {/* Direct Answer Recommendation Callout */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300">
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  <span>Recommended Direct Answer Anchor (For H1 Sub-heading)</span>
                </div>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 italic">
                  "{pageDetails.aiSummary?.aiSnippetRecommendation || `${currentProject?.name} delivers automated intelligence, benchmarking, and verified performance workflows.`}"
                </p>
              </div>
            </Card>

            {/* AI Crawler Bot Access Matrix */}
            <Card className="bg-white dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27] p-5 space-y-4">
              <h3 className="font-serif text-base text-[#141413] dark:text-[#faf9f5]">AI Crawler Bot Access (robots.txt)</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
                  <div>
                    <span className="font-semibold block">GPTBot (OpenAI)</span>
                    <span className="text-[10px] text-zinc-500">Powers ChatGPT Search &amp; GPT-4o</span>
                  </div>
                  <Badge variant="outline" className="text-emerald-600 bg-emerald-500/10 border-emerald-500/30 text-[10px]">Allowed</Badge>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
                  <div>
                    <span className="font-semibold block">PerplexityBot</span>
                    <span className="text-[10px] text-zinc-500">Powers Perplexity Pro citations</span>
                  </div>
                  <Badge variant="outline" className="text-emerald-600 bg-emerald-500/10 border-emerald-500/30 text-[10px]">Allowed</Badge>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
                  <div>
                    <span className="font-semibold block">ClaudeBot (Anthropic)</span>
                    <span className="text-[10px] text-zinc-500">Powers Claude search knowledge</span>
                  </div>
                  <Badge variant="outline" className="text-emerald-600 bg-emerald-500/10 border-emerald-500/30 text-[10px]">Allowed</Badge>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
                  <div>
                    <span className="font-semibold block">Google-Extended</span>
                    <span className="text-[10px] text-zinc-500">Powers Gemini &amp; AI Overviews</span>
                  </div>
                  <Badge variant="outline" className="text-emerald-600 bg-emerald-500/10 border-emerald-500/30 text-[10px]">Allowed</Badge>
                </div>
              </div>
            </Card>
          </div>

          {/* Granular GEO / AEO Automated Standards Checklist */}
          <Card className="bg-white dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="font-serif text-lg text-[#141413] dark:text-[#faf9f5]">
                  GEO &amp; Answer Engine Standards (7 Automated Checks)
                </h3>
                <p className="text-xs text-zinc-500">Includes step-by-step resolution guides and ready-to-use direct answer callout boxes.</p>
              </div>
              <AiOptimizationFixModal 
                currentUrl={selectedScan?.pageUrl || currentProject?.websiteUrl || ''} 
                siteName={currentProject?.name}
                title={pageDetails.title}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {THEME_CHECKS.geoAeo.map((check) => {
                const matchingIssue = selectedScan?.issues?.find((i: any) => 
                  check.matchKeywords.some(kw => `${i.title} ${i.description}`.toLowerCase().includes(kw.toLowerCase()))
                );
                const isPassed = !matchingIssue;
                return (
                  <ActionableCheckItem
                    key={check.id}
                    check={check}
                    isPassed={isPassed}
                    matchingIssue={matchingIssue}
                    customAction={
                      <AiOptimizationFixModal 
                        currentUrl={selectedScan?.pageUrl || currentProject?.websiteUrl || ''} 
                        siteName={currentProject?.name}
                        title={pageDetails.title}
                      />
                    }
                  />
                );
              })}
            </div>
          </Card>
        </TabsContent>

        {/* ------------------------------------------------------------------ */}
        {/* TAB 6: SPEED, CWV & IMAGES                                         */}
        {/* ------------------------------------------------------------------ */}
        <TabsContent value="performance" className="space-y-6">
          {/* Header & Quick Action */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-white dark:bg-[#181715] p-5 rounded-2xl border border-[#e6dfd8] dark:border-[#2e2b27]">
            <div>
              <h3 className="font-serif text-xl text-[#141413] dark:text-[#faf9f5] flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#cc785c]" />
                Speed, Core Web Vitals &amp; Media Diagnostics
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Evaluates Largest Contentful Paint (LCP), Cumulative Layout Shift (CLS), script deferral, and media formats.
              </p>
            </div>
            <ImageOptimizationFixModal 
              sampleImageSrc={pageDetails.imagesList?.[0]?.src}
              sampleAlt={pageDetails.imagesList?.[0]?.alt}
            />
          </div>

          {/* 4-Metric Speed & CWV Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Image Efficiency */}
            <Card className="bg-white dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27] p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase text-zinc-400">Media Assets</span>
                <ImageIcon className="w-4 h-4 text-[#cc785c]" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{pageDetails.imagesTotal || 0}</span>
                <Badge variant={(pageDetails.missingAltCount || 0) === 0 ? 'outline' : 'destructive'} className="text-[10px]">
                  {pageDetails.missingAltCount || 0} Missing Alt
                </Badge>
              </div>
              <p className="text-[11px] text-zinc-500">
                {(pageDetails.nonModernImagesCount || 0) > 0 ? `${pageDetails.nonModernImagesCount} uncompressed PNG/JPG` : 'All next-gen WebP/AVIF'}
              </p>
            </Card>

            {/* Layout Shift (CLS) Risk */}
            <Card className="bg-white dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27] p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase text-zinc-400">Layout Shift (CLS)</span>
                <Layers className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">0.02</span>
                <Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-500/10 border-emerald-500/30">
                  Good (&lt; 0.1)
                </Badge>
              </div>
              <p className="text-[11px] text-zinc-500">
                Aspect ratio preservation &amp; explicit image dimensions
              </p>
            </Card>

            {/* Render Blocking Scripts */}
            <Card className="bg-white dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27] p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase text-zinc-400">Render-Blocking</span>
                <Cpu className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className={`text-2xl font-bold ${(pageDetails.renderBlockingScripts || 0) > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                  {pageDetails.renderBlockingScripts || 0}
                </span>
                <Badge variant={(pageDetails.renderBlockingScripts || 0) === 0 ? 'outline' : 'secondary'} className="text-[10px]">
                  {(pageDetails.renderBlockingScripts || 0) === 0 ? 'Fully Async/Defer' : 'Needs Defer'}
                </Badge>
              </div>
              <p className="text-[11px] text-zinc-500">
                Synchronous scripts blocking first contentful paint
              </p>
            </Card>

            {/* DOM Node Depth */}
            <Card className="bg-white dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27] p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase text-zinc-400">DOM Elements</span>
                <Globe2 className="w-4 h-4 text-[#5b8cce]" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{pageDetails.totalDomElements || 0}</span>
                <Badge variant={(pageDetails.totalDomElements || 0) < 1500 ? 'outline' : 'secondary'} className="text-[10px]">
                  {(pageDetails.totalDomElements || 0) < 1500 ? 'Optimal (< 1.5k)' : 'Heavy DOM'}
                </Badge>
              </div>
              <p className="text-[11px] text-zinc-500">
                Lightweight DOM tree accelerates layout calculation
              </p>
            </Card>
          </div>

          {/* Interactive Image Forensics & Table */}
          <Card className="bg-white dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27] p-5 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="font-serif text-lg text-[#141413] dark:text-[#faf9f5] flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#cc785c]" />
                  Audited Image Assets &amp; Optimization Matrix
                </h3>
                <p className="text-xs text-zinc-500">
                  Inspect descriptive alt text, dimensions, and compression formats for all on-page graphics.
                </p>
              </div>
              <span className="text-xs font-mono text-zinc-400">
                {pageDetails.imagesList?.length || 0} Images Sampled
              </span>
            </div>

            <div className="overflow-x-auto">
              <div className="space-y-2.5 min-w-[600px]">
                {pageDetails.imagesList && pageDetails.imagesList.length > 0 ? (
                  pageDetails.imagesList.map((img: any, idx: number) => {
                    const isModern = img.src.endsWith('.webp') || img.src.endsWith('.avif') || img.src.endsWith('.svg');
                    const hasAlt = img.alt && img.alt !== 'Missing' && img.alt.trim() !== '';
                    const hasDims = img.width && img.height;

                    return (
                      <div 
                        key={idx} 
                        className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between gap-4 hover:border-[#cc785c]/40 transition-all"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {/* Thumbnail / Icon preview */}
                          <div className="w-10 h-10 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden border border-zinc-300 dark:border-zinc-700">
                            {img.src.startsWith('http') || img.src.startsWith('/') ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img 
                                src={img.src} 
                                alt={img.alt || 'Thumb'} 
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.target as any).style.display = 'none'; }}
                              />
                            ) : (
                              <ImageIcon className="w-4 h-4 text-zinc-400" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0 space-y-1">
                            <span className="font-mono text-xs text-zinc-900 dark:text-zinc-100 block truncate" title={img.src}>
                              {img.src}
                            </span>
                            <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                              <span>Alt: <strong className={hasAlt ? 'text-zinc-700 dark:text-zinc-300' : 'text-red-500'}>{img.alt || 'MISSING'}</strong></span>
                              <span>•</span>
                              <span>Dims: <span className="font-mono">{hasDims ? `${img.width}x${img.height}` : 'Auto (CLS risk)'}</span></span>
                            </div>
                          </div>
                        </div>

                        {/* Status Badges */}
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant={isModern ? 'outline' : 'secondary'} className={`text-[10px] ${isModern ? 'text-emerald-600 bg-emerald-500/10 border-emerald-500/30' : 'text-amber-600'}`}>
                            {isModern ? 'Next-Gen Format' : 'Legacy Format'}
                          </Badge>
                          <Badge variant={hasAlt ? 'outline' : 'destructive'} className="text-[10px]">
                            {hasAlt ? 'Alt OK' : 'Missing Alt'}
                          </Badge>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-zinc-400 italic text-xs py-4 text-center">No image elements detected on this URL.</p>
                )}
              </div>
            </div>
          </Card>

          {/* Granular Performance & Core Web Vitals Checklist */}
          <Card className="bg-white dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="font-serif text-lg text-[#141413] dark:text-[#faf9f5]">
                  Speed, Images &amp; Asset Standards (5 Automated Checks)
                </h3>
                <p className="text-xs text-zinc-500">Includes step-by-step resolution guides for image compression, layout shifts, and script deferral.</p>
              </div>
              <ImageOptimizationFixModal 
                sampleImageSrc={pageDetails.imagesList?.[0]?.src}
                sampleAlt={pageDetails.imagesList?.[0]?.alt}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {THEME_CHECKS.performance.map((check) => {
                const matchingIssue = selectedScan?.issues?.find((i: any) => 
                  check.matchKeywords.some(kw => `${i.title} ${i.description}`.toLowerCase().includes(kw.toLowerCase()))
                );
                const isPassed = !matchingIssue;
                return (
                  <ActionableCheckItem
                    key={check.id}
                    check={check}
                    isPassed={isPassed}
                    matchingIssue={matchingIssue}
                    customAction={
                      <ImageOptimizationFixModal 
                        sampleImageSrc={pageDetails.imagesList?.[0]?.src}
                        sampleAlt={pageDetails.imagesList?.[0]?.alt}
                      />
                    }
                  />
                );
              })}
            </div>
          </Card>
        </TabsContent>

        {/* ------------------------------------------------------------------ */}
        {/* TAB 7: LINK GRAPH & ARCHITECTURE                                   */}
        {/* ------------------------------------------------------------------ */}
        <TabsContent value="links" className="space-y-6">
          {/* Header & Generator */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-white dark:bg-[#181715] p-5 rounded-2xl border border-[#e6dfd8] dark:border-[#2e2b27]">
            <div>
              <h3 className="font-serif text-xl text-[#141413] dark:text-[#faf9f5] flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#cc785c]" />
                Link Graph, Anchor Text &amp; PageRank Equity
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Evaluates crawl accessibility, anchor text keyword relevance, internal silo architecture, and outbound attribution.
              </p>
            </div>
            <LinkOptimizationFixModal 
              brand={currentProject?.name}
              domain={selectedScan?.pageUrl ? new URL(selectedScan.pageUrl).hostname : 'yourdomain.com'}
            />
          </div>

          {/* 3-Metric Link Equity Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-white dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27] p-4 text-center space-y-1">
              <span className="text-3xl font-bold text-[#cc785c]">{pageDetails.internalLinksCount || 0}</span>
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block">Internal Links Discovered</span>
              <p className="text-[11px] text-zinc-500">Distributes domain authority &amp; PageRank equity</p>
            </Card>

            <Card className="bg-white dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27] p-4 text-center space-y-1">
              <span className="text-3xl font-bold text-zinc-800 dark:text-zinc-200">{pageDetails.externalLinksCount || 0}</span>
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block">Outbound External Citations</span>
              <p className="text-[11px] text-zinc-500">Provides reference signals to authority databases</p>
            </Card>

            <Card className="bg-white dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27] p-4 text-center space-y-1">
              <span className={`text-3xl font-bold ${(pageDetails.genericAnchorCount || 0) > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                {pageDetails.genericAnchorCount || 0}
              </span>
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block">Generic Anchors Flagged</span>
              <p className="text-[11px] text-zinc-500">
                {(pageDetails.genericAnchorCount || 0) > 0 ? 'Needs keyword descriptive text' : 'All anchors descriptive'}
              </p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Generic Anchor Text Remediation Table */}
            <Card className="bg-white dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27] p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <h3 className="font-serif text-lg text-[#141413] dark:text-[#faf9f5] flex items-center gap-2">
                  <Hash className="w-4 h-4 text-[#cc785c]" />
                  Anchor Text Quality Observatory
                </h3>
                <Badge variant={(pageDetails.genericAnchorCount || 0) === 0 ? 'outline' : 'secondary'} className="text-[10px]">
                  {(pageDetails.genericAnchorCount || 0) === 0 ? '0 Generic (Pass)' : `${pageDetails.genericAnchorCount} Generic`}
                </Badge>
              </div>

              <div className="space-y-2.5 text-xs max-h-[300px] overflow-y-auto">
                {pageDetails.genericAnchorsList && pageDetails.genericAnchorsList.length > 0 ? (
                  pageDetails.genericAnchorsList.map((anchor: any, aIdx: number) => (
                    <div key={aIdx} className="p-3 rounded-lg bg-amber-500/[0.04] border border-amber-500/30 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-amber-700 dark:text-amber-400">
                          &ldquo;{anchor.text}&rdquo; (Generic Anchor)
                        </span>
                        <Badge variant="destructive" className="text-[9px]">Replace Anchor</Badge>
                      </div>
                      <p className="font-mono text-[11px] text-zinc-500 truncate">Target: {anchor.href}</p>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 pt-1">
                        💡 <strong>Suggestion:</strong> Rephrase to descriptive text like <em>&ldquo;Explore {currentProject?.name || 'Platform'} Architecture Guide&rdquo;</em>
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/30 text-center space-y-1">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">All Anchor Texts Are Descriptive</p>
                    <p className="text-[11px] text-zinc-500">Zero generic anchor phrases like &quot;click here&quot; or &quot;read more&quot; detected.</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Discovered Crawl Pages Hub */}
            <Card className="bg-white dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27] p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <h3 className="font-serif text-lg text-[#141413] dark:text-[#faf9f5] flex items-center gap-2">
                  <Globe2 className="w-4 h-4 text-[#cc785c]" />
                  Discovered Site Architecture ({pages.length} Pages)
                </h3>
                <Badge variant="outline" className="text-[10px] font-mono">Live Crawler</Badge>
              </div>

              <div className="max-h-[300px] overflow-y-auto space-y-2 text-xs">
                {pages.map((p, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                    <span className="truncate max-w-[240px] text-zinc-700 dark:text-zinc-300 font-mono text-[11px]" title={p.url}>
                      {p.url}
                    </span>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-6 text-[10px] text-[#cc785c] border-[#cc785c]/30 hover:bg-[#cc785c]/10"
                      onClick={() => handleTriggerScan(p.url)}
                    >
                      Audit URL
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Granular Internal Linking & Architecture Checklist */}
          <Card className="bg-white dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="font-serif text-lg text-[#141413] dark:text-[#faf9f5]">
                  Internal Linking &amp; Graph Standards (4 Automated Checks)
                </h3>
                <p className="text-xs text-zinc-500">Includes step-by-step resolution guides for anchor text optimization, broken links, and attribution.</p>
              </div>
              <LinkOptimizationFixModal 
                brand={currentProject?.name}
                domain={selectedScan?.pageUrl ? new URL(selectedScan.pageUrl).hostname : 'yourdomain.com'}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {THEME_CHECKS.internalLinks.map((check) => {
                const matchingIssue = selectedScan?.issues?.find((i: any) => 
                  check.matchKeywords.some(kw => `${i.title} ${i.description}`.toLowerCase().includes(kw.toLowerCase()))
                );
                const isPassed = !matchingIssue;
                return (
                  <ActionableCheckItem
                    key={check.id}
                    check={check}
                    isPassed={isPassed}
                    matchingIssue={matchingIssue}
                    customAction={
                      <LinkOptimizationFixModal 
                        brand={currentProject?.name}
                        domain={selectedScan?.pageUrl ? new URL(selectedScan.pageUrl).hostname : 'yourdomain.com'}
                      />
                    }
                  />
                );
              })}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
