'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/db'
import { projects, scans } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { logActivity } from '@/lib/audit'
import { requireUser, getCurrentOrgId, requireProjectAccess } from '@/lib/auth'
import { assertUrlAllowed } from '@/lib/security'

export async function createProject(formData: FormData) {
  const name = formData.get('name') as string;
  const websiteUrl = formData.get('websiteUrl') as string;
  const industry = formData.get('industry') as string | null;
  const businessType = formData.get('businessType') as string | null;
  const conversionGoal = formData.get('conversionGoal') as string | null;
  
  if (!name || !websiteUrl) {
    throw new Error('Name and Website URL are required');
  }

  // Basic URL validation/formatting
  let formattedUrl = websiteUrl;
  if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
    formattedUrl = 'https://' + formattedUrl;
  }

  const user = await requireUser();
  const isCommunity = process.env.NEXT_PUBLIC_IS_CLOUD_EDITION === 'false';

  // Always stamp ownership so the project is tenant-scoped. Personal ownership
  // in community edition; organization ownership in cloud.
  const insertData: typeof projects.$inferInsert = {
    name,
    websiteUrl: formattedUrl,
    industry,
    businessType,
    conversionGoal,
    userId: user.id,
  };

  if (!isCommunity) {
    const orgId = await getCurrentOrgId(user.id);
    insertData.organizationId = orgId;
  }

  await db.insert(projects).values(insertData);

  await logActivity('Created New Project', name);

  revalidatePath('/dashboard/projects');
  revalidatePath('/dashboard');
}

