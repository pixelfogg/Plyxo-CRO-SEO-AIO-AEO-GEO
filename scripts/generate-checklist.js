const fs = require('fs');

const rawText = `1. SEO Analysis (150+ Checks)
Technical SEO
HTTPS enabled
SSL validity
HTTP/2 or HTTP/3
Canonical URL
Indexability
Crawlability
robots.txt
sitemap.xml
XML sitemap validity
HTML sitemap
hreflang implementation
Pagination tags
URL structure
URL length
URL keyword optimization
Redirect chains
Redirect loops
404 pages
Soft 404
Broken internal links
Broken external links
Duplicate pages
Duplicate titles
Duplicate meta descriptions
Thin pages
Orphan pages
Crawl depth
Canonical conflicts
WWW/non-WWW consistency
Trailing slash consistency
Meta Data
Title tag length
Keyword placement
Duplicate titles
Meta description length
Duplicate descriptions
Missing descriptions
Meta robots
Open Graph tags
Twitter cards
Apple meta tags
Theme color
Viewport tag
Headings
H1 exists
Multiple H1
Heading hierarchy
Empty headings
Keyword usage
Heading relevance
Content SEO
Word count
Keyword density
Semantic keywords
NLP entities
LSI keywords
Readability score
Duplicate content
Content freshness
AI-generated detection
E-E-A-T signals
FAQ presence
Rich snippets
Internal linking
Outbound authority links
Content uniqueness
Image SEO
Missing ALT
ALT quality
Image titles
Image filenames
Lazy loading
WebP/AVIF
Dimensions
Responsive images
Compression
Structured Data
Organization
LocalBusiness
Product
FAQ
Breadcrumb
Article
Review
Event
Video
Person
SoftwareApplication
Service
WebSite
SearchAction
Validation errors
Internal Linking
Link depth
Anchor diversity
Orphan pages
Broken anchors
Link distribution
Footer links
Breadcrumbs
Advanced SEO
Topical authority
Search intent match
Content clusters
Semantic coverage
Featured snippet optimization
PAA optimization
Voice search readiness
AI Overview readiness
GEO (Generative Engine Optimization)
Entity coverage
Knowledge Graph readiness
2. Performance Analysis
Core Web Vitals
LCP
CLS
INP
FCP
TTFB
Speed Index
Total Blocking Time
Loading
DOM Loaded
Fully Loaded
Render Blocking CSS
Render Blocking JS
Critical CSS
Preload
Prefetch
DNS Prefetch
Preconnect
JavaScript
Bundle size
Unused JS
Tree shaking
Code splitting
Async scripts
Deferred scripts
Third-party scripts
CSS
Unused CSS
Minification
Compression
Critical CSS
Images
Image size
Compression
WebP
AVIF
Responsive images
Lazy loading
SVG optimization
Fonts
Font loading
Font-display
Font preloading
Font size optimization
Server
Compression (Gzip/Brotli)
CDN usage
Caching headers
Cache-Control
Keep Alive
HTTP version
DNS lookup
Server response
TLS handshake
Resources
Number of requests
Total page weight
JS weight
CSS weight
Font weight
Image weight
3. Accessibility (WCAG 2.2)
Structure
Proper headings
Landmark regions
Skip navigation
Semantic HTML
Keyboard
Keyboard navigation
Focus visibility
Tab order
Keyboard traps
Screen Readers
ARIA labels
ARIA roles
Form labels
Live regions
Images
ALT text
Decorative images
SVG accessibility
Color
Contrast ratio
Link distinguishability
Dark mode compatibility
Forms
Labels
Required indicators
Error messages
Validation accessibility
Multimedia
Captions
Transcript
Audio controls
4. Best Practices
HTTPS
Console errors
Deprecated APIs
Security headers
CSP
XSS protection
Frame options
Referrer policy
Permissions policy
Mixed content
Cookie security
External dependencies
Third-party risks
Browser compatibility
Mobile responsiveness
5. UX Analysis
Navigation
Clear menu
Sticky navigation
Search visibility
Breadcrumbs
Mobile menu
Mobile UX
Tap targets
Thumb reachability
Mobile spacing
Safe areas
Forms
Field count
Progress indicators
Validation
Autofill
Password visibility
User Journey
Hero clarity
Information hierarchy
Visual flow
CTA placement
Decision friction
Exit points
Interaction
Hover states
Loading indicators
Micro interactions
Empty states
Error handling
6. Visual Design Analysis
Branding
Brand consistency
Color palette
Typography
Logo visibility
Layout
Alignment
Grid consistency
White space
Visual balance
Section spacing
Typography
Font pairing
Readability
Line height
Letter spacing
Text width
Colors
Contrast
Accessibility
Emotional impact
Consistency
Images
Quality
Consistency
Relevance
Authenticity
Design Quality
Modern appearance
Premium feel
Trust perception
Professional polish
Visual Hierarchy
Primary focus
Secondary focus
Eye tracking path
F-pattern optimization
Z-pattern optimization
7. Copywriting Analysis
Headlines
Clarity
Value proposition
Emotional impact
Keyword usage
Messaging
Benefits vs features
Customer-centric language
Readability
Simplicity
Tone consistency
Psychology
Emotional triggers
Curiosity
Urgency
Scarcity
Social proof
Authority
SEO Copy
Keyword intent
NLP optimization
Semantic richness
Readability
Grade level
Sentence length
Passive voice
Jargon detection
8. Trust Analysis
Business
About page
Contact information
Phone
Email
Address
Google Maps
Social Proof
Testimonials
Reviews
Ratings
Case studies
Client logos
Legal
Privacy policy
Terms
Refund policy
Cookie policy
GDPR
CCPA
Security
SSL
Payment badges
Trust seals
Company
Team members
Founder story
Years in business
Certifications
Awards
9. CTA Analysis
Visibility
Above the fold
Contrast
Size
Placement
Messaging
Action verbs
Clarity
Urgency
Benefit-driven
Quantity
CTA frequency
CTA consistency
Primary CTA
Secondary CTA
Performance
Clickability
Mobile usability
Accessibility
Sticky CTA
10. CRO (Conversion Rate Optimization)
Landing Page
Clear value proposition
Hero effectiveness
Above-the-fold optimization
CTA visibility
Friction
Too many clicks
Form friction
Navigation distractions
Exit opportunities
Persuasion
Benefits
Objection handling
Guarantees
Risk reversal
Trust signals
Funnel
Conversion path
Checkout friction
Lead capture
Multi-step optimization
Behavioral Psychology
FOMO
Anchoring
Reciprocity
Social proof
Authority
Commitment
Loss aversion
Analytics
Scroll depth
Click heatmap opportunities
Rage click detection opportunities
Dead clicks
Attention areas
User journey bottlenecks
11. AI-Powered Insights (Unique Differentiator)
Competitor Analysis
Compare with top 5 competitors
Compare page speed
Compare CTAs
Compare copywriting
Compare design quality
Compare trust signals
Compare SEO coverage
AI Design Review
Visual hierarchy scoring
First impression analysis
Premium look score
Clutter detection
Color harmony analysis
Typography quality
Spacing consistency
Accessibility prediction
AI Copy Review
Emotional score
Persuasion score
Clarity score
Reading difficulty
Trust score
Conversion potential
Brand tone consistency
AI CRO Recommendations
Predicted conversion blockers
CTA improvements
Hero section rewrite
Section reordering
Copy improvements
Trust improvements
Form optimization
Navigation improvements
AI Business Analysis
Target audience identification
Customer intent analysis
Missing pages
Missing content
Competitive positioning
USP clarity
Brand authority score
AI Predictive Scores
SEO Score (0–100)
Performance Score (0–100)
Accessibility Score (0–100)
UX Score (0–100)
Design Score (0–100)
Copywriting Score (0–100)
Trust Score (0–100)
CTA Score (0–100)
CRO Score (0–100)
Brand Authority Score (0–100)
E-E-A-T Score (0–100)
AI Search Readiness Score (0–100)
Overall Website Health Score (0–100)`;

