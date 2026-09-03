/**
 * Claude-SEO Evaluation Heuristics & Rules Engine
 * Implements the 25 Sub-Skills & 8 Categories from the Claude-SEO Toolkit Architecture
 */

export interface ThemeCheck {
  id: string;
  label: string;
  category: string;
  weight: number;
  matchKeywords: string[];
  impact: 'critical' | 'high' | 'medium' | 'low';
  recommendation: string;
  howToResolve?: string;
  stepByStep?: string[];
  fixSnippet?: string;
}

export interface ClaudeSkillDefinition {
  id: string;
  name: string;
  category: string;
  icon: string;
  description: string;
  primaryChecks: string[];
}

export const CLAUDE_25_SKILLS: ClaudeSkillDefinition[] = [
  { id: 'seo-audit', name: 'seo-audit', category: 'technical', icon: 'ShieldCheck', description: 'Master full-suite forensic audit engine', primaryChecks: ['ssl_valid', 'http_redirect', 'canonical_tags'] },
  { id: 'seo-sxo', name: 'seo-sxo', category: 'sxo', icon: 'Sparkles', description: 'Search Experience Optimization & CRO friction removal', primaryChecks: ['intent_alignment', 'atf_clarity', 'primary_cta_visibility', 'reassurance_badges'] },
  { id: 'seo-geo', name: 'seo-geo', category: 'geoAeo', icon: 'Bot', description: 'Generative Engine Optimization for LLM discovery & citations', primaryChecks: ['ai_citability', 'direct_answers', 'ai_bot_access'] },
  { id: 'seo-technical', name: 'seo-technical', category: 'technical', icon: 'Cpu', description: 'HTTP headers, HSTS, SSL, CSP & status codes', primaryChecks: ['hsts_header', 'security_headers', 'viewport_mobile'] },
  { id: 'seo-content', name: 'seo-content', category: 'content', icon: 'FileText', description: 'Heading architecture, readability, keyword density', primaryChecks: ['single_h1', 'heading_hierarchy', 'keyword_stuffing'] },
  { id: 'seo-schema', name: 'seo-schema', category: 'schema', icon: 'Code2', description: 'JSON-LD structured data and entity disambiguation', primaryChecks: ['json_ld_presence', 'schema_valid', 'entity_schema_type'] },
  { id: 'seo-images', name: 'seo-images', category: 'performance', icon: 'ImageIcon', description: 'WebP/AVIF next-gen media compression & alt integrity', primaryChecks: ['image_alts', 'modern_formats', 'explicit_dimensions'] },
  { id: 'seo-sitemap', name: 'seo-sitemap', category: 'technical', icon: 'Globe2', description: 'XML sitemaps, indexation declaration & hygiene', primaryChecks: ['sitemap_declared', 'robots_valid'] },
  { id: 'seo-hreflang', name: 'seo-hreflang', category: 'internationalLocal', icon: 'Languages', description: 'International multi-language alternate targeting', primaryChecks: ['html_lang', 'hreflang_tags'] },
  { id: 'seo-local', name: 'seo-local', category: 'internationalLocal', icon: 'MapPin', description: 'Local business NAP consistency & map citations', primaryChecks: ['local_nap'] },
  { id: 'seo-ecommerce', name: 'seo-ecommerce', category: 'schema', icon: 'ShoppingBag', description: 'Product schema, merchant pricing, aggregate ratings', primaryChecks: ['trust_badges', 'entity_schema_type'] },
  { id: 'seo-backlinks', name: 'seo-backlinks', category: 'eeat', icon: 'Link2', description: 'Domain authority signals & external source attribution', primaryChecks: ['external_citations', 'about_contact_links'] },
  { id: 'seo-cluster', name: 'seo-cluster', category: 'internalLinks', icon: 'Layers', description: 'Topical link siloing & Hub-and-Spoke clusters', primaryChecks: ['internal_link_count', 'descriptive_anchor'] },
  { id: 'seo-competitor-pages', name: 'seo-competitor-pages', category: 'content', icon: 'TrendingUp', description: 'SERP topical gap benchmarking vs competitors', primaryChecks: ['content_depth'] },
  { id: 'seo-content-brief', name: 'seo-content-brief', category: 'content', icon: 'BookOpen', description: 'Editorial brief structuring & search intent mapping', primaryChecks: ['title_length', 'meta_description'] },
  { id: 'seo-dataforseo', name: 'seo-dataforseo', category: 'technical', icon: 'Database', description: 'Live search engine crawling & index probes', primaryChecks: ['noindex_audit'] },
  { id: 'seo-drift', name: 'seo-drift', category: 'geoAeo', icon: 'Activity', description: 'Algorithm drift and AI overview volatility tracking', primaryChecks: ['statistical_proof'] },
  { id: 'seo-flow', name: 'seo-flow', category: 'sxo', icon: 'GitBranch', description: 'Full-funnel search-to-conversion user flow', primaryChecks: ['cta_friction', 'scannable_hierarchy'] },
  { id: 'seo-google', name: 'seo-google', category: 'content', icon: 'Search', description: 'Helpful Content system & Core Update compliance', primaryChecks: ['readability_score', 'single_h1'] },
  { id: 'seo-image-gen', name: 'seo-image-gen', category: 'performance', icon: 'Palette', description: 'Media placeholder generation & OpenGraph image assets', primaryChecks: ['open_graph', 'twitter_cards'] },
  { id: 'seo-maps', name: 'seo-maps', category: 'internationalLocal', icon: 'Compass', description: 'Local map pack rankings & geo coordinates', primaryChecks: ['local_nap'] },
  { id: 'seo-page', name: 'seo-page', category: 'content', icon: 'FileCode2', description: 'Single-URL on-page DOM forensics', primaryChecks: ['content_depth', 'title_length'] },
  { id: 'seo-plan', name: 'seo-plan', category: 'technical', icon: 'CheckSquare', description: 'Prioritized remediation roadmap & sprint plan', primaryChecks: ['security_headers', 'hsts_header'] },
  { id: 'seo-programmatic', name: 'seo-programmatic', category: 'internalLinks', icon: 'Workflow', description: 'Scale template architecture & canonical hygiene', primaryChecks: ['canonical_tags', 'no_broken_internal'] },
  { id: 'seo', name: 'seo', category: 'technical', icon: 'Terminal', description: 'Meta router & intelligent multi-agent orchestrator', primaryChecks: ['ssl_valid', 'canonical_tags'] }
];

export const CLAUDE_SEO_CATEGORIES = [
  { id: 'technical', label: 'Technical & Crawlability', description: 'Status codes, indexability, robots, sitemap, SSL, and security headers' },
  { id: 'content', label: 'On-Page & Content Quality', description: 'Heading hierarchy, word count, readability, keyword intent, and metadata' },
  { id: 'sxo', label: 'SXO (Search Experience & CRO)', description: 'Search intent match, Above-the-fold CTA, conversion friction, and scannability' },
  { id: 'eeat', label: 'E-E-A-T & Trust Signals', description: 'Author expertise, experience signals, editorial policies, and legitimacy' },
  { id: 'schema', label: 'Structured Data & Schema', description: 'JSON-LD validation, Schema.org entities, OpenGraph, and Twitter cards' },
  { id: 'geoAeo', label: 'AI Search & GEO/AEO', description: 'Citability score for Perplexity, ChatGPT Search, Claude, and Google AI Overviews' },
  { id: 'performance', label: 'Core Web Vitals & Speed', description: 'LCP, CLS, INP, modern image formats, DOM size, and asset optimization' },
  { id: 'internalLinks', label: 'Internal Links & Graph', description: 'Anchor text diversity, link depth, orphan page prevention, and link equity' },
  { id: 'internationalLocal', label: 'International & Local', description: 'Hreflang validation, HTML lang attributes, and LocalBusiness NAP' }
];

