export type IssuePriority = 'low' | 'medium' | 'high' | 'critical';
export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ScanIssue {
  category: string; // e.g., 'seo', 'performance', 'accessibility', 'copywriting'
  title: string;
  description: string;
  priority: IssuePriority;
  severity: IssueSeverity;
  businessImpact?: string;
  difficulty?: string;
  expectedConversionGain?: string;
  implementationSteps?: string[];
  aiGeneratedExample?: string;
  boundingBox?: [number, number, number, number];
}

export interface CoreWebVitals {
  lcp: number | null; // Largest Contentful Paint (ms); null if not measured
  cls: number | null; // Cumulative Layout Shift; null if not measured
  inp: number | null; // Interaction to Next Paint (ms); null if not measured
  score: number | null; // Performance Score (0-100); null if not measured
}

export interface AnalyzerResult {
  score: number; // 0 to 100
  issues: ScanIssue[];
  recommendations: string[];
  coreWebVitals?: CoreWebVitals;
}

export interface ScanContext {
  url: string;
  html: string;
  screenshotUrl?: string;
  projectId: string;
  scanId: string;
}

export interface AnalyzerPlugin {
  name: string;
  category: string;
  analyze(context: ScanContext): Promise<AnalyzerResult | Record<string, AnalyzerResult>>;
}
