import { AnalyzerPlugin, ScanContext, AnalyzerResult } from './types';
import { SeoAnalyzer } from './plugins/seo';
import { PageSpeedAnalyzer } from './plugins/pagespeed';
// import { AccessibilityAnalyzer } from './plugins/accessibility';
// import { VisualAiAnalyzer } from './plugins/visual';

const plugins: AnalyzerPlugin[] = [
  SeoAnalyzer,
  PageSpeedAnalyzer,
  // AccessibilityAnalyzer,
  // VisualAiAnalyzer
];

// Merge a plugin's result into the accumulator instead of overwriting, so two
// plugins that both produce (e.g.) an "seo" category combine rather than one
// silently clobbering the other. Issues concatenate; the score is the stricter
// (lower) of the two.
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

export async function runScanner(context: ScanContext) {
  const results: Record<string, AnalyzerResult> = {};

  // In a real production system, this would be queued via Inngest / Edge Functions
  // and run in parallel or sequence depending on dependencies.
  for (const plugin of plugins) {
    try {
      console.log(`[Scanner] Running ${plugin.name} for ${context.url}`);
      const result = await plugin.analyze(context);

      // If the plugin returned a single AnalyzerResult (has score property)
      if ('score' in result) {
        mergeResult(results, plugin.category, result as AnalyzerResult);
      } else {
        // If the plugin returned a Record<string, AnalyzerResult>
        for (const [category, res] of Object.entries(result as Record<string, AnalyzerResult>)) {
          mergeResult(results, category, res);
        }
      }
    } catch (error) {
      console.error(`[Scanner] Error in plugin ${plugin.name}:`, error);
      // Fallback result for failed plugin
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