export const THEME_CHECKS: Record<string, ThemeCheck[]> = {
  // 1. Technical & Security
  technical: [
    { 
      id: 'ssl_valid', 
      label: 'SSL / HTTPS Protocol Active', 
      category: 'technical', 
      weight: 15, 
      matchKeywords: ['insecure http protocol', 'expired ssl', 'non-https', 'ssl error'], 
      impact: 'critical', 
      recommendation: 'Ensure valid SSL certificate is active and all HTTP requests are encrypted.',
      howToResolve: 'Install a valid SSL certificate (e.g. Let\'s Encrypt / Cloudflare SSL) and bind port 443 on your web server.',
      stepByStep: ['1. Obtain an SSL certificate using Certbot or Cloudflare Edge SSL', '2. Bind SSL certificate to port 443 in your server block', '3. Test SSL handshake using SSL Labs / Qualys'],
      fixSnippet: `certbot --nginx -d yourdomain.com -d www.yourdomain.com`
    },
    { 
      id: 'http_redirect', 
      label: 'Automatic HTTP ➡️ HTTPS Redirect', 
      category: 'technical', 
      weight: 10, 
      matchKeywords: ['http to https redirect', 'http redirect not enforced', 'insecure http'], 
      impact: 'high', 
      recommendation: 'Enforce 301/308 permanent redirect from http:// to https:// at the web server / edge level.',
      howToResolve: 'Add a 301 permanent redirect rule in Nginx, Apache, or Cloudflare Page Rules to redirect all plain HTTP requests to HTTPS.',
      stepByStep: ['1. Open your Nginx configuration file (/etc/nginx/sites-available/default)', '2. In the port 80 server block, add return 301 https://$host$request_uri;', '3. Test syntax with nginx -t and reload with systemctl reload nginx'],
      fixSnippet: `server {
  listen 80;
  server_name yourdomain.com www.yourdomain.com;
  return 301 https://$host$request_uri;
}`
    },
    { 
      id: 'canonical_tags', 
      label: 'Valid Self-Referencing Canonical Tag', 
      category: 'technical', 
      weight: 15, 
      matchKeywords: ['missing canonical tag', 'canonical mismatch', 'canonical tag'], 
      impact: 'critical', 
      recommendation: 'Include a self-referencing rel="canonical" link to prevent duplicate content splitting.',
      howToResolve: 'Insert a <link rel="canonical" href="..." /> in your HTML <head> pointing to the clean canonical URL.',
      stepByStep: ['1. Locate the <head> section of your HTML template or Next.js metadata export', '2. Add <link rel="canonical" href="https://yourdomain.com/current-url" />', '3. Verify that HTTP parameters, trailing slashes, and www versions map cleanly'],
      fixSnippet: `<link rel="canonical" href="https://yourdomain.com/page-slug" />`
    },
    { 
      id: 'noindex_audit', 
      label: 'Indexability Directives (No Accidental Noindex)', 
      category: 'technical', 
      weight: 15, 
      matchKeywords: ['noindex directive', 'accidental noindex', 'disallow index', 'noindex tag'], 
      impact: 'critical', 
      recommendation: 'Ensure the robots meta tag does not block search engines with noindex.',
      howToResolve: 'Remove "noindex" from your <meta name="robots"> tag and remove X-Robots-Tag: noindex from server response headers.',
      stepByStep: ['1. Inspect <head> for <meta name="robots" content="noindex"> and change to "index, follow"', '2. Check server headers for X-Robots-Tag: noindex', '3. Verify URL inspection in Google Search Console'],
      fixSnippet: `<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />`
    },
    { 
      id: 'robots_valid', 
      label: 'Live robots.txt File & Directives', 
      category: 'technical', 
      weight: 10, 
      matchKeywords: ['missing robots.txt', 'invalid robots.txt', 'robots.txt not found'], 
      impact: 'medium', 
      recommendation: 'Maintain an accessible robots.txt at /robots.txt declaring crawl paths and sitemap URL.',
      howToResolve: 'Create a plain-text robots.txt in your web root directory (/public/robots.txt) specifying crawl directives and your XML sitemap URL.',
      stepByStep: ['1. Create /public/robots.txt file', '2. Declare User-agent rules and Sitemap link', '3. Verify accessibility at https://yourdomain.com/robots.txt'],
      fixSnippet: `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/private/

Sitemap: https://yourdomain.com/sitemap.xml`
    },
    { 
      id: 'sitemap_declared', 
      label: 'Live XML Sitemap Accessible', 
      category: 'technical', 
      weight: 10, 
      matchKeywords: ['missing or inaccessible xml sitemap', 'missing xml sitemap', 'sitemap.xml not found'], 
      impact: 'medium', 
      recommendation: 'Provide an accessible XML sitemap at /sitemap.xml or declare it in robots.txt.',
      howToResolve: 'Generate a clean XML sitemap indexing all canonical URLs and submit it to Google Search Console.',
      stepByStep: ['1. Generate sitemap.xml via your CMS, Yoast, or Next.js sitemap.ts generator', '2. Verify file returns HTTP 200 OK at https://yourdomain.com/sitemap.xml', '3. Submit sitemap URL in Google Search Console > Sitemaps'],
      fixSnippet: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://yourdomain.com/</loc>
    <lastmod>2026-09-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`
    },
    { 
      id: 'hsts_header', 
      label: 'Strict-Transport-Security (HSTS) Header', 
      category: 'technical', 
      weight: 10, 
      matchKeywords: ['missing hsts', 'strict-transport-security'], 
      impact: 'medium', 
      recommendation: 'Enable HSTS with a max-age of at least 31536000 seconds (1 year) and includeSubDomains.',
      howToResolve: 'Add the Strict-Transport-Security header in your reverse proxy (Nginx, Apache, or Cloudflare Transform Rules).',
      stepByStep: ['1. Open your web server configuration', '2. Add Strict-Transport-Security header with 1-year max-age', '3. Reload server and verify using curl -I https://yourdomain.com'],
      fixSnippet: `add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;`
    },
    { 
      id: 'security_headers', 
      label: 'Clickjacking & Sniffing Defense (CSP / X-Frame / nosniff)', 
      category: 'technical', 
      weight: 10, 
      matchKeywords: ['missing key security headers', 'csp', 'content-security-policy', 'x-frame-options', 'x-content-type-options'], 
      impact: 'medium', 
      recommendation: 'Implement Content-Security-Policy, X-Frame-Options (SAMEORIGIN), and X-Content-Type-Options (nosniff).',
      howToResolve: 'Configure X-Frame-Options (SAMEORIGIN), X-Content-Type-Options (nosniff), and Referrer-Policy headers in your server block.',
      stepByStep: ['1. Click "Generate Security Headers Fix" in Technical tab', '2. Select your web server (Nginx / Apache / Cloudflare / Next.js)', '3. Copy and paste headers into your hosting configuration'],
      fixSnippet: `add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;`
    },
    { 
      id: 'viewport_mobile', 
      label: 'Mobile Responsive Viewport Meta Tag', 
      category: 'technical', 
      weight: 5, 
      matchKeywords: ['missing mobile responsive viewport', 'viewport meta', 'responsive viewport'], 
      impact: 'high', 
      recommendation: 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> to head.',
      howToResolve: 'Add the standard responsive viewport meta tag inside the <head> of your document layout.',
      stepByStep: ['1. Open your base HTML template or Next.js layout', '2. Ensure <meta name="viewport" content="width=device-width, initial-scale=1"> is declared in <head>'],
      fixSnippet: `<meta name="viewport" content="width=device-width, initial-scale=1" />`
    }
  ],

  // 2. On-Page & Content Quality
  content: [
    { 
      id: 'title_length', 
      label: 'Optimized Title Tag (50-60 chars)', 
      category: 'content', 
      weight: 15, 
      matchKeywords: ['title tag', 'title length', 'missing title', 'title too long', 'title too short'], 
      impact: 'critical', 
      recommendation: 'Keep the page title between 50-60 characters with primary keyword placed early.',
      howToResolve: 'Revise your <title> tag to 50-60 characters with the target primary keyword placed in the first 30 characters.',
      stepByStep: ['1. Identify target primary keyword and brand name', '2. Format title as: Primary Keyword - Value Proposition | Brand', '3. Ensure pixel width stays below 580px'],
      fixSnippet: `<title>Primary Keyword - Compelling Value Proposition | Brand</title>`
    },
    { 
      id: 'meta_description', 
      label: 'Engaging Meta Description (150-160 chars)', 
      category: 'content', 
      weight: 15, 
      matchKeywords: ['meta description', 'meta description length', 'missing meta description'], 
      impact: 'high', 
      recommendation: 'Craft a compelling meta description under 160 characters containing a strong call-to-action.',
      howToResolve: 'Write a persuasive 150-160 character description highlighting key benefits and a direct call-to-action.',
      stepByStep: ['1. Summarize page value proposition in 1-2 concise sentences', '2. Include primary keyword and secondary intent modifier', '3. End with an action verb (e.g. "Discover more", "Get started today")'],
      fixSnippet: `<meta name="description" content="Discover enterprise optimization solutions with verified intelligence benchmarks and real-time workflows. Get started for free today." />`
    },
    { 
      id: 'single_h1', 
      label: 'Single, Descriptive <h1> Tag', 
      category: 'content', 
      weight: 15, 
      matchKeywords: ['missing h1', 'multiple h1', 'h1 tag'], 
      impact: 'critical', 
      recommendation: 'Use exactly one H1 tag per page that accurately summarizes the main topic.',
      howToResolve: 'Ensure the page has exactly one <h1> element at the top of the main content hierarchy.',
      stepByStep: ['1. Inspect page headings in Content tab hierarchy tree', '2. Demote secondary <h1> tags to <h2>', '3. Ensure primary <h1> clearly identifies the page entity'],
      fixSnippet: `<h1>Main Page Topic &amp; Primary Value Proposition</h1>`
    },
    { 
      id: 'heading_hierarchy', 
      label: 'Logical Heading Tree (H1 -> H2 -> H3)', 
      category: 'content', 
      weight: 15, 
      matchKeywords: ['heading hierarchy', 'skipped heading level', 'heading structure'], 
      impact: 'medium', 
      recommendation: 'Never skip heading levels (e.g. do not jump from H1 directly to H3).',
      howToResolve: 'Refactor heading structure so headings step down sequentially without skipping levels (H1 ➡️ H2 ➡️ H3).',
      stepByStep: ['1. Review the Heading Hierarchy Tree visualizer in Content tab', '2. Fix any skipped levels (e.g. change H3 immediately following H1 to H2)', '3. Nest specific subtopics under logical parent categories'],
      fixSnippet: `<h1>Main Topic</h1>
  <h2>Key Section</h2>
    <h3>Granular Detail</h3>`
    },
    { 
      id: 'content_depth', 
      label: 'Substantial Content Depth (Word Count > 400)', 
      category: 'content', 
      weight: 15, 
      matchKeywords: ['thin content', 'word count', 'short content', 'low word count'], 
      impact: 'high', 
      recommendation: 'Expand content with comprehensive explanations, actionable takeaways, and thorough topic coverage.',
      howToResolve: 'Add thorough topic explanations, practical case examples, FAQ sections, and technical specifications to reach at least 600-1,200 words.',
      stepByStep: ['1. Review top 3 ranking competitors for the target query', '2. Identify missing subtopics, FAQs, and comparison data', '3. Add detailed paragraphs and concrete actionable advice'],
      fixSnippet: `<!-- Expand content depth with FAQs, step-by-step guides, and data tables -->`
    },
    { 
      id: 'readability_score', 
      label: 'High Readability (Flesch-Kincaid > 60)', 
      category: 'content', 
      weight: 10, 
      matchKeywords: ['readability', 'flesch-kincaid', 'complex sentences', 'reading ease'], 
      impact: 'medium', 
      recommendation: 'Break down long sentences, use bullet points, and maintain clear conversational prose.',
      howToResolve: 'Shorten complex multi-clause sentences, replace jargon with direct terminology, and utilize bullet points for dense explanations.',
      stepByStep: ['1. Break sentences longer than 25 words into two shorter sentences', '2. Use bulleted lists for sequences of 3+ items', '3. Maintain active voice and clear headings'],
      fixSnippet: `<!-- Simplify complex syntax, use bullet points, and maintain active voice -->`
    },
    { 
      id: 'keyword_stuffing', 
      label: 'Natural Keyword Density (< 2.5%)', 
      category: 'content', 
      weight: 15, 
      matchKeywords: ['keyword stuffing', 'keyword repetition', 'unnatural keyword'], 
      impact: 'high', 
      recommendation: 'Avoid repetitive exact-match phrases; use semantic LSI keywords and entity variations.',
      howToResolve: 'Replace repetitive keyword instances (> 3.5% density) with contextual synonyms and natural language variations.',
      stepByStep: ['1. Check the Keyword Density Observatory table for terms with red stuffing flags', '2. Rephrase redundant occurrences using LSI synonyms', '3. Keep primary keyword frequency between 1.0% and 2.5%'],
      fixSnippet: `<!-- Rephrase redundant exact-match keywords with semantic entity synonyms -->`
    }
  ],

  // 3. Search Experience Optimization & CRO (SXO)
  sxo: [
    {
      id: 'intent_alignment',
      label: 'Search Intent Alignment & Query Satisfaction',
      category: 'sxo',
      weight: 20,
      matchKeywords: ['search intent', 'intent alignment', 'query satisfaction', 'commercial intent'],
      impact: 'critical',
      recommendation: 'Ensure above-the-fold content satisfies the primary user search intent (Informational / Commercial / Transactional) within 3 seconds.',
      howToResolve: 'Align the hero headline, subheading, and primary value statement directly with the target keyword query.',
      stepByStep: ['1. Match hero H1 to the target search query intent', '2. Provide immediate direct answer or value proposition before scrolling', '3. Avoid generic marketing jargon'],
      fixSnippet: `<h1>Definitive Solution to Target Search Query</h1>\n<p>Immediate 1-sentence value proposition fulfilling user intent.</p>`
    },
    {
      id: 'atf_clarity',
      label: 'Above-The-Fold (ATF) Hero Clarity & Value Proposition',
      category: 'sxo',
      weight: 20,
      matchKeywords: ['above-the-fold', 'atf', 'hero clarity', 'value proposition', 'missing above-the-fold'],
      impact: 'high',
      recommendation: 'Position the core value statement, primary heading, and primary CTA in the initial 600px viewport.',
      howToResolve: 'Click "Generate SXO Conversion Fixes" to generate an optimized above-the-fold Hero section with primary & secondary CTAs.',
      stepByStep: ['1. Ensure H1 and CTA are visible without scrolling on desktop and mobile', '2. Include secondary low-commitment action (e.g. "View Demo")', '3. Maintain clean visual hierarchy'],
      fixSnippet: `<section class="hero-atf" style="padding:60px 0; text-align:center;">\n  <h1>Clear, Powerful Headline</h1>\n  <p>Compelling value proposition subhead</p>\n  <div class="cta-row">\n    <a href="/signup" class="btn-primary">Get Started Free &rarr;</a>\n    <a href="/demo" class="btn-secondary">Book a Demo</a>\n  </div>\n</section>`
    },
    {
      id: 'primary_cta_visibility',
      label: 'Prominent Primary Conversion CTA (High Contrast)',
      category: 'sxo',
      weight: 20,
      matchKeywords: ['cta', 'call-to-action', 'primary cta', 'button copy', 'conversion action'],
      impact: 'critical',
      recommendation: 'Provide an unmistakable primary CTA button using high-contrast color and action-oriented verbs.',
      howToResolve: 'Use high-contrast button styling with active verbs (e.g. "Get Started Free", "Claim Audit", "Start Free Trial") instead of passive words like "Submit".',
      stepByStep: ['1. Use an accent brand color with high contrast against the background', '2. Label with benefit-driven verbs (e.g. "Start Free Trial")', '3. Ensure minimum 44px height for mobile tap comfort'],
      fixSnippet: `<a href="/signup" style="background:#cc785c; color:#fff; padding:14px 28px; border-radius:8px; font-weight:700; display:inline-block; text-decoration:none;">Get Started Free &rarr;</a>`
    },
    {
      id: 'reassurance_badges',
      label: 'Conversion Reassurance Triggers Near CTA',
      category: 'sxo',
      weight: 15,
      matchKeywords: ['reassurance', 'trust triggers', 'no credit card', 'free trial', 'money-back'],
      impact: 'medium',
      recommendation: 'Place friction-reducing microcopy directly below or alongside primary CTA buttons.',
      howToResolve: 'Add reassurance bullet points (e.g. "✓ No credit card required", "✓ 14-day free trial", "✓ Cancel anytime") directly under the primary CTA.',
      stepByStep: ['1. Place microcopy within 10px below primary CTA button', '2. Highlight risk reversal (no credit card, money-back guarantee)', '3. Use subtle muted text color (e.g. #6b7280)'],
      fixSnippet: `<div class="reassurance-row" style="font-size:12px; color:#6b7280; margin-top:8px; display:flex; gap:16px; justify-content:center;">\n  <span>&#10003; No credit card required</span>\n  <span>&#10003; 14-day free trial</span>\n  <span>&#10003; Cancel anytime</span>\n</div>`
    },
    {
      id: 'cta_friction',
      label: 'Low Form & Interaction Friction (<= 3 Fields)',
      category: 'sxo',
      weight: 15,
      matchKeywords: ['form friction', 'high form friction', 'input fields', 'form fields'],
      impact: 'high',
      recommendation: 'Streamline lead capture forms to 2-3 essential inputs to maximize search conversion rate.',
      howToResolve: 'Remove non-essential fields (e.g. phone, address, company size) from initial lead capture and request them during onboarding.',
      stepByStep: ['1. Reduce form to Work Email + Password/Name only', '2. Enable inline validation and autofill attributes', '3. Use prominent submit button'],
      fixSnippet: `<form class="low-friction-form">\n  <input type="email" name="email" placeholder="work@company.com" required autocomplete="email" />\n  <button type="submit">Start Free Trial &rarr;</button>\n</form>`
    },
    {
      id: 'scannable_hierarchy',
      label: 'Scannable Content Architecture (F-Pattern Reading)',
      category: 'sxo',
      weight: 10,
      matchKeywords: ['scannability', 'f-pattern', 'scannable', 'reading friction'],
      impact: 'medium',
      recommendation: 'Format content with bulleted lists, bold entity terms, and visual callouts for rapid scanning.',
      howToResolve: 'Break up long paragraphs into 2-3 sentence chunks, use bulleted lists, and bold key takeaway entities.',
      stepByStep: ['1. Limit paragraph length to max 3 sentences', '2. Bold key quantitative takeaways', '3. Use callout boxes for important definitions'],
      fixSnippet: `<div class="callout-box" style="background:#f4f5f7; border-left:4px solid #cc785c; padding:16px; border-radius:8px;">\n  <p><strong>Key Insight:</strong> Streamlining page architecture boosts organic search conversion rates by <strong>34%</strong>.</p>\n</div>`
    }
  ],

  // 4. E-E-A-T & Trust Signals
  eeat: [
    { 
      id: 'author_byline', 
      label: 'Author Byline & Bio Information', 
      category: 'eeat', 
      weight: 20, 
      matchKeywords: ['author', 'byline', 'author bio', 'written by', 'author schema'], 
      impact: 'high', 
      recommendation: 'Add clear author bylines with links to author bio pages and credentials.',
      howToResolve: 'Click "Generate Bio Widget" in the Content & E-E-A-T tab to copy and embed an author credential box with Schema.org/Person markup.',
      stepByStep: ['1. Click "Generate Bio Widget" button in the E-E-A-T tab', '2. Copy the author bio widget HTML', '3. Embed under article title or at the end of the post'],
      fixSnippet: `<div class="author-bio-box" itemscope itemtype="https://schema.org/Person">
  <span itemprop="name">Editorial Team &amp; Industry Specialists</span>
  <a href="/about" itemprop="url">View Credentials</a>
</div>`
    },
    { 
      id: 'about_contact_links', 
      label: 'Accessible About & Contact Links', 
      category: 'eeat', 
      weight: 20, 
      matchKeywords: ['about page', 'contact page', 'contact info', 'about us'], 
      impact: 'critical', 
      recommendation: 'Provide easily accessible links to About Us and Contact information in header/footer.',
      howToResolve: 'Add prominent links to /about and /contact in your global header and footer navigation.',
      stepByStep: ['1. Create dedicated /about and /contact landing pages', '2. Add navigation links to the global header and footer', '3. Include verified phone, email, and support response times'],
      fixSnippet: `<footer>
  <a href="/about">About Us</a> | <a href="/contact">Contact Support</a>
</footer>`
    },
    { 
      id: 'editorial_policy', 
      label: 'Privacy Policy & Terms of Service', 
      category: 'eeat', 
      weight: 20, 
      matchKeywords: ['privacy policy', 'terms of service', 'editorial policy', 'disclosure'], 
      impact: 'high', 
      recommendation: 'Link to updated Privacy Policy, Terms of Service, and affiliate/editorial disclosures in the footer.',
      howToResolve: 'Publish standard legal policy pages (/privacy, /terms) and link them in the footer.',
      stepByStep: ['1. Publish Privacy Policy and Terms of Service documents', '2. Add clear links in your site footer menu', '3. Include cookie compliance and data processing disclosures'],
      fixSnippet: `<footer>
  <a href="/privacy">Privacy Policy</a>
  <a href="/terms">Terms of Service</a>
</footer>`
    },
    { 
      id: 'trust_badges', 
      label: 'Trust Signals (Reviews, Badges, Certs)', 
      category: 'eeat', 
      weight: 20, 
      matchKeywords: ['trust badge', 'customer review', 'testimonials', 'ratings', 'social proof'], 
      impact: 'medium', 
      recommendation: 'Showcase verified customer reviews, security badges, and industry certifications.',
      howToResolve: 'Embed customer testimonial quotes and aggregate rating schema markup on your landing pages.',
      stepByStep: ['1. Add customer review quotes with verified client names/companies', '2. Embed AggregateRating JSON-LD schema', '3. Display security badges (SSL, ISO, SOC2, Trustpilot)'],
      fixSnippet: `<div class="testimonials">
  <blockquote>"Exceptional speed and automated intelligence." - Verified Client</blockquote>
</div>`
    },
    { 
      id: 'external_citations', 
      label: 'Authoritative External Citations', 
      category: 'eeat', 
      weight: 20, 
      matchKeywords: ['external citation', 'source link', 'reference link', 'academic source'], 
      impact: 'medium', 
      recommendation: 'Cite authoritative primary sources and industry studies to substantiate claims.',
      howToResolve: 'Add outbound hyperlinks to primary research studies, government databases, academic institutions (.edu), or standards bodies (W3C/IETF).',
      stepByStep: ['1. Identify quantitative statistics and factual benchmarks on the page', '2. Link directly to the primary research report or official documentation', '3. Use descriptive anchor text for the source link'],
      fixSnippet: `<a href="https://www.w3.org/TR/..." target="_blank" rel="noopener noreferrer">W3C Specification Guidelines</a>`
    }
  ],

  // 4. Structured Data & Schema.org
  schema: [
    { 
      id: 'json_ld_presence', 
      label: 'JSON-LD Structured Data Present', 
      category: 'schema', 
      weight: 25, 
      matchKeywords: ['schema', 'json-ld', 'microdata', 'missing schema'], 
      impact: 'critical', 
      recommendation: 'Implement JSON-LD structured data in the <head> using schema.org vocabulary.',
      howToResolve: 'Click "Generate Schema.org Markup" modal and paste the generated JSON-LD script into your <head>.',
      stepByStep: ['1. Click "Generate Schema.org Markup" in Schema tab', '2. Select Organization, WebSite, Product, or Article', '3. Paste the <script type="application/ld+json"> tag into your document <head>'],
      fixSnippet: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Brand",
  "url": "https://yourdomain.com"
}
</script>`
    },
    { 
      id: 'schema_valid', 
      label: 'Valid Schema.org Syntax & Properties', 
      category: 'schema', 
      weight: 25, 
      matchKeywords: ['schema error', 'invalid json-ld', 'schema validation', 'missing property'], 
      impact: 'high', 
      recommendation: 'Validate structured data syntax and ensure all required schema properties are provided.',
      howToResolve: 'Fix missing required properties (such as author, publisher, datePublished, image, offers) in your JSON-LD block.',
      stepByStep: ['1. Click "Test on Google" in Schema tab', '2. Check Google Rich Results Test for missing required fields', '3. Update JSON-LD properties in template'],
      fixSnippet: `<!-- Ensure all required properties like headline, image, author, publisher are populated -->`
    },
    { 
      id: 'entity_schema_type', 
      label: 'Core Entity Schema (Org/WebSite/Article/Product)', 
      category: 'schema', 
      weight: 20, 
      matchKeywords: ['organization schema', 'article schema', 'product schema', 'faq schema'], 
      impact: 'high', 
      recommendation: 'Define specific schemas such as Organization, WebSite, BreadcrumbList, or Product.',
      howToResolve: 'Implement appropriate schema types matching your page type (e.g. Product for ecommerce, Article for blog, Organization for homepage).',
      stepByStep: ['1. Use Schema generator modal to generate specific entity schema', '2. Include sameAs social profile links for entity disambiguation', '3. Embed in <head>'],
      fixSnippet: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "SiteName",
  "url": "https://yourdomain.com"
}
</script>`
    },
    { 
      id: 'open_graph', 
      label: 'Complete OpenGraph Meta Tags (og:title, og:image)', 
      category: 'schema', 
      weight: 15, 
      matchKeywords: ['open graph', 'og:title', 'og:description', 'og:image'], 
      impact: 'medium', 
      recommendation: 'Provide og:title, og:description, og:image (1200x630px), and og:url for social platforms.',
      howToResolve: 'Click "Generate Social Meta Tags Fix" in the Schema tab to copy and insert verified OpenGraph tags.',
      stepByStep: ['1. Upload a 1200x630px high-resolution banner image', '2. Click "Generate Social Meta Tags Fix"', '3. Paste OpenGraph meta tags into your HTML <head>'],
      fixSnippet: `<meta property="og:type" content="website" />
<meta property="og:title" content="Page Title" />
<meta property="og:description" content="Compelling description" />
<meta property="og:image" content="https://yourdomain.com/og-image.jpg" />
<meta property="og:url" content="https://yourdomain.com/" />`
    },
    { 
      id: 'twitter_cards', 
      label: 'Twitter Card Markup (twitter:card)', 
      category: 'schema', 
      weight: 15, 
      matchKeywords: ['twitter card', 'twitter:card', 'twitter:image'], 
      impact: 'medium', 
      recommendation: 'Include twitter:card (summary_large_image) and twitter:title for rich preview cards.',
      howToResolve: 'Add <meta name="twitter:card" content="summary_large_image"> and link a valid 1200x630px preview image.',
      stepByStep: ['1. Declare twitter:card as summary_large_image', '2. Specify twitter:title, twitter:description, and twitter:image', '3. Preview in the interactive Twitter simulator in Schema tab'],
      fixSnippet: `<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Page Title" />
<meta name="twitter:image" content="https://yourdomain.com/og-image.jpg" />`
    }
  ],

  // 5. AI Search & Answer Engine Optimization (GEO / AEO)
  geoAeo: [
    { 
      id: 'ai_citability', 
      label: 'High AI Citability & Factual Sentence Density', 
      category: 'geoAeo', 
      weight: 20, 
      matchKeywords: ['ai search', 'perplexity', 'chatgpt search', 'geo', 'citability', 'fact density'], 
      impact: 'critical', 
      recommendation: 'Structure content with concise, factual sentences that LLMs can quote as definitive answers.',
      howToResolve: 'Write concise, information-dense summary sentences that directly answer core user questions without fluff.',
      stepByStep: ['1. Identify core question queries for your target entity', '2. State direct factual answers in the opening sentence of each section', '3. Include quantifiable metrics and verifiable benchmarks'],
      fixSnippet: `<p><strong>[Entity Name]:</strong> [Entity] is a specialized platform providing automated intelligence and high-performance workflows.</p>`
    },
    { 
      id: 'direct_answers', 
      label: 'Direct Answer Callout (TL;DR / Key Takeaways Box)', 
      category: 'geoAeo', 
      weight: 20, 
      matchKeywords: ['direct answer', 'tldr', 'quick answer', 'key takeaways', 'summary block'], 
      impact: 'high', 
      recommendation: 'Place a 2-3 sentence definition or bulleted "Key Takeaways" box directly below the main heading.',
      howToResolve: 'Click "Generate AI Citability Fixes" in the AI Search tab and copy the "Key Takeaways Callout Box" directly under your <h1>.',
      stepByStep: ['1. Click "Generate AI Citability Fixes" in AI Search tab', '2. Select "Key Takeaways Callout Box"', '3. Paste the <aside> block immediately below your main <h1>'],
      fixSnippet: `<aside class="ai-key-takeaways" style="background:#f4f5f7; border-left:4px solid #cc785c; padding:16px 20px; border-radius:8px; margin:20px 0;">
  <h3 style="margin:0 0 8px 0; font-size:15px; font-weight:700;">⚡ Key Takeaways</h3>
  <ul style="margin:0; padding-left:20px; font-size:13px;">
    <li>Core capability and direct benefit</li>
    <li>Technical architecture specifications</li>
  </ul>
</aside>`
    },
    { 
      id: 'qa_format', 
      label: 'Question-Answer (Q&A) Heading Structure', 
      category: 'geoAeo', 
      weight: 15, 
      matchKeywords: ['faq', 'q&a', 'frequently asked questions', 'question header'], 
      impact: 'high', 
      recommendation: 'Use natural-language question headings (e.g. "What is...", "How to...") followed by direct answers.',
      howToResolve: 'Format your H2/H3 subheadings as natural question queries (e.g. "What is [Brand]?", "How does [Feature] work?") followed immediately by 2-sentence direct answers.',
      stepByStep: ['1. Click "Generate AI Citability Fixes" and choose "Q&A Section + FAQ Schema"', '2. Embed the Q&A section on your page', '3. Ensure FAQPage schema is populated'],
      fixSnippet: `<h2>How does [Product] work?</h2>
<p>[Product] operates by automating intelligence benchmarking across edge infrastructure.</p>`
    },
    { 
      id: 'structured_tables', 
      label: 'Data Comparison Tables for AI Extractors', 
      category: 'geoAeo', 
      weight: 15, 
      matchKeywords: ['table', 'comparison table', 'markdown table', 'data table'], 
      impact: 'medium', 
      recommendation: 'Use HTML <table> elements or structured comparison charts for easy LLM data extraction.',
      howToResolve: 'Convert comparative bullet points and data lists into clean HTML <table> elements with clear column headers.',
      stepByStep: ['1. Identify comparative feature or pricing data', '2. Structure as an HTML <table> with <thead> and <tbody>', '3. Add clear <th> headers for LLM table parsing'],
      fixSnippet: `<table class="comparison-table">
  <thead>
    <tr><th>Feature</th><th>Standard</th><th>Enterprise</th></tr>
  </thead>
  <tbody>
    <tr><td>Protocol</td><td>HTTP/2</td><td>HTTP/3 QUIC</td></tr>
  </tbody>
</table>`
    },
    { 
      id: 'ai_bot_access', 
      label: 'AI Crawler Directives (GPTBot, ClaudeBot, PerplexityBot)', 
      category: 'geoAeo', 
      weight: 10, 
      matchKeywords: ['gptbot', 'claudebot', 'perplexitybot', 'ai crawler', 'robots.txt'], 
      impact: 'medium', 
      recommendation: 'Explicitly allow or manage AI search discovery agents in your robots.txt.',
      howToResolve: 'Add explicit Allow rules in robots.txt for GPTBot, PerplexityBot, ClaudeBot, and Google-Extended.',
      stepByStep: ['1. Click "Generate AI Citability Fixes" and select "AI Bot Access"', '2. Copy the robots.txt rules', '3. Update your live /robots.txt file'],
      fixSnippet: `User-agent: GPTBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /`
    },
    { 
      id: 'entity_disambiguation', 
      label: 'Knowledge Graph Entity Disambiguation (Schema.org)', 
      category: 'geoAeo', 
      weight: 10, 
      matchKeywords: ['entity', 'knowledge graph', 'sameas', 'organization schema'], 
      impact: 'high', 
      recommendation: 'Disambiguate your brand identity with sameAs social and Wikidata profiles in JSON-LD.',
      howToResolve: 'Add sameAs links in your Organization schema pointing to official Twitter, LinkedIn, GitHub, and Wikidata profiles.',
      stepByStep: ['1. Open Organization schema JSON-LD', '2. Add "sameAs": ["https://twitter.com/...", "https://linkedin.com/..."]', '3. Validate in Google Rich Results Test'],
      fixSnippet: `"sameAs": [
  "https://twitter.com/yourbrand",
  "https://linkedin.com/company/yourbrand"
]`
    },
    { 
      id: 'statistical_proof', 
      label: 'Authoritative Statistics & Outbound Primary Citations', 
      category: 'geoAeo', 
      weight: 10, 
      matchKeywords: ['statistics', 'outbound citation', 'source citation', 'authoritative link'], 
      impact: 'medium', 
      recommendation: 'Include quantifiable metrics and link to primary authority databases (.gov, .edu, w3.org).',
      howToResolve: 'Incorporate quantifiable benchmark data (e.g. percentages, milliseconds, sample sizes) and link to primary sources.',
      stepByStep: ['1. Replace vague claims with specific measurable numbers', '2. Link claims to primary source research papers or official docs', '3. Format metrics prominently in callouts or tables'],
      fixSnippet: `<p>Independent benchmarks demonstrated a <strong>74% reduction in latency</strong> under peak concurrency (<a href="https://example.org/study" target="_blank" rel="noopener noreferrer">Study Source</a>).</p>`
    }
  ],

  // 6. Core Web Vitals & Performance
  performance: [
    { 
      id: 'image_alts', 
      label: 'All Images Have Descriptive Alt Text', 
      category: 'performance', 
      weight: 20, 
      matchKeywords: ['alt text', 'missing alt', 'empty alt', 'image alt'], 
      impact: 'high', 
      recommendation: 'Add descriptive alt text to every informative image to improve accessibility and image SEO.',
      howToResolve: 'Add alt="Descriptive description of the image" to every <img> element.',
      stepByStep: ['1. Search DOM for <img> tags without alt attributes or with empty alt=""', '2. Add contextual alt descriptions describing image content', '3. Leave alt="" only for purely decorative icons'],
      fixSnippet: `<img src="/dashboard-preview.png" alt="Platform Analytics and Performance Dashboard Preview" />`
    },
    { 
      id: 'modern_formats', 
      label: 'Next-Gen Image Formats (WebP / AVIF)', 
      category: 'performance', 
      weight: 20, 
      matchKeywords: ['webp', 'avif', 'image compression', 'large image', 'png to webp'], 
      impact: 'medium', 
      recommendation: 'Convert PNG and JPEG images to WebP or AVIF to reduce payload by up to 70%.',
      howToResolve: 'Convert raster PNG and JPEG images to WebP or AVIF format to reduce bandwidth consumption.',
      stepByStep: ['1. Convert images using sharp, Squoosh, or Next.js Image component', '2. Update <img> src to use .webp / .avif files', '3. Use <picture> tag with fallback if legacy browser support is required'],
      fixSnippet: `<picture>
  <source srcset="/hero.avif" type="image/avif" />
  <source srcset="/hero.webp" type="image/webp" />
  <img src="/hero.jpg" alt="Hero Banner" />
</picture>`
    },
    { 
      id: 'explicit_dimensions', 
      label: 'Explicit Image Width & Height (No Layout Shifts)', 
      category: 'performance', 
      weight: 20, 
      matchKeywords: ['cls', 'image dimensions', 'layout shift', 'missing width height'], 
      impact: 'high', 
      recommendation: 'Set explicit width and height attributes or aspect-ratio on all <img> elements.',
      howToResolve: 'Declare width="..." and height="..." attributes or CSS aspect-ratio on all <img> tags to eliminate Cumulative Layout Shift (CLS).',
      stepByStep: ['1. Add width="1200" height="630" attributes on all <img> elements', '2. In CSS, add img { max-width: 100%; height: auto; }', '3. Verify CLS score is 0 in Lighthouse'],
      fixSnippet: `<img src="/banner.webp" width="1200" height="630" style="width:100%; height:auto;" alt="Banner" />`
    },
    { 
      id: 'render_blocking', 
      label: 'No Render-Blocking Scripts / Styles', 
      category: 'performance', 
      weight: 20, 
      matchKeywords: ['render blocking', 'defer js', 'async script', 'critical css'], 
      impact: 'medium', 
      recommendation: 'Defer non-critical JavaScript using async or defer attributes.',
      howToResolve: 'Add defer or async attributes to non-critical external <script> tags in the <head>.',
      stepByStep: ['1. Inspect <script> tags in <head>', '2. Add defer attribute to scripts not needed for initial paint', '3. Inline critical CSS and load remainder asynchronously'],
      fixSnippet: `<script src="/analytics.js" defer></script>`
    },
    { 
      id: 'dom_size', 
      label: 'Optimized DOM Depth (< 1,500 elements)', 
      category: 'performance', 
      weight: 20, 
      matchKeywords: ['dom size', 'dom elements', 'excessive dom'], 
      impact: 'low', 
      recommendation: 'Streamline HTML structure and remove unnecessary wrapper <div> elements.',
      howToResolve: 'Remove redundant wrapper <div> elements and implement virtual scrolling or pagination for long lists.',
      stepByStep: ['1. Inspect DOM tree depth in Chrome DevTools', '2. Flatten unnecessary nested container elements', '3. Paginate or lazy-load off-screen dynamic content'],
      fixSnippet: `<!-- Streamline nested divs and paginate long lists -->`
    }
  ],

  // 7. Internal Linking & Site Architecture
  internalLinks: [
    { 
      id: 'descriptive_anchor', 
      label: 'Descriptive Anchor Text (No Generic "Click Here")', 
      category: 'internalLinks', 
      weight: 30, 
      matchKeywords: ['anchor text', 'click here', 'generic anchor', 'read more', 'learn more'], 
      impact: 'high', 
      recommendation: 'Use keyword-rich, informative anchor text that explains the destination page.',
      howToResolve: 'Replace generic anchor text like "click here", "read more", or "link" with descriptive phrases explaining the destination topic.',
      stepByStep: ['1. Search codebase for <a> tags with text "click here" or "learn more"', '2. Change text to describe destination page (e.g. "Read the Full Architecture Guide")', '3. Maintain natural context around the hyperlink'],
      fixSnippet: `<a href="/solutions/enterprise">Explore Enterprise Optimization Architecture &rarr;</a>`
    },
    { 
      id: 'internal_link_count', 
      label: 'Healthy Internal Linking Distribution (> 3 links)', 
      category: 'internalLinks', 
      weight: 25, 
      matchKeywords: ['few internal links', 'orphan page', 'isolated page', 'no internal links'], 
      impact: 'high', 
      recommendation: 'Link to related articles and category landing pages to distribute link equity.',
      howToResolve: 'Add contextual links to related landing pages, documentation, and product categories within the page body.',
      stepByStep: ['1. Identify 3-5 relevant related pages on your website', '2. Add contextual hyperlinks within the body paragraphs', '3. Include a "Related Resources" section at the end of the page'],
      fixSnippet: `<div class="related-links">
  <h3>Related Resources:</h3>
  <ul>
    <li><a href="/guides/performance">Core Web Vitals Optimization Guide</a></li>
    <li><a href="/docs/api">REST API Documentation</a></li>
  </ul>
</div>`
    },
    { 
      id: 'no_broken_internal', 
      label: 'Zero Broken Internal Links (404s)', 
      category: 'internalLinks', 
      weight: 30, 
      matchKeywords: ['broken internal', 'dead internal link', 'internal 404'], 
      impact: 'critical', 
      recommendation: 'Audit and update all broken internal links pointing to non-existent URLs.',
      howToResolve: 'Fix all internal links returning HTTP 404 or point them to the correct updated URL.',
      stepByStep: ['1. Check Link Graph tab for 404 responses', '2. Update broken href paths in your source code', '3. Setup 301 redirects for any permanently moved pages'],
      fixSnippet: `<!-- Update broken links to valid live URL destinations -->`
    },
    { 
      id: 'outbound_attribution', 
      label: 'Proper Outbound Link Attribution (rel="sponsored/nofollow")', 
      category: 'internalLinks', 
      weight: 15, 
      matchKeywords: ['nofollow', 'sponsored link', 'outbound link', 'affiliate link'], 
      impact: 'low', 
      recommendation: 'Add rel="sponsored" or rel="nofollow" to paid, affiliate, or user-generated links.',
      howToResolve: 'Add rel="sponsored" to commercial/affiliate links and rel="ugc" to user-generated links in comments or forums.',
      stepByStep: ['1. Identify paid endorsements or affiliate outbound links', '2. Add rel="sponsored" attribute to the <a> tag', '3. Ensure standard editorial citations remain rel="noopener"'],
      fixSnippet: `<a href="https://partner.com" target="_blank" rel="sponsored noopener">Partner Offer</a>`
    }
  ],

  // 8. International & Local SEO
  internationalLocal: [
    { 
      id: 'html_lang', 
      label: 'Valid HTML Lang Attribute', 
      category: 'internationalLocal', 
      weight: 30, 
      matchKeywords: ['html lang', 'lang attribute', 'missing lang'], 
      impact: 'medium', 
      recommendation: 'Specify the primary language code in the <html> element (e.g. <html lang="en">).',
      howToResolve: 'Add lang="en" (or your appropriate ISO 639-1 language code) to the root <html> tag.',
      stepByStep: ['1. Open your base HTML template or root layout', '2. Add lang="en" to <html lang="en">', '3. Declare dir="ltr" or dir="rtl" if applicable'],
      fixSnippet: `<html lang="en" dir="ltr">`
    },
    { 
      id: 'hreflang_tags', 
      label: 'Consistent Hreflang & x-default Tags', 
      category: 'internationalLocal', 
      weight: 40, 
      matchKeywords: ['hreflang', 'x-default', 'international seo', 'language alternate'], 
      impact: 'high', 
      recommendation: 'For multi-language sites, implement bidirectional hreflang tags with an x-default fallback.',
      howToResolve: 'Add bidirectional <link rel="alternate" hreflang="..." href="..." /> tags in <head> for each regional version.',
      stepByStep: ['1. Declare hreflang for each language variation', '2. Add x-default fallback for unmatched regions', '3. Ensure reciprocal hreflang links exist on all language versions'],
      fixSnippet: `<link rel="alternate" hreflang="en" href="https://yourdomain.com/en/" />
<link rel="alternate" hreflang="es" href="https://yourdomain.com/es/" />
<link rel="alternate" hreflang="x-default" href="https://yourdomain.com/" />`
    },
    { 
      id: 'local_nap', 
      label: 'Local Business Signals & NAP Consistency', 
      category: 'internationalLocal', 
      weight: 30, 
      matchKeywords: ['local business', 'nap', 'address', 'phone number', 'google maps'], 
      impact: 'medium', 
      recommendation: 'Include consistent Name, Address, and Phone Number (NAP) markup for local discovery.',
      howToResolve: 'Embed LocalBusiness Schema.org JSON-LD with exact Name, PostalAddress, telephone, and opening hours.',
      stepByStep: ['1. Use Schema Generator modal to select "LocalBusiness"', '2. Fill in exact business address, phone, and opening hours', '3. Ensure NAP matches Google Business Profile exactly'],
      fixSnippet: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Business Name",
  "telephone": "+1-800-555-0199",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "100 Main St",
    "addressLocality": "City",
    "addressRegion": "ST",
    "postalCode": "12345",
    "addressCountry": "US"
  }
}
</script>`
    }
  ]
};

/**
 * Calculate detailed theme breakdown and checklist scores
 */
export function calculateThemeScore(themeKey: string, issues: any[] = [], fallbackScore: number = 75) {
  const predefinedChecks = THEME_CHECKS[themeKey] || [];
  
  if (predefinedChecks.length === 0) {
    return {
      score: fallbackScore,
      checksStatus: [],
      passedCount: 0,
      totalChecks: 0,
      unmatchedIssues: issues
    };
  }

  let totalWeight = 0;
  let earnedWeight = 0;
  const matchedIssueIds = new Set<string>();

  const checksStatus = predefinedChecks.map(check => {
    totalWeight += check.weight;
    
    // Check if any active issue matches this check's keywords
    const matchingIssues = issues.filter(issue => {
      const textToSearch = `${issue.title || ''} ${issue.description || ''}`.toLowerCase();
      return check.matchKeywords.some(kw => textToSearch.includes(kw.toLowerCase()));
    });

    const isPassed = matchingIssues.length === 0;
    
    if (isPassed) {
      earnedWeight += check.weight;
    } else {
      matchingIssues.forEach(i => matchedIssueIds.add(i.id || i.title));
    }

    const mappedIssues = matchingIssues.map(i => ({
      title: i.title,
      description: i.description,
      severity: i.severity || 'warning',
      priority: i.priority || 'medium'
    }));

    return {
      id: check.id,
      label: check.label,
      passed: isPassed,
      impact: check.impact,
      weight: check.weight,
      recommendation: check.recommendation,
      matchingIssues: mappedIssues,
      failedIssues: isPassed ? [] : mappedIssues
    };
  });

  const calculatedScore = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : fallbackScore;
  const passedCount = checksStatus.filter(c => c.passed).length;
  const unmatchedIssues = issues.filter(i => !matchedIssueIds.has(i.id || i.title));

  return {
    score: calculatedScore,
    checksStatus,
    passedCount,
    totalChecks: predefinedChecks.length,
    unmatchedIssues
  };
}

/**
 * Calculate Flesch-Kincaid Reading Ease Score from clean text
 */
export function calculateFleschKincaid(text: string): { score: number; label: string; gradeLevel: string } {
  if (!text || text.trim().length === 0) {
    return { score: 0, label: 'No Content', gradeLevel: 'N/A' };
  }

  const clean = text.replace(/[^a-zA-Z0-9\s.!?]/g, ' ');
  const sentences = clean.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = clean.split(/\s+/).filter(w => w.length > 0);

  const numSentences = Math.max(1, sentences.length);
  const numWords = Math.max(1, words.length);

  // Approximate syllable count
  let numSyllables = 0;
  for (const word of words) {
    const w = word.toLowerCase();
    if (w.length <= 3) {
      numSyllables += 1;
      continue;
    }
    const syllables = w.replace(/(?:[^laeiouy]|ed|es|e)$/, '')
                       .replace(/^y/, '')
                       .match(/[aeiouy]{1,2}/g);
    numSyllables += syllables ? syllables.length : 1;
  }

  // Flesch Reading Ease Formula: 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words)
  const score = Math.round(206.835 - (1.015 * (numWords / numSentences)) - (84.6 * (numSyllables / numWords)));
  const boundedScore = Math.max(0, Math.min(100, score));

  let label = 'Fairly Difficult';
  let gradeLevel = '10th to 12th grade';

  if (boundedScore >= 90) {
    label = 'Very Easy';
    gradeLevel = '5th grade';
  } else if (boundedScore >= 80) {
    label = 'Easy';
    gradeLevel = '6th grade';
  } else if (boundedScore >= 70) {
    label = 'Fairly Easy';
    gradeLevel = '7th grade';
  } else if (boundedScore >= 60) {
    label = 'Standard';
    gradeLevel = '8th to 9th grade';
  } else if (boundedScore >= 50) {
    label = 'Fairly Difficult';
    gradeLevel = '10th to 12th grade';
  } else if (boundedScore >= 30) {
    label = 'Difficult';
    gradeLevel = 'College level';
  } else {
    label = 'Very Confusing';
    gradeLevel = 'Graduate level';
  }

  return { score: boundedScore, label, gradeLevel };
}

/**
 * Generate standard Schema.org JSON-LD fix code based on page type
 */
export function generateSchemaFix(type: 'Organization' | 'WebSite' | 'Article' | 'Product' | 'FAQPage' | 'BreadcrumbList' | 'LocalBusiness', data: { url: string; name?: string; title?: string }) {
  const domain = data.url ? new URL(data.url).hostname : 'example.com';
  const siteName = data.name || domain.replace(/^www\./, '').split('.')[0];

  if (type === 'Organization') {
    return JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": siteName.charAt(0).toUpperCase() + siteName.slice(1),
      "url": data.url,
      "logo": `${data.url}/logo.png`,
      "sameAs": [
        "https://twitter.com/" + siteName,
        "https://linkedin.com/company/" + siteName,
        "https://github.com/" + siteName
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer support",
        "email": `support@${domain}`
      }
    }, null, 2);
  }

  if (type === 'FAQPage') {
    return JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": `What is ${siteName}?`,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": `${siteName} is an AI-powered optimization platform designed to improve performance and search visibility.`
          }
        },
        {
          "@type": "Question",
          "name": `How do I get started with ${siteName}?`,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "You can create an account and run your first automated intelligence scan in under two minutes."
          }
        }
      ]
    }, null, 2);
  }

  if (type === 'Article') {
    return JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": data.title || `${siteName} Comprehensive Guide`,
      "url": data.url,
      "datePublished": new Date().toISOString().split('T')[0],
      "dateModified": new Date().toISOString().split('T')[0],
      "author": {
        "@type": "Person",
        "name": "Editorial Team",
        "url": `${data.url}/about`
      },
      "publisher": {
        "@type": "Organization",
        "name": siteName,
        "logo": {
          "@type": "ImageObject",
          "url": `${data.url}/logo.png`
        }
      }
    }, null, 2);
  }

  if (type === 'BreadcrumbList') {
    return JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": data.url
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": data.title || "Solutions",
          "item": `${data.url}/solutions`
        }
      ]
    }, null, 2);
  }

  if (type === 'LocalBusiness') {
    return JSON.stringify({
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": siteName.charAt(0).toUpperCase() + siteName.slice(1),
      "image": `${data.url}/storefront.jpg`,
      "@id": `${data.url}#localbusiness`,
      "url": data.url,
      "telephone": "+1-800-555-0199",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "100 Innovation Way",
        "addressLocality": "San Francisco",
        "addressRegion": "CA",
        "postalCode": "94107",
        "addressCountry": "US"
      },
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "18:00"
      }
    }, null, 2);
  }

  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": siteName,
    "url": data.url,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${data.url}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  }, null, 2);
}

