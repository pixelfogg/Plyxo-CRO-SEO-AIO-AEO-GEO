export interface MasterChecklistItem {
  id: string;
  category: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  isCore: boolean;
}

export const MASTER_CHECKLIST: MasterChecklistItem[] = [
  {
    "id": "seo-1",
    "category": "seo",
    "title": "HTTPS enabled",
    "description": "Deep-dive analysis of https enabled to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-2",
    "category": "seo",
    "title": "SSL validity",
    "description": "Deep-dive analysis of ssl validity to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-3",
    "category": "seo",
    "title": "HTTP/2 or HTTP/3",
    "description": "Deep-dive analysis of http/2 or http/3 to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-4",
    "category": "seo",
    "title": "Canonical URL",
    "description": "Deep-dive analysis of canonical url to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-5",
    "category": "seo",
    "title": "Indexability",
    "description": "Deep-dive analysis of indexability to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-6",
    "category": "seo",
    "title": "Crawlability",
    "description": "Deep-dive analysis of crawlability to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-7",
    "category": "seo",
    "title": "robots.txt",
    "description": "Deep-dive analysis of robots.txt to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-8",
    "category": "seo",
    "title": "sitemap.xml",
    "description": "Deep-dive analysis of sitemap.xml to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-9",
    "category": "seo",
    "title": "XML sitemap validity",
    "description": "Deep-dive analysis of xml sitemap validity to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-10",
    "category": "seo",
    "title": "HTML sitemap",
    "description": "Deep-dive analysis of html sitemap to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-11",
    "category": "seo",
    "title": "hreflang implementation",
    "description": "Deep-dive analysis of hreflang implementation to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-12",
    "category": "seo",
    "title": "Pagination tags",
    "description": "Deep-dive analysis of pagination tags to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-13",
    "category": "seo",
    "title": "URL structure",
    "description": "Deep-dive analysis of url structure to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-14",
    "category": "seo",
    "title": "URL length",
    "description": "Deep-dive analysis of url length to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-15",
    "category": "seo",
    "title": "URL keyword optimization",
    "description": "Deep-dive analysis of url keyword optimization to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-16",
    "category": "seo",
    "title": "Redirect chains",
    "description": "Deep-dive analysis of redirect chains to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-17",
    "category": "seo",
    "title": "Redirect loops",
    "description": "Deep-dive analysis of redirect loops to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-18",
    "category": "seo",
    "title": "404 pages",
    "description": "Deep-dive analysis of 404 pages to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-19",
    "category": "seo",
    "title": "Soft 404",
    "description": "Deep-dive analysis of soft 404 to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-20",
    "category": "seo",
    "title": "Broken internal links",
    "description": "Deep-dive analysis of broken internal links to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-21",
    "category": "seo",
    "title": "Broken external links",
    "description": "Deep-dive analysis of broken external links to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-22",
    "category": "seo",
    "title": "Duplicate pages",
    "description": "Deep-dive analysis of duplicate pages to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-23",
    "category": "seo",
    "title": "Duplicate titles",
    "description": "Deep-dive analysis of duplicate titles to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-24",
    "category": "seo",
    "title": "Duplicate meta descriptions",
    "description": "Deep-dive analysis of duplicate meta descriptions to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-25",
    "category": "seo",
    "title": "Thin pages",
    "description": "Deep-dive analysis of thin pages to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-26",
    "category": "seo",
    "title": "Orphan pages",
    "description": "Deep-dive analysis of orphan pages to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-27",
    "category": "seo",
    "title": "Crawl depth",
    "description": "Deep-dive analysis of crawl depth to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-28",
    "category": "seo",
    "title": "Canonical conflicts",
    "description": "Deep-dive analysis of canonical conflicts to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-29",
    "category": "seo",
    "title": "WWW/non-WWW consistency",
    "description": "Deep-dive analysis of www/non-www consistency to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-30",
    "category": "seo",
    "title": "Trailing slash consistency",
    "description": "Deep-dive analysis of trailing slash consistency to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-31",
    "category": "seo",
    "title": "Title tag length",
    "description": "Deep-dive analysis of title tag length to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-32",
    "category": "seo",
    "title": "Keyword placement",
    "description": "Deep-dive analysis of keyword placement to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-33",
    "category": "seo",
    "title": "Duplicate titles",
    "description": "Deep-dive analysis of duplicate titles to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-34",
    "category": "seo",
    "title": "Meta description length",
    "description": "Deep-dive analysis of meta description length to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-35",
    "category": "seo",
    "title": "Duplicate descriptions",
    "description": "Deep-dive analysis of duplicate descriptions to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-36",
    "category": "seo",
    "title": "Missing descriptions",
    "description": "Deep-dive analysis of missing descriptions to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-37",
    "category": "seo",
    "title": "Meta robots",
    "description": "Deep-dive analysis of meta robots to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-38",
    "category": "seo",
    "title": "Open Graph tags",
    "description": "Deep-dive analysis of open graph tags to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-39",
    "category": "seo",
    "title": "Twitter cards",
    "description": "Deep-dive analysis of twitter cards to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-40",
    "category": "seo",
    "title": "Apple meta tags",
    "description": "Deep-dive analysis of apple meta tags to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-41",
    "category": "seo",
    "title": "Theme color",
    "description": "Deep-dive analysis of theme color to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-42",
    "category": "seo",
    "title": "Viewport tag",
    "description": "Deep-dive analysis of viewport tag to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-43",
    "category": "seo",
    "title": "H1 exists",
    "description": "Deep-dive analysis of h1 exists to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-44",
    "category": "seo",
    "title": "Multiple H1",
    "description": "Deep-dive analysis of multiple h1 to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-45",
    "category": "seo",
    "title": "Heading hierarchy",
    "description": "Deep-dive analysis of heading hierarchy to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-46",
    "category": "seo",
    "title": "Empty headings",
    "description": "Deep-dive analysis of empty headings to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-47",
    "category": "seo",
    "title": "Keyword usage",
    "description": "Deep-dive analysis of keyword usage to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-48",
    "category": "seo",
    "title": "Heading relevance",
    "description": "Deep-dive analysis of heading relevance to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-49",
    "category": "seo",
    "title": "Word count",
    "description": "Deep-dive analysis of word count to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-50",
    "category": "seo",
    "title": "Keyword density",
    "description": "Deep-dive analysis of keyword density to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-51",
    "category": "seo",
    "title": "Semantic keywords",
    "description": "Deep-dive analysis of semantic keywords to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-52",
    "category": "seo",
    "title": "NLP entities",
    "description": "Deep-dive analysis of nlp entities to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-53",
    "category": "seo",
    "title": "LSI keywords",
    "description": "Deep-dive analysis of lsi keywords to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-54",
    "category": "seo",
    "title": "Readability score",
    "description": "Deep-dive analysis of readability score to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-55",
    "category": "seo",
    "title": "Duplicate content",
    "description": "Deep-dive analysis of duplicate content to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-56",
    "category": "seo",
    "title": "Content freshness",
    "description": "Deep-dive analysis of content freshness to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-57",
    "category": "seo",
    "title": "AI-generated detection",
    "description": "Deep-dive analysis of ai-generated detection to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-58",
    "category": "seo",
    "title": "E-E-A-T signals",
    "description": "Deep-dive analysis of e-e-a-t signals to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-59",
    "category": "seo",
    "title": "FAQ presence",
    "description": "Deep-dive analysis of faq presence to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-60",
    "category": "seo",
    "title": "Rich snippets",
    "description": "Deep-dive analysis of rich snippets to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-61",
    "category": "seo",
    "title": "Outbound authority links",
    "description": "Deep-dive analysis of outbound authority links to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-62",
    "category": "seo",
    "title": "Content uniqueness",
    "description": "Deep-dive analysis of content uniqueness to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-63",
    "category": "seo",
    "title": "Missing ALT",
    "description": "Deep-dive analysis of missing alt to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-64",
    "category": "seo",
    "title": "ALT quality",
    "description": "Deep-dive analysis of alt quality to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-65",
    "category": "seo",
    "title": "Image titles",
    "description": "Deep-dive analysis of image titles to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-66",
    "category": "seo",
    "title": "Image filenames",
    "description": "Deep-dive analysis of image filenames to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-67",
    "category": "seo",
    "title": "Lazy loading",
    "description": "Deep-dive analysis of lazy loading to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-68",
    "category": "seo",
    "title": "WebP/AVIF",
    "description": "Deep-dive analysis of webp/avif to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-69",
    "category": "seo",
    "title": "Dimensions",
    "description": "Deep-dive analysis of dimensions to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-70",
    "category": "seo",
    "title": "Responsive images",
    "description": "Deep-dive analysis of responsive images to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-71",
    "category": "seo",
    "title": "Compression",
    "description": "Deep-dive analysis of compression to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-72",
    "category": "seo",
    "title": "Organization",
    "description": "Deep-dive analysis of organization to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-73",
    "category": "seo",
    "title": "LocalBusiness",
    "description": "Deep-dive analysis of localbusiness to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-74",
    "category": "seo",
    "title": "Product",
    "description": "Deep-dive analysis of product to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-75",
    "category": "seo",
    "title": "FAQ",
    "description": "Deep-dive analysis of faq to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-76",
    "category": "seo",
    "title": "Breadcrumb",
    "description": "Deep-dive analysis of breadcrumb to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-77",
    "category": "seo",
    "title": "Article",
    "description": "Deep-dive analysis of article to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-78",
    "category": "seo",
    "title": "Review",
    "description": "Deep-dive analysis of review to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-79",
    "category": "seo",
    "title": "Event",
    "description": "Deep-dive analysis of event to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-80",
    "category": "seo",
    "title": "Video",
    "description": "Deep-dive analysis of video to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-81",
    "category": "seo",
    "title": "Person",
    "description": "Deep-dive analysis of person to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-82",
    "category": "seo",
    "title": "SoftwareApplication",
    "description": "Deep-dive analysis of softwareapplication to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-83",
    "category": "seo",
    "title": "Service",
    "description": "Deep-dive analysis of service to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-84",
    "category": "seo",
    "title": "WebSite",
    "description": "Deep-dive analysis of website to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-85",
    "category": "seo",
    "title": "SearchAction",
    "description": "Deep-dive analysis of searchaction to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-86",
    "category": "seo",
    "title": "Validation errors",
    "description": "Deep-dive analysis of validation errors to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-87",
    "category": "seo",
    "title": "Link depth",
    "description": "Deep-dive analysis of link depth to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-88",
    "category": "seo",
    "title": "Anchor diversity",
    "description": "Deep-dive analysis of anchor diversity to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-89",
    "category": "seo",
    "title": "Orphan pages",
    "description": "Deep-dive analysis of orphan pages to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-90",
    "category": "seo",
    "title": "Broken anchors",
    "description": "Deep-dive analysis of broken anchors to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-91",
    "category": "seo",
    "title": "Link distribution",
    "description": "Deep-dive analysis of link distribution to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-92",
    "category": "seo",
    "title": "Footer links",
    "description": "Deep-dive analysis of footer links to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-93",
    "category": "seo",
    "title": "Breadcrumbs",
    "description": "Deep-dive analysis of breadcrumbs to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-94",
    "category": "seo",
    "title": "Topical authority",
    "description": "Deep-dive analysis of topical authority to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-95",
    "category": "seo",
    "title": "Search intent match",
    "description": "Deep-dive analysis of search intent match to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-96",
    "category": "seo",
    "title": "Content clusters",
    "description": "Deep-dive analysis of content clusters to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-97",
    "category": "seo",
    "title": "Semantic coverage",
    "description": "Deep-dive analysis of semantic coverage to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-98",
    "category": "seo",
    "title": "Featured snippet optimization",
    "description": "Deep-dive analysis of featured snippet optimization to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-99",
    "category": "seo",
    "title": "PAA optimization",
    "description": "Deep-dive analysis of paa optimization to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-100",
    "category": "seo",
    "title": "Voice search readiness",
    "description": "Deep-dive analysis of voice search readiness to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-101",
    "category": "seo",
    "title": "AI Overview readiness",
    "description": "Deep-dive analysis of ai overview readiness to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-102",
    "category": "seo",
    "title": "GEO (Generative Engine Optimization)",
    "description": "Deep-dive analysis of geo (generative engine optimization) to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-103",
    "category": "seo",
    "title": "Entity coverage",
    "description": "Deep-dive analysis of entity coverage to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "seo-104",
    "category": "seo",
    "title": "Knowledge Graph readiness",
    "description": "Deep-dive analysis of knowledge graph readiness to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "performance-1",
    "category": "performance",
    "title": "LCP",
    "description": "Deep-dive analysis of lcp to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "performance-2",
    "category": "performance",
    "title": "CLS",
    "description": "Deep-dive analysis of cls to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "performance-3",
    "category": "performance",
    "title": "INP",
    "description": "Deep-dive analysis of inp to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "performance-4",
    "category": "performance",
    "title": "FCP",
    "description": "Deep-dive analysis of fcp to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "performance-5",
    "category": "performance",
    "title": "TTFB",
    "description": "Deep-dive analysis of ttfb to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "performance-6",
    "category": "performance",
    "title": "Speed Index",
    "description": "Deep-dive analysis of speed index to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "performance-7",
    "category": "performance",
    "title": "Total Blocking Time",
    "description": "Deep-dive analysis of total blocking time to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "performance-8",
    "category": "performance",
    "title": "DOM Loaded",
    "description": "Deep-dive analysis of dom loaded to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "performance-9",
    "category": "performance",
    "title": "Fully Loaded",
    "description": "Deep-dive analysis of fully loaded to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "performance-10",
    "category": "performance",
    "title": "Render Blocking CSS",
    "description": "Deep-dive analysis of render blocking css to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "performance-11",
    "category": "performance",
    "title": "Render Blocking JS",
    "description": "Deep-dive analysis of render blocking js to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "performance-12",
    "category": "performance",
    "title": "Critical CSS",
    "description": "Deep-dive analysis of critical css to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "performance-13",
    "category": "performance",
    "title": "Preload",
    "description": "Deep-dive analysis of preload to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "performance-14",
    "category": "performance",
    "title": "Prefetch",
    "description": "Deep-dive analysis of prefetch to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "performance-15",
    "category": "performance",
    "title": "DNS Prefetch",
    "description": "Deep-dive analysis of dns prefetch to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "performance-16",
    "category": "performance",
    "title": "Preconnect",
    "description": "Deep-dive analysis of preconnect to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "performance-17",
    "category": "performance",
    "title": "Bundle size",
    "description": "Deep-dive analysis of bundle size to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "performance-18",
    "category": "performance",
    "title": "Unused JS",
    "description": "Deep-dive analysis of unused js to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "performance-19",
    "category": "performance",
    "title": "Tree shaking",
    "description": "Deep-dive analysis of tree shaking to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "performance-20",
    "category": "performance",
    "title": "Code splitting",
    "description": "Deep-dive analysis of code splitting to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "performance-21",
    "category": "performance",
    "title": "Async scripts",
    "description": "Deep-dive analysis of async scripts to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "performance-22",
    "category": "performance",
    "title": "Deferred scripts",
    "description": "Deep-dive analysis of deferred scripts to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "performance-23",
    "category": "performance",
    "title": "Third-party scripts",
    "description": "Deep-dive analysis of third-party scripts to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "performance-24",
    "category": "performance",
    "title": "Unused CSS",
    "description": "Deep-dive analysis of unused css to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "performance-25",
    "category": "performance",
    "title": "Minification",
    "description": "Deep-dive analysis of minification to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "performance-26",
    "category": "performance",
    "title": "Compression",
    "description": "Deep-dive analysis of compression to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "performance-27",
    "category": "performance",
    "title": "Critical CSS",
    "description": "Deep-dive analysis of critical css to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "performance-28",
    "category": "performance",
    "title": "Image size",
    "description": "Deep-dive analysis of image size to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "performance-29",
    "category": "performance",
    "title": "Compression",
    "description": "Deep-dive analysis of compression to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "performance-30",
    "category": "performance",
    "title": "WebP",
    "description": "Deep-dive analysis of webp to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "performance-31",
    "category": "performance",
    "title": "AVIF",
    "description": "Deep-dive analysis of avif to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "performance-32",
    "category": "performance",
    "title": "Responsive images",
    "description": "Deep-dive analysis of responsive images to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "performance-33",
    "category": "performance",
    "title": "Lazy loading",
    "description": "Deep-dive analysis of lazy loading to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "performance-34",
    "category": "performance",
    "title": "SVG optimization",
    "description": "Deep-dive analysis of svg optimization to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "performance-35",
    "category": "performance",
    "title": "Font loading",
    "description": "Deep-dive analysis of font loading to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "performance-36",
    "category": "performance",
    "title": "Font-display",
    "description": "Deep-dive analysis of font-display to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "performance-37",
    "category": "performance",
    "title": "Font preloading",
    "description": "Deep-dive analysis of font preloading to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "performance-38",
    "category": "performance",
    "title": "Font size optimization",
    "description": "Deep-dive analysis of font size optimization to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "performance-39",
    "category": "performance",
    "title": "Compression (Gzip/Brotli)",
    "description": "Deep-dive analysis of compression (gzip/brotli) to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "performance-40",
    "category": "performance",
    "title": "CDN usage",
    "description": "Deep-dive analysis of cdn usage to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "performance-41",
    "category": "performance",
    "title": "Caching headers",
    "description": "Deep-dive analysis of caching headers to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "performance-42",
    "category": "performance",
    "title": "Cache-Control",
    "description": "Deep-dive analysis of cache-control to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "performance-43",
    "category": "performance",
    "title": "Keep Alive",
    "description": "Deep-dive analysis of keep alive to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "performance-44",
    "category": "performance",
    "title": "HTTP version",
    "description": "Deep-dive analysis of http version to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "performance-45",
    "category": "performance",
    "title": "DNS lookup",
    "description": "Deep-dive analysis of dns lookup to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "performance-46",
    "category": "performance",
    "title": "Server response",
    "description": "Deep-dive analysis of server response to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "performance-47",
    "category": "performance",
    "title": "TLS handshake",
    "description": "Deep-dive analysis of tls handshake to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "performance-48",
    "category": "performance",
    "title": "Number of requests",
    "description": "Deep-dive analysis of number of requests to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "performance-49",
    "category": "performance",
    "title": "Total page weight",
    "description": "Deep-dive analysis of total page weight to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "performance-50",
    "category": "performance",
    "title": "JS weight",
    "description": "Deep-dive analysis of js weight to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "performance-51",
    "category": "performance",
    "title": "CSS weight",
    "description": "Deep-dive analysis of css weight to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "performance-52",
    "category": "performance",
    "title": "Font weight",
    "description": "Deep-dive analysis of font weight to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "performance-53",
    "category": "performance",
    "title": "Image weight",
    "description": "Deep-dive analysis of image weight to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "accessibility-1",
    "category": "accessibility",
    "title": "Proper headings",
    "description": "Deep-dive analysis of proper headings to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "accessibility-2",
    "category": "accessibility",
    "title": "Landmark regions",
    "description": "Deep-dive analysis of landmark regions to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "accessibility-3",
    "category": "accessibility",
    "title": "Skip navigation",
    "description": "Deep-dive analysis of skip navigation to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "accessibility-4",
    "category": "accessibility",
    "title": "Semantic HTML",
    "description": "Deep-dive analysis of semantic html to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "accessibility-5",
    "category": "accessibility",
    "title": "Keyboard navigation",
    "description": "Deep-dive analysis of keyboard navigation to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "accessibility-6",
    "category": "accessibility",
    "title": "Focus visibility",
    "description": "Deep-dive analysis of focus visibility to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "accessibility-7",
    "category": "accessibility",
    "title": "Tab order",
    "description": "Deep-dive analysis of tab order to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "accessibility-8",
    "category": "accessibility",
    "title": "Keyboard traps",
    "description": "Deep-dive analysis of keyboard traps to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "accessibility-9",
    "category": "accessibility",
    "title": "ARIA labels",
    "description": "Deep-dive analysis of aria labels to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "accessibility-10",
    "category": "accessibility",
    "title": "ARIA roles",
    "description": "Deep-dive analysis of aria roles to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "accessibility-11",
    "category": "accessibility",
    "title": "Form labels",
    "description": "Deep-dive analysis of form labels to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "accessibility-12",
    "category": "accessibility",
    "title": "Live regions",
    "description": "Deep-dive analysis of live regions to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "accessibility-13",
    "category": "accessibility",
    "title": "ALT text",
    "description": "Deep-dive analysis of alt text to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "accessibility-14",
    "category": "accessibility",
    "title": "Decorative images",
    "description": "Deep-dive analysis of decorative images to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "accessibility-15",
    "category": "accessibility",
    "title": "SVG accessibility",
    "description": "Deep-dive analysis of svg accessibility to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "accessibility-16",
    "category": "accessibility",
    "title": "Contrast ratio",
    "description": "Deep-dive analysis of contrast ratio to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "accessibility-17",
    "category": "accessibility",
    "title": "Link distinguishability",
    "description": "Deep-dive analysis of link distinguishability to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "accessibility-18",
    "category": "accessibility",
    "title": "Dark mode compatibility",
    "description": "Deep-dive analysis of dark mode compatibility to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "accessibility-19",
    "category": "accessibility",
    "title": "Labels",
    "description": "Deep-dive analysis of labels to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "accessibility-20",
    "category": "accessibility",
    "title": "Required indicators",
    "description": "Deep-dive analysis of required indicators to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "accessibility-21",
    "category": "accessibility",
    "title": "Error messages",
    "description": "Deep-dive analysis of error messages to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "accessibility-22",
    "category": "accessibility",
    "title": "Validation accessibility",
    "description": "Deep-dive analysis of validation accessibility to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "accessibility-23",
    "category": "accessibility",
    "title": "Captions",
    "description": "Deep-dive analysis of captions to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "accessibility-24",
    "category": "accessibility",
    "title": "Transcript",
    "description": "Deep-dive analysis of transcript to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "accessibility-25",
    "category": "accessibility",
    "title": "Audio controls",
    "description": "Deep-dive analysis of audio controls to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "best-practices-1",
    "category": "best-practices",
    "title": "HTTPS",
    "description": "Deep-dive analysis of https to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "best-practices-2",
    "category": "best-practices",
    "title": "Console errors",
    "description": "Deep-dive analysis of console errors to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "best-practices-3",
    "category": "best-practices",
    "title": "Deprecated APIs",
    "description": "Deep-dive analysis of deprecated apis to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "best-practices-4",
    "category": "best-practices",
    "title": "Security headers",
    "description": "Deep-dive analysis of security headers to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "best-practices-5",
    "category": "best-practices",
    "title": "CSP",
    "description": "Deep-dive analysis of csp to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "best-practices-6",
    "category": "best-practices",
    "title": "XSS protection",
    "description": "Deep-dive analysis of xss protection to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "best-practices-7",
    "category": "best-practices",
    "title": "Frame options",
    "description": "Deep-dive analysis of frame options to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "best-practices-8",
    "category": "best-practices",
    "title": "Referrer policy",
    "description": "Deep-dive analysis of referrer policy to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "best-practices-9",
    "category": "best-practices",
    "title": "Permissions policy",
    "description": "Deep-dive analysis of permissions policy to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "best-practices-10",
    "category": "best-practices",
    "title": "Mixed content",
    "description": "Deep-dive analysis of mixed content to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "best-practices-11",
    "category": "best-practices",
    "title": "Cookie security",
    "description": "Deep-dive analysis of cookie security to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "best-practices-12",
    "category": "best-practices",
    "title": "External dependencies",
    "description": "Deep-dive analysis of external dependencies to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "best-practices-13",
    "category": "best-practices",
    "title": "Third-party risks",
    "description": "Deep-dive analysis of third-party risks to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "best-practices-14",
    "category": "best-practices",
    "title": "Browser compatibility",
    "description": "Deep-dive analysis of browser compatibility to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "best-practices-15",
    "category": "best-practices",
    "title": "Mobile responsiveness",
    "description": "Deep-dive analysis of mobile responsiveness to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ux-1",
    "category": "ux",
    "title": "Clear menu",
    "description": "Deep-dive analysis of clear menu to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ux-2",
    "category": "ux",
    "title": "Sticky navigation",
    "description": "Deep-dive analysis of sticky navigation to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ux-3",
    "category": "ux",
    "title": "Search visibility",
    "description": "Deep-dive analysis of search visibility to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ux-4",
    "category": "ux",
    "title": "Breadcrumbs",
    "description": "Deep-dive analysis of breadcrumbs to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ux-5",
    "category": "ux",
    "title": "Mobile menu",
    "description": "Deep-dive analysis of mobile menu to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ux-6",
    "category": "ux",
    "title": "Tap targets",
    "description": "Deep-dive analysis of tap targets to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ux-7",
    "category": "ux",
    "title": "Thumb reachability",
    "description": "Deep-dive analysis of thumb reachability to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ux-8",
    "category": "ux",
    "title": "Mobile spacing",
    "description": "Deep-dive analysis of mobile spacing to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ux-9",
    "category": "ux",
    "title": "Safe areas",
    "description": "Deep-dive analysis of safe areas to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ux-10",
    "category": "ux",
    "title": "Field count",
    "description": "Deep-dive analysis of field count to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ux-11",
    "category": "ux",
    "title": "Progress indicators",
    "description": "Deep-dive analysis of progress indicators to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ux-12",
    "category": "ux",
    "title": "Validation",
    "description": "Deep-dive analysis of validation to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ux-13",
    "category": "ux",
    "title": "Autofill",
    "description": "Deep-dive analysis of autofill to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ux-14",
    "category": "ux",
    "title": "Password visibility",
    "description": "Deep-dive analysis of password visibility to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ux-15",
    "category": "ux",
    "title": "Hero clarity",
    "description": "Deep-dive analysis of hero clarity to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ux-16",
    "category": "ux",
    "title": "Information hierarchy",
    "description": "Deep-dive analysis of information hierarchy to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ux-17",
    "category": "ux",
    "title": "Visual flow",
    "description": "Deep-dive analysis of visual flow to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ux-18",
    "category": "ux",
    "title": "CTA placement",
    "description": "Deep-dive analysis of cta placement to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ux-19",
    "category": "ux",
    "title": "Decision friction",
    "description": "Deep-dive analysis of decision friction to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ux-20",
    "category": "ux",
    "title": "Exit points",
    "description": "Deep-dive analysis of exit points to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ux-21",
    "category": "ux",
    "title": "Hover states",
    "description": "Deep-dive analysis of hover states to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ux-22",
    "category": "ux",
    "title": "Loading indicators",
    "description": "Deep-dive analysis of loading indicators to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ux-23",
    "category": "ux",
    "title": "Micro interactions",
    "description": "Deep-dive analysis of micro interactions to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ux-24",
    "category": "ux",
    "title": "Empty states",
    "description": "Deep-dive analysis of empty states to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ux-25",
    "category": "ux",
    "title": "Error handling",
    "description": "Deep-dive analysis of error handling to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "visual-1",
    "category": "visual",
    "title": "Brand consistency",
    "description": "Deep-dive analysis of brand consistency to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "visual-2",
    "category": "visual",
    "title": "Color palette",
    "description": "Deep-dive analysis of color palette to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "visual-3",
    "category": "visual",
    "title": "Logo visibility",
    "description": "Deep-dive analysis of logo visibility to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "visual-4",
    "category": "visual",
    "title": "Alignment",
    "description": "Deep-dive analysis of alignment to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "visual-5",
    "category": "visual",
    "title": "Grid consistency",
    "description": "Deep-dive analysis of grid consistency to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "visual-6",
    "category": "visual",
    "title": "White space",
    "description": "Deep-dive analysis of white space to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "visual-7",
    "category": "visual",
    "title": "Visual balance",
    "description": "Deep-dive analysis of visual balance to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "visual-8",
    "category": "visual",
    "title": "Section spacing",
    "description": "Deep-dive analysis of section spacing to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "visual-9",
    "category": "visual",
    "title": "Font pairing",
    "description": "Deep-dive analysis of font pairing to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "visual-10",
    "category": "visual",
    "title": "Readability",
    "description": "Deep-dive analysis of readability to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "visual-11",
    "category": "visual",
    "title": "Line height",
    "description": "Deep-dive analysis of line height to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "visual-12",
    "category": "visual",
    "title": "Letter spacing",
    "description": "Deep-dive analysis of letter spacing to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "visual-13",
    "category": "visual",
    "title": "Text width",
    "description": "Deep-dive analysis of text width to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "visual-14",
    "category": "visual",
    "title": "Contrast",
    "description": "Deep-dive analysis of contrast to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "visual-15",
    "category": "visual",
    "title": "Accessibility",
    "description": "Deep-dive analysis of accessibility to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "visual-16",
    "category": "visual",
    "title": "Emotional impact",
    "description": "Deep-dive analysis of emotional impact to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "visual-17",
    "category": "visual",
    "title": "Consistency",
    "description": "Deep-dive analysis of consistency to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "visual-18",
    "category": "visual",
    "title": "Quality",
    "description": "Deep-dive analysis of quality to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "visual-19",
    "category": "visual",
    "title": "Consistency",
    "description": "Deep-dive analysis of consistency to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "visual-20",
    "category": "visual",
    "title": "Relevance",
    "description": "Deep-dive analysis of relevance to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "visual-21",
    "category": "visual",
    "title": "Authenticity",
    "description": "Deep-dive analysis of authenticity to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "visual-22",
    "category": "visual",
    "title": "Modern appearance",
    "description": "Deep-dive analysis of modern appearance to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "visual-23",
    "category": "visual",
    "title": "Premium feel",
    "description": "Deep-dive analysis of premium feel to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "visual-24",
    "category": "visual",
    "title": "Trust perception",
    "description": "Deep-dive analysis of trust perception to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "visual-25",
    "category": "visual",
    "title": "Professional polish",
    "description": "Deep-dive analysis of professional polish to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "visual-26",
    "category": "visual",
    "title": "Primary focus",
    "description": "Deep-dive analysis of primary focus to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "visual-27",
    "category": "visual",
    "title": "Secondary focus",
    "description": "Deep-dive analysis of secondary focus to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "visual-28",
    "category": "visual",
    "title": "Eye tracking path",
    "description": "Deep-dive analysis of eye tracking path to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "visual-29",
    "category": "visual",
    "title": "F-pattern optimization",
    "description": "Deep-dive analysis of f-pattern optimization to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "visual-30",
    "category": "visual",
    "title": "Z-pattern optimization",
    "description": "Deep-dive analysis of z-pattern optimization to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "copywriting-1",
    "category": "copywriting",
    "title": "Clarity",
    "description": "Deep-dive analysis of clarity to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "copywriting-2",
    "category": "copywriting",
    "title": "Value proposition",
    "description": "Deep-dive analysis of value proposition to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "copywriting-3",
    "category": "copywriting",
    "title": "Emotional impact",
    "description": "Deep-dive analysis of emotional impact to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "copywriting-4",
    "category": "copywriting",
    "title": "Keyword usage",
    "description": "Deep-dive analysis of keyword usage to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "copywriting-5",
    "category": "copywriting",
    "title": "Benefits vs features",
    "description": "Deep-dive analysis of benefits vs features to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "copywriting-6",
    "category": "copywriting",
    "title": "Customer-centric language",
    "description": "Deep-dive analysis of customer-centric language to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "copywriting-7",
    "category": "copywriting",
    "title": "Readability",
    "description": "Deep-dive analysis of readability to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "copywriting-8",
    "category": "copywriting",
    "title": "Simplicity",
    "description": "Deep-dive analysis of simplicity to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "copywriting-9",
    "category": "copywriting",
    "title": "Tone consistency",
    "description": "Deep-dive analysis of tone consistency to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "copywriting-10",
    "category": "copywriting",
    "title": "Emotional triggers",
    "description": "Deep-dive analysis of emotional triggers to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "copywriting-11",
    "category": "copywriting",
    "title": "Curiosity",
    "description": "Deep-dive analysis of curiosity to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "copywriting-12",
    "category": "copywriting",
    "title": "Urgency",
    "description": "Deep-dive analysis of urgency to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "copywriting-13",
    "category": "copywriting",
    "title": "Scarcity",
    "description": "Deep-dive analysis of scarcity to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "copywriting-14",
    "category": "copywriting",
    "title": "Authority",
    "description": "Deep-dive analysis of authority to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "copywriting-15",
    "category": "copywriting",
    "title": "Keyword intent",
    "description": "Deep-dive analysis of keyword intent to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "copywriting-16",
    "category": "copywriting",
    "title": "NLP optimization",
    "description": "Deep-dive analysis of nlp optimization to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "copywriting-17",
    "category": "copywriting",
    "title": "Semantic richness",
    "description": "Deep-dive analysis of semantic richness to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "copywriting-18",
    "category": "copywriting",
    "title": "Readability",
    "description": "Deep-dive analysis of readability to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "copywriting-19",
    "category": "copywriting",
    "title": "Grade level",
    "description": "Deep-dive analysis of grade level to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "copywriting-20",
    "category": "copywriting",
    "title": "Sentence length",
    "description": "Deep-dive analysis of sentence length to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "copywriting-21",
    "category": "copywriting",
    "title": "Passive voice",
    "description": "Deep-dive analysis of passive voice to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "copywriting-22",
    "category": "copywriting",
    "title": "Jargon detection",
    "description": "Deep-dive analysis of jargon detection to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "trust-1",
    "category": "trust",
    "title": "About page",
    "description": "Deep-dive analysis of about page to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "trust-2",
    "category": "trust",
    "title": "Contact information",
    "description": "Deep-dive analysis of contact information to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "trust-3",
    "category": "trust",
    "title": "Phone",
    "description": "Deep-dive analysis of phone to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "trust-4",
    "category": "trust",
    "title": "Email",
    "description": "Deep-dive analysis of email to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "trust-5",
    "category": "trust",
    "title": "Address",
    "description": "Deep-dive analysis of address to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "trust-6",
    "category": "trust",
    "title": "Google Maps",
    "description": "Deep-dive analysis of google maps to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "trust-7",
    "category": "trust",
    "title": "Testimonials",
    "description": "Deep-dive analysis of testimonials to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "trust-8",
    "category": "trust",
    "title": "Reviews",
    "description": "Deep-dive analysis of reviews to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "trust-9",
    "category": "trust",
    "title": "Ratings",
    "description": "Deep-dive analysis of ratings to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "trust-10",
    "category": "trust",
    "title": "Case studies",
    "description": "Deep-dive analysis of case studies to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "trust-11",
    "category": "trust",
    "title": "Client logos",
    "description": "Deep-dive analysis of client logos to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "trust-12",
    "category": "trust",
    "title": "Privacy policy",
    "description": "Deep-dive analysis of privacy policy to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "trust-13",
    "category": "trust",
    "title": "Terms",
    "description": "Deep-dive analysis of terms to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "trust-14",
    "category": "trust",
    "title": "Refund policy",
    "description": "Deep-dive analysis of refund policy to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "trust-15",
    "category": "trust",
    "title": "Cookie policy",
    "description": "Deep-dive analysis of cookie policy to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "trust-16",
    "category": "trust",
    "title": "GDPR",
    "description": "Deep-dive analysis of gdpr to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "trust-17",
    "category": "trust",
    "title": "CCPA",
    "description": "Deep-dive analysis of ccpa to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "trust-18",
    "category": "trust",
    "title": "SSL",
    "description": "Deep-dive analysis of ssl to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "trust-19",
    "category": "trust",
    "title": "Payment badges",
    "description": "Deep-dive analysis of payment badges to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "trust-20",
    "category": "trust",
    "title": "Trust seals",
    "description": "Deep-dive analysis of trust seals to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "trust-21",
    "category": "trust",
    "title": "Team members",
    "description": "Deep-dive analysis of team members to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "trust-22",
    "category": "trust",
    "title": "Founder story",
    "description": "Deep-dive analysis of founder story to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "trust-23",
    "category": "trust",
    "title": "Years in business",
    "description": "Deep-dive analysis of years in business to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "trust-24",
    "category": "trust",
    "title": "Certifications",
    "description": "Deep-dive analysis of certifications to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "trust-25",
    "category": "trust",
    "title": "Awards",
    "description": "Deep-dive analysis of awards to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "cta-1",
    "category": "cta",
    "title": "Above the fold",
    "description": "Deep-dive analysis of above the fold to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "cta-2",
    "category": "cta",
    "title": "Contrast",
    "description": "Deep-dive analysis of contrast to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "cta-3",
    "category": "cta",
    "title": "Size",
    "description": "Deep-dive analysis of size to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "cta-4",
    "category": "cta",
    "title": "Placement",
    "description": "Deep-dive analysis of placement to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "cta-5",
    "category": "cta",
    "title": "Action verbs",
    "description": "Deep-dive analysis of action verbs to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "cta-6",
    "category": "cta",
    "title": "Clarity",
    "description": "Deep-dive analysis of clarity to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "cta-7",
    "category": "cta",
    "title": "Urgency",
    "description": "Deep-dive analysis of urgency to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "cta-8",
    "category": "cta",
    "title": "Benefit-driven",
    "description": "Deep-dive analysis of benefit-driven to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "cta-9",
    "category": "cta",
    "title": "Quantity",
    "description": "Deep-dive analysis of quantity to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "cta-10",
    "category": "cta",
    "title": "CTA frequency",
    "description": "Deep-dive analysis of cta frequency to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "cta-11",
    "category": "cta",
    "title": "CTA consistency",
    "description": "Deep-dive analysis of cta consistency to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "cta-12",
    "category": "cta",
    "title": "Primary CTA",
    "description": "Deep-dive analysis of primary cta to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "cta-13",
    "category": "cta",
    "title": "Secondary CTA",
    "description": "Deep-dive analysis of secondary cta to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "cta-14",
    "category": "cta",
    "title": "Clickability",
    "description": "Deep-dive analysis of clickability to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "cta-15",
    "category": "cta",
    "title": "Mobile usability",
    "description": "Deep-dive analysis of mobile usability to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "cta-16",
    "category": "cta",
    "title": "Accessibility",
    "description": "Deep-dive analysis of accessibility to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "cta-17",
    "category": "cta",
    "title": "Sticky CTA",
    "description": "Deep-dive analysis of sticky cta to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "cro-1",
    "category": "cro",
    "title": "Clear value proposition",
    "description": "Deep-dive analysis of clear value proposition to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "cro-2",
    "category": "cro",
    "title": "Hero effectiveness",
    "description": "Deep-dive analysis of hero effectiveness to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "cro-3",
    "category": "cro",
    "title": "Above-the-fold optimization",
    "description": "Deep-dive analysis of above-the-fold optimization to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "cro-4",
    "category": "cro",
    "title": "CTA visibility",
    "description": "Deep-dive analysis of cta visibility to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "cro-5",
    "category": "cro",
    "title": "Too many clicks",
    "description": "Deep-dive analysis of too many clicks to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "cro-6",
    "category": "cro",
    "title": "Form friction",
    "description": "Deep-dive analysis of form friction to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "cro-7",
    "category": "cro",
    "title": "Navigation distractions",
    "description": "Deep-dive analysis of navigation distractions to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "cro-8",
    "category": "cro",
    "title": "Exit opportunities",
    "description": "Deep-dive analysis of exit opportunities to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "cro-9",
    "category": "cro",
    "title": "Benefits",
    "description": "Deep-dive analysis of benefits to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "cro-10",
    "category": "cro",
    "title": "Objection handling",
    "description": "Deep-dive analysis of objection handling to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "cro-11",
    "category": "cro",
    "title": "Guarantees",
    "description": "Deep-dive analysis of guarantees to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "cro-12",
    "category": "cro",
    "title": "Risk reversal",
    "description": "Deep-dive analysis of risk reversal to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "cro-13",
    "category": "cro",
    "title": "Trust signals",
    "description": "Deep-dive analysis of trust signals to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "cro-14",
    "category": "cro",
    "title": "Conversion path",
    "description": "Deep-dive analysis of conversion path to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "cro-15",
    "category": "cro",
    "title": "Checkout friction",
    "description": "Deep-dive analysis of checkout friction to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "cro-16",
    "category": "cro",
    "title": "Lead capture",
    "description": "Deep-dive analysis of lead capture to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "cro-17",
    "category": "cro",
    "title": "Multi-step optimization",
    "description": "Deep-dive analysis of multi-step optimization to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "cro-18",
    "category": "cro",
    "title": "FOMO",
    "description": "Deep-dive analysis of fomo to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "cro-19",
    "category": "cro",
    "title": "Anchoring",
    "description": "Deep-dive analysis of anchoring to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "cro-20",
    "category": "cro",
    "title": "Reciprocity",
    "description": "Deep-dive analysis of reciprocity to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "cro-21",
    "category": "cro",
    "title": "Authority",
    "description": "Deep-dive analysis of authority to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "cro-22",
    "category": "cro",
    "title": "Commitment",
    "description": "Deep-dive analysis of commitment to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "cro-23",
    "category": "cro",
    "title": "Loss aversion",
    "description": "Deep-dive analysis of loss aversion to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "cro-24",
    "category": "cro",
    "title": "Scroll depth",
    "description": "Deep-dive analysis of scroll depth to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "cro-25",
    "category": "cro",
    "title": "Click heatmap opportunities",
    "description": "Deep-dive analysis of click heatmap opportunities to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "cro-26",
    "category": "cro",
    "title": "Rage click detection opportunities",
    "description": "Deep-dive analysis of rage click detection opportunities to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "cro-27",
    "category": "cro",
    "title": "Dead clicks",
    "description": "Deep-dive analysis of dead clicks to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "cro-28",
    "category": "cro",
    "title": "Attention areas",
    "description": "Deep-dive analysis of attention areas to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "cro-29",
    "category": "cro",
    "title": "User journey bottlenecks",
    "description": "Deep-dive analysis of user journey bottlenecks to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ai-insights-1",
    "category": "ai-insights",
    "title": "Compare with top 5 competitors",
    "description": "Deep-dive analysis of compare with top 5 competitors to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ai-insights-2",
    "category": "ai-insights",
    "title": "Compare page speed",
    "description": "Deep-dive analysis of compare page speed to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ai-insights-3",
    "category": "ai-insights",
    "title": "Compare CTAs",
    "description": "Deep-dive analysis of compare ctas to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ai-insights-4",
    "category": "ai-insights",
    "title": "Compare copywriting",
    "description": "Deep-dive analysis of compare copywriting to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ai-insights-5",
    "category": "ai-insights",
    "title": "Compare design quality",
    "description": "Deep-dive analysis of compare design quality to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ai-insights-6",
    "category": "ai-insights",
    "title": "Compare trust signals",
    "description": "Deep-dive analysis of compare trust signals to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ai-insights-7",
    "category": "ai-insights",
    "title": "Compare SEO coverage",
    "description": "Deep-dive analysis of compare seo coverage to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ai-insights-8",
    "category": "ai-insights",
    "title": "Visual hierarchy scoring",
    "description": "Deep-dive analysis of visual hierarchy scoring to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ai-insights-9",
    "category": "ai-insights",
    "title": "First impression analysis",
    "description": "Deep-dive analysis of first impression analysis to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ai-insights-10",
    "category": "ai-insights",
    "title": "Premium look score",
    "description": "Deep-dive analysis of premium look score to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ai-insights-11",
    "category": "ai-insights",
    "title": "Clutter detection",
    "description": "Deep-dive analysis of clutter detection to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ai-insights-12",
    "category": "ai-insights",
    "title": "Color harmony analysis",
    "description": "Deep-dive analysis of color harmony analysis to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ai-insights-13",
    "category": "ai-insights",
    "title": "Typography quality",
    "description": "Deep-dive analysis of typography quality to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ai-insights-14",
    "category": "ai-insights",
    "title": "Spacing consistency",
    "description": "Deep-dive analysis of spacing consistency to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ai-insights-15",
    "category": "ai-insights",
    "title": "Accessibility prediction",
    "description": "Deep-dive analysis of accessibility prediction to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ai-insights-16",
    "category": "ai-insights",
    "title": "Emotional score",
    "description": "Deep-dive analysis of emotional score to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ai-insights-17",
    "category": "ai-insights",
    "title": "Persuasion score",
    "description": "Deep-dive analysis of persuasion score to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ai-insights-18",
    "category": "ai-insights",
    "title": "Clarity score",
    "description": "Deep-dive analysis of clarity score to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ai-insights-19",
    "category": "ai-insights",
    "title": "Reading difficulty",
    "description": "Deep-dive analysis of reading difficulty to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ai-insights-20",
    "category": "ai-insights",
    "title": "Trust score",
    "description": "Deep-dive analysis of trust score to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ai-insights-21",
    "category": "ai-insights",
    "title": "Conversion potential",
    "description": "Deep-dive analysis of conversion potential to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ai-insights-22",
    "category": "ai-insights",
    "title": "Brand tone consistency",
    "description": "Deep-dive analysis of brand tone consistency to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ai-insights-23",
    "category": "ai-insights",
    "title": "Predicted conversion blockers",
    "description": "Deep-dive analysis of predicted conversion blockers to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ai-insights-24",
    "category": "ai-insights",
    "title": "CTA improvements",
    "description": "Deep-dive analysis of cta improvements to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ai-insights-25",
    "category": "ai-insights",
    "title": "Hero section rewrite",
    "description": "Deep-dive analysis of hero section rewrite to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ai-insights-26",
    "category": "ai-insights",
    "title": "Section reordering",
    "description": "Deep-dive analysis of section reordering to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ai-insights-27",
    "category": "ai-insights",
    "title": "Copy improvements",
    "description": "Deep-dive analysis of copy improvements to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ai-insights-28",
    "category": "ai-insights",
    "title": "Trust improvements",
    "description": "Deep-dive analysis of trust improvements to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ai-insights-29",
    "category": "ai-insights",
    "title": "Form optimization",
    "description": "Deep-dive analysis of form optimization to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ai-insights-30",
    "category": "ai-insights",
    "title": "Navigation improvements",
    "description": "Deep-dive analysis of navigation improvements to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ai-insights-31",
    "category": "ai-insights",
    "title": "Target audience identification",
    "description": "Deep-dive analysis of target audience identification to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ai-insights-32",
    "category": "ai-insights",
    "title": "Customer intent analysis",
    "description": "Deep-dive analysis of customer intent analysis to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ai-insights-33",
    "category": "ai-insights",
    "title": "Missing pages",
    "description": "Deep-dive analysis of missing pages to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ai-insights-34",
    "category": "ai-insights",
    "title": "Missing content",
    "description": "Deep-dive analysis of missing content to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ai-insights-35",
    "category": "ai-insights",
    "title": "Competitive positioning",
    "description": "Deep-dive analysis of competitive positioning to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ai-insights-36",
    "category": "ai-insights",
    "title": "USP clarity",
    "description": "Deep-dive analysis of usp clarity to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ai-insights-37",
    "category": "ai-insights",
    "title": "Brand authority score",
    "description": "Deep-dive analysis of brand authority score to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ai-insights-38",
    "category": "ai-insights",
    "title": "SEO Score (0–100)",
    "description": "Deep-dive analysis of seo score (0–100) to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ai-insights-39",
    "category": "ai-insights",
    "title": "Performance Score (0–100)",
    "description": "Deep-dive analysis of performance score (0–100) to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ai-insights-40",
    "category": "ai-insights",
    "title": "Accessibility Score (0–100)",
    "description": "Deep-dive analysis of accessibility score (0–100) to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ai-insights-41",
    "category": "ai-insights",
    "title": "UX Score (0–100)",
    "description": "Deep-dive analysis of ux score (0–100) to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ai-insights-42",
    "category": "ai-insights",
    "title": "Design Score (0–100)",
    "description": "Deep-dive analysis of design score (0–100) to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ai-insights-43",
    "category": "ai-insights",
    "title": "Copywriting Score (0–100)",
    "description": "Deep-dive analysis of copywriting score (0–100) to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ai-insights-44",
    "category": "ai-insights",
    "title": "Trust Score (0–100)",
    "description": "Deep-dive analysis of trust score (0–100) to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ai-insights-45",
    "category": "ai-insights",
    "title": "CTA Score (0–100)",
    "description": "Deep-dive analysis of cta score (0–100) to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ai-insights-46",
    "category": "ai-insights",
    "title": "CRO Score (0–100)",
    "description": "Deep-dive analysis of cro score (0–100) to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ai-insights-47",
    "category": "ai-insights",
    "title": "Brand Authority Score (0–100)",
    "description": "Deep-dive analysis of brand authority score (0–100) to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ai-insights-48",
    "category": "ai-insights",
    "title": "E-E-A-T Score (0–100)",
    "description": "Deep-dive analysis of e-e-a-t score (0–100) to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ai-insights-49",
    "category": "ai-insights",
    "title": "AI Search Readiness Score (0–100)",
    "description": "Deep-dive analysis of ai search readiness score (0–100) to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  },
  {
    "id": "ai-insights-50",
    "category": "ai-insights",
    "title": "Overall Website Health Score (0–100)",
    "description": "Deep-dive analysis of overall website health score (0–100) to ensure enterprise-grade optimization.",
    "priority": "high",
    "isCore": true
  }
];

export function getChecklistByCategory(category: string) {
  return MASTER_CHECKLIST.filter(item => item.category === category);
}