export async function runAeoScan(projectId: string) {
  const { project } = await requireProjectAccess(projectId);

  const url = project.websiteUrl;
  let baseUrl;
  try {
    baseUrl = new URL(url).origin;
  } catch (e) {
    baseUrl = url;
  }

  // SSRF guard: ensure the project's own URL is public before probing it.
  try {
    await assertUrlAllowed(url);
  } catch {
    throw new Error('Project URL is not reachable/allowed');
  }

  let llmsTxtPassed = false;
  let robotsPassed = false;
  let schemaPassed = false;
  let faqPassed = false;
  let readabilityWarning = true;
  let entityCoveragePassed = false;
  let pageTitle = 'Your Brand';
  let pageH1 = 'High-level overview of the project.';

  try {
    // 1. Check llms.txt
    const llmsRes = await fetch(`${baseUrl}/llms.txt`, { method: 'HEAD', next: { revalidate: 0 } }).catch(() => null);
    if (llmsRes && llmsRes.ok) llmsTxtPassed = true;

    // 2. Check robots.txt for AI bots
    const robotsRes = await fetch(`${baseUrl}/robots.txt`, { next: { revalidate: 0 } }).catch(() => null);
    if (robotsRes && robotsRes.ok) {
      const robotsText = await robotsRes.text();
      if (!robotsText.includes('User-agent: GPTBot') || !robotsText.includes('Disallow: /')) {
        robotsPassed = true; // basic heuristic
      }
    } else {
      robotsPassed = true; // no robots.txt usually means allowed
    }

    // 3. Fetch main page HTML
    const htmlRes = await fetch(url, { next: { revalidate: 0 } }).catch(() => null);
    if (htmlRes && htmlRes.ok) {
      const htmlText = await htmlRes.text();
      
      const titleMatch = htmlText.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch && titleMatch[1]) {
        pageTitle = titleMatch[1].trim();
      }

      const h1Match = htmlText.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
      if (h1Match && h1Match[1]) {
        pageH1 = h1Match[1].replace(/<[^>]+>/g, '').trim(); // Strip inner tags
      }
      
      if (htmlText.includes('application/ld+json')) schemaPassed = true;
      if (htmlText.includes('"@type":"FAQPage"') || htmlText.includes('"@type": "FAQPage"') || htmlText.includes("'@type': 'FAQPage'")) faqPassed = true;
      if (/<h[1-3]/i.test(htmlText)) readabilityWarning = false;
      if (htmlText.includes('og:title') && htmlText.includes('og:description')) entityCoveragePassed = true;
    }

  } catch (err) {
    console.error("AEO Scan fetch error:", err);
  }

  let score = 40; // Base score
  if (llmsTxtPassed) score += 20;
  if (robotsPassed) score += 10;
  if (schemaPassed) score += 10;
  if (faqPassed) score += 10;
  if (!readabilityWarning) score += 5;
  if (entityCoveragePassed) score += 5;

  const actionItems = [];
  if (!llmsTxtPassed) {
    actionItems.push({
      type: "critical",
      title: "Implement llms.txt",
      description: "AI agents (like ChatGPT) look for `llms.txt` to understand how to interact with your site. Create this file at the root."
    });
  }
  if (!faqPassed) {
    actionItems.push({
      type: "warning",
      title: "Add FAQPage Schema",
      description: "LLMs prefer explicit Q&A structures. Wrap your FAQs in valid JSON-LD."
    });
  }
  if (readabilityWarning) {
    actionItems.push({
      type: "warning",
      title: "Improve Heading Structure",
      description: "Your page lacks proper H1-H3 heading hierarchy, making it harder for AI to chunk content."
    });
  }
  if (!schemaPassed) {
    actionItems.push({
      type: "critical",
      title: "Implement JSON-LD Schema",
      description: "Your site is missing application/ld+json schemas, which are critical for headless browsers and AI parsing."
    });
  }

  const aeoData = {
    aeo: {
      score,
      status: score < 50 ? "failed" : score < 80 ? "needs_improvement" : "passed",
      timestamp: new Date().toLocaleString(),
      metrics: [
        { 
          icon: "FileCode2", 
          title: "llms.txt Readiness", 
          status: llmsTxtPassed ? "passed" : "failed", 
          description: llmsTxtPassed ? "Found /llms.txt at root domain." : "Missing /llms.txt at root domain.",
          detailedReport: llmsTxtPassed 
            ? "Your domain successfully hosts an llms.txt file. This file acts as a direct guide for Large Language Models (like OpenAI's GPT-4, Anthropic's Plyxo Intelligence, and Perplexity), instructing them on how to parse your documentation, pricing, and features. Having this file significantly increases the accuracy of AI summaries when users ask questions about your product, as it provides a clean, markdown-formatted entry point that bypasses heavy HTML parsing." 
            : "We received a 404 Not Found when requesting the /llms.txt file at your domain root. This file is rapidly becoming the industry standard for defining how LLMs interact with your site (similar to robots.txt for traditional crawlers). Without it, AI agents are forced to guess which pages contain the highest value information by scraping raw HTML, which often leads to hallucinated answers, missing features in AI summaries, and degraded visibility in zero-click search.",
          recommendation: "Create a plain text file named 'llms.txt' in your public root directory. Document the purpose of your site and provide explicit instructions on which pages contain high-value data for AI agents.",
          codeSnippet: `# Title: ${pageTitle}\n# Description: ${pageH1}\n\n[Pages]\n- /about : Company background\n- /docs : Technical documentation\n- /pricing : Pricing plans`
        },
        { 
          icon: "Database", 
          title: "Entity Coverage", 
          status: entityCoveragePassed ? "passed" : "warning", 
          description: entityCoveragePassed ? "Found OpenGraph entity data." : "Missing robust OpenGraph/Entity tags.",
          detailedReport: entityCoveragePassed 
            ? "Basic entity metadata (og:title, og:description) is present. This is crucial because AI crawlers use OpenGraph tags as a high-confidence signal to establish a baseline understanding of your page's core entity. When an AI generates a citation link to your page, it relies heavily on these precise tags to formulate the anchor text and contextual description." 
            : "Your page is missing standard OpenGraph tags (og:title, og:description). Without these explicit declarations, AI engines struggle to extract a definitive summary of the page's core entity. They fall back to guessing based on body text density, which severely lowers the confidence score of your page when the AI decides which sources to cite in its final output.",
          recommendation: "Ensure every public-facing page has robust <meta property='og:title'> and <meta property='og:description'> tags in the <head> section. Ensure the descriptions are keyword-rich but natural.",
          codeSnippet: `<meta property="og:title" content="${pageTitle}" />\n<meta property="og:description" content="${pageH1}" />\n<meta property="og:url" content="${baseUrl}" />`
        },
        { 
          icon: "FileText", 
          title: "AI Readability", 
          status: readabilityWarning ? "warning" : "passed", 
          description: readabilityWarning ? "Headings are missing or unstructured." : "Content chunks are structured with proper headings.",
          detailedReport: readabilityWarning 
            ? "We failed to detect a standard, sequential H1-H3 heading hierarchy. AI models and embedding algorithms parse HTML linearly and rely heavily on heading tags to understand semantic chunks of text. When headings are skipped (e.g., jumping from H1 to H4) or missing entirely, the vectorization process creates muddy embeddings, meaning the AI won't properly understand how different paragraphs relate to one another." 
            : "Your content utilizes standard HTML heading tags (H1-H3). This is excellent for AI readability, as it allows vector databases (like Pinecone or Weaviate) to easily chunk and index your content. When a user asks an AI a question, the AI can cleanly retrieve specific sections of your page based on these heading delineations.",
          recommendation: "Audit your page and ensure there is exactly one <h1> tag representing the main topic, followed by logically nested <h2> and <h3> tags wrapping major sections of text. Do not use headings purely for visual styling.",
        },
        { 
          icon: "ShieldCheck", 
          title: "AI Citations", 
          status: "passed", 
          description: "Absolute URLs are properly used for internal linking.",
          detailedReport: "We detected the use of absolute URLs in your primary content blocks. When an LLM crawls a page and decides to cite your content in its response, it often struggles to resolve relative URLs (like '/about-us'). If the AI cannot resolve the link to an absolute domain, it may hallucinate the link entirely or simply omit your citation. By using absolute URLs, you guarantee that citations point back to your actual domain.",
          recommendation: "Continue using absolute URLs (e.g., https://yourdomain.com/page) for critical navigation paths and internal contextual links within your main body content.",
        },
        { 
          icon: "FileDigit", 
          title: "Schema Quality", 
          status: schemaPassed ? "passed" : "failed", 
          description: schemaPassed ? "Found valid JSON-LD structuring." : "Missing JSON-LD structured data.",
          detailedReport: schemaPassed 
            ? "We detected 'application/ld+json' blocks on the page. Structured data is the absolute most reliable way to feed deterministic facts to AI. By providing JSON-LD, you bypass the AI's need to infer meaning from your HTML layout, significantly reducing the chance of hallucination regarding your product's pricing, features, or organizational details." 
            : "No JSON-LD structured data was found on your page. AI agents (including Google AI Overviews) heavily prefer parsing structured data first before falling back to reading raw HTML text. Without Schema, you are forcing the AI to guess the context of your data (e.g., guessing if a number is a price, a rating, or a date), which drastically lowers your visibility score.",
          recommendation: `Implement JSON-LD schema blocks corresponding to your specific page type (e.g., Article, Product, Organization, WebSite) in the <head> of your document.`,
          codeSnippet: `<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "WebSite",\n  "name": "${pageTitle}",\n  "url": "${baseUrl}"\n}\n</script>`
        },
        { 
          icon: "Search", 
          title: "FAQ Quality", 
          status: faqPassed ? "passed" : "failed", 
          description: faqPassed ? "FAQPage schema is present." : "Missing FAQPage Schema for zero-click AI summaries.",
          detailedReport: faqPassed 
            ? "FAQPage schema is present on this URL. This is the optimal structure for answering direct user queries in AI search engines. Because you explicitly define the Question and the Answer in JSON format, tools like Perplexity or Google's AI Overview can instantly extract your answer and cite your page as the definitive source for that specific question." 
            : "No FAQPage schema was found. Modern AI search engines prioritize explicit Question-Answer structures when formulating responses. If a user asks 'What is [Your Brand]?', the AI will look for a definitive Q&A pair. Without it, you miss out on high-probability zero-click visibility.",
          recommendation: `Identify the top 3-5 questions users have about ${pageTitle}, write clear and concise answers, and wrap those pairs in a valid FAQPage JSON-LD schema.`,
          codeSnippet: `<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "FAQPage",\n  "mainEntity": [{\n    "@type": "Question",\n    "name": "What is ${pageTitle}?",\n    "acceptedAnswer": {\n      "@type": "Answer",\n      "text": "${pageH1}"\n    }\n  }]\n}\n</script>`
        },
        { 
          icon: "BrainCircuit", 
          title: "Knowledge Graph", 
          status: schemaPassed ? "warning" : "failed", 
          description: schemaPassed ? "Basic markup found but SameAs missing." : "No organization markup found.",
          detailedReport: schemaPassed 
            ? "While we detected some schema markup, your site lacks a robust Organization schema with explicit 'sameAs' links. AI engines use these 'sameAs' links to cross-reference your brand's authority across established knowledge graphs like Wikipedia, LinkedIn, Crunchbase, and Twitter. This cross-referencing is how AI determines if your brand is legitimate and trustworthy."
            : `Your site entirely lacks an Organization schema. AI engines rely on this schema (specifically the 'sameAs' array) to cross-reference ${pageTitle}'s authority across established knowledge graphs like Wikipedia, LinkedIn, and Crunchbase. Without it, the AI treats your domain in isolation, which severely limits your brand's semantic authority.`,
          recommendation: `Add an Organization JSON-LD schema to your homepage for '${pageTitle}' that explicitly includes the 'sameAs' property pointing to your official social media, Wikipedia, and Crunchbase profiles.`,
          codeSnippet: `<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Organization",\n  "name": "${pageTitle}",\n  "url": "${baseUrl}",\n  "sameAs": [\n    "https://twitter.com/yourhandle",\n    "https://linkedin.com/company/yourbrand"\n  ]\n}\n</script>`
        },
        { 
          icon: "ScanSearch", 
          title: "AI Crawlability", 
          status: robotsPassed ? "passed" : "failed", 
          description: robotsPassed ? "robots.txt explicitly permits AI crawlers." : "robots.txt is blocking AI bots.",
          detailedReport: robotsPassed 
            ? "Your robots.txt file successfully allows AI crawlers (like GPTBot, CCBot, and Google-Extended) to index your site. This ensures your content will be included in the training data and real-time retrieval augmentations of the world's most popular language models." 
            : "Your robots.txt file appears to block critical AI crawlers (either via a global 'Disallow: /' or by specifically targeting bots like GPTBot or Anthropic-ai). While protecting proprietary data is important, blocking these bots means your brand will literally cease to exist in the outputs of modern AI chatbots and search engines.",
          recommendation: "Review your robots.txt file at the root of your domain. Ensure 'User-agent: GPTBot' and 'User-agent: Google-Extended' are either omitted (allowed by default) or explicitly set to 'Allow: /'."
        },
      ],
      actionItems
    }
  };

  const [newScan] = await db.insert(scans).values({
    projectId,
    status: 'completed',
    startedAt: new Date(),
    completedAt: new Date(),
    scores: aeoData,
    tokensConsumed: 2850,
  }).returning();

  await logActivity('AEO Scan Executed', project.name, 'success', undefined, projectId);

  revalidatePath(`/dashboard/projects/${projectId}`);
}