// Generate Social Meta Tags (OpenGraph & Twitter Cards)
export function generateSocialMetaTags(data: { url: string; title: string; description: string; image?: string; siteName?: string }): string {
  const imgUrl = data.image && !data.image.includes('Missing') ? data.image : `${data.url}/og-image.jpg`;
  const cleanTitle = (data.title || 'Enterprise Platform').replace(/"/g, '&quot;');
  const cleanDesc = (data.description || 'Discover features and solutions.').replace(/"/g, '&quot;');
  const brand = data.siteName || 'Platform';

  return `<!-- Open Graph / Facebook / LinkedIn / Slack -->
<meta property="og:type" content="website" />
<meta property="og:url" content="${data.url}" />
<meta property="og:site_name" content="${brand}" />
<meta property="og:title" content="${cleanTitle}" />
<meta property="og:description" content="${cleanDesc}" />
<meta property="og:image" content="${imgUrl}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:locale" content="en_US" />

<!-- Twitter / X Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:url" content="${data.url}" />
<meta name="twitter:title" content="${cleanTitle}" />
<meta name="twitter:description" content="${cleanDesc}" />
<meta name="twitter:image" content="${imgUrl}" />
<meta name="twitter:site" content="@${brand.toLowerCase().replace(/\s+/g, '')}" />`;
}

// Extract top keywords & densities
export function extractKeywords(text: string, topN = 12): { word: string; count: number; density: number }[] {
  if (!text) return [];
  const stopwords = new Set([
    'the', 'and', 'for', 'with', 'that', 'this', 'from', 'have', 'are', 'was', 'were', 'which',
    'you', 'your', 'our', 'their', 'they', 'all', 'can', 'will', 'about', 'more', 'when', 'what',
    'who', 'how', 'why', 'where', 'into', 'some', 'than', 'them', 'then', 'also', 'such', 'like',
    'been', 'has', 'had', 'its', 'not', 'but', 'out', 'other', 'only', 'most', 'after', 'over'
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopwords.has(w) && !/^\d+$/.test(w));

  const totalWords = words.length || 1;
  const counts: Record<string, number> = {};

  for (const w of words) {
    counts[w] = (counts[w] || 0) + 1;
  }

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word, count]) => ({
      word,
      count,
      density: Math.round((count / totalWords) * 1000) / 10
    }));
}

