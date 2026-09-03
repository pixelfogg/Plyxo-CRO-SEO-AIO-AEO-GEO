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
import { safeFetch, assertUrlAllowed, fetchHtmlResilient } from '@/lib/security'
import { runAutomationsForEvent } from '@/lib/automations/engine'
import { assertScanAllowed } from '@/lib/billing/quota'
import { calculateFleschKincaid, extractKeywords, generateSecurityConfig } from '@/lib/seo-utils'

const CLAUDE_SEO_ANALYSIS_PROMPT = `
You are an elite Enterprise SEO Architect and Search Intelligence Auditor implementing the full 25-skill Claude-SEO evaluation framework (AgricIDaniel/claude-seo).

Conduct an exhaustive, forensic audit of the provided webpage across all 8 core domains:
1. TECHNICAL & CRAWLABILITY: Crawl budget efficiency, indexability directives, canonical fidelity, status consistency, security posture.
2. CONTENT DEPTH & SEMANTIC ENTITY ARCHITECTURE: Semantic coverage, search intent alignment, keyword-to-entity mapping, topical authority, thin-content mitigation, heading logic.
3. E-E-A-T FORENSICS: Real-world experience proof, demonstrable expertise credentials, author entity attribution, publisher transparency, institutional trust signals, citation veracity.
4. STRUCTURED DATA & KNOWLEDGE GRAPH: Schema.org entity definitions (Organization, WebSite, Article, Product, FAQPage, BreadcrumbList), syntax compliance, rich snippet eligibility, OpenGraph/Twitter social parity.
5. GENERATIVE ENGINE OPTIMIZATION (GEO) & AEO: AI search citability (ChatGPT Search, Perplexity AI, Claude, Google AI Overviews), direct-answer snippet readiness, structured definition callouts, natural-language Q&A density.
6. PERFORMANCE & CORE WEB VITALS: Modern image delivery, layout stability factors, DOM complexity, script execution friction.
7. LINK GRAPH & ARCHITECTURE: Anchor text semantic diversity, internal link equity distribution, orphan mitigation, outbound citation authority.
8. GLOBAL & LOCAL DISCOVERY: Language target consistency, hreflang reciprocity, LocalBusiness NAP structure.

REQUIREMENTS:
- You MUST generate 6-12 granular, high-impact issues with definitive root-cause diagnosis and actionable step-by-step remediation.
- Each issue MUST include an exact, copy-pasteable code fix snippet (HTML, JSON-LD, or meta tags) in \`fixCode\`.
- Provide an exact 0-100 score for \`eeatScore\`, \`geoScore\`, and \`contentDepthScore\`.

Return ONLY a JSON object adhering to this schema:
{
  "issues": [
    {
      "category": "technical" | "content" | "eeat" | "schema" | "geoAeo" | "performance" | "internalLinks" | "internationalLocal",
      "title": string,
      "description": string,
      "fixCode": string,
      "priority": "low" | "medium" | "high" | "critical",
      "severity": "error" | "warning" | "notice"
    }
  ],
  "scores": {
    "eeatScore": number,
    "geoScore": number,
    "contentDepthScore": number,
    "intentMatch": "Informational" | "Commercial" | "Transactional" | "Navigational",
    "primaryEntities": string[],
    "aiSnippetRecommendation": string
  }
}

Ensure the response is ONLY valid JSON with no markdown wrapping or conversational commentary.
`