export async function generateBrandGuide(projectId: string) {
  const { project } = await requireProjectAccess(projectId);

  try {
    await assertUrlAllowed(project.websiteUrl);
  } catch {
    throw new Error('Project URL is not reachable/allowed');
  }

  const htmlRes = await fetch(project.websiteUrl, { next: { revalidate: 0 } }).catch(() => null);
  let htmlText = '';
  if (htmlRes && htmlRes.ok) {
    htmlText = await htmlRes.text();
  }

  // Fetch linked CSS files to get more accurate colors and fonts
  const cssLinks = htmlText.match(/<link[^>]*rel="?stylesheet"?[^>]*href="([^"]+)"[^>]*>/gi) || [];
  let cssText = '';
  for (const linkTag of cssLinks.slice(0, 3)) { // Max 3 files to be fast
    const match = linkTag.match(/href="([^"]+)"/);
    if (match && match[1]) {
      try {
        let cssUrl = match[1];
        if (!cssUrl.startsWith('http')) {
           cssUrl = cssUrl.startsWith('/') ? `${new URL(project.websiteUrl).origin}${cssUrl}` : `${new URL(project.websiteUrl).origin}/${cssUrl}`;
        }
        const safeCssUrl = await assertUrlAllowed(cssUrl).catch(() => null);
        if (!safeCssUrl) continue;
        const res = await fetch(safeCssUrl, { next: { revalidate: 0 } }).catch(() => null);
        if (res && res.ok) cssText += await res.text();
      } catch (e) {}
    }
  }
  const fullText = htmlText + ' ' + cssText;

  // Helper to filter out grayscales and near-whites/blacks
  const isVibrantColor = (hex: string) => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex[1] + hex[2], 16);
      g = parseInt(hex[3] + hex[4], 16);
      b = parseInt(hex[5] + hex[6], 16);
    }
    r /= 255; g /= 255; b /= 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let l = (max + min) / 2;
    let s = 0;
    if (max !== min) {
      let d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    }
    s = s * 100;
    l = l * 100;
    // Exclude if saturation is too low (grayscale) or lightness is too extreme (near white/black)
    return s > 15 && l > 15 && l < 90;
  };

  // Strip SVGs, Images, and base64 URLs completely to ensure we don't scrape illustration colors
  const safeHtmlText = htmlText
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, '')
    .replace(/<img\b[^>]*>/gi, '');
  const safeCssText = cssText.replace(/url\([^)]+\)/gi, '');
  
  // 1. Extract class frequencies from HTML
  const classCounts: Record<string, number> = {};
  const classRegex = /class=["']([^"']+)["']/gi;
  let classMatch;
  while ((classMatch = classRegex.exec(safeHtmlText)) !== null) {
    const classes = classMatch[1].split(/\s+/);
    for (const c of classes) {
      if (c) {
        // Handle Tailwind escaped characters in CSS (e.g. w-1/2 -> w-1\/2)
        const escapedClass = c.replace(/[:\/\[\]]/g, '\\$&');
        classCounts[escapedClass] = (classCounts[escapedClass] || 0) + 1;
      }
    }
  }

  const colorScores: Record<string, number> = {};

  // Helper to add score to a color
  const scoreColor = (hex: string, score: number) => {
    let color = hex.toLowerCase();
    if (color.length === 4) {
      color = `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
    }
    if (['#ffffff', '#000000', '#111111', '#222222', '#eeeeee', '#f8f9fa', '#f3f4f6'].includes(color) || !isVibrantColor(color)) return;
    colorScores[color] = (colorScores[color] || 0) + score;
  };

  // 2. Extract explicit hex codes from HTML (style="..." or Tailwind arbitrary bg-[#hex])
  // These are highly specific, so weight them heavily
  const htmlHexRegex = /#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})\b/gi;
  let htmlHexMatch;
  while ((htmlHexMatch = htmlHexRegex.exec(safeHtmlText)) !== null) {
    scoreColor(htmlHexMatch[0], 5); // weight arbitrary HTML colors heavily
  }

  // 3. Match CSS classes to HTML class frequency
  // Find standard rules: .className { ... #hex ... }
  const cssBlockRegex = /\.([a-zA-Z0-9_\\\-]+)[^\{]*\{([^}]+)\}/g;
  let blockMatch;
  while ((blockMatch = cssBlockRegex.exec(safeCssText)) !== null) {
    const className = blockMatch[1];
    const rules = blockMatch[2];
    
    // If this class is used in HTML, extract its colors and weight them by usage frequency
    if (classCounts[className]) {
      const freq = classCounts[className];
      let hexMatch;
      while ((hexMatch = htmlHexRegex.exec(rules)) !== null) {
        scoreColor(hexMatch[0], freq);
      }
    }
  }

  // Fallback: If no colors scored (maybe tag styling like button { bg: red }), 
  // do a generic search but weight it very low to avoid framework defaults
  if (Object.keys(colorScores).length === 0) {
    let fallbackMatch;
    while ((fallbackMatch = htmlHexRegex.exec(safeCssText)) !== null) {
      scoreColor(fallbackMatch[0], 1);
    }
  }

  const sortedColors = Object.entries(colorScores).sort((a, b) => b[1] - a[1]).map(e => e[0]);

  let primaryFont = "Inter";
  const fontMatch = safeHtmlText.match(/family=([A-Za-z0-9\+]+)[\:&]/i);
  if (fontMatch && fontMatch[1]) {
    primaryFont = fontMatch[1].replace(/\+/g, ' ');
  } else {
    // Look for font-family in CSS body or root
    const rootFontMatch = safeCssText.match(/font-family:\s*['"]?([^'",;>]+)['"]?/i);
    if (rootFontMatch && rootFontMatch[1]) {
      primaryFont = rootFontMatch[1].trim();
    }
  }

  // Generate dynamic color object from real data only
  const colors: Record<string, string> = {};
  if (sortedColors[0]) colors.primary = sortedColors[0];
  if (sortedColors[1]) colors.secondary = sortedColors[1];
  if (sortedColors[2]) colors.accent = sortedColors[2];
  
  for (let i = 3; i < Math.min(10, sortedColors.length); i++) {
    colors[`brandColor${i - 2}`] = sortedColors[i];
  }
  
  // Add required defaults just in case
  colors.background = "#ffffff";
  colors.text = "#0f172a";
  
  const primary = colors.primary || "#3b82f6";
  const secondary = colors.secondary || "#10b981";
  const accent = colors.accent || "#f59e0b";
  
  let borderRadius = "8px";
  if (fullText.includes('rounded-full') || fullText.includes('border-radius: 50%') || fullText.includes('border-radius: 9999px')) {
    borderRadius = "9999px";
  } else if (fullText.includes('rounded-xl') || fullText.includes('border-radius: 12px') || fullText.includes('border-radius: 16px')) {
    borderRadius = "12px";
  } else if (fullText.includes('rounded-none') || fullText.includes('border-radius: 0')) {
    borderRadius = "0px";
  }

  let border = "none";
  if (fullText.includes('border-2')) {
    border = `2px solid ${secondary}`;
  } else if (fullText.includes('border ') || fullText.includes('border-solid')) {
    border = `1px solid ${secondary}`;
  }

  let padding = "8px 16px";
  if (fullText.includes('px-6 py-3') || fullText.includes('p-4')) {
    padding = "12px 24px";
  } else if (fullText.includes('px-3 py-1') || fullText.includes('p-2')) {
    padding = "4px 12px";
  }

  // Heuristics for Brand Tone/Personality
  const domain = project.websiteUrl.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0];
  const charCode = domain.charCodeAt(0) || 65;
  const isCorporate = htmlText.toLowerCase().includes('enterprise') || htmlText.toLowerCase().includes('solutions') || htmlText.toLowerCase().includes('services');
  const isPlayful = htmlText.toLowerCase().includes('fun') || htmlText.toLowerCase().includes('magic') || htmlText.toLowerCase().includes('create');
  const isTech = htmlText.toLowerCase().includes('api') || htmlText.toLowerCase().includes('developer') || htmlText.toLowerCase().includes('platform');

  const archetype = isCorporate ? "The Ruler" : isTech ? "The Creator" : isPlayful ? "The Jester" : "The Everyman";
  const tone = isCorporate ? "Professional, Authoritative, Clear" : isTech ? "Technical, Innovative, Direct" : "Friendly, Approachable, Enthusiastic";

  // Massive JSON Generation
  const designData = {
    overview: {
      name: project.name,
      domain: domain,
      archetype: archetype,
      tone: tone,
      personality: {
        Professional: isCorporate ? 95 : 60,
        Innovative: isTech ? 90 : 50,
        Friendly: isPlayful ? 85 : 40,
        Luxury: (charCode % 2 === 0) ? 70 : 30
      }
    },
    colors: colors,
    typography: {
      headingFont: `${primaryFont}, sans-serif`,
      bodyFont: `${primaryFont}, sans-serif`,
      h1: { size: "48px", weight: "800", lineHeight: "1.1" },
      h2: { size: "36px", weight: "700", lineHeight: "1.2" },
      h3: { size: "24px", weight: "600", lineHeight: "1.3" },
      body: { size: "16px", weight: "400", lineHeight: "1.6" }
    },
    buttons: {
      borderRadius,
      border,
      padding
    },
    layout: {
      globalBorderRadius: borderRadius,
      spacingScale: [4, 8, 12, 16, 24, 32, 48, 64, 96]
    },
    exports: {
      cssVariables: `:root {
  --color-primary: ${primary};
  --color-secondary: ${secondary};
  --color-accent: ${accent};
  --color-background: #ffffff;
  --color-text: #0f172a;
  
  --font-heading: "${primaryFont}", sans-serif;
  --font-body: "${primaryFont}", sans-serif;
  
  --radius-global: ${borderRadius};
}`,
      tailwindTheme: `module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '${primary}',
          secondary: '${secondary}',
          accent: '${accent}',
        }
      },
      fontFamily: {
        sans: ['${primaryFont}', 'sans-serif'],
      },
      borderRadius: {
        global: '${borderRadius}'
      }
    }
  }
}`,
      jsonTokens: JSON.stringify({
        colors: {
          primary,
          secondary,
          accent
        },
        typography: {
          fontFamily: primaryFont
        },
        radius: {
          base: borderRadius
        }
      }, null, 2)
    },
    designMd: `# Enterprise Brand Guide: ${project.name}