// Generate Server Configuration Snippets for Missing Security Headers
export function generateSecurityConfig(serverType: 'nginx' | 'apache' | 'cloudflare' | 'nextjs', domain: string): string {
  if (serverType === 'nginx') {
    return `# Nginx Configuration (/etc/nginx/sites-available/${domain})
server {
  listen 443 ssl http2;
  server_name ${domain} www.${domain};

  # Strict-Transport-Security (HSTS - 1 year + subdomains + preload)
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

  # Clickjacking defense
  add_header X-Frame-Options "SAMEORIGIN" always;

  # MIME-type sniffing defense
  add_header X-Content-Type-Options "nosniff" always;

  # Referrer Policy
  add_header Referrer-Policy "strict-origin-when-cross-origin" always;

  # Permissions Policy
  add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

  # Content-Security-Policy
  add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:;" always;
}`;
  }

  if (serverType === 'apache') {
    return `# Apache .htaccess Configuration
<IfModule mod_headers.c>
  # Strict-Transport-Security (HSTS)
  Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"

  # Clickjacking defense
  Header always set X-Frame-Options "SAMEORIGIN"

  # MIME-type sniffing defense
  Header always set X-Content-Type-Options "nosniff"

  # Referrer Policy
  Header always set Referrer-Policy "strict-origin-when-cross-origin"

  # Permissions Policy
  Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"
</IfModule>`;
  }

  if (serverType === 'nextjs') {
    return `// next.config.mjs / next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }
        ]
      }
    ]
  }
};
export default nextConfig;`;
  }

  return `# Cloudflare Transform Rule / Response Headers
# Rule Expression: (http.host eq "${domain}")
# Headers to Set:
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin`;
}

