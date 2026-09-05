"use client";

import React, { useState } from "react";
import Link from "next/link";
import { RadialSpike, BrandLogo } from "@/components/claude/RadialSpike";
import { PlyxoLogo } from "@/components/ui/logo";
import { ArrowUpRight, Check, Sparkles, Terminal, Code2, ShieldAlert, Cpu, Eye, FileSearch, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"audit" | "code">("audit");

  return (
    <div className="min-h-screen bg-[#faf9f5] text-[#141413] font-sans selection:bg-[#cc785c]/20">
      {/* Top Navigation — top-nav */}
      <header className="sticky top-0 z-50 h-[64px] w-full bg-[#faf9f5]/95 backdrop-blur-sm border-b border-[#e6dfd8] transition-all">
        <div className="max-w-[1200px] mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/">
            <PlyxoLogo className="h-7" forceDark={true} />
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/dashboard/aio" className="text-[14px] font-medium text-[#141413] hover:text-[#cc785c] transition-colors">
              Platform
            </Link>
            <Link href="/dashboard/projects" className="text-[14px] font-medium text-[#141413] hover:text-[#cc785c] transition-colors">
              AI Audits
            </Link>
            <Link href="#capabilities" className="text-[14px] font-medium text-[#141413] hover:text-[#cc785c] transition-colors">
              Bounding Engine
            </Link>
            <Link href="#models" className="text-[14px] font-medium text-[#141413] hover:text-[#cc785c] transition-colors">
              Intelligence
            </Link>
            <Link href="/dashboard" className="text-[14px] font-medium text-[#141413] hover:text-[#cc785c] transition-colors">
              Dashboard
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {process.env.NEXT_PUBLIC_IS_CLOUD_EDITION !== 'false' && (
              <Link href="/login" className="hidden sm:inline-block text-[14px] font-medium text-[#141413] hover:text-[#cc785c] transition-colors">
                Sign in
              </Link>
            )}
            <Link 
              href="/dashboard/aio" 
              className="inline-flex items-center justify-center bg-[#cc785c] hover:bg-[#a9583e] text-white font-medium text-[14px] px-5 py-2 rounded-[8px] shadow-none transition-colors h-[40px]"
            >
              Try Plyxo
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Band — hero-band */}
        <section className="py-[64px] lg:py-[96px] max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left 6 columns: Editorial Display */}
            <div className="lg:col-span-6 flex flex-col items-start">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#efe9de] text-[#141413] text-[13px] font-medium mb-6 border border-[#e6dfd8]">
                <RadialSpike size={14} className="text-[#cc785c]" />
                <span>Anthropic-Powered CRO Architecture</span>
              </div>

              <h1 className="font-serif text-[42px] sm:text-[54px] lg:text-[64px] font-normal leading-[1.05] tracking-[-1.5px] text-[#141413] mb-6">
                Meet your thinking partner for conversion optimization.
              </h1>

              <p className="font-sans text-[16px] sm:text-[18px] leading-[1.55] text-[#3d3d3a] mb-8 max-w-xl">
                Plyxo autonomously reads your web architecture, draws precise visual bounding boxes around user friction, analyzes Core Web Vitals, and synthesizes econometrics to predict revenue lift.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
                <Link 
                  href="/dashboard/aio" 
                  className="inline-flex items-center justify-center bg-[#cc785c] hover:bg-[#a9583e] text-white font-medium text-[15px] px-6 py-3 rounded-[8px] transition-all"
                >
                  Start Autonomous Audit
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
                <Link 
                  href="#capabilities" 
                  className="inline-flex items-center justify-center bg-[#faf9f5] hover:bg-[#efe9de] text-[#141413] border border-[#e6dfd8] font-medium text-[15px] px-6 py-3 rounded-[8px] transition-all"
                >
                  Explore Bounding Engine
                </Link>
              </div>

              <div className="mt-12 pt-6 border-t border-[#e6dfd8] w-full flex items-center justify-between text-[#6c6a64] text-[13px] font-medium">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#5db872]"></span>
                  Opus 3.7 Vision Ready
                </span>
                <span>Sub-second DOM parsing</span>
                <span className="hidden sm:inline-block">Zero config setup</span>
              </div>
            </div>

            {/* Right 6 columns: Dark Navy Product Chrome Mockup — code-window-card */}
            <div className="lg:col-span-6 w-full">
              <div className="bg-[#181715] text-[#faf9f5] rounded-[16px] border border-[#252320] overflow-hidden shadow-2xl">
                {/* Window Chrome Header */}
                <div className="bg-[#252320] px-4 py-3 flex items-center justify-between border-b border-[#1f1e1b]">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 rounded-full bg-[#3d3d3a]/60"></div>
                    <div className="h-3 w-3 rounded-full bg-[#3d3d3a]/60"></div>
                    <div className="h-3 w-3 rounded-full bg-[#3d3d3a]/60"></div>
                    <span className="text-[12px] font-mono font-medium text-[#a09d96] ml-2">plyxo-audit-engine // session_0942.log</span>
                  </div>
                  <div className="flex bg-[#181715] rounded-md p-0.5 border border-[#3d3d3a]/40">
                    <button 
                      onClick={() => setActiveTab("audit")}
                      className={cn("text-[11px] font-medium px-2.5 py-1 rounded-sm transition-colors", activeTab === "audit" ? "bg-[#252320] text-white" : "text-[#8e8b82] hover:text-white")}
                    >
                      AI Detection Log
                    </button>
                    <button 
                      onClick={() => setActiveTab("code")}
                      className={cn("text-[11px] font-medium px-2.5 py-1 rounded-sm transition-colors", activeTab === "code" ? "bg-[#252320] text-white" : "text-[#8e8b82] hover:text-white")}
                    >
                      Bounding DOM
                    </button>
                  </div>
                </div>

                {/* Code Window Content Area */}
                <div className="p-6 font-mono text-[13px] leading-[1.7] overflow-x-auto bg-[#181715] min-h-[340px]">
                  {activeTab === "audit" ? (
                    <div className="space-y-3">
                      <div className="text-[#8e8b82] flex items-center gap-2">
                        <Terminal className="h-4 w-4 text-[#cc785c]" />
                        <span>[00:00.12] Initiating autonomous CRO analysis on target domain...</span>
                      </div>
                      <div className="text-[#a09d96]">
                        <span className="text-[#5db872]">[DOM_PARSE]</span> Document tree indexed. 1,420 reachable elements identified.
                      </div>
                      <div className="p-3 rounded-md bg-[#1f1e1b] border border-[#252320] text-[#faf9f5] my-2">
                        <div className="text-[#cc785c] font-semibold flex items-center gap-1.5 mb-1">
                          <RadialSpike size={14} />
                          <span>Friction Pattern Found [Severity: HIGH]</span>
                        </div>
                        <p className="text-[12px] font-sans text-[#d4d1c9] leading-relaxed">
                          Primary CTA on mobile viewports has touch target area &lt; 44px (measured 32x28). Causes severe mis-tap dropoff during step 2 of checkout funnel.
                        </p>
                      </div>
                      <div className="text-[#e8a55a]">
                        <span>[BOUNDING_ENGINE]</span> Bounding box coordinates deployed: <span className="text-white bg-[#252320] px-1.5 py-0.5 rounded text-[11px]">rect(x:240, y:812, w:180, h:32)</span>
                      </div>
                      <div className="text-[#5db8a6] flex items-center justify-between border-t border-[#252320] pt-3 mt-3">
                        <span>✦ Predicted Monthly Revenue Gain:</span>
                        <span className="font-sans font-bold text-white text-[16px]">+$24,600.00 (+4.8%)</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1 text-[#d4d1c9]">
                      <div><span className="text-[#cc785c]">const</span> auditResult = <span className="text-[#5db8a6]">await</span> plyxo.<span className="text-[#e8a55a]">audit</span>({`{`}</div>
                      <div className="pl-4"><span className="text-[#8e8b82]">url:</span> <span className="text-[#5db872]">&quot;https://client-store.com/checkout&quot;</span>,</div>
                      <div className="pl-4"><span className="text-[#8e8b82]">model:</span> <span className="text-[#5db872]">&quot;plyxo-intelligence-2025&quot;</span>,</div>
                      <div className="pl-4"><span className="text-[#8e8b82]">features:</span> [<span className="text-[#5db872]">&quot;bounding_boxes&quot;</span>, <span className="text-[#5db872]">&quot;core_web_vitals&quot;</span>, <span className="text-[#5db872]">&quot;revenue_lift&quot;</span>]</div>
                      <div>{`}`});</div>
                      <div className="py-2 text-[#8e8b82]">// Automated patch generated by Plyxo:</div>
                      <div className="text-[#5db872] bg-[#5db872]/10 p-2 rounded border border-[#5db872]/20 font-mono text-[12px]">
                        + &lt;button className=&quot;min-h-[44px] min-w-[44px] py-3 px-6 rounded-md bg-primary text-white font-medium&quot;&gt;
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Status Bar */}
                <div className="bg-[#1f1e1b] px-6 py-3.5 border-t border-[#252320] flex items-center justify-between text-[12px]">
                  <div className="flex items-center space-x-2">
                    <span className="flex h-2 w-2 rounded-full bg-[#5db872]"></span>
                    <span className="text-[#a09d96]">Live Audit Engine:</span>
                    <span className="text-white font-medium">Ready for deployment</span>
                  </div>
                  <Link href="/dashboard" className="text-[#cc785c] hover:underline font-sans flex items-center gap-1 font-medium">
                    View Full Trace <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Feature Cards Section — surface-card */}
        <section id="capabilities" className="py-[96px] bg-[#faf9f5] border-t border-[#e6dfd8]">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="max-w-2xl mb-16">
              <span className="text-[12px] uppercase font-semibold tracking-[1.5px] text-[#cc785c] block mb-3">
                Editorial Depth
              </span>
              <h2 className="font-serif text-[36px] sm:text-[48px] font-normal leading-[1.1] tracking-[-1px] text-[#141413] mb-4">
                Designed to find revenue where others only see code.
              </h2>
              <p className="font-sans text-[16px] text-[#3d3d3a]">
                Most auditing tools dump arbitrary checklist warnings. Plyxo unites computational vision and behavioral psychology to prescribe high-yield design revisions.
              </p>
            </div>

            {/* 3-up Feature Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#efe9de] rounded-[12px] p-[32px] border border-[#e6dfd8] flex flex-col justify-between transition-transform duration-200 hover:-translate-y-1">
                <div>
                  <div className="h-10 w-10 rounded-full bg-[#faf9f5] flex items-center justify-center mb-6 text-[#cc785c] border border-[#e6dfd8]">
                    <Eye className="h-5 w-5" />
                  </div>
                  <h3 className="text-[18px] font-medium text-[#141413] mb-3">
                    Visual Bounding Engine
                  </h3>
                  <p className="text-[15px] leading-[1.55] text-[#3d3d3a] mb-6">
                    Our multimodal OCR engine scans rendered pages across device viewports, pinpointing layout overlap, contrast defects, and visual hierarchy failures with exact pixel bounding boxes.
                  </p>
                </div>
                <div className="pt-4 border-t border-[#e6dfd8]/60 text-[13px] font-medium text-[#141413] flex items-center gap-1">
                  <span>99.8% precision rate</span>
                </div>
              </div>

              <div className="bg-[#efe9de] rounded-[12px] p-[32px] border border-[#e6dfd8] flex flex-col justify-between transition-transform duration-200 hover:-translate-y-1">
                <div>
                  <div className="h-10 w-10 rounded-full bg-[#faf9f5] flex items-center justify-center mb-6 text-[#5db8a6] border border-[#e6dfd8]">
                    <Cpu className="h-5 w-5" />
                  </div>
                  <h3 className="text-[18px] font-medium text-[#141413] mb-3">
                    Core Web Vitals & Analytics
                  </h3>
                  <p className="text-[15px] leading-[1.55] text-[#3d3d3a] mb-6">
                    Real-time synthesis of LCP, CLS, and INP metrics directly integrated with Google PSI API and Lighthouse data. We tell you precisely which script bottlenecks conversion.
                  </p>
                </div>
                <div className="pt-4 border-t border-[#e6dfd8]/60 text-[13px] font-medium text-[#141413] flex items-center gap-1">
                  <span>Google PSI integrated</span>
                </div>
              </div>

              <div className="bg-[#efe9de] rounded-[12px] p-[32px] border border-[#e6dfd8] flex flex-col justify-between transition-transform duration-200 hover:-translate-y-1">
                <div>
                  <div className="h-10 w-10 rounded-full bg-[#faf9f5] flex items-center justify-center mb-6 text-[#e8a55a] border border-[#e6dfd8]">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h3 className="text-[18px] font-medium text-[#141413] mb-3">
                    Predictive Econometrics
                  </h3>
                  <p className="text-[15px] leading-[1.55] text-[#3d3d3a] mb-6">
                    Why test blindly? Our reasoning model simulates user cohort friction against industry benchmarks to predict exact ARR lift before your engineering team touches a line of code.
                  </p>
                </div>
                <div className="pt-4 border-t border-[#e6dfd8]/60 text-[13px] font-medium text-[#141413] flex items-center gap-1">
                  <span>Prioritized by financial return</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dark Navy Product Chrome Section — product-mockup-card-dark */}
        <section id="models" className="py-[96px] bg-[#faf9f5]">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="bg-[#181715] text-[#faf9f5] rounded-[16px] p-8 md:p-12 lg:p-16 border border-[#252320]">
              <div className="max-w-3xl mb-12">
                <span className="inline-block px-3 py-1 rounded-full bg-[#252320] text-[#a09d96] text-[12px] font-mono mb-4">
                  MODEL ARCHITECTURE
                </span>
                <h2 className="font-serif text-[36px] sm:text-[44px] font-normal leading-[1.15] tracking-[-0.5px] text-[#faf9f5] mb-6">
                  Powered by Plyxo Intelligence.
                </h2>
                <p className="font-sans text-[16px] leading-[1.55] text-[#a09d96]">
                  Different optimization tasks demand varied cognitive depths. Plyxo seamlessly switches between models to balance high-speed heuristic scans and profound architectural reasoning.
                </p>
              </div>

              {/* Model Comparison Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-[#252320]">
                <div className="bg-[#1f1e1b] rounded-[12px] p-6 border border-[#252320] flex flex-col justify-between">
                  <div>
                    <div className="text-[13px] font-mono text-[#5db8a6] uppercase tracking-wider mb-2">Opus 3.7 Engine</div>
                    <h3 className="font-serif text-[24px] text-[#faf9f5] font-normal mb-2">Architectural Audits</h3>
                    <p className="text-[14px] text-[#a09d96] mb-6 leading-relaxed">
                      Deep reasoning over multi-page checkout funnels, structural design systems, and complex psychological friction points.
                    </p>
                  </div>
                  <div className="text-[12px] font-mono text-[#8e8b82] pt-4 border-t border-[#252320]">
                    Max Reasoning // 200K Context
                  </div>
                </div>

                <div className="bg-[#252320] rounded-[12px] p-6 border border-[#3d3d3a]/40 flex flex-col justify-between shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-[#cc785c] text-white text-[10px] font-mono uppercase px-3 py-1 font-bold tracking-wider rounded-bl-md">
                    Recommended
                  </div>
                  <div>
                    <div className="text-[13px] font-mono text-[#cc785c] uppercase tracking-wider mb-2">Sonnet 3.7 Hybrid</div>
                    <h3 className="font-serif text-[24px] text-[#faf9f5] font-normal mb-2">Autonomous Bounding</h3>
                    <p className="text-[14px] text-[#faf9f5]/90 mb-6 leading-relaxed">
                      Instant multimodal vision analysis. Draws pixel-perfect bounding boxes and compiles React/CSS drop-in design remediations in real time.
                    </p>
                  </div>
                  <div className="text-[12px] font-mono text-[#faf9f5]/70 pt-4 border-t border-[#3d3d3a]/30">
                    High Speed & Vision // Sub-second
                  </div>
                </div>

                <div className="bg-[#1f1e1b] rounded-[12px] p-6 border border-[#252320] flex flex-col justify-between">
                  <div>
                    <div className="text-[13px] font-mono text-[#e8a55a] uppercase tracking-wider mb-2">Haiku 3.5 Watcher</div>
                    <h3 className="font-serif text-[24px] text-[#faf9f5] font-normal mb-2">Continuous Guard</h3>
                    <p className="text-[14px] text-[#a09d96] mb-6 leading-relaxed">
                      24/7 synthetic canary monitoring. Alerts your engineering Slack instantaneously when a new deployment degrades Core Web Vitals.
                    </p>
                  </div>
                  <div className="text-[12px] font-mono text-[#8e8b82] pt-4 border-t border-[#252320]">
                    Always On // Zero Latency
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        
        {/* Comprehensive Analysis Suite */}
        <section className="py-[64px] lg:py-[96px] bg-[#181715] text-[#faf9f5]">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="mb-16">
              <span className="text-[13px] font-mono text-[#cc785c] uppercase tracking-wider mb-4 block">Unified Audit Architecture</span>
              <h2 className="font-serif text-[36px] sm:text-[48px] font-normal leading-[1.1] tracking-[-1px] max-w-2xl">
                One platform. Four distinct intelligence engines.
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* CRO Analysis */}
              <div className="bg-[#1f1e1b] rounded-2xl p-8 border border-[#2e2b27] hover:border-[#cc785c]/50 transition-colors">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-[#cc785c]/10 p-3 rounded-lg">
                    <Eye className="w-6 h-6 text-[#cc785c]" />
                  </div>
                  <h3 className="text-xl font-medium tracking-tight">CRO Intelligence</h3>
                </div>
                <p className="text-[#a09d96] mb-6 leading-relaxed">
                  Deep behavioral analysis modeling human psychological patterns against your UI. Identifies high-friction interaction points, cognitive overload, and visual hierarchy failures.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm text-[#faf9f5]"><Check className="w-4 h-4 text-[#5db8a6]" /> Visual Hierarchy Scoring</li>
                  <li className="flex items-center gap-3 text-sm text-[#faf9f5]"><Check className="w-4 h-4 text-[#5db8a6]" /> Friction Point Detection</li>
                  <li className="flex items-center gap-3 text-sm text-[#faf9f5]"><Check className="w-4 h-4 text-[#5db8a6]" /> Accessibility Compliance</li>
                </ul>
              </div>

              {/* AEO Analysis */}
              <div className="bg-[#1f1e1b] rounded-2xl p-8 border border-[#2e2b27] hover:border-[#e8a55a]/50 transition-colors">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-[#e8a55a]/10 p-3 rounded-lg">
                    <Sparkles className="w-6 h-6 text-[#e8a55a]" />
                  </div>
                  <h3 className="text-xl font-medium tracking-tight">AEO / GEO Engine</h3>
                </div>
                <p className="text-[#a09d96] mb-6 leading-relaxed">
                  Prepare your architecture for the next era of search. Audits your compliance with Generative Engine Optimization requirements for LLMs like ChatGPT and Claude.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm text-[#faf9f5]"><Check className="w-4 h-4 text-[#5db8a6]" /> LLM Crawlability & robots.txt</li>
                  <li className="flex items-center gap-3 text-sm text-[#faf9f5]"><Check className="w-4 h-4 text-[#5db8a6]" /> Semantic Citation Readiness</li>
                  <li className="flex items-center gap-3 text-sm text-[#faf9f5]"><Check className="w-4 h-4 text-[#5db8a6]" /> Entity Extraction Readiness</li>
                </ul>
              </div>

              {/* SEO Analysis */}
              <div className="bg-[#1f1e1b] rounded-2xl p-8 border border-[#2e2b27] hover:border-[#5db872]/50 transition-colors">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-[#5db872]/10 p-3 rounded-lg">
                    <FileSearch className="w-6 h-6 text-[#5db872]" />
                  </div>
                  <h3 className="text-xl font-medium tracking-tight">Technical SEO</h3>
                </div>
                <p className="text-[#a09d96] mb-6 leading-relaxed">
                  Enterprise-grade crawl simulation. Uncovers broken canonical chains, indexation blocks, meta degradation, and complex internal linking silos.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm text-[#faf9f5]"><Check className="w-4 h-4 text-[#5db8a6]" /> Canonical & Indexation Audits</li>
                  <li className="flex items-center gap-3 text-sm text-[#faf9f5]"><Check className="w-4 h-4 text-[#5db8a6]" /> Meta Data & Structure Health</li>
                  <li className="flex items-center gap-3 text-sm text-[#faf9f5]"><Check className="w-4 h-4 text-[#5db8a6]" /> Search Console Integration</li>
                </ul>
              </div>

              {/* Core Web Vitals */}
              <div className="bg-[#1f1e1b] rounded-2xl p-8 border border-[#2e2b27] hover:border-[#5db8a6]/50 transition-colors">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-[#5db8a6]/10 p-3 rounded-lg">
                    <Zap className="w-6 h-6 text-[#5db8a6]" />
                  </div>
                  <h3 className="text-xl font-medium tracking-tight">Core Web Vitals</h3>
                </div>
                <p className="text-[#a09d96] mb-6 leading-relaxed">
                  Sub-second diagnostic profiles mapping the real-world performance of your site. Direct synthesis of LCP, FID, and CLS metrics against conversion benchmarks.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm text-[#faf9f5]"><Check className="w-4 h-4 text-[#5db8a6]" /> Largest Contentful Paint (LCP)</li>
                  <li className="flex items-center gap-3 text-sm text-[#faf9f5]"><Check className="w-4 h-4 text-[#5db8a6]" /> Cumulative Layout Shift (CLS)</li>
                  <li className="flex items-center gap-3 text-sm text-[#faf9f5]"><Check className="w-4 h-4 text-[#5db8a6]" /> First Input Delay (FID)</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Coral Callout Band — callout-card-coral */}
        <section className="py-[48px] bg-[#faf9f5]">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="bg-[#cc785c] text-white rounded-[16px] p-10 md:p-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 shadow-sm">
              <div className="max-w-2xl">
                <span className="text-[12px] font-sans font-semibold uppercase tracking-[1.5px] text-white/80 block mb-2">
                  Ready To Proceed
                </span>
                <h2 className="font-serif text-[32px] sm:text-[42px] font-normal leading-[1.15] tracking-[-0.5px] text-white mb-4">
                  Elevate your conversion architecture today.
                </h2>
                <p className="font-sans text-[16px] text-white/90 leading-relaxed">
                  Join industry-leading design teams using Anthropic-powered agents to transform visitor friction into quantifiable revenue.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 shrink-0">
                <Link 
                  href="/dashboard" 
                  className="bg-[#faf9f5] hover:bg-[#efe9de] text-[#141413] font-medium text-[15px] px-8 py-4 rounded-[8px] transition-colors inline-flex items-center justify-center"
                >
                  Enter Workspace
                  <ArrowUpRight className="ml-2 h-4 w-4 text-[#cc785c]" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer — footer */}
      <footer className="bg-[#181715] text-[#a09d96] py-[64px] border-t border-[#252320] mt-[48px]">
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-10">
          
          <div className="md:col-span-5 flex flex-col justify-between space-y-6">
            <div>
              <BrandLogo variant="dark" />
              <p className="mt-4 text-[14px] leading-relaxed text-[#8e8b82] max-w-sm">
                An editorial, automated AI conversion optimization platform built to identify UX friction, synthesize Core Web Vitals, and forecast revenue econometrics.
              </p>
              <div className="mt-5">
                <a
                  href="https://www.producthunt.com/products/plyxo-self-hosted-cro-seo-llm-tool?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-plyxo-self-hosted-cro-seo-llm-tool"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block transition-opacity hover:opacity-90"
                >
                  <img
                    src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1241714&theme=neutral&t=1788576510860"
                    alt="Plyxo: Self-hosted CRO+SEO+LLM tool - Free, open-source AI tool for CRO, SEO & AI-search citations | Product Hunt"
                    width={250}
                    height={54}
                    className="w-[210px] h-auto"
                  />
                </a>
              </div>
            </div>
            <div className="text-[13px] text-[#6c6a64]">
              © {new Date().getFullYear()} Plyxo Inc. All rights reserved. Powered by Plyxo Intelligence.
            </div>
          </div>

          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8 text-[14px]">
            <div className="space-y-3">
              <div className="text-white font-medium text-[13px] tracking-wider uppercase mb-4">Product</div>
              <div><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></div>
              <div><Link href="/dashboard/projects" className="hover:text-white transition-colors">AI Auditing</Link></div>
              <div><Link href="#capabilities" className="hover:text-white transition-colors">Bounding Box Engine</Link></div>
              <div><Link href="/dashboard/aio" className="hover:text-white transition-colors">AEO Intelligence</Link></div>
            </div>

            <div className="space-y-3">
              <div className="text-white font-medium text-[13px] tracking-wider uppercase mb-4">Resources</div>
              <div><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></div>
              <div><Link href="/blog" className="hover:text-white transition-colors">Research &amp; Blog</Link></div>
              <div><Link href="#models" className="hover:text-white transition-colors">Model Benchmarks</Link></div>
              <div><Link href="/support" className="hover:text-white transition-colors">API Reference</Link></div>
            </div>

            <div className="space-y-3">
              <div className="text-white font-medium text-[13px] tracking-wider uppercase mb-4">Company</div>
              <div><Link href="/about" className="hover:text-white transition-colors">About Plyxo</Link></div>
              <div><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></div>
              <div><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></div>
              <div><Link href="/contact" className="hover:text-white transition-colors">Contact Engineering</Link></div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

