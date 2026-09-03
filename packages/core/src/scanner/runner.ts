import { AnalyzerPlugin, ScanContext, AnalyzerResult } from '../types';
import { SeoAnalyzer } from './plugins/seo';
import { PageSpeedAnalyzer } from './plugins/pagespeed';

const defaultPlugins: AnalyzerPlugin[] = [
  SeoAnalyzer,
  PageSpeedAnalyzer,
];

function mergeResult(results: Record<string, AnalyzerResult>, category: string, incoming: AnalyzerResult) {
  const existing = results[category];
  if (!existing) {
    results[category] = incoming;
    return;
  }
  results[category] = {
    score: Math.min(existing.score, incoming.score),
    issues: [...existing.issues, ...incoming.issues],
    recommendations: [...(existing.recommendations || []), ...(incoming.recommendations || [])],
  };
}

export async function runScanner(context: ScanContext, customPlugins?: AnalyzerPlugin[]) {
  const results: Record<string, AnalyzerResult> = {};
  const activePlugins = customPlugins || defaultPlugins;

  for (const plugin of activePlugins) {
    try {
      console.log(`[Scanner] Running ${plugin.name} for ${context.url}`);
      const result = await plugin.analyze(context);

      if ('score' in result) {
        mergeResult(results, plugin.category, result as AnalyzerResult);
      } else {
        for (const [category, res] of Object.entries(result as Record<string, AnalyzerResult>)) {
          mergeResult(results, category, res);
        }
      }
    } catch (error) {
      console.error(`[Scanner] Error in plugin ${plugin.name}:`, error);
      results[plugin.category] = {
        score: 0,
        issues: [{
          category: plugin.category,
          title: `Plugin Execution Failed: ${plugin.name}`,
          description: String(error),
          priority: 'critical',
          severity: 'high'
        }],
        recommendations: []
      };
    }
  }
  
  return results;
}