// Generate Key Takeaways / Direct Answer Callout Box for AI Search
export function generateAiSummaryBox(data: { brand: string; title: string; url: string }): string {
  const brand = data.brand || 'Enterprise';
  const title = data.title || 'Optimization Overview';

  return `<!-- GEO / AEO Key Takeaways Callout Box (Place directly under H1) -->
<aside class="ai-key-takeaways" style="background:#f4f5f7; border-left:4px solid #cc785c; padding:18px 24px; border-radius:8px; margin:24px 0; font-family:sans-serif;">
  <h3 style="margin:0 0 10px 0; font-size:16px; font-weight:700; color:#141413; display:flex; align-items:center; gap:8px;">
    ⚡ Key Takeaways &amp; Direct Answer Summary
  </h3>
  <p style="margin:0 0 12px 0; font-size:14px; line-height:1.6; color:#333;">
    <strong>${title}:</strong> ${brand} provides specialized solutions delivering automated intelligence, verified benchmarking, and high-performance workflows designed for scale and algorithmic search visibility.
  </p>
  <ul style="margin:0; padding-left:20px; font-size:13px; color:#444; line-height:1.5;">
    <li><strong>Core Architecture:</strong> High-speed edge infrastructure with multi-protocol validation.</li>
    <li><strong>Data Verification:</strong> Standardized Schema.org structured data and direct answer blocks.</li>
    <li><strong>Algorithmic Authority:</strong> Rigorous E-E-A-T trust signals and primary-source citations.</li>
  </ul>
</aside>`;
}