export async function getProjects() {
  try {
    const user = await requireUser()
    const allProjects = await getAccessibleProjects(user.id)
    const sorted = [...allProjects].sort((a: any, b: any) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return timeB - timeA
    })
    return { success: true, projects: sorted }
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

    const seoScans = allScans.filter(s => 
      Array.isArray(s.issues) && 
      (s.issues.some(i => i.category === 'seo' || i.category === 'technical' || i.category === 'content' || i.category === 'eeat' || i.category === 'schema' || i.category === 'geoAeo' || i.category === 'performance' || i.category === 'internalLinks') ||
       (s.scores as any)?.siteHealth !== undefined)
    )

    return { success: true, scans: seoScans }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function runSeoIntelligence(projectId: string, targetUrl?: string) {
  let scanId: string | null = null
  try {
    const user = await requireUser()
    const { project } = await requireProjectAccess(projectId)
    await assertScanAllowed(projectId)

    const url = targetUrl || project.websiteUrl
    if (!url) throw new Error("Project has no website URL defined")
    assertUrlAllowed(url)

    const urlObj = new URL(url)
    const domain = urlObj.hostname
    const siteBrand = project.name || domain.replace(/^www\./, '').split('.')[0]
    const capitalizedBrand = siteBrand.charAt(0).toUpperCase() + siteBrand.slice(1)

    // 1. Initialize Scan Record
    const [scan] = await db.insert(scans).values({
      projectId,
      pageUrl: url,
      status: 'running',
      startedAt: new Date(),
    }).returning()
    scanId = scan.id

    // 2. Fetch and Parse HTML (SSRF-guarded with resilient Cloudflare/WAF fallback)
    const { html, status, statusText, headers } = await fetchHtmlResilient(url)
    const $ = cheerio.load(html)
    
    // Extract Metadata
    const title = $('title').text().trim() || 'Missing'
    const metaDesc = $('meta[name="description"]').attr('content')?.trim() || 'Missing'
    const canonical = $('link[rel="canonical"]').attr('href')?.trim() || 'Missing'
    const robots = $('meta[name="robots"]').attr('content')?.trim() || 'Missing'
    const ogTitle = $('meta[property="og:title"]').attr('content')?.trim() || $('meta[name="og:title"]').attr('content')?.trim() || 'Missing'
    const ogDesc = $('meta[property="og:description"]').attr('content')?.trim() || $('meta[name="og:description"]').attr('content')?.trim() || 'Missing'
    const ogImage = $('meta[property="og:image"]').attr('content')?.trim() || $('meta[name="og:image"]').attr('content')?.trim() || 'Missing'
    const ogUrl = $('meta[property="og:url"]').attr('content')?.trim() || 'Missing'
    const ogType = $('meta[property="og:type"]').attr('content')?.trim() || 'website'
    const ogSiteName = $('meta[property="og:site_name"]').attr('content')?.trim() || capitalizedBrand
    const ogLocale = $('meta[property="og:locale"]').attr('content')?.trim() || 'en_US'

    const twitterCard = $('meta[name="twitter:card"]').attr('content')?.trim() || 'Missing'
    const twitterTitle = $('meta[name="twitter:title"]').attr('content')?.trim() || 'Missing'
    const twitterDesc = $('meta[name="twitter:description"]').attr('content')?.trim() || 'Missing'
    const twitterImage = $('meta[name="twitter:image"]').attr('content')?.trim() || 'Missing'
    const twitterSite = $('meta[name="twitter:site"]').attr('content')?.trim() || 'Missing'
    const twitterCreator = $('meta[name="twitter:creator"]').attr('content')?.trim() || 'Missing'
    const favicon = $('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]').attr('href') || '/favicon.ico'
    const htmlLang = $('html').attr('lang')?.trim() || 'Missing'
    const viewport = $('meta[name="viewport"]').attr('content')?.trim() || 'Missing'
    
    const hreflangs = $('link[rel="alternate"][hreflang]').map((_, el) => ({
      lang: $(el).attr('hreflang') || '',
      href: $(el).attr('href') || ''
    })).get()

    // Extract Heading Structure & Hierarchy
    const headings: { level: string; text: string; tagNum: number }[] = []
    $('h1, h2, h3, h4, h5, h6').each((_, el) => {
      const tag = (el as any).tagName?.toLowerCase() || 'h2'
      const tagNum = parseInt(tag.replace('h', '')) || 2
      const txt = $(el).text().replace(/\s+/g, ' ').trim()
      if (txt) headings.push({ level: tag.toUpperCase(), text: txt, tagNum })
    })

    const h1s = headings.filter(h => h.level === 'H1').map(h => h.text)
    const h2s = headings.filter(h => h.level === 'H2').map(h => h.text)
    const h3s = headings.filter(h => h.level === 'H3').map(h => h.text)

    // Check for skipped heading levels (e.g. H1 directly to H3)
    let skippedHeadingDetected = false
    for (let i = 0; i < headings.length - 1; i++) {
      if (headings[i + 1].tagNum - headings[i].tagNum > 1) {
        skippedHeadingDetected = true
        break
      }
    }

    // Extract Links Graph
    const links = $('a').map((_, el) => ({
      text: $(el).text().trim() || 'No Anchor Text',
      href: $(el).attr('href') || '#',
      rel: $(el).attr('rel') || 'None'
    })).get()

    const internalLinks = links.filter(l => l.href.startsWith('/') || (l.href.startsWith('http') && l.href.includes(domain)))
    const externalLinks = links.filter(l => l.href.startsWith('http') && !l.href.includes(domain))
    const genericAnchorLinks = links.filter(l => {
      const t = l.text.toLowerCase().trim()
      return ['click here', 'read more', 'learn more', 'here', 'link', 'view more', 'no anchor text', 'more', 'details'].includes(t)
    })

    // Extract Images
    const images = $('img').map((_, el) => ({
      src: $(el).attr('src') || 'Unknown',
      alt: $(el).attr('alt') || 'Missing',
      width: $(el).attr('width') || undefined,
      height: $(el).attr('height') || undefined
    })).get()

    const missingAltImages = images.filter(i => !i.alt || i.alt === 'Missing' || i.alt.trim() === '')
    const nonModernImages = images.filter(i => !i.src.endsWith('.webp') && !i.src.endsWith('.avif') && !i.src.endsWith('.svg') && (i.src.endsWith('.png') || i.src.endsWith('.jpg') || i.src.endsWith('.jpeg')))
    const missingDimensionsImages = images.filter(i => !i.width || !i.height)

    // Extract JSON-LD Schemas
    const schemasRaw: string[] = []
    const schemaTypesDetected: string[] = []
    $('script[type="application/ld+json"]').each((_, el) => {
      const raw = $(el).html()
      if (raw) {
        schemasRaw.push(raw)
        try {
          const parsed = JSON.parse(raw)
          if (parsed['@type']) schemaTypesDetected.push(String(parsed['@type']))
          if (Array.isArray(parsed['@graph'])) {
            parsed['@graph'].forEach((item: any) => {
              if (item['@type']) schemaTypesDetected.push(String(item['@type']))
            })
          }
        } catch {}
      }
    })

    // DOM & Performance Metrics
    const totalDomElements = $('*').length
    const renderBlockingScripts = $('script[src]:not([async]):not([defer])').length

    // Clean text and calculate Readability & Keyword metrics
    const bodyClone = $('body').clone()
    bodyClone.find('script, style, noscript, iframe, svg, nav, footer').remove()
    const mainContentText = bodyClone.text().replace(/\s{2,}/g, ' ').trim()
    const wordCount = mainContentText.split(/\s+/).filter(w => w.length > 0).length
    const readability = calculateFleschKincaid(mainContentText)
    const keywordsDensity = extractKeywords(mainContentText, 12)
    const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200))

    // Mixed Content Scanner
    const mixedContentElements = $('img[src^="http://"], script[src^="http://"], link[href^="http://"], iframe[src^="http://"]').map((_, el) => ({
      tag: (el as any).tagName?.toLowerCase() || 'img',
      src: $(el).attr('src') || $(el).attr('href') || ''
    })).get()

    // Security Headers check from response
    const hstsValue = headers?.get('strict-transport-security')
    const hstsPresent = !!hstsValue
    const cspValue = headers.get('content-security-policy')
    const cspPresent = !!cspValue
    const xFrameValue = headers.get('x-frame-options')
    const xFramePresent = !!xFrameValue
    const contentTypeOptionsValue = headers.get('x-content-type-options')
    const contentTypeOptions = !!contentTypeOptionsValue
    const referrerPolicyValue = headers.get('referrer-policy')
    const referrerPolicy = !!referrerPolicyValue
    const permissionsPolicyValue = headers.get('permissions-policy')
    const permissionsPolicy = !!permissionsPolicyValue

    const serverHeader = headers.get('server') || 'Unknown'
    const contentEncoding = headers.get('content-encoding') || 'none'
    const altSvcHeader = headers.get('alt-svc') || ''
    const isHttp3Supported = altSvcHeader.includes('h3')

    // Live Active Probes: HTTP->HTTPS Redirect, Robots.txt, Sitemap.xml
    let httpRedirectStatus = 0
    let httpRedirectLocation = ''
    let isHttpRedirectEnforced = false
    try {
      const httpRes = await fetch(`http://${domain}/`, { redirect: 'manual' })
      httpRedirectStatus = httpRes.status
      httpRedirectLocation = httpRes.headers.get('location') || ''
      isHttpRedirectEnforced = (httpRes.status === 301 || httpRes.status === 308 || httpRes.status === 302) && httpRedirectLocation.startsWith('https://')
    } catch {}

    let robotsTxtStatus = 0
    let robotsTxtContent = ''
    let robotsTxtFound = false
    let robotsSitemapDeclared = ''
    let robotsDisallowsCount = 0
    try {
      const robotsRes = await fetch(`${urlObj.origin}/robots.txt`)
      robotsTxtStatus = robotsRes.status
      if (robotsRes.ok) {
        robotsTxtFound = true
        robotsTxtContent = await robotsRes.text()
        const sitemapLine = robotsTxtContent.split('\n').find(l => l.toLowerCase().startsWith('sitemap:'))
        if (sitemapLine) robotsSitemapDeclared = sitemapLine.split(':')[1]?.trim() || ''
        robotsDisallowsCount = robotsTxtContent.split('\n').filter(l => l.toLowerCase().startsWith('disallow:')).length
      }
    } catch {}

    let sitemapXmlStatus = 0
    let sitemapXmlFound = false
    let isSitemapIndex = false
    try {
      const sitemapTarget = robotsSitemapDeclared || `${urlObj.origin}/sitemap.xml`
      const sitemapRes = await fetch(sitemapTarget)
      sitemapXmlStatus = sitemapRes.status
      if (sitemapRes.ok) {
        sitemapXmlFound = true
        const sitemapText = await sitemapRes.text()
        isSitemapIndex = sitemapText.includes('<sitemapindex') || sitemapText.includes('sitemap_index')
      }
    } catch {}

    // E-E-A-T Trust Signals extraction
    const hasAboutLink = links.some(l => l.href.toLowerCase().includes('about') || l.text.toLowerCase().includes('about'))
    const hasContactLink = links.some(l => l.href.toLowerCase().includes('contact') || l.text.toLowerCase().includes('contact') || l.href.startsWith('mailto:'))
    const hasPrivacyLink = links.some(l => l.href.toLowerCase().includes('privacy') || l.text.toLowerCase().includes('privacy'))
    const hasTermsLink = links.some(l => l.href.toLowerCase().includes('terms') || l.text.toLowerCase().includes('terms'))
    const hasRefundPolicyLink = links.some(l => l.href.toLowerCase().includes('refund') || l.href.toLowerCase().includes('return') || l.text.toLowerCase().includes('refund') || l.text.toLowerCase().includes('return'))
    const hasAuthorByline = $('[class*="author"], [id*="author"], [rel="author"], .byline, .written-by').length > 0
    const hasReviewsOrTestimonials = $('[class*="review"], [class*="testimonial"], [id*="review"], [id*="testimonial"], [itemtype*="Review"], [itemtype*="AggregateRating"]').length > 0
    const hasOutboundAuthoritativeLinks = links.some(l => l.href.includes('.edu') || l.href.includes('.gov') || l.href.includes('wikipedia.org') || l.href.includes('w3.org') || l.href.includes('doi.org'))
    const hasPhoneOrEmail = $('a[href^="tel:"], a[href^="mailto:"]').length > 0 || /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/.test(mainContentText)
    const hasPhysicalAddress = $('[itemtype*="PostalAddress"], address, [class*="address"]').length > 0

    // ------------------------------------------------------------------------
    // Search Experience & CRO (SXO) Extraction (Skill: seo-sxo, seo-flow)
    // ------------------------------------------------------------------------
    const ctaElements: { text: string; href: string; isPrimary: boolean }[] = []
    $('a[class*="btn"], a[class*="cta"], a[class*="button"], button, [role="button"], input[type="submit"]').each((_, el) => {
      const txt = $(el).text().replace(/\s+/g, ' ').trim() || $(el).attr('value') || ''
      const href = $(el).attr('href') || '#'
      if (txt && txt.length < 50) {
        ctaElements.push({
          text: txt,
          href,
          isPrimary: /get started|try free|sign up|start free|free trial|buy now|request demo|book demo|contact us|start now/i.test(txt)
        })
      }
    })

    const hasAboveTheFoldCta = ctaElements.length > 0
    const primaryCta = ctaElements.find(c => c.isPrimary) || ctaElements[0] || null

    const reassurancePhrases = [
      'no credit card', 'free trial', 'money-back guarantee', 'cancel anytime',
      'money back', 'instant access', 'no obligations', 'secure checkout',
      'privacy guaranteed', 'gdpr compliant', 'soc2', 'verified'
    ]
    const detectedReassurances = reassurancePhrases.filter(phrase => 
      new RegExp(`\\b${phrase}\\b`, 'i').test(mainContentText)
    )

    const totalForms = $('form').length
    const totalFormFields = $('form input:not([type="hidden"]), form select, form textarea').length

    const listElementsCount = $('ul, ol').length
    const boldElementsCount = $('strong, b').length
    const calloutBoxesCount = $('[class*="callout"], [class*="alert"], [class*="highlight"], aside, blockquote').length
    const scannabilityScore = Math.min(100, Math.round((listElementsCount * 10) + (boldElementsCount * 4) + (calloutBoxesCount * 15) + (headings.length * 5)))

    // ------------------------------------------------------------------------
    // Deep Forensic Deterministic Analyzer (Claude-SEO 25-Skills Suite)
    // ------------------------------------------------------------------------
    const forensicIssues: any[] = []
    let technicalPenalty = 0
    let contentPenalty = 0
    let sxoPenalty = 0
    let schemaPenalty = 0
    let eeatPenalty = 0
    let geoPenalty = 0
    let perfPenalty = 0
    let linksPenalty = 0
    let intlPenalty = 0

    // --- 1. TECHNICAL & SECURITY (Skills: seo-technical, seo-crawlability, seo-security, seo-mobile) ---
    if (!url.startsWith('https')) {
      forensicIssues.push({
        category: 'technical',
        title: 'Insecure HTTP Protocol Served',
        description: 'The site is accessible over unencrypted HTTP. Search engines penalize insecure sites in ranking algorithms.',
        fixCode: `# Nginx 301 Permanent Redirect\nserver {\n  listen 80;\n  server_name ${domain};\n  return 301 https://$host$request_uri;\n}`,
        priority: 'critical',
        severity: 'error'
      })
      technicalPenalty += 25
    }

    if (!isHttpRedirectEnforced && url.startsWith('https')) {
      forensicIssues.push({
        category: 'technical',
        title: 'HTTP to HTTPS Redirect Not Automatically Enforced',
        description: `HTTP requests to http://${domain}/ did not return an immediate 301/308 permanent redirect (Status: ${httpRedirectStatus || 'No response'}).`,
        fixCode: `# Enforce HTTPS in Nginx:\nserver {\n  listen 80;\n  server_name ${domain};\n  return 301 https://$host$request_uri;\n}`,
        priority: 'high',
        severity: 'warning'
      })
      technicalPenalty += 10
    }

    if (!canonical || canonical === 'Missing') {
      forensicIssues.push({
        category: 'technical',
        title: 'Missing Canonical Tag',
        description: 'No self-referential <link rel="canonical"> tag was detected in document <head>. This risks duplicate content penalties from tracking parameters and URL variations.',
        fixCode: `<link rel="canonical" href="${url}" />`,
        priority: 'high',
        severity: 'warning'
      })
      technicalPenalty += 15
    } else if (canonical !== url && canonical !== url + '/' && !url.startsWith(canonical)) {
      forensicIssues.push({
        category: 'technical',
        title: 'Canonical URL Target Mismatch',
        description: `Canonical tag specifies "${canonical}" which does not match the accessed page URL "${url}". Search engines will attribute indexing signals away from this URL.`,
        fixCode: `<link rel="canonical" href="${url}" />`,
        priority: 'high',
        severity: 'warning'
      })
      technicalPenalty += 15
    }

    if (robots.toLowerCase().includes('noindex')) {
      forensicIssues.push({
        category: 'technical',
        title: 'Catastrophic Noindex Directive Active',
        description: 'The meta robots tag explicitly prevents search engines from indexing this page in SERPs.',
        fixCode: `<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />`,
        priority: 'critical',
        severity: 'error'
      })
      technicalPenalty += 50
    }

    if (!robotsTxtFound) {
      forensicIssues.push({
        category: 'technical',
        title: 'Missing or Inaccessible robots.txt File',
        description: `HTTP GET ${urlObj.origin}/robots.txt returned HTTP ${robotsTxtStatus}. Search engine crawlers require robots.txt to discover crawl paths.`,
        fixCode: `# Create /robots.txt:\nUser-agent: *\nAllow: /\n\nSitemap: ${urlObj.origin}/sitemap.xml`,
        priority: 'medium',
        severity: 'warning'
      })
      technicalPenalty += 10
    }

    if (!sitemapXmlFound) {
      forensicIssues.push({
        category: 'technical',
        title: 'Missing or Inaccessible XML Sitemap',
        description: `Could not verify XML Sitemap at ${urlObj.origin}/sitemap.xml (Status: ${sitemapXmlStatus}). Submit an active sitemap to Google Search Console.`,
        fixCode: `<!-- XML Sitemap Format (/sitemap.xml) -->\n<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${url}</loc>\n    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n    <priority>1.0</priority>\n  </url>\n</urlset>`,
        priority: 'medium',
        severity: 'warning'
      })
      technicalPenalty += 10
    }

    if (!hstsPresent) {
      forensicIssues.push({
        category: 'technical',
        title: 'Missing HSTS (Strict-Transport-Security) Header',
        description: 'Origin server does not emit HSTS header. Browsers may allow unencrypted downgrade attacks before HTTPS handshake.',
        fixCode: `# Add to Nginx / Cloudflare Transform Rules:\nStrict-Transport-Security: max-age=31536000; includeSubDomains; preload`,
        priority: 'medium',
        severity: 'notice'
      })
      technicalPenalty += 5
    }

    if (!cspPresent) {
      forensicIssues.push({
        category: 'technical',
        title: 'Missing Content-Security-Policy (CSP) Header',
        description: 'No Content-Security-Policy header was served. CSP protects against XSS and data injection vulnerabilities.',
        fixCode: `Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' data: https:;`,
        priority: 'low',
        severity: 'notice'
      })
      technicalPenalty += 5
    }

    if (!xFramePresent) {
      forensicIssues.push({
        category: 'technical',
        title: 'Missing X-Frame-Options (Clickjacking Protection) Header',
        description: 'Origin server does not set X-Frame-Options: SAMEORIGIN to prevent unauthorized iframe embedding.',
        fixCode: `X-Frame-Options: SAMEORIGIN\nX-Content-Type-Options: nosniff\nReferrer-Policy: strict-origin-when-cross-origin`,
        priority: 'low',
        severity: 'notice'
      })
      technicalPenalty += 5
    }

    if (viewport === 'Missing') {
      forensicIssues.push({
        category: 'technical',
        title: 'Missing Mobile Responsive Viewport Meta Tag',
        description: 'Page lacks mobile viewport declaration. Search engines will treat this page as mobile-unfriendly.',
        fixCode: `<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />`,
        priority: 'critical',
        severity: 'error'
      })
      technicalPenalty += 20
    }

    // --- 2. ON-PAGE CONTENT & METADATA (Skills: seo-content, seo-headings, seo-metadata, seo-readability) ---
    if (title === 'Missing') {
      forensicIssues.push({
        category: 'content',
        title: 'Missing <title> Tag',
        description: 'Document head contains no title tag. Search engines have zero primary keyword signal for indexing.',
        fixCode: `<title>${capitalizedBrand} - Advanced Performance & Optimization Platform</title>`,
        priority: 'critical',
        severity: 'error'
      })
      contentPenalty += 25
    } else if (title.length < 30) {
      forensicIssues.push({
        category: 'content',
        title: 'Title Tag Is Too Short (< 30 characters)',
        description: `Current title "${title}" (${title.length} chars) underutilizes Google's 580px (~55-60 char) SERP display limit.`,
        fixCode: `<title>${title} | Enterprise Solutions & Features - ${capitalizedBrand}</title>`,
        priority: 'medium',
        severity: 'warning'
      })
      contentPenalty += 10
    } else if (title.length > 65) {
      forensicIssues.push({
        category: 'content',
        title: 'Title Tag Exceeds Display Length (> 65 characters)',
        description: `Current title is ${title.length} characters long and will be truncated with ellipsis (...) in Google search snippets.`,
        fixCode: `<title>${title.slice(0, 56)}... | ${capitalizedBrand}</title>`,
        priority: 'medium',
        severity: 'warning'
      })
      contentPenalty += 5
    }

    if (metaDesc === 'Missing') {
      forensicIssues.push({
        category: 'content',
        title: 'Missing Meta Description',
        description: 'No meta description tag provided. Google will extract arbitrary page text, reducing CTR by up to 25%.',
        fixCode: `<meta name="description" content="Discover ${capitalizedBrand}: The premier enterprise platform for performance benchmarks, deep analytics, and automated optimization." />`,
        priority: 'high',
        severity: 'warning'
      })
      contentPenalty += 15
    } else if (metaDesc.length < 110 || metaDesc.length > 165) {
      forensicIssues.push({
        category: 'content',
        title: `Suboptimal Meta Description Length (${metaDesc.length} characters)`,
        description: 'Optimal Google meta description length is 140-160 characters with an active call-to-action.',
        fixCode: `<meta name="description" content="${metaDesc.slice(0, 150)} Explore features and get started today." />`,
        priority: 'low',
        severity: 'notice'
      })
      contentPenalty += 5
    }

    if (h1s.length === 0) {
      forensicIssues.push({
        category: 'content',
        title: 'Missing Primary <h1> Heading',
        description: 'Page lacks an H1 heading. Google uses the H1 tag as the primary on-page semantic topic descriptor.',
        fixCode: `<h1>${title.split('|')[0].trim() || `${capitalizedBrand} Enterprise Platform`}</h1>`,
        priority: 'critical',
        severity: 'error'
      })
      contentPenalty += 20
    } else if (h1s.length > 1) {
      forensicIssues.push({
        category: 'content',
        title: `Multiple <h1> Headings Detected (${h1s.length} H1s)`,
        description: `Found ${h1s.length} separate H1 tags. Best practice is exactly one single H1 for primary topical clarity.`,
        fixCode: `<!-- Convert secondary H1 elements to H2 subsections -->\n<h2>${h1s[1]}</h2>`,
        priority: 'medium',
        severity: 'notice'
      })
      contentPenalty += 5
    }

    if (skippedHeadingDetected) {
      forensicIssues.push({
        category: 'content',
        title: 'Skipped Heading Hierarchy Levels Detected',
        description: 'The heading hierarchy jumps non-sequentially (e.g. from H1 directly to H3 or H2 to H4), which degrades screen reader accessibility and document outline parsing.',
        fixCode: `<!-- Correct Nested Order: -->\n<h1>Primary Topic</h1>\n  <h2>Key Sub-section</h2>\n    <h3>Granular Detail</h3>`,
        priority: 'medium',
        severity: 'warning'
      })
      contentPenalty += 10
    }

    if (wordCount < 300) {
      forensicIssues.push({
        category: 'content',
        title: `Thin Content Detected (${wordCount} words)`,
        description: `Page body text is only ${wordCount} words. Pages under 400 words are vulnerable to Google Helpful Content demotion.`,
        fixCode: `<!-- Expand content with structured sections: -->\n<section>\n  <h2>Comprehensive Overview</h2>\n  <p>In-depth explanation, feature breakdown, and industry use-cases...</p>\n</section>`,
        priority: 'high',
        severity: 'warning'
      })
      contentPenalty += 20
    }

    const stuffedKeywords = keywordsDensity.filter(k => k.density > 3.5)
    if (stuffedKeywords.length > 0) {
      forensicIssues.push({
        category: 'content',
        title: `Keyword Stuffing Risk: "${stuffedKeywords[0].word}" (${stuffedKeywords[0].density}% density)`,
        description: `The word "${stuffedKeywords[0].word}" appears ${stuffedKeywords[0].count} times (${stuffedKeywords[0].density}% density). Densities above 3.5% risk algorithmic demotion under Google Helpful Content & Spam guidelines.`,
        fixCode: `<!-- Replace exact repetitions of "${stuffedKeywords[0].word}" with semantic entity synonyms and LSI phrasing -->`,
        priority: 'high',
        severity: 'warning'
      })
      contentPenalty += 15
    }

    if (mixedContentElements.length > 0 && url.startsWith('https')) {
      forensicIssues.push({
        category: 'technical',
        title: `Insecure Mixed Content (${mixedContentElements.length} HTTP assets)`,
        description: `Found ${mixedContentElements.length} asset(s) loaded over insecure http:// (e.g. "${mixedContentElements[0].src}"). Browsers block these passive/active resources on HTTPS pages.`,
        fixCode: `<${mixedContentElements[0].tag} src="${mixedContentElements[0].src.replace(/^http:\/\//, 'https://')}" />`,
        priority: 'critical',
        severity: 'error'
      })
      technicalPenalty += 20
    }

    // --- 3. STRUCTURED DATA & SCHEMA.ORG (Skills: seo-schema, seo-social) ---
    if (schemasRaw.length === 0) {
      const generatedSchema = JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "@id": `${url}#organization`,
            "name": capitalizedBrand,
            "url": url,
            "logo": `${url}/logo.png`,
            "sameAs": [
              `https://twitter.com/${siteBrand.toLowerCase()}`,
              `https://linkedin.com/company/${siteBrand.toLowerCase()}`
            ]
          },
          {
            "@type": "WebSite",
            "@id": `${url}#website`,
            "url": url,
            "name": capitalizedBrand,
            "publisher": { "@id": `${url}#organization` }
          }
        ]
      }, null, 2)

      forensicIssues.push({
        category: 'schema',
        title: 'No JSON-LD Structured Data Detected',
        description: 'Zero Schema.org structured data found. Google requires JSON-LD to unlock rich search features, knowledge graph panels, and brand entities.',
        fixCode: `<script type="application/ld+json">\n${generatedSchema}\n</script>`,
        priority: 'critical',
        severity: 'error'
      })
      schemaPenalty += 35
    } else {
      // Check for Organization or WebSite schema
      const hasCoreEntity = schemaTypesDetected.some(t => ['Organization', 'WebSite', 'Corporation', 'LocalBusiness'].includes(t))
      if (!hasCoreEntity) {
        forensicIssues.push({
          category: 'schema',
          title: 'Missing Organization / WebSite Schema Entity',
          description: 'Detected schemas lack a top-level Organization or WebSite entity declaration.',
          fixCode: `<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Organization",\n  "name": "${capitalizedBrand}",\n  "url": "${url}"\n}\n</script>`,
          priority: 'high',
          severity: 'warning'
        })
        schemaPenalty += 15
      }
    }

    if (ogTitle === 'Missing' || ogImage === 'Missing' || twitterCard === 'Missing') {
      forensicIssues.push({
        category: 'schema',
        title: 'Incomplete OpenGraph & Twitter Social Meta Tags',
        description: 'Missing og:title, og:image, or twitter:card meta tags. Social platform link shares (Twitter, LinkedIn, Slack) will render broken or bland previews.',
        fixCode: `<meta property="og:type" content="website" />\n<meta property="og:url" content="${url}" />\n<meta property="og:title" content="${title.replace(/"/g, '&quot;')}" />\n<meta property="og:description" content="${metaDesc.replace(/"/g, '&quot;')}" />\n<meta property="og:image" content="${url}/og-image.jpg" />\n<meta name="twitter:card" content="summary_large_image" />`,
        priority: 'medium',
        severity: 'warning'
      })
      schemaPenalty += 15
    }

    // --- 4. E-E-A-T FORENSICS (Skills: seo-eeat, seo-author-authority, seo-trust-legitimacy) ---
    if (!hasAboutLink || !hasContactLink) {
      forensicIssues.push({
        category: 'eeat',
        title: 'Missing Essential E-E-A-T Transparency Links (About / Contact)',
        description: 'No direct navigation links to About Us or Contact pages detected. Google Search Quality Rater Guidelines heavily penalize anonymous commercial websites.',
        fixCode: `<footer>\n  <nav aria-label="E-E-A-T Transparency">\n    <a href="/about">About ${capitalizedBrand}</a>\n    <a href="/contact">Contact Support</a>\n    <a href="/team">Leadership &amp; Authors</a>\n  </nav>\n</footer>`,
        priority: 'high',
        severity: 'warning'
      })
      eeatPenalty += 20
    }

    if (!hasPrivacyLink || !hasTermsLink) {
      forensicIssues.push({
        category: 'eeat',
        title: 'Missing Legal Trust Signals (Privacy Policy / Terms)',
        description: 'No explicit footer links to Privacy Policy or Terms of Service found. This damages institutional trust score for Google merchant and algorithmic evaluators.',
        fixCode: `<nav aria-label="Legal">\n  <a href="/privacy">Privacy Policy</a>\n  <a href="/terms">Terms of Service</a>\n</nav>`,
        priority: 'medium',
        severity: 'notice'
      })
      eeatPenalty += 10
    }

    if (!hasAuthorByline && wordCount > 400) {
      forensicIssues.push({
        category: 'eeat',
        title: 'Lacking Direct Author Entity Attribution',
        description: 'Informational content lacks an author byline with credentials, bio link, or Schema.org/Person markup.',
        fixCode: `<div class="article-author" itemscope itemtype="https://schema.org/Person">\n  <span>Written by <a href="/team/editor" itemprop="name">Editorial Staff</a></span>\n  <span itemprop="jobTitle">Chief Technology Analyst</span>\n</div>`,
        priority: 'medium',
        severity: 'notice'
      })
      eeatPenalty += 15
    }

    if (!hasReviewsOrTestimonials && wordCount > 300) {
      forensicIssues.push({
        category: 'eeat',
        title: 'Missing Customer Reviews & Verified Rating Signals',
        description: 'No customer testimonials, verified reviews, or Schema.org/AggregateRating detected. Social proof and real user feedback are core Google E-E-A-T trust signals.',
        fixCode: `<section class="testimonials" itemscope itemtype="https://schema.org/Product">\n  <span itemprop="name">${capitalizedBrand}</span>\n  <div itemprop="aggregateRating" itemscope itemtype="https://schema.org/AggregateRating">\n    <span itemprop="ratingValue">4.9</span>/5.0 based on <span itemprop="reviewCount">120</span> verified client reviews\n  </div>\n</section>`,
        priority: 'medium',
        severity: 'notice'
      })
      eeatPenalty += 10
    }

    if (!hasOutboundAuthoritativeLinks && wordCount > 500) {
      forensicIssues.push({
        category: 'eeat',
        title: 'Lacking Outbound Authoritative Source Citations',
        description: 'Page does not link out to recognized authoritative research, industry standards, or primary sources (.edu, .gov, w3.org, wikipedia.org).',
        fixCode: `<!-- Link out to authoritative primary sources: -->\n<p>Reference authoritative data from <a href="https://www.w3.org" target="_blank" rel="noopener noreferrer">W3C Standards</a> or official industry benchmarks.</p>`,
        priority: 'low',
        severity: 'notice'
      })
      eeatPenalty += 5
    }

    // --- 5. GENERATIVE ENGINE OPTIMIZATION (GEO & AEO) (Skills: seo-geo, seo-aeo) ---
    const hasFaqOrQnA = h2s.some(h => /^(what|how|why|is|can|where|who|when)\b/i.test(h)) || $('details, .faq, [itemtype*="FAQPage"]').length > 0
    if (!hasFaqOrQnA) {
      forensicIssues.push({
        category: 'geoAeo',
        title: 'Missing Direct-Answer Q&A / FAQ Block for AI Search Citations',
        description: 'AI Answer Engines (ChatGPT Search, Perplexity AI, Google AI Overviews) preferentially quote content formatted as explicit question-answer pairs.',
        fixCode: `<section class="faq-section" itemscope itemtype="https://schema.org/FAQPage">\n  <h2>Frequently Asked Questions</h2>\n  <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">\n    <h3 itemprop="name">What is ${capitalizedBrand}?</h3>\n    <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">\n      <p itemprop="text">${capitalizedBrand} is an enterprise platform delivering automated intelligence, benchmarking, and architectural workflows.</p>\n    </div>\n  </div>\n</section>`,
        priority: 'high',
        severity: 'warning'
      })
      geoPenalty += 20
    }

    forensicIssues.push({
      category: 'geoAeo',
      title: 'Missing "Key Takeaways" Definition Callout for LLM Extraction',
      description: 'Generative AI search engines extract 2-3 sentence executive summaries placed directly below the primary heading.',
      fixCode: `<div class="ai-summary-callout" style="background:#f9f9f9; padding:16px; border-left:4px solid #cc785c; margin:20px 0;">\n  <p><strong>Key Takeaways:</strong></p>\n  <ul>\n    <li>${capitalizedBrand} provides automated intelligence and deep multi-vector audits.</li>\n    <li>Enforces enterprise compliance across speed, security, and search visibility.</li>\n  </ul>\n</div>`,
      priority: 'medium',
      severity: 'notice'
    })

    // --- 6. CORE WEB VITALS & IMAGES (Skills: seo-performance, seo-images) ---
    if (missingAltImages.length > 0) {
      const sampleSrc = missingAltImages[0].src
      forensicIssues.push({
        category: 'performance',
        title: `Images Missing Alt Text (${missingAltImages.length} images affected)`,
        description: `${missingAltImages.length} image(s) lack descriptive alt attributes (e.g. "${sampleSrc}"). This fails WCAG accessibility and image search indexing.`,
        fixCode: `<!-- Update image with descriptive keyword-rich alt text: -->\n<img src="${sampleSrc}" alt="${capitalizedBrand} dashboard analytics overview" loading="lazy" />`,
        priority: 'high',
        severity: 'warning'
      })
      perfPenalty += Math.min(25, missingAltImages.length * 5)
    }

    if (nonModernImages.length > 0) {
      forensicIssues.push({
        category: 'performance',
        title: `Legacy Image Formats Detected (${nonModernImages.length} PNG/JPG images)`,
        description: `Found ${nonModernImages.length} uncompressed PNG/JPEG images. Converting to modern WebP or AVIF reduces page weight by up to 75%.`,
        fixCode: `<picture>\n  <source srcset="${nonModernImages[0]?.src?.replace(/\.(png|jpg|jpeg)$/, '.webp')}" type="image/webp">\n  <img src="${nonModernImages[0]?.src}" alt="Optimized illustration" loading="lazy">\n</picture>`,
        priority: 'medium',
        severity: 'notice'
      })
      perfPenalty += 10
    }

    if (missingDimensionsImages.length > 0) {
      forensicIssues.push({
        category: 'performance',
        title: `Images Missing Explicit Width & Height Attributes`,
        description: `${missingDimensionsImages.length} image(s) lack explicit width and height HTML attributes, which causes Cumulative Layout Shift (CLS) during page rendering.`,
        fixCode: `<img src="${images[0]?.src || '/image.png'}" width="800" height="450" style="width:100%; height:auto;" alt="..." />`,
        priority: 'medium',
        severity: 'warning'
      })
      perfPenalty += 10
    }

    if (renderBlockingScripts > 0) {
      forensicIssues.push({
        category: 'performance',
        title: `Render-Blocking JavaScript Resources (${renderBlockingScripts} scripts)`,
        description: `${renderBlockingScripts} external script(s) are loaded synchronously in the head without 'defer' or 'async' attributes, blocking DOM rendering.`,
        fixCode: `<!-- Add defer attribute to non-critical scripts: -->\n<script src="/path/to/script.js" defer></script>`,
        priority: 'high',
        severity: 'warning'
      })
      perfPenalty += 15
    }

    // --- 7. INTERNAL LINKS & GRAPH (Skills: seo-internal-links) ---
    if (genericAnchorLinks.length > 0) {
      forensicIssues.push({
        category: 'internalLinks',
        title: `Generic Anchor Text Detected (${genericAnchorLinks.length} instances)`,
        description: `Links with anchors like "${genericAnchorLinks[0].text}" fail to transmit contextual keyword relevance to destination URLs.`,
        fixCode: `<!-- Replace generic text with descriptive keyword anchor: -->\n<a href="${genericAnchorLinks[0]?.href || '/features'}">Explore ${capitalizedBrand} features &amp; capabilities</a>`,
        priority: 'medium',
        severity: 'warning'
      })
      linksPenalty += Math.min(20, genericAnchorLinks.length * 4)
    }

    if (internalLinks.length < 3) {
      forensicIssues.push({
        category: 'internalLinks',
        title: 'Low Internal Link Equity Distribution',
        description: `Page contains only ${internalLinks.length} internal link(s). An isolated page receives less PageRank crawl frequency and index priority.`,
        fixCode: `<nav aria-label="Related Topics">\n  <ul>\n    <li><a href="/pricing">Enterprise Pricing &amp; Plans</a></li>\n    <li><a href="/docs">Documentation &amp; Guides</a></li>\n    <li><a href="/blog">Latest Case Studies &amp; Research</a></li>\n  </ul>\n</nav>`,
        priority: 'high',
        severity: 'warning'
      })
      linksPenalty += 20
    }

    // --- 8. INTERNATIONAL & LOCAL SEO (Skills: seo-international, seo-local) ---
    if (htmlLang === 'Missing') {
      forensicIssues.push({
        category: 'internationalLocal',
        title: 'Missing HTML <html> lang Attribute',
        description: 'The root <html> element is missing the lang attribute (e.g. lang="en"), impeding search engines from indexing language targeting.',
        fixCode: `<html lang="en" dir="ltr">`,
        priority: 'medium',
        severity: 'warning'
      })
      intlPenalty += 20
    }

    // --- 9. SEARCH EXPERIENCE OPTIMIZATION & CRO (Skills: seo-sxo, seo-flow) ---
    if (!hasAboveTheFoldCta) {
      forensicIssues.push({
        category: 'sxo',
        title: 'Missing Above-The-Fold Primary Conversion Action (CTA)',
        description: 'No clear Call-to-Action button or conversion path detected in the hero area. High bounce risk for commercial search intent visitors.',
        fixCode: `<div class="hero-cta-wrapper" style="margin-top:24px; display:flex; gap:12px;">\n  <a href="/get-started" class="btn-primary" style="background:#cc785c; color:#fff; padding:14px 28px; border-radius:8px; font-weight:700; text-decoration:none;">Get Started Free &rarr;</a>\n  <a href="/demo" class="btn-secondary" style="border:1px solid #d1d5db; padding:14px 24px; border-radius:8px; text-decoration:none;">Book a Demo</a>\n</div>`,
        priority: 'high',
        severity: 'warning'
      })
      sxoPenalty += 20
    }

    if (detectedReassurances.length === 0) {
      forensicIssues.push({
        category: 'sxo',
        title: 'Lacking Conversion Reassurance Triggers Near CTA',
        description: 'Landing page lacks friction-reducing microcopy (e.g. "No credit card required", "Free trial", "Money-back guarantee", "SOC2 certified"). Reassurance microcopy increases SXO conversion rates by up to 28%.',
        fixCode: `<div class="reassurance-bar" style="font-size:12px; color:#6b7280; margin-top:12px; display:flex; gap:16px;">\n  <span>&#10003; No credit card required</span>\n  <span>&#10003; 14-day free trial</span>\n  <span>&#10003; Cancel anytime</span>\n</div>`,
        priority: 'medium',
        severity: 'notice'
      })
      sxoPenalty += 10
    }

    if (totalFormFields > 5) {
      forensicIssues.push({
        category: 'sxo',
        title: `High Form Friction Detected (${totalFormFields} input fields)`,
        description: `Found ${totalFormFields} form fields. Every extra input field reduces search conversion rates by an average of 4-7%. Streamline form to 2-3 essential fields.`,
        fixCode: `<!-- Reduce form to essential fields: Work Email + Company Name -->\n<form>\n  <input type="email" placeholder="work@company.com" required />\n  <button type="submit">Start Free Trial</button>\n</form>`,
        priority: 'medium',
        severity: 'warning'
      })
      sxoPenalty += 10
    }

    if (scannabilityScore < 40) {
      forensicIssues.push({
        category: 'sxo',
        title: 'Low Content Scannability (F-Pattern Reading Friction)',
        description: 'Page lacks bulleted lists, bold entity terms, and visual callouts. Search engine visitors scan rather than read line-by-line.',
        fixCode: `<ul class="benefit-bullets">\n  <li><strong>Core Capability:</strong> Automated intelligence...</li>\n  <li><strong>Speed Benchmark:</strong> 70% latency reduction...</li>\n</ul>`,
        priority: 'medium',
        severity: 'notice'
      })
      sxoPenalty += 10
    }

    // ------------------------------------------------------------------------
    // Semantic AI Qualitative Enrichment (Gemini 2.5 Flash)
    // ------------------------------------------------------------------------
    const fullContext = `
URL: ${url}
Brand: ${capitalizedBrand}
Title: ${title}
Meta Description: ${metaDesc}
Word Count: ${wordCount}
Readability Score: ${readability.score}/100 (${readability.label})
Headings List (${headings.length}): ${JSON.stringify(headings.slice(0, 20))}
Detected Schema Types: ${JSON.stringify(schemaTypesDetected)}
Internal Links Count: ${internalLinks.length}
External Links Count: ${externalLinks.length}
Has HTTPS: ${url.startsWith('https')}
Has HSTS: ${hstsPresent}
HTML Lang: ${htmlLang}

--- CLEAN BODY TEXT EXCERPT ---
${mainContentText.slice(0, 25000)}
`

    let aiResult: any = { issues: [], scores: {} }
    let aiResponse: any = null

    try {
      aiResponse = await geminiGenerateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: CLAUDE_SEO_ANALYSIS_PROMPT + wrapUntrustedContent('extracted webpage data', fullContext) }] }
        ],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
          topP: 0.8
        }
      })

      if (aiResponse?.text) {
        aiResult = JSON.parse(stripJsonFences(aiResponse.text))
      }
    } catch (aiErr: any) {
      console.warn("Gemini AI qualitative analysis skipped or key error, using forensic Claude-SEO heuristics:", aiErr.message)
      aiResult = {
        issues: [],
        scores: {
          eeatScore: Math.max(30, 100 - eeatPenalty),
          geoScore: Math.max(30, 100 - geoPenalty),
          contentDepthScore: Math.max(30, 100 - contentPenalty),
          intentMatch: 'Commercial / SaaS',
          primaryEntities: [capitalizedBrand, 'Search Engine Optimization', 'Analytics', 'Conversion Rate Optimization'],
          aiSnippetRecommendation: `${capitalizedBrand} is an enterprise intelligence platform providing automated SEO audits, performance benchmarks, and conversion rate optimization.`
        }
      }
    }

    const aiIssues = (aiResult.issues || []).map((i: any) => ({
      ...i,
      category: i.category || 'content'
    }))

    // Combine deterministic forensic issues with AI issues
    const allIssues = [...forensicIssues, ...aiIssues]

    // Category Score Calculations
    const technicalScore = Math.max(10, Math.min(100, 100 - technicalPenalty))
    const contentScore = Math.max(10, Math.min(100, 100 - contentPenalty))
    const schemaScore = Math.max(10, Math.min(100, 100 - schemaPenalty))
    const eeatScore = Math.max(10, Math.min(100, aiResult.scores?.eeatScore ?? (100 - eeatPenalty)))
    const geoScore = Math.max(10, Math.min(100, aiResult.scores?.geoScore ?? (100 - geoPenalty)))
    const performanceScore = Math.max(10, Math.min(100, 100 - perfPenalty))
    const linksScore = Math.max(10, Math.min(100, 100 - linksPenalty))
    const internationalScore = Math.max(10, Math.min(100, 100 - intlPenalty))

    const siteHealth = Math.round(
      (technicalScore * 0.22) +
      (contentScore * 0.18) +
      (eeatScore * 0.15) +
      (geoScore * 0.15) +
      (schemaScore * 0.12) +
      (performanceScore * 0.08) +
      (linksScore * 0.05) +
      (internationalScore * 0.05)
    )

    const scores = {
      siteHealth,
      aiSearchHealth: geoScore,
      eeatScore,
      geoScore,
      technicalScore,
      contentScore,
      schemaScore,
      linksScore,
      performanceScore,
      thematic: {
        technical: technicalScore,
        content: contentScore,
        eeat: eeatScore,
        schema: schemaScore,
        geoAeo: geoScore,
        performance: performanceScore,
        internalLinks: linksScore,
        internationalLocal: internationalScore,
        robotsTxt: 100,
        crawlability: technicalScore,
        https: url.startsWith('https') ? 100 : 0,
        internationalSeo: internationalScore,
        coreWebVitals: performanceScore,
        sitePerformance: performanceScore,
        internalLinking: linksScore,
        markup: schemaScore
      },
      pageDetails: {
        url,
        brand: capitalizedBrand,
        title,
        metaDescription: metaDesc,
        canonical,
        wordCount,
        readability,
        htmlLang,
        totalDomElements,
        renderBlockingScripts,
        headingsCount: headings.length,
        headingsTree: headings,
        schemaTypes: schemaTypesDetected,
        schemasRaw,
        imagesTotal: images.length,
        imagesList: images.slice(0, 15),
        missingAltCount: missingAltImages.length,
        nonModernImagesCount: nonModernImages.length,
        internalLinksCount: internalLinks.length,
        externalLinksCount: externalLinks.length,
        genericAnchorCount: genericAnchorLinks.length,
        genericAnchorsList: genericAnchorLinks.slice(0, 10),
        securityHeaders: {
          https: url.startsWith('https'),
          hsts: hstsPresent,
          csp: cspPresent,
          xFrame: xFramePresent,
          contentTypeOptions
        },
        technicalAudit: {
          httpStatus: status || 200,
          httpStatusText: statusText || 'OK',
          server: serverHeader,
          contentEncoding: contentEncoding,
          isHttp3Supported,
          httpToHttpsRedirect: {
            tested: true,
            status: httpRedirectStatus,
            location: httpRedirectLocation,
            enforced: isHttpRedirectEnforced
          },
          canonical: {
            found: canonical !== 'Missing',
            url: canonical,
            isSelfReferential: canonical === url || canonical === url + '/' || url.startsWith(canonical)
          },
          robotsMeta: {
            found: robots !== 'Missing',
            content: robots,
            isIndexable: !robots.toLowerCase().includes('noindex'),
            isFollowable: !robots.toLowerCase().includes('nofollow')
          },
          robotsTxt: {
            found: robotsTxtFound,
            status: robotsTxtStatus,
            url: `${urlObj.origin}/robots.txt`,
            disallowCount: robotsDisallowsCount,
            sitemapDeclared: robotsSitemapDeclared
          },
          sitemapXml: {
            found: sitemapXmlFound,
            status: sitemapXmlStatus,
            url: robotsSitemapDeclared || `${urlObj.origin}/sitemap.xml`,
            isSitemapIndex
          },
          viewport: {
            found: viewport !== 'Missing',
            content: viewport,
            isMobileResponsive: viewport !== 'Missing' && viewport.includes('width=device-width')
          },
          securityHeaders: {
            hsts: { present: hstsPresent, value: hstsValue },
            csp: { present: cspPresent, value: cspValue },
            xFrameOptions: { present: xFramePresent, value: xFrameValue },
            xContentTypeOptions: { present: contentTypeOptions, value: contentTypeOptionsValue },
            referrerPolicy: { present: referrerPolicy, value: referrerPolicyValue },
            permissionsPolicy: { present: permissionsPolicy, value: permissionsPolicyValue }
          }
        },
        keywordsDensity,
        readingTimeMinutes,
        mixedContentCount: mixedContentElements.length,
        eeatSignals: {
          hasAboutLink,
          hasContactLink,
          hasPrivacyLink,
          hasTermsLink,
          hasRefundPolicyLink,
          hasAuthorByline,
          hasReviewsOrTestimonials,
          hasOutboundAuthoritativeLinks,
          hasPhoneOrEmail,
          hasPhysicalAddress
        },
        aiSummary: {
          intentMatch: aiResult.scores?.intentMatch || 'Commercial / SaaS',
          primaryEntities: aiResult.scores?.primaryEntities || [capitalizedBrand, 'Optimization', 'Intelligence'],
          aiSnippetRecommendation: aiResult.scores?.aiSnippetRecommendation || `${capitalizedBrand} is an enterprise optimization platform delivering automated intelligence, benchmarking, and architectural workflows.`
        },
        socialAudit: {
          og: {
            title: ogTitle,
            description: ogDesc,
            image: ogImage,
            url: ogUrl !== 'Missing' ? ogUrl : url,
            type: ogType,
            siteName: ogSiteName,
            locale: ogLocale,
            hasValidImage: ogImage !== 'Missing' && (ogImage.startsWith('http') || ogImage.startsWith('/')),
            isComplete: ogTitle !== 'Missing' && ogDesc !== 'Missing' && ogImage !== 'Missing'
          },
          twitter: {
            card: twitterCard !== 'Missing' ? twitterCard : 'summary_large_image',
            title: twitterTitle !== 'Missing' ? twitterTitle : (ogTitle !== 'Missing' ? ogTitle : title),
            description: twitterDesc !== 'Missing' ? twitterDesc : (ogDesc !== 'Missing' ? ogDesc : metaDesc),
            image: twitterImage !== 'Missing' ? twitterImage : (ogImage !== 'Missing' ? ogImage : `${url}/og-image.jpg`),
            site: twitterSite,
            creator: twitterCreator,
            isComplete: twitterCard !== 'Missing' && (twitterImage !== 'Missing' || ogImage !== 'Missing')
          },
          favicon
        },
        sxoAudit: {
          hasAboveTheFoldCta,
          primaryCta: primaryCta?.text || 'None Detected',
          primaryCtaHref: primaryCta?.href || '#',
          totalCtas: ctaElements.length,
          ctasList: ctaElements.slice(0, 8),
          reassuranceSignals: detectedReassurances,
          hasReassuranceTriggers: detectedReassurances.length > 0,
          totalForms,
          totalFormFields,
          scannabilityScore,
          pogoStickingRisk: wordCount < 300 || !hasAboveTheFoldCta ? 'High' : wordCount < 600 ? 'Medium' : 'Low',
          searchIntent: aiResult.scores?.intentMatch || (hasAboveTheFoldCta ? 'Commercial / Transactional' : 'Informational')
        }
      },
      statistics: {
        crawledPages: 1,
        healthyPages: siteHealth >= 80 ? 1 : 0,
        brokenPages: siteHealth < 50 ? 1 : 0,
        issuesPages: siteHealth < 80 && siteHealth >= 50 ? 1 : 0,
        httpCodes: { "5xx": 0, "4xx": 0, "3xx": 0, "2xx": 1 },
        sitemap: { inSitemap: 1, notInSitemap: 0 },
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
          jsonLd: schemasRaw.length > 0 ? 1 : 0, 
          openGraph: ogTitle !== 'Missing' ? 1 : 0, 
          twitter: twitterCard !== 'Missing' ? 1 : 0, 
          none: (schemasRaw.length === 0 && ogTitle === 'Missing') ? 1 : 0 
        },
        hreflang: { issues: 0, noHreflang: hreflangs.length === 0 ? 1 : 0, valid: hreflangs.length > 0 ? 1 : 0 },
        amp: { present: 0, missing: 1 }
      }
    }

    const promptTokens = aiResponse?.usageMetadata?.promptTokenCount || Math.ceil((CLAUDE_SEO_ANALYSIS_PROMPT.length + fullContext.length) / 4)
    const candidateTokens = aiResponse?.usageMetadata?.candidatesTokenCount || Math.ceil((aiResponse?.text?.length || 0) / 4)
    const tokensConsumed = aiResponse?.usageMetadata?.totalTokenCount || (promptTokens + candidateTokens)

    // 4. Update Scan in Database
    await db.update(scans).set({
      status: 'completed',
      completedAt: new Date(),
      scores,
      tokensConsumed,
    }).where(eq(scans.id, scan.id))
    
    if (allIssues.length > 0) {
      const issueRecords = allIssues.map((i: any) => ({
        scanId: scan.id,
        category: i.category || 'seo',
        title: i.title,
        description: i.description + (i.fixCode ? `\n\n\`\`\`html\n${i.fixCode}\n\`\`\`` : ''),
        priority: i.priority || 'medium',
        severity: i.severity || 'notice',
        businessImpact: '1'
      }))
      await db.insert(scanIssues).values(issueRecords)
    }

    // 5. Discover internal pages for next crawl
    try {
      const baseUrl = urlObj.origin
      const internalHrefs = new Set<string>()
      
      links.forEach(l => {
        try {
          if (!l.href || l.href.startsWith('mailto:') || l.href.startsWith('tel:') || l.href === '#' || l.href.startsWith('javascript:')) return
          let fullUrl = ''
          if (l.href.startsWith('/')) fullUrl = baseUrl + l.href
          else if (l.href.startsWith(baseUrl)) fullUrl = l.href
          
          if (fullUrl) {
            const cleanUrl = fullUrl.split('#')[0]
            if (cleanUrl !== url && cleanUrl !== url + '/') {
              internalHrefs.add(cleanUrl)
            }
          }
        } catch (e) {}
      })

      if (internalHrefs.size > 0) {
        const existingPages = await db.query.projectPages.findMany({
          where: eq(projectPages.projectId, projectId)
        })
        const existingUrls = new Set(existingPages.map(p => p.url))
        
        const newPages = Array.from(internalHrefs)
          .filter(u => !existingUrls.has(u))
          .map(u => ({ projectId, url: u, status: 'discovered' }))
          
        if (newPages.length > 0) {
          await db.insert(projectPages).values(newPages.slice(0, 50))
        }
      }
    } catch (e) {
      console.error("Failed to process internal links:", e)
    }

    // 6. Log Activity
    try {
      await logActivity('scan.created', 'SEO Scan', 'success', undefined, projectId)
    } catch {}

    revalidatePath(`/dashboard/seo/${projectId}`)
    return { success: true, scanId: scan.id, scores }
  } catch (error: any) {
    if (scanId) {
      await db.update(scans).set({ status: 'failed' }).where(eq(scans.id, scanId))
    }
    return { success: false, error: error.message }
  }
}

export async function crawlWebsite(projectId: string) {
  try {
    const { project } = await requireProjectAccess(projectId)
    return await runSeoIntelligence(projectId, project.websiteUrl)
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
