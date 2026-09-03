import { AnalyzerPlugin, AnalyzerResult, ScanContext, ScanIssue } from '../../types';

export const PageSpeedAnalyzer: AnalyzerPlugin = {
  name: 'Google PageSpeed Analyzer (Lighthouse)',
  category: 'lighthouse',
  
  async analyze(context: ScanContext): Promise<Record<string, AnalyzerResult>> {
    const { url, pageSpeedApiKey } = context;
    
    let apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=performance&category=accessibility&category=seo&category=best-practices&strategy=mobile`;
    
    const key = pageSpeedApiKey || process.env.GOOGLE_PSI_API_KEY;
    if (key) {
      apiUrl += `&key=${key}`;
    }

    try {
      const response = await fetch(apiUrl, { method: 'GET' });
      if (!response.ok) {
        throw new Error(`PageSpeed API returned ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      const lighthouse = data.lighthouseResult;

      if (!lighthouse || !lighthouse.categories || !lighthouse.audits) {
        throw new Error('Invalid Lighthouse response structure.');
      }

      const results: Record<string, AnalyzerResult> = {
        performance: { score: 0, issues: [], recommendations: [] },
        accessibility: { score: 0, issues: [], recommendations: [] },
        seo: { score: 0, issues: [], recommendations: [] },
        'best-practices': { score: 0, issues: [], recommendations: [] },
      };

      // Extract scores
      for (const cat of Object.keys(results)) {
        if (lighthouse.categories[cat]) {
          results[cat].score = Math.round((lighthouse.categories[cat].score || 0) * 100);
        }
      }

      // Map audits to issues
      const audits = lighthouse.audits;
      
      for (const cat of Object.keys(results)) {
        const categoryData = lighthouse.categories[cat];
        if (!categoryData || !categoryData.auditRefs) continue;

        for (const ref of categoryData.auditRefs) {
          const audit = audits[ref.id];
          if (!audit) continue;

          if (
            (audit.score !== null && audit.score < 0.9 && audit.scoreDisplayMode !== 'informative' && audit.scoreDisplayMode !== 'notApplicable')
            || (audit.score === null && audit.scoreDisplayMode === 'error')
          ) {
            let priority: 'low' | 'medium' | 'high' | 'critical' = 'low';
            if (audit.score !== null) {
              if (audit.score < 0.5) priority = 'high';
              else if (audit.score < 0.8) priority = 'medium';
            }
            if (ref.weight > 3) priority = 'critical';

            const cleanDescription = audit.description ? audit.description.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') : 'No description provided.';
            
            let title = audit.title;
            if (audit.displayValue) {
              title += ` (${audit.displayValue})`;
            }

            const issue: ScanIssue = {
              category: cat === 'best-practices' ? 'security' : cat,
              title,
              description: cleanDescription,
              priority,
              severity: priority,
              difficulty: 'medium',
              implementationSteps: audit.details?.items ? [`Review specific elements: ${audit.details.items.length} items flagged by Lighthouse.`] : []
            };

            results[cat].issues.push(issue);
          }
        }
      }

      return results;
    } catch (error) {
      console.error('[Lighthouse] Failed:', error);
      throw error;
    }
  }
};
