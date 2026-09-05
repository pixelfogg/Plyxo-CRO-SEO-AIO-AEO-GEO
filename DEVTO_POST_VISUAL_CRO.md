---
title: How We Built an AI Visual CRO Auditor That Draws Bounding Boxes Over UX Friction
published: true
tags: webdev, javascript, ai, opensource
cover_image: https://raw.githubusercontent.com/pixelfogg/Plyxo-CRO-SEO-AIO-AEO-GEO/main/public/images/og-visual-cro.jpg
canonical_url: https://plyxo.org
---

When traditional automated audit tools (like Google Lighthouse) scan a webpage, they test for **DOM metrics and performance**: Largest Contentful Paint (LCP), missing ARIA labels, image dimensions, or meta tags.

**What they CANNOT tell you:**
- *"Your primary CTA button blends directly into the hero gradient background."*
- *"Your pricing table has cognitive overload and 5 competing badge colors."*
- *"Your sign-up form creates visual friction by hiding password requirements."*

To solve this, we built an **open-source Visual CRO (Conversion Rate Optimization) engine** for [Plyxo Community Edition](https://github.com/pixelfogg/Plyxo-CRO-SEO-AIO-AEO-GEO). 

It captures high-DPI full-page screenshots, feeds them into multimodal vision models, returns **normalized coordinate bounding boxes `[ymin, xmin, ymax, xmax]` over friction zones**, and generates copy-paste Tailwind CSS fixes.

Here is how the architecture works under the hood.

---

## 🏗️ The Architecture: From URL to Visual Coordinates

```
[Target URL] 
     ↓
[Puppeteer / Headless Chrome] 
     ↓ (High-DPI Screenshot + DOM Heuristics)
[Multimodal Vision Model] 
     ↓ (Normalized 0-1000 Coordinates JSON)
[Interactive Canvas Overlay + Tailwind Code Remediation]
```

---

## 1. High-DPI Viewport Rendering & Layout Shifts

Standard screenshots often miss sticky headers, modals, or hydration popups. We use a headless Chrome pipeline that enforces high-DPI rendering and waits for network idle:

```typescript
// packages/core/src/scanners/screenshot.ts
import puppeteer from 'puppeteer';

export async function captureViewport(url: string) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: 1440,
    height: 900,
    deviceScaleFactor: 2 // High DPI for crisp font & badge recognition
  });

  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
  
  // Clean scroll to trigger lazy-loaded sections
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
  await new Promise(r => setTimeout(r, 600));
  await page.evaluate(() => window.scrollTo(0, 0));

  const screenshotBuffer = await page.screenshot({
    fullPage: false, // Hero/above-the-fold is where 80% of CRO friction happens
    encoding: 'base64'
  });

  await browser.close();
  return screenshotBuffer;
}
```

---

## 2. Prompting Multimodal Vision for Normalized Bounding Boxes

Standard LLMs return chatty explanations. For an interactive UI overlay, we need **structured JSON with normalized visual coordinates (0-1000 scale)**.

Here is the system prompt and structured schema we pass to the vision model:

```typescript
const SYSTEM_PROMPT = `
You are an expert Conversion Rate Optimization (CRO) and UX Design Auditor.
Analyze the provided desktop screenshot of a landing page.

Identify top UX/CRO friction points:
1. Contrast/Visibility issues (unclear CTAs)
2. Visual clutter / Cognitive overload
3. Lack of immediate value proposition / hierarchy
4. Trust signal deficiencies

For each issue, you MUST provide:
- 'title': Short descriptive title
- 'severity': 'critical' | 'warning' | 'info'
- 'box_2d': Normalized coordinates [ymin, xmin, ymax, xmax] between 0 and 1000
- 'frictionReason': Why this hurts conversion
- 'proposedCodeFix': Concrete Tailwind CSS / HTML remediation code
`;
```

---

## 3. Rendering the Interactive Canvas Overlay

Once the backend returns the normalized coordinate array, we render dynamic highlight boxes that scale responsively with any container:

```tsx
// components/VisualCroOverlay.tsx
import React, { useState } from 'react';

interface FrictionBox {
  id: string;
  title: string;
  severity: 'critical' | 'warning' | 'info';
  box_2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax]
  proposedCodeFix: string;
}

export function VisualCroOverlay({ 
  screenshotUrl, 
  issues 
}: { 
  screenshotUrl: string; 
  issues: FrictionBox[] 
}) {
  const [selectedIssue, setSelectedIssue] = useState<FrictionBox | null>(null);

  return (
    <div className="relative inline-block w-full border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      <img src={screenshotUrl} alt="Audited Page" className="w-full h-auto block" />
      
      {/* Visual Bounding Boxes */}
      {issues.map((issue) => {
        const [ymin, xmin, ymax, xmax] = issue.box_2d;
        const top = `${(ymin / 1000) * 100}%`;
        const left = `${(xmin / 1000) * 100}%`;
        const height = `${((ymax - ymin) / 1000) * 100}%`;
        const width = `${((xmax - xmin) / 1000) * 100}%`;

        const colorMap = {
          critical: 'border-rose-500 bg-rose-500/20 text-rose-300',
          warning: 'border-amber-500 bg-amber-500/20 text-amber-300',
          info: 'border-blue-500 bg-blue-500/20 text-blue-300'
        };

        return (
          <div
            key={issue.id}
            onClick={() => setSelectedIssue(issue)}
            style={{ top, left, height, width }}
            className={`absolute border-2 cursor-pointer transition-all hover:scale-[1.02] ${colorMap[issue.severity]}`}
          >
            <span className="absolute -top-6 left-0 text-xs px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 font-mono">
              {issue.title}
            </span>
          </div>
        );
      })}
    </div>
  );
}
```

---

## 4. Generating Concrete Code Remediation

Instead of just telling the developer *"your button lacks contrast"*, the engine generates the replacement JSX:

```tsx
// Before (Detected Friction)
<button className="bg-indigo-400 text-indigo-100 py-2 px-4 rounded">
  Get Started
</button>

// Recommended Fix (High-Contrast Visual Hierarchy + Micro-interaction)
<button className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all duration-200">
  Start Free Audit →
</button>
```

---

## 🚀 Try It & Contribute (100% Open Source)

We packaged this visual engine into **Plyxo Community Edition**, a free, MIT-licensed audit platform that combines:
- 🎨 **Visual CRO & Friction Bounding Boxes**
- ⚡ **Core Web Vitals & Real-Time Performance Audits**
- 🤖 **AEO / GEO Engine** (Generative Engine Optimization for ChatGPT/Perplexity)
- 🔌 **Model Context Protocol (MCP) Server** for Claude Desktop & Cursor IDE

### Quick Start with Docker:
```bash
git clone https://github.com/pixelfogg/Plyxo-CRO-SEO-AIO-AEO-GEO.git
cd Plyxo-CRO-SEO-AIO-AEO-GEO
docker compose up -d
```

Check out the code, run it locally on your own SaaS landing page, or star the repo on GitHub:

⭐ **GitHub Repo:** [github.com/pixelfogg/Plyxo-CRO-SEO-AIO-AEO-GEO](https://github.com/pixelfogg/Plyxo-CRO-SEO-AIO-AEO-GEO)  
🌐 **Live Demo:** [plyxo.org](https://plyxo.org)

---

*What techniques are you using to audit landing page conversion rates? Let's discuss in the comments below!*
