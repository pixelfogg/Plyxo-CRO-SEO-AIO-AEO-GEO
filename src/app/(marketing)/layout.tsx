import Link from 'next/link';
import { BrandLogo } from "@/components/claude/RadialSpike";
import { PlyxoLogo } from "@/components/ui/logo";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f5] text-[#141413] font-sans selection:bg-[#cc785c]/20">
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
            <Link href="/#capabilities" className="text-[14px] font-medium text-[#141413] hover:text-[#cc785c] transition-colors">
              Bounding Engine
            </Link>
            <Link href="/#models" className="text-[14px] font-medium text-[#141413] hover:text-[#cc785c] transition-colors">
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

      <main className="flex-1 w-full relative">
        {children}
      </main>

      {/* Footer — footer */}
      <footer className="bg-[#181715] text-[#a09d96] py-[64px] border-t border-[#252320]">
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
              <div><Link href="/#capabilities" className="hover:text-white transition-colors">Bounding Box Engine</Link></div>
              <div><Link href="/dashboard/aio" className="hover:text-white transition-colors">AEO Intelligence</Link></div>
            </div>

            <div className="space-y-3">
              <div className="text-white font-medium text-[13px] tracking-wider uppercase mb-4">Resources</div>
              <div><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></div>
              <div><Link href="/blog" className="hover:text-white transition-colors">Research &amp; Blog</Link></div>
              <div><Link href="/#models" className="hover:text-white transition-colors">Model Benchmarks</Link></div>
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
  )
}