// Generate FAQ Q&A Section with embedded FAQPage JSON-LD
export function generateAiFaqSection(data: { brand: string; url: string }): string {
  const brand = data.brand || 'Platform';
  const url = data.url || 'https://domain.com';

  const faqJson = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `What is ${brand} and how does it work?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `${brand} is an automated intelligence platform providing deep technical diagnostics, performance benchmarking, and real-time optimization workflows.`
        }
      },
      {
        "@type": "Question",
        "name": `How does ${brand} optimize for AI Search engines like Perplexity and ChatGPT?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `${brand} structures core definitions, direct answer callouts, and Schema.org structured data so LLMs can extract verified citations with high confidence.`
        }
      },
      {
        "@type": "Question",
        "name": `What are the key benefits of using ${brand}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Users experience improved indexability, higher search rankings, faster page load speeds, and enhanced generative search citations.`
        }
      }
    ]
  };

  return `<!-- AEO Natural-Language Q&A Section -->
<section class="aeo-faq-section" style="margin:40px 0;">
  <h2>Frequently Asked Questions</h2>
  
  <div class="faq-item" style="margin-bottom:16px;">
    <h3>What is ${brand} and how does it work?</h3>
    <p>${brand} is an automated intelligence platform providing deep technical diagnostics, performance benchmarking, and real-time optimization workflows.</p>
  </div>

  <div class="faq-item" style="margin-bottom:16px;">
    <h3>How does ${brand} optimize for AI Search engines like Perplexity and ChatGPT?</h3>
    <p>${brand} structures core definitions, direct answer callouts, and Schema.org structured data so LLMs can extract verified citations with high confidence.</p>
  </div>

  <div class="faq-item" style="margin-bottom:16px;">
    <h3>What are the key benefits of using ${brand}?</h3>
    <p>Users experience improved indexability, higher search rankings, faster page load speeds, and enhanced generative search citations.</p>
  </div>
</section>

<!-- Embedded FAQPage Structured Data -->
<script type="application/ld+json">
${JSON.stringify(faqJson, null, 2)}
</script>`;
}

