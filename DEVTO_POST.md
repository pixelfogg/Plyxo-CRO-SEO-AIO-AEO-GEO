---
title: I built a free, open-source alternative to Ahrefs & Hotjar powered by Claude-SEO & LLM Citations
published: true
tags: opensource, webdev, nextjs, ai
canonical_url: https://github.com/pixelfogg/Plyxo-CRO-SEO-AIO-AEO-GEO
cover_image: https://raw.githubusercontent.com/pixelfogg/Plyxo-CRO-SEO-AIO-AEO-GEO/main/docs/devto-cover.png
---

Most SEO and conversion optimization tools on the market are either:
1. **Overwhelming metadata spreadsheets** (Ahrefs, Screaming Frog) costing $99–$499/month.
2. **Passive analytics dashboards** (Google Analytics, Hotjar) that tell you *that* visitors bounce, but never tell you *why* or give you the code to fix it.
3. **Completely blind to the new AI search landscape** (ChatGPT Search, Perplexity AI, Google Gemini, Claude).

I wanted an autonomous thinking partner that doesn't just list warnings—it actually **inspects the rendered page, draws visual bounding boxes around UX friction, writes the drop-in React/Tailwind code fixes, and benchmarks how LLMs cite my website**.

So I built and open-sourced **Plyxo Community Edition** — 100% free, self-hosted, and unlimited.

⭐ **GitHub Repo:** [https://github.com/pixelfogg/Plyxo-CRO-SEO-AIO-AEO-GEO](https://github.com/pixelfogg/Plyxo-CRO-SEO-AIO-AEO-GEO)

---

## ⚡ What makes Plyxo different?

![Claude-SEO Autonomous Audit](https://raw.githubusercontent.com/pixelfogg/Plyxo-CRO-SEO-AIO-AEO-GEO/main/docs/demo/claude-seo-audit-demo.png)

### 1. 🎯 Visual CRO Bounding Box Friction Detection
Instead of giving you vague advice like *"improve button visibility"*, Plyxo takes a high-res screenshot of your page, calculates normalized bounding box coordinates over friction hotspots, computes the **expected monthly revenue lift**, and outputs **copy-paste Tailwind CSS & React remediation code**.

![CRO Visual Bounding Box](https://raw.githubusercontent.com/pixelfogg/Plyxo-CRO-SEO-AIO-AEO-GEO/main/docs/demo/cro-visual-bounding-box-demo.png)

---

### 2. 🧠 Complete Claude-SEO Skills Integration
Inspired by the popular [AgriciDaniel/claude-seo](https://github.com/AgriciDaniel/claude-seo) skill architecture, Plyxo natively runs 6 parallel specialist agents on every crawl:

* **⚙️ Technical SEO & Performance:** Evaluates robots.txt, sitemaps, canonicals, and real Google PageSpeed Insights Core Web Vitals (LCP, CLS, INP, TTFB).
* **🛡️ Resilient WAF Bypass:** Multi-tier fallback crawler that simulates authentic browser headers so Cloudflare or anti-bot firewalls never return `403 Forbidden` on your audits.
* **📐 Schema.org & JSON-LD Validation:** Deep syntax checks for `Article`, `Product/Offer`, `FAQPage`, `BreadcrumbList`, and `Organization`.
* **📝 E-E-A-T & Readability:** Evaluates author attribution, citation density, thin-content thresholds, and sequential `H1`–`H6` outline structure.
* **🔑 Semantic Keyword Intent:** Categorizes query clusters by intent (*Informational*, *Navigational*, *Commercial*, *Transactional*) and detects keyword cannibalization.

---

### 3. 🤖 AEO / GEO: Will ChatGPT & Perplexity Cite You?
Search is changing fast. Users don't just click blue links; they ask LLMs. 

Plyxo scores how readily **ChatGPT Search**, **Perplexity AI**, **Google Gemini**, and **Anthropic Claude** will extract your content as an authoritative cited source, measuring knowledge graph entity density and direct-answer formatting.

![AEO Citation Scoring](https://raw.githubusercontent.com/pixelfogg/Plyxo-CRO-SEO-AIO-AEO-GEO/main/docs/demo/aeo-citation-scoring-demo.png)

---

### 4. ⚔️ Side-by-Side Competitor Battlecards
Enter any competitor domain to get an automated side-by-side gap analysis comparing site speed, schema coverage, topical authority, and high-intent search gaps.

![Competitor Battlecard](https://raw.githubusercontent.com/pixelfogg/Plyxo-CRO-SEO-AIO-AEO-GEO/main/docs/demo/competitor-battlecard-demo.png)

---

### 5. 🔗 SSRF-Protected Fast Dead Link Crawler
Sweeps hundreds of internal and external URLs at ~390 requests/second to catch broken 404s, redirect chains, and SSL errors before they hurt your rankings.

![Dead Link Crawler](https://raw.githubusercontent.com/pixelfogg/Plyxo-CRO-SEO-AIO-AEO-GEO/main/docs/demo/dead-link-crawler-demo.png)

---

## 🛠️ Tech Stack

* **Framework:** Next.js 16 (Turbopack, App Router, React 19 Server Actions)
* **Language:** TypeScript 5.0 (Strict mode)
* **Database & ORM:** PostgreSQL + Drizzle ORM
* **AI Engine:** Google Gemini 2.0 Flash / Pro (with automatic multi-key failover)
* **Styling:** Tailwind CSS v4, Radix UI Primitives, Lucide Icons

---

## 🚀 Quick Start (Runs in 60 Seconds)

### 1. Clone the repository & install dependencies
```bash
git clone https://github.com/pixelfogg/Plyxo-CRO-SEO-AIO-AEO-GEO.git
cd Plyxo-CRO-SEO-AIO-AEO-GEO
npm install
```

### 2. Add your environment variables
```bash
cp .env.example .env.local
```

### 3. Add your free Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/)
```bash
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/plyxo_community
GEMINI_API_KEYS=your_free_gemini_key_here
```

### 4. Initialize the database & run
```bash
npm run setup:community
npm run dev
```

Open **`http://localhost:3000`** — you get immediate, unrestricted access to the entire platform!

---

## 🤝 Let's build together!

Plyxo Community Edition is **100% MIT Licensed**, privacy-first, and self-hosted on your own PostgreSQL instance. Zero tracking, zero telemetry paywalls.

If you find this project helpful or want to test it on your own websites:

👉 **Star the repo on GitHub:** [https://github.com/pixelfogg/Plyxo-CRO-SEO-AIO-AEO-GEO](https://github.com/pixelfogg/Plyxo-CRO-SEO-AIO-AEO-GEO)

I'd love to hear your feedback, bug reports, or feature requests in the comments below! What are you using for SEO & CRO audits today?
