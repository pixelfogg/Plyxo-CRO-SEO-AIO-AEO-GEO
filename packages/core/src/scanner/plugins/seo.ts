import { AnalyzerPlugin, AnalyzerResult, ScanContext, ScanIssue } from '../../types';
import * as cheerio from 'cheerio';

export const SeoAnalyzer: AnalyzerPlugin = {
  name: 'Basic SEO Analyzer',
  category: 'seo',
  
  async analyze(context: ScanContext): Promise<AnalyzerResult> {
    const { html } = context;
    const $ = cheerio.load(html);
    
    let score = 100;
    const issues: ScanIssue[] = [];
    const recommendations: string[] = [];
    
    // Check Title
    const title = $('title').text();
    if (!title || title.trim() === '') {
      score -= 20;
      issues.push({
        category: 'seo',
        title: 'Missing Page Title',
        description: 'The page is missing a <title> tag, which is critical for SEO and tab navigation.',
        priority: 'critical',
        severity: 'high',
        businessImpact: 'Significant drop in search engine ranking and poor UX.',
        difficulty: 'low',
        expectedConversionGain: 'Low (Indirect, via traffic)',
        implementationSteps: ['Add a <title> tag inside the <head> of the document.'],
        aiGeneratedExample: '<title>Plyxo CRO - Analyze & Optimize</title>'
      });
      recommendations.push('Add a descriptive and keyword-rich <title> tag.');
    } else if (title.length < 30 || title.length > 60) {
      score -= 10;
      issues.push({
        category: 'seo',
        title: 'Suboptimal Title Length',
        description: `The title is ${title.length} characters long. Best practice is 30-60 characters.`,
        priority: 'medium',
        severity: 'medium',
      });
    }

    // Check Meta Description
    const description = $('meta[name="description"]').attr('content');
    if (!description || description.trim() === '') {
      score -= 15;
      issues.push({
        category: 'seo',
        title: 'Missing Meta Description',
        description: 'The page is missing a meta description, which impacts click-through rate (CTR) on search engines.',
        priority: 'high',
        severity: 'high',
        businessImpact: 'Lower CTR from search results.',
        difficulty: 'low',
      });
      recommendations.push('Add a compelling meta description under 160 characters.');
    }

    // Check H1 Tag
    const h1s = $('h1');
    if (h1s.length === 0) {
      score -= 15;
      issues.push({
        category: 'seo',
        title: 'Missing H1 Heading',
        description: 'No <h1> tag was found. H1s provide critical context to search engines.',
        priority: 'high',
        severity: 'high',
        businessImpact: 'Search engines may struggle to understand the main topic of the page.',
        difficulty: 'low',
      });
    } else if (h1s.length > 1) {
      score -= 5;
      issues.push({
        category: 'seo',
        title: 'Multiple H1 Headings',
        description: 'Multiple <h1> tags were found. It is best practice to have exactly one H1 per page.',
        priority: 'low',
        severity: 'low',
      });
    }

    return {
      score: Math.max(0, score),
      issues,
      recommendations
    };
  }
};