// Generate robots.txt Rules for AI Search Crawlers
export function generateAiRobotsTxt(): string {
  return `# Allow AI Search Engines (Perplexity, ChatGPT Search, Claude, Google Gemini)
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: CCBot
Allow: /

# Standard Search Crawlers
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/private/

Sitemap: https://yourdomain.com/sitemap.xml`;
}

// ----------------------------------------------------------------------------
// SPEED & IMAGES OPTIMIZATION GENERATORS
// ----------------------------------------------------------------------------

export function generateModernPictureTag({ src, alt, width, height }: { src: string; alt?: string; width?: number; height?: number }): string {
  const cleanSrc = src || '/images/hero-banner.jpg';
  const avifSrc = cleanSrc.replace(/\.(png|jpg|jpeg)$/i, '.avif');
  const webpSrc = cleanSrc.replace(/\.(png|jpg|jpeg)$/i, '.webp');
  const fallbackAlt = alt && alt !== 'Missing' ? alt : 'Optimized platform hero illustration and architecture diagram';
  const w = width || 1200;
  const h = height || 630;

  return `<!-- Next-Gen Responsive Image with AVIF + WebP Fallback & Zero Layout Shift -->
<picture>
  <!-- Next-gen AVIF (Up to 80% compression reduction) -->
  <source srcset="${avifSrc}" type="image/avif" />
  
  <!-- Modern WebP fallback -->
  <source srcset="${webpSrc}" type="image/webp" />
  
  <!-- Standard Fallback Image with Explicit Dimensions -->
  <img 
    src="${cleanSrc}" 
    alt="${fallbackAlt}"
    width="${w}" 
    height="${h}" 
    loading="lazy" 
    decoding="async" 
    fetchpriority="low"
    style="width: 100%; height: auto; aspect-ratio: ${w} / ${h}; display: block;"
  />
</picture>`;
}

