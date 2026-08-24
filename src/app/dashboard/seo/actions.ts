'use server'

import { db } from '@/db'
import { scans, scanIssues, projectPages, webhooks } from '@/db/schema'
import { eq, desc, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import * as cheerio from 'cheerio'
import crypto from 'crypto'
import { geminiGenerateContent, wrapUntrustedContent, stripJsonFences } from '@/lib/ai/gemini'
import { logActivity } from '@/lib/audit'
import { requireUser, assertProjectAccess, requireProjectAccess, getAccessibleProjects } from '@/lib/auth'
import { safeFetch, assertUrlAllowed } from '@/lib/security'

const SEO_ANALYSIS_PROMPT = `
You are an elite Enterprise SEO Architect and Semantic Evaluator.
We have already performed a deterministic technical SEO scan on this webpage.
Your job is ONLY to perform a qualitative, semantic, and intent-based analysis of the content.

We are providing you with a raw extraction of the webpage's plain text content and metadata.
Analyze this data ruthlessly against modern Search Engine requirements (Helpful Content Guidelines, E-E-A-T, Semantic Entity Richness).

You MUST generate 3-7 granular, actionable issues.
Look for:
- Keyword stuffing or unnatural phrasing.
- Thin content, lack of depth, or poor search intent match.
- Missing E-E-A-T signals (Expertise, Experience, Authoritativeness, Trustworthiness).
- Tone or readability issues.

Return a JSON object following this EXACT TypeScript interface:
{
  "issues": [
    {
      "title": string, // Actionable title (e.g. "Thin Content Detected", "Lacking E-E-A-T Signals")
      "description": string, // Detailed explanation and exact steps to resolve
      "priority": string, // "low", "medium", "high", "critical"
      "severity": string // MUST BE "error", "warning", or "notice"
    }
  ],
  "aiSearchHealth": number // 0-100 score indicating how well this content answers typical AI-search (e.g. ChatGPT/Perplexity) queries.
}

Ensure the response is ONLY valid JSON.
`

export async function getProjects() {
  try {
    const user = await requireUser()
    const allProjects = await getAccessibleProjects(user.id)
    return { success: true, projects: allProjects.sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0)) }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getProjectPages(projectId: string) {
  try {
    const user = await requireUser()
    await assertProjectAccess(projectId, user.id)
    const pages = await db.query.projectPages.findMany({
      where: eq(projectPages.projectId, projectId),
      orderBy: [desc(projectPages.discoveredAt)]
    })
    return { success: true, pages }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getSeoScans(projectId: string) {
  try {
    const user = await requireUser()
    await assertProjectAccess(projectId, user.id)
    // Exclude the heavy screenshotBase64 column (full-page JPEGs, MBs each — only
    // the CRO visual report uses it, not the SEO report). Without this the page
    // shipped tens of MB of base64 to the browser on every load.
    const allScans = await db.query.scans.findMany({
      where: eq(scans.projectId, projectId),
      orderBy: [desc(scans.createdAt)],
      columns: {
        id: true,
        projectId: true,
        pageUrl: true,
        status: true,
        scores: true,
        startedAt: true,
        completedAt: true,
        createdAt: true,
      },
      with: {
        issues: true
      }
    })

    // Filter to only scans that actually have SEO issues attached AND were generated
    // by the SEO Intelligence tool (which includes siteHealth in its scores).
    const seoScans = allScans.filter(s => 
      Array.isArray(s.issues) && 
      s.issues.some(i => i.category === 'seo') &&
      s.scores &&
      (s.scores as any).siteHealth !== undefined
    );

    return { success: true, scans: seoScans }
  } catch (error: any) {
    console.error(`getSeoScans error:`, error);
    return { success: false, error: error.message }
  }
}

export async function runSeoIntelligence(projectId: string, url: string) {
  let scanId: string | undefined
  try {
    const { project } = await requireProjectAccess(projectId)

    // 1. Create a pending scan record
    const [scan] = await db.insert(scans).values({
      projectId,
      pageUrl: url,
      status: 'running',
      startedAt: new Date(),
    }).returning()
    scanId = scan.id

    // 2. Fetch and parse HTML (SSRF-guarded)
    const response = await safeFetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }})
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`)
    }
    const html = await response.text()
    const $ = cheerio.load(html)
    
    // Extract metadata
    const title = $('title').text()
    const metaDesc = $('meta[name="description"]').attr('content') || 'Missing'
    const canonical = $('link[rel="canonical"]').attr('href') || 'Missing'
    const robots = $('meta[name="robots"]').attr('content') || 'Missing'
    const ogTitle = $('meta[property="og:title"]').attr('content') || 'Missing'
    const ogDesc = $('meta[property="og:description"]').attr('content') || 'Missing'
    
    // Extract Headers
    const h1s = $('h1').map((_, el) => $(el).text().trim()).get()
    const h2s = $('h2').map((_, el) => $(el).text().trim()).get()
    const h3s = $('h3').map((_, el) => $(el).text().trim()).get()
    
    // Extract Links
    const links = $('a').map((_, el) => ({
      text: $(el).text().trim() || 'No Anchor Text',
      href: $(el).attr('href') || '#',
      rel: $(el).attr('rel') || 'None'
    })).get()
    
    // Extract Images
    const images = $('img').map((_, el) => ({
      src: $(el).attr('src') || 'Unknown',
      alt: $(el).attr('alt') || 'Missing'
    })).get()
    
    // Extract Schema Markup
    const schema = $('script[type="application/ld+json"]').map((_, el) => $(el).html()).get()

    // Clean text
    $('script, style, noscript, iframe, svg').remove()
    const cleanText = $('body').text().replace(/\s{2,}/g, ' ').trim().slice(0, 30000)

    // Deterministic Analysis & Scoring
    const deterministicIssues: any[] = [];
    let siteHealth = 100;
    
    // 1. Meta Tags
    if (!title || title === 'Missing') {
      deterministicIssues.push({ title: 'Missing Title Tag', description: 'The page has no <title> tag.', priority: 'critical', severity: 'error', pagesAffected: 1 });
      siteHealth -= 15;
    } else if (title.length < 30 || title.length > 65) {
      deterministicIssues.push({ title: 'Suboptimal Title Length', description: `Title is ${title.length} characters (optimal is 50-60).`, priority: 'medium', severity: 'warning', pagesAffected: 1 });
      siteHealth -= 5;
    }

    if (!metaDesc || metaDesc === 'Missing') {
      deterministicIssues.push({ title: 'Missing Meta Description', description: 'The page has no meta description.', priority: 'high', severity: 'error', pagesAffected: 1 });
      siteHealth -= 10;
    } else if (metaDesc.length < 100 || metaDesc.length > 160) {
      deterministicIssues.push({ title: 'Suboptimal Meta Description Length', description: `Meta description is ${metaDesc.length} characters (optimal is 150-160).`, priority: 'medium', severity: 'warning', pagesAffected: 1 });
      siteHealth -= 5;
    }

    if (!canonical || canonical === 'Missing') {
      deterministicIssues.push({ title: 'Missing Canonical Tag', description: 'No rel="canonical" tag found.', priority: 'medium', severity: 'warning', pagesAffected: 1 });
      siteHealth -= 5;
    }

    if (robots && robots.toLowerCase().includes('noindex')) {
      deterministicIssues.push({ title: 'Page is Noindex', description: 'The robots meta tag prevents search engines from indexing this page.', priority: 'critical', severity: 'error', pagesAffected: 1 });
      siteHealth -= 50;
    }

    // 2. Headings
    if (h1s.length === 0) {
      deterministicIssues.push({ title: 'Missing H1 Tag', description: 'The page has no H1 tag.', priority: 'high', severity: 'error', pagesAffected: 1 });
      siteHealth -= 10;
    } else if (h1s.length > 1) {
      deterministicIssues.push({ title: 'Multiple H1 Tags', description: `Found ${h1s.length} H1 tags. Best practice is exactly one.`, priority: 'low', severity: 'notice', pagesAffected: 1 });
      siteHealth -= 2;
    }

    // 3. Images
    const missingAltImages = images.filter(i => !i.alt || i.alt === 'Missing' || i.alt.trim() === '');
    if (missingAltImages.length > 0) {
      deterministicIssues.push({ title: 'Images Missing Alt Text', description: `${missingAltImages.length} images are missing alt attributes (e.g. ${missingAltImages[0].src}).`, priority: 'medium', severity: 'warning', pagesAffected: 1 });
      siteHealth -= Math.min(10, missingAltImages.length * 2);
    }

    // 4. Links
    const internalLinks = links.filter(l => l.href.startsWith('/') || l.href.startsWith(url));
    const missingAnchorLinks = links.filter(l => !l.text || l.text.trim() === '' || l.text === 'No Anchor Text');
    if (missingAnchorLinks.length > 0) {
      deterministicIssues.push({ title: 'Missing Anchor Text', description: `${missingAnchorLinks.length} links have no descriptive anchor text.`, priority: 'medium', severity: 'warning', pagesAffected: 1 });
      siteHealth -= Math.min(10, missingAnchorLinks.length);
    }

    // 5. Schema / OG
    if (!ogTitle || ogTitle === 'Missing') {
      deterministicIssues.push({ title: 'Missing OpenGraph Tags', description: 'No og:title tag found. Social sharing previews will be suboptimal.', priority: 'low', severity: 'notice', pagesAffected: 1 });
    }
    if (schema.length === 0) {
      deterministicIssues.push({ title: 'No Schema Markup Found', description: 'No JSON-LD structured data detected in the static HTML.', priority: 'low', severity: 'notice', pagesAffected: 1 });
    }

    siteHealth = Math.max(0, siteHealth);

    const fullContext = `
    --- META DIRECTIVES ---
    URL: ${url}
    Title: ${title}
    Meta Description: ${metaDesc}
    
    --- PAGE CONTENT (Clean Text) ---
    ${cleanText}
    `;

    // 3. Call Gemini
    const aiResponse = await geminiGenerateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: SEO_ANALYSIS_PROMPT + wrapUntrustedContent('extracted webpage content', fullContext) }] }
      ],
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1,
        topP: 0.8
      }
    })

    if (!aiResponse.text) {
      throw new Error("Empty response from AI")
    }

    const parsed = JSON.parse(stripJsonFences(aiResponse.text))
    
    const aiIssues = parsed.issues || [];
    const allIssues = [...deterministicIssues, ...aiIssues];
    
    const scores = {
      siteHealth,
      aiSearchHealth: parsed.aiSearchHealth || 50,
      thematic: {
        robotsTxt: 100, // Not measurable per page
        crawlability: (robots && robots.toLowerCase().includes('noindex')) ? 0 : 100,
        https: url.startsWith('https') ? 100 : 0,
        internationalSeo: 50, // Hard to measure statically without hreflang parse
        coreWebVitals: 50,
        sitePerformance: 50,
        internalLinking: internalLinks.length > 0 ? 100 : 0,
        markup: schema.length > 0 ? 100 : 50
      },
      statistics: {
        crawledPages: 1,
        healthyPages: siteHealth >= 80 ? 1 : 0,
        brokenPages: siteHealth < 50 ? 1 : 0,
        issuesPages: siteHealth < 80 && siteHealth >= 50 ? 1 : 0,
        httpCodes: { "5xx": 0, "4xx": 0, "3xx": 0, "2xx": 1 },
        sitemap: { inSitemap: 0, notInSitemap: 0 },
        crawlDepth: { "1click": 1, "2clicks": 0, "3clicks": 0, "more": 0 },
        internalLinks: { 
          "1": internalLinks.length === 1 ? 1 : 0, 
          "2to5": internalLinks.length > 1 && internalLinks.length <= 5 ? 1 : 0, 
          "6to15": internalLinks.length > 5 && internalLinks.length <= 15 ? 1 : 0, 
          "16to50": internalLinks.length > 15 ? 1 : 0 
        },
        canonicalization: { 
          self: canonical === url ? 1 : 0, 
          other: (canonical !== url && canonical !== 'Missing') ? 1 : 0, 
          missing: canonical === 'Missing' ? 1 : 0 
        },
        markup: { 
          microdata: 0, 
          jsonLd: schema.length > 0 ? 1 : 0, 
          openGraph: ogTitle !== 'Missing' ? 1 : 0, 
          twitter: 0, 
          none: (schema.length === 0 && ogTitle === 'Missing') ? 1 : 0 
        },
        hreflang: { issues: 0, noHreflang: 1, valid: 0 },
        amp: { present: 0, missing: 1 }
      }
    }

    const promptTokens = aiResponse.usageMetadata?.promptTokenCount || Math.ceil((SEO_ANALYSIS_PROMPT.length + fullContext.length) / 4);
    const candidateTokens = aiResponse.usageMetadata?.candidatesTokenCount || Math.ceil((aiResponse.text?.length || 0) / 4);
    const tokensConsumed = aiResponse.usageMetadata?.totalTokenCount || (promptTokens + candidateTokens);

    // 4. Update DB
    await db.update(scans).set({
      status: 'completed',
      completedAt: new Date(),
      scores: scores,
      tokensConsumed,
    }).where(eq(scans.id, scan.id))
    
    if (allIssues.length > 0) {
      const issueRecords = allIssues.map((i: any) => ({
        scanId: scan.id,
        category: 'seo',
        title: i.title,
        description: i.description,
        priority: i.priority || 'medium',
        severity: i.severity || 'notice',
        businessImpact: String(i.pagesAffected || 1)
      }))
      await db.insert(scanIssues).values(issueRecords)
    }

    // 5. Discover and Save Internal Pages
    try {
      const baseUrlObj = new URL(url);
      const baseUrl = baseUrlObj.origin;
      const internalHrefs = new Set<string>();
      
      links.forEach(l => {
        try {
          if (!l.href || l.href.startsWith('mailto:') || l.href.startsWith('tel:') || l.href === '#' || l.href.startsWith('javascript:')) return;
          
          let fullUrl = '';
          if (l.href.startsWith('/')) {
            fullUrl = baseUrl + l.href;
          } else if (l.href.startsWith(baseUrl)) {
            fullUrl = l.href;
          }
          
          if (fullUrl) {
            // Remove hash fragments for cleaner URLs
            const cleanUrl = fullUrl.split('#')[0];
            // Ensure it's not exactly the current URL to avoid self-referencing
            if (cleanUrl !== url && cleanUrl !== url + '/') {
              internalHrefs.add(cleanUrl);
            }
          }
        } catch (e) {}
      });

      if (internalHrefs.size > 0) {
        // Fetch existing pages to avoid unique constraint violations
        const existingPages = await db.query.projectPages.findMany({
          where: eq(projectPages.projectId, projectId)
        });
        const existingUrls = new Set(existingPages.map(p => p.url));
        
        const newPages = Array.from(internalHrefs)
          .filter(u => !existingUrls.has(u))
          .map(u => ({
            projectId,
            url: u,
            status: 'discovered'
          }));
          
        if (newPages.length > 0) {
          // Bulk insert up to 50 new links at a time to prevent payload too large errors
          await db.insert(projectPages).values(newPages.slice(0, 50));
        }
      }
    } catch (e) {
      console.error("Failed to process internal links:", e);
    }

    // 6. Webhook Trigger (scan.completed)
    try {
      const activeWebhooks = await db.query.webhooks.findMany({
        where: and(
          eq(webhooks.projectId, projectId),
          eq(webhooks.isActive, true)
        )
      });
      
      const payload = {
        event: "scan.completed",
        projectId,
        url,
        timestamp: new Date().toISOString(),
        scores: parsed.scores,
        issues: parsed.issues
      };

      const body = JSON.stringify(payload);
      for (const hook of activeWebhooks) {
        // If event filter exists and doesn't contain our event, skip
        if (hook.events && Array.isArray(hook.events) && !hook.events.includes("scan.completed")) continue;

        const headers: Record<string, string> = {
          "Content-Type": "application/json"
        };
        // Sign the body with an HMAC — never send the raw secret.
        if (hook.secret) {
          headers["X-Plyxo-Signature"] = crypto.createHmac('sha256', hook.secret).update(body).digest('hex');
        }

        // SSRF-guard the (user-configured) delivery URL.
        assertUrlAllowed(hook.url)
          .then((safeUrl) => fetch(safeUrl, { method: "POST", headers, body }))
          .catch(err => console.error(`Webhook failed for ${hook.url}`, err));
      }
    } catch (e) {
      console.error("Failed to trigger webhooks:", e);
    }

    await logActivity('SEO Scan Executed', url, 'success', undefined, projectId);

    revalidatePath(`/dashboard/seo/${projectId}`)
    return { success: true, scanId: scan.id }
  } catch (error: any) {
    console.error("SEO Analysis failed:", error)
    // Don't leave the scan stuck in "running".
    if (scanId) {
      await db.update(scans)
        .set({ status: 'failed', completedAt: new Date() })
        .where(eq(scans.id, scanId))
        .catch(() => {})
    }
    return { success: false, error: error.message }
  }
}

export async function crawlWebsite(projectId: string, startUrl: string) {
  try {
    const { project } = await requireProjectAccess(projectId);
    
    // Fetch and parse HTML
    const response = await safeFetch(startUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }});
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const baseUrlObj = new URL(startUrl);
    const baseUrl = baseUrlObj.origin;
    const internalHrefs = new Set<string>();
    
    // Add the start URL itself
    internalHrefs.add(startUrl.split('#')[0]);
    
      $('a').each((_, el) => {
      try {
        const href = $(el).attr('href');
        if (!href || href.startsWith('mailto:') || href.startsWith('tel:') || href === '#' || href.startsWith('javascript:')) return;
        
        try {
          const urlObj = new URL(href, baseUrl);
          // Only add internal links matching the same origin
          if (urlObj.origin === baseUrl) {
            const cleanUrl = urlObj.href.split('#')[0];
            internalHrefs.add(cleanUrl);
          }
        } catch (urlErr) {
          // Ignore invalid URLs
        }
      } catch (e) {}
    });

    if (internalHrefs.size > 0) {
      // Fetch existing pages to avoid unique constraint violations
      const existingPages = await db.query.projectPages.findMany({
        where: eq(projectPages.projectId, projectId)
      });
      const existingUrls = new Set(existingPages.map(p => p.url));
      
      const newPages = Array.from(internalHrefs)
        .filter(u => !existingUrls.has(u))
        .map(u => ({
          projectId,
          url: u,
          status: 'discovered'
        }));
        
      if (newPages.length > 0) {
        // Bulk insert up to 100 new links
        await db.insert(projectPages).values(newPages.slice(0, 100));
      }
    }
    
    revalidatePath(`/dashboard/seo/${projectId}`);
    return { success: true, count: internalHrefs.size };
  } catch (error: any) {
    console.error("Crawl failed:", error);
    return { success: false, error: error.message };
  }
}
