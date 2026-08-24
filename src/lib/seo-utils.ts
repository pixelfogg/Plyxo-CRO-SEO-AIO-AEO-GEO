export const THEME_CHECKS: Record<string, { id: string; label: string; matchKeywords: string[] }[]> = {
  https: [
    { id: 'ssl_valid', label: 'Valid SSL Certificate', matchKeywords: ['ssl', 'certificate', 'https', 'expired'] },
    { id: 'mixed_content', label: 'No Mixed Content', matchKeywords: ['mixed content', 'http://'] },
    { id: 'secure_cookies', label: 'Secure Cookies', matchKeywords: ['cookie', 'secure flag'] },
    { id: 'hsts_header', label: 'HSTS Header Present', matchKeywords: ['hsts', 'strict-transport-security'] },
    { id: 'tls_version', label: 'Modern TLS Version', matchKeywords: ['tls', 'tls 1.0', 'tls 1.1'] }
  ],
  markup: [
    { id: 'schema_presence', label: 'Schema.org presence', matchKeywords: ['schema', 'json-ld', 'microdata'] },
    { id: 'schema_valid', label: 'Schema validation', matchKeywords: ['invalid schema', 'schema error'] },
    { id: 'breadcrumb_schema', label: 'Breadcrumb Schema', matchKeywords: ['breadcrumb'] },
    { id: 'local_schema', label: 'Local Business Schema', matchKeywords: ['local business', 'localbusiness'] },
    { id: 'article_schema', label: 'Article/Product Schema', matchKeywords: ['article schema', 'product schema'] },
    { id: 'open_graph', label: 'Open Graph tags', matchKeywords: ['open graph', 'og:'] },
    { id: 'twitter_cards', label: 'Twitter Cards', matchKeywords: ['twitter card', 'twitter:'] }
  ],
  robotsTxt: [
    { id: 'robots_presence', label: 'robots.txt found', matchKeywords: ['robots.txt', 'robots missing'] },
    { id: 'robots_valid', label: 'robots.txt format is valid', matchKeywords: ['robots.txt format', 'invalid robots'] },
    { id: 'sitemap_declared', label: 'Sitemap declared in robots.txt', matchKeywords: ['sitemap in robots', 'sitemap declared'] },
    { id: 'sensitive_paths', label: 'Sensitive Paths Blocked', matchKeywords: ['admin', 'sensitive path'] }
  ],
  crawlability: [
    { id: 'no_4xx_5xx', label: 'No 4xx or 5xx errors', matchKeywords: ['404', '500', 'broken link', 'not found', 'server error'] },
    { id: 'canonical_tags', label: 'Valid canonical tags', matchKeywords: ['canonical'] },
    { id: 'no_orphaned', label: 'No orphaned pages', matchKeywords: ['orphan'] },
    { id: 'crawl_depth', label: 'Reasonable crawl depth', matchKeywords: ['crawl depth', 'too many clicks'] },
    { id: 'redirect_chains', label: 'No Redirect Chains', matchKeywords: ['redirect chain', 'multiple redirects'] },
    { id: 'noindex_accident', label: 'No Accidental Noindex', matchKeywords: ['noindex', 'accidental noindex'] }
  ],
  coreWebVitals: [
    { id: 'lcp', label: 'Largest Contentful Paint (LCP) is Good', matchKeywords: ['lcp', 'largest contentful paint'] },
    { id: 'cls', label: 'Cumulative Layout Shift (CLS) is Good', matchKeywords: ['cls', 'cumulative layout shift', 'layout shift'] },
    { id: 'inp', label: 'Interaction to Next Paint (INP) is Good', matchKeywords: ['inp', 'interaction to next paint', 'responsiveness'] },
    { id: 'render_blocking', label: 'No Render-Blocking Resources', matchKeywords: ['render blocking', 'render-blocking'] }
  ],
  internalLinking: [
    { id: 'descriptive_anchor', label: 'Descriptive anchor text', matchKeywords: ['anchor text', 'click here', 'generic anchor'] },
    { id: 'no_broken_internal', label: 'No broken internal links', matchKeywords: ['broken internal', 'dead link'] },
    { id: 'link_count', label: 'Reasonable number of links on page', matchKeywords: ['too many links', 'excessive links'] },
    { id: 'link_depth', label: 'Reasonable Link Depth', matchKeywords: ['link depth', 'deep links'] }
  ],
  sitePerformance: [
    { id: 'optimized_images', label: 'Optimized images', matchKeywords: ['image size', 'large image', 'compress'] },
    { id: 'modern_formats', label: 'Modern Image Formats (WebP)', matchKeywords: ['webp', 'modern format'] },
    { id: 'minified_assets', label: 'Minified CSS and JS', matchKeywords: ['minify', 'minified', 'unminified'] },
    { id: 'ttfb', label: 'Fast Server Response (TTFB)', matchKeywords: ['ttfb', 'time to first byte', 'server response'] },
    { id: 'dom_size', label: 'Reasonable DOM Size', matchKeywords: ['dom size', 'dom elements'] }
  ],
  internationalSeo: [
    { id: 'hreflang', label: 'Valid hreflang tags', matchKeywords: ['hreflang'] },
    { id: 'html_lang', label: 'HTML lang attribute', matchKeywords: ['html lang', 'language attribute'] },
    { id: 'x_default', label: 'x-default hreflang', matchKeywords: ['x-default'] },
    { id: 'lang_mismatch', label: 'No Language Mismatch', matchKeywords: ['language mismatch', 'wrong language'] }
  ]
};

export function calculateThemeScore(themeKey: string, issues: any[], fallbackScore: number) {
  const predefinedChecks = THEME_CHECKS[themeKey] || [];
  
  if (predefinedChecks.length === 0) {
    return { score: fallbackScore, checksStatus: [], passedCount: 0, totalChecks: 0, unmatchedIssues: [] };
  }

  const themeName = themeKey.replace(/([A-Z])/g, ' $1').trim();
  
  const checksStatus = predefinedChecks.map(check => {
    const failedIssues = issues.filter(i => 
      check.matchKeywords.some(kw => i.title.toLowerCase().includes(kw) || i.description.toLowerCase().includes(kw))
    );
    return {
      ...check,
      passed: failedIssues.length === 0,
      failedIssues
    };
  });

  const relatedIssues = issues.filter(i => 
    i.title.toLowerCase().includes(themeName.toLowerCase()) || 
    i.description.toLowerCase().includes(themeName.toLowerCase()) ||
    (themeKey === 'coreWebVitals' && (i.title.toLowerCase().includes('performance') || i.title.toLowerCase().includes('speed') || i.title.toLowerCase().includes('lcp') || i.title.toLowerCase().includes('cls'))) ||
    (themeKey === 'markup' && (i.title.toLowerCase().includes('schema') || i.title.toLowerCase().includes('structured'))) ||
    (themeKey === 'https' && i.title.toLowerCase().includes('security'))
  );
  
  const unmatchedIssues = relatedIssues.filter(ri => 
    !checksStatus.some(c => c.failedIssues.some(fi => fi.title === ri.title))
  );

  const passedCount = checksStatus.filter(c => c.passed).length;
  const totalChecks = checksStatus.length;

  let rawScore = Math.round((passedCount / totalChecks) * 100);
  rawScore = Math.max(0, rawScore - (unmatchedIssues.length * 5));

  return { 
    score: rawScore, 
    checksStatus, 
    passedCount, 
    totalChecks, 
    unmatchedIssues 
  };
}