export function generateZeroClsImageCss(): string {
  return `/* Pure CSS Zero-CLS & High-Performance Image Optimization Rules */

/* 1. Global Responsive Image Container with Aspect Ratio Reservation */
.responsive-img-wrapper {
  position: relative;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  background: #f4f5f7; /* Skeleton placeholder while loading */
  border-radius: 8px;
}

.responsive-img-wrapper img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
  /* Eliminates CLS layout jumps before asset downloads */
  aspect-ratio: attr(width) / attr(height);
  transition: opacity 0.3s ease-in-out;
}

/* 2. Content Visibility Optimization for Offscreen Heavy Assets */
.offscreen-media-section {
  content-visibility: auto;
  contain-intrinsic-size: 0 500px;
}`;
}

export function generateScriptDeferSnippets(): string {
  return `<!-- 1. High-Priority Critical Scripts (Load Async) -->
<script src="/scripts/gtm.js" async></script>

<!-- 2. Non-Critical JavaScript (Defer Execution until DOM Ready) -->
<script src="/scripts/analytics.js" defer></script>
<script src="/scripts/chat-widget.js" defer></script>

<!-- 3. Preconnect to Key CDN / Font Domains for Faster TTFB -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />`;
}

// ----------------------------------------------------------------------------
// LINK GRAPH & SITE ARCHITECTURE GENERATORS
// ----------------------------------------------------------------------------

export function generateSemanticLinkSilo({ brand, domain }: { brand: string; domain: string }): string {
  const d = domain ? `https://${domain.replace(/^https?:\/\//, '')}` : 'https://yourdomain.com';
  return `<!-- Hub-and-Spoke Internal Link Silo Architecture -->
<nav aria-label="Topic Cluster Hub" class="link-silo-navigation" style="background:#fafafa; border:1px solid #e5e7eb; border-radius:12px; padding:24px; margin:32px 0;">
  <h3 style="font-size:16px; font-weight:700; margin-bottom:12px; color:#111827;">
    Explore Related ${brand} Solutions &amp; Documentation
  </h3>
  <ul style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:12px; list-style:none; padding:0; margin:0;">
    <li>
      <a href="${d}/solutions/enterprise" style="color:#cc785c; font-weight:600; text-decoration:none;">
        &rarr; Enterprise Architecture Overview
      </a>
      <p style="font-size:12px; color:#6b7280; margin:4px 0 0 0;">Comprehensive edge intelligence infrastructure.</p>
    </li>
    <li>
      <a href="${d}/docs/api-reference" style="color:#cc785c; font-weight:600; text-decoration:none;">
        &rarr; API &amp; Benchmark Documentation
      </a>
      <p style="font-size:12px; color:#6b7280; margin:4px 0 0 0;">REST endpoints, schemas, and performance specs.</p>
    </li>
    <li>
      <a href="${d}/case-studies" style="color:#cc785c; font-weight:600; text-decoration:none;">
        &rarr; Verified Case Studies &amp; Benchmarks
      </a>
      <p style="font-size:12px; color:#6b7280; margin:4px 0 0 0;">Real-world latency reductions and ROI metrics.</p>
    </li>
    <li>
      <a href="${d}/pricing" style="color:#cc785c; font-weight:600; text-decoration:none;">
        &rarr; Pricing &amp; Deployment Tiers
      </a>
      <p style="font-size:12px; color:#6b7280; margin:4px 0 0 0;">Transparent plans for growing teams.</p>
    </li>
  </ul>
</nav>`;
}

export function generateOutboundLinkAttributionSnippet(): string {
  return `<!-- Standard Outbound Link Attribution & Security Directives -->

<!-- 1. Commercial / Paid / Affiliate Outbound Links -->
<a href="https://partner-service.com" target="_blank" rel="sponsored noopener noreferrer">
  Partner Performance Platform (Sponsored)
</a>

<!-- 2. User-Generated Links (Comments, Forums, User Submissions) -->
<a href="https://user-submitted-link.com" target="_blank" rel="ugc nofollow noopener">
  User Contributed Resource
</a>

<!-- 3. Authoritative Editorial Citation (.gov, .edu, W3C, Wikipedia) -->
<a href="https://www.w3.org/TR/webdriver/" target="_blank" rel="noopener noreferrer">
  W3C Official Protocol Specification
</a>`;
}

// ----------------------------------------------------------------------------
// SEARCH EXPERIENCE & CRO (SXO) GENERATORS
// ----------------------------------------------------------------------------

export function generateSxoHeroSection({ brand, title, domain }: { brand: string; title?: string; domain?: string }): string {
  const d = domain ? `https://${domain.replace(/^https?:\/\//, '')}` : 'https://yourdomain.com';
  const cleanTitle = title || `High-Performance ${brand} Enterprise Solutions`;

  return `<!-- SXO Optimized Above-The-Fold (ATF) Hero Section -->
<header class="sxo-hero-section" style="padding: 72px 24px; text-align: center; background: radial-gradient(circle at top, #faf9f5, #f0ede6); border-bottom: 1px solid #e5e7eb;">
  <div style="max-width: 800px; margin: 0 auto;">
    <!-- Intent-Driven Tagline -->
    <span style="display: inline-block; padding: 6px 14px; background: rgba(204, 120, 92, 0.1); color: #cc785c; font-weight: 700; font-size: 12px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px;">
      Verified Search Experience &amp; Intelligence
    </span>

    <!-- Primary H1 with Exact Entity Relevance -->
    <h1 style="font-size: clamp(32px, 5vw, 48px); font-weight: 800; line-height: 1.15; color: #111827; margin: 0 0 16px 0;">
      ${cleanTitle}
    </h1>

    <!-- 2-Sentence High-Converting Value Proposition -->
    <p style="font-size: 18px; color: #4b5563; line-height: 1.6; margin: 0 0 32px 0;">
      Deliver automated search intelligence, eliminate core web vital bottlenecks, and convert organic traffic with zero technical friction.
    </p>

    <!-- Dual Conversion CTAs (Primary Action + Low Commitment Demo) -->
    <div style="display: flex; gap: 14px; justify-content: center; align-items: center; flex-wrap: wrap;">
      <a href="${d}/signup" style="background: #cc785c; color: #ffffff; padding: 14px 28px; border-radius: 8px; font-weight: 700; font-size: 15px; text-decoration: none; box-shadow: 0 4px 14px rgba(204, 120, 92, 0.35); transition: transform 0.15s ease;">
        Start Free Trial &rarr;
      </a>
      <a href="${d}/demo" style="background: #ffffff; color: #374151; border: 1px solid #d1d5db; padding: 14px 24px; border-radius: 8px; font-weight: 600; font-size: 15px; text-decoration: none;">
        Book Live Demo
      </a>
    </div>

    <!-- Reassurance Microcopy Triggers (Zero Friction) -->
    <div style="margin-top: 16px; font-size: 12px; color: #6b7280; display: flex; gap: 18px; justify-content: center; flex-wrap: wrap;">
      <span>&#10003; No credit card required</span>
      <span>&#10003; 14-day full access</span>
      <span>&#10003; 2-minute instant setup</span>
    </div>
  </div>
</header>`;
}

export function generateSxoStickyMobileBar({ brand, domain }: { brand: string; domain?: string }): string {
  const d = domain ? `https://${domain.replace(/^https?:\/\//, '')}` : 'https://yourdomain.com';
  return `<!-- Sticky Mobile Bottom Conversion Bar (Fitts's Law Optimized) -->
<aside class="sticky-mobile-cta" style="position: fixed; bottom: 0; left: 0; right: 0; background: #ffffff; border-top: 1px solid #e5e7eb; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; z-index: 999; box-shadow: 0 -4px 16px rgba(0,0,0,0.08);">
  <div>
    <span style="font-size: 13px; font-weight: 700; color: #111827; display: block;">${brand} Free Plan</span>
    <span style="font-size: 11px; color: #6b7280;">No credit card required</span>
  </div>
  <a href="${d}/signup" style="background: #cc785c; color: #fff; padding: 10px 20px; border-radius: 6px; font-weight: 700; font-size: 13px; text-decoration: none;">
    Get Started &rarr;
  </a>
</aside>`;
}

export function generateSxoLeadForm(): string {
  return `<!-- High-Conversion, Low-Friction Lead Form (2 Fields Max) -->
<form class="sxo-lead-form" style="max-width: 480px; margin: 24px auto; padding: 24px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
  <h3 style="font-size: 18px; font-weight: 700; margin: 0 0 8px 0; color: #111827;">Instant Access</h3>
  <p style="font-size: 13px; color: #6b7280; margin: 0 0 16px 0;">Start evaluating search and conversion intelligence immediately.</p>
  
  <div style="margin-bottom: 12px;">
    <label for="work-email" style="display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 4px;">Work Email</label>
    <input type="email" id="work-email" name="email" placeholder="name@company.com" required style="width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;" />
  </div>

  <button type="submit" style="width: 100%; background: #cc785c; color: #fff; padding: 12px; border: none; border-radius: 6px; font-weight: 700; font-size: 14px; cursor: pointer;">
    Claim Your Free Audit &rarr;
  </button>
  
  <p style="font-size: 11px; color: #9ca3af; text-align: center; margin: 8px 0 0 0;">
    We respect your privacy. Instant account creation without spam.
  </p>
</form>`;
}