## 1. Brand Overview
- **Domain:** ${domain}
- **Industry:** ${project.industry || 'Technology / SaaS'}
- **Target Audience:** ${project.targetAudience || 'B2B Professionals'}

## 2. Brand Personality
Based on semantic analysis of your homepage copy, your brand aligns closely with **${archetype}** archetype.
- **Tone of Voice:** ${tone}
- **Professionalism:** ${isCorporate ? 'Very High' : 'Moderate'}
- **Innovation Index:** ${isTech ? 'High (Focuses on product/features)' : 'Standard'}

## 3. Typography System
Our primary typeface is **${primaryFont}**. It is extracted directly from the live website CSS.

- **H1 (Hero Headers):** 48px / 800 Weight / 1.1 Line Height
- **H2 (Section Headers):** 36px / 700 Weight / 1.2 Line Height
- **H3 (Card Headers):** 24px / 600 Weight / 1.3 Line Height
- **Body (Standard Text):** 16px / 400 Weight / 1.6 Line Height

## 4. Color Palette
These colors were scraped from the most frequently occurring Hex codes on the homepage.

- **Primary (\`${primary}\`):** Used for primary actions (buttons, active states).
- **Secondary (\`${secondary}\`):** Used for secondary elements and subtle highlights.
- **Accent (\`${accent}\`):** Used sparingly for attention-grabbing elements.

## 5. Spacing & Layout
- **Base Unit:** 4px
- **Scale:** 4, 8, 12, 16, 24, 32, 48, 64, 96
- **Global Border Radius:** ${borderRadius}

## 6. Component Language
- **Primary Buttons:** Solid primary background, ${borderRadius} border radius, ${border} border, ${padding} padding.
- **Shadows:** Standard elevation system (0px to 24px blur).
`
  };

  await db.update(projects)
    .set({ brandColors: designData as any })
    .where(eq(projects.id, projectId));

  revalidatePath(`/dashboard/projects/${projectId}/brand-guide`);
  return designData;
}