let currentCategory = '';
let currentPriority = 'medium';
let idCounter = 1;

const items = [];
const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

const subheadings = [
  'Technical SEO', 'Meta Data', 'Headings', 'Content SEO', 'Image SEO', 'Structured Data', 'Internal Linking', 'Advanced SEO', 
  'Core Web Vitals', 'Loading', 'JavaScript', 'CSS', 'Images', 'Fonts', 'Server', 'Resources', 
  'Structure', 'Keyboard', 'Screen Readers', 'Color', 'Forms', 'Multimedia', 
  'Navigation', 'Mobile UX', 'User Journey', 'Interaction', 
  'Branding', 'Layout', 'Typography', 'Colors', 'Design Quality', 'Visual Hierarchy', 
  'Headlines', 'Messaging', 'Psychology', 'SEO Copy', 
  'Business', 'Social Proof', 'Legal', 'Security', 'Company', 
  'Visibility', 'Performance', 
  'Landing Page', 'Friction', 'Persuasion', 'Funnel', 'Behavioral Psychology', 'Analytics',
  'Competitor Analysis', 'AI Design Review', 'AI Copy Review', 'AI CRO Recommendations', 'AI Business Analysis', 'AI Predictive Scores'
];

for(let line of lines) {
  if (line.match(/^\d+\.\s+(.*)/)) {
    let catName = line.match(/^\d+\.\s+(.*)/)[1].toLowerCase();
    if (catName.includes('seo')) currentCategory = 'seo';
    else if (catName.includes('performance')) currentCategory = 'performance';
    else if (catName.includes('accessibility')) currentCategory = 'accessibility';
    else if (catName.includes('best practices')) currentCategory = 'best-practices';
    else if (catName.includes('ux')) currentCategory = 'ux';
    else if (catName.includes('visual')) currentCategory = 'visual';
    else if (catName.includes('copywriting')) currentCategory = 'copywriting';
    else if (catName.includes('trust')) currentCategory = 'trust';
    else if (catName.includes('cta')) currentCategory = 'cta';
    else if (catName.includes('cro')) currentCategory = 'cro';
    else if (catName.includes('ai-powered insights')) currentCategory = 'ai-insights';
    else currentCategory = 'other';
    idCounter = 1;
    continue;
  }
  
  if (subheadings.some(sh => sh.toLowerCase() === line.toLowerCase())) {
     continue;
  }
  
  if (line.includes('These are the features that will separate')) continue;
  
  const item = {
    id: `${currentCategory}-${idCounter++}`,
    category: currentCategory,
    title: line,
    description: `Deep-dive analysis of ${line.toLowerCase()} to ensure enterprise-grade optimization.`,
    priority: 'high',
    isCore: true
  };
  items.push(item);
}

const fileContent = `export interface MasterChecklistItem {
  id: string;
  category: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  isCore: boolean;
}

export const MASTER_CHECKLIST: MasterChecklistItem[] = ${JSON.stringify(items, null, 2)};

export function getChecklistByCategory(category: string) {
  return MASTER_CHECKLIST.filter(item => item.category === category);
}
`;

fs.writeFileSync('src/lib/scanner/master-checklist.ts', fileContent);
console.log('Successfully generated comprehensive master-checklist.ts with ' + items.length + ' checks.');
