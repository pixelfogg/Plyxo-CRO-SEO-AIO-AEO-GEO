import { db } from '@/db';
import { scans, scanIssues } from '@/db/schema';
import { runScanner } from './runner';
import { analyzeHtmlWithAI } from '../ai/gemini';
import { eq } from 'drizzle-orm';
import { fetchCoreWebVitals } from './vitals';
import { assertUrlAllowed, safeFetch } from '../security';
import { logActivity } from '@/lib/audit';
import { captureScreenshot } from './screenshot';

const VALID_PRIORITIES = new Set(['low', 'medium', 'high', 'critical']);
const VALID_SEVERITIES = new Set(['low', 'medium', 'high', 'critical']);

/**
 * Background queue processor with parallel execution, multi-provider screenshot capture,
 * and robust fallback guards for live serverless & self-hosted environments.
 */
export async function processScanJob(scanId: string) {
  console.log(`[Queue] Processing scan job: ${scanId}`);
  let currentScan: any = null;
  
  try {
    // 1. Fetch Scan metadata from DB
    const scan = await db.query.scans.findFirst({
      where: eq(scans.id, scanId),
      with: { project: true }
    });

    if (!scan || !scan.project) {
      throw new Error(`Scan ${scanId} or associated project not found`);
    }
    currentScan = scan;

    // SSRF guard: ensure the project URL is a public web address
    await assertUrlAllowed(scan.project.websiteUrl);

    // Update status to 'running'
    await db.update(scans).set({ status: 'running' }).where(eq(scans.id, scanId));

    // 2. Setup Context
    const context = {
      url: scan.project.websiteUrl,
      industry: scan.project.industry || 'generic',
    };

    // 2.5 Run DOM Fetch and High-Resolution Screenshot Capture in Parallel
    console.log(`[Queue] Fetching DOM content and capturing high-res screenshot for ${context.url}...`);
    
    const fetchDomPromise = (async () => {
      let html = '';
      const browserlessKeysStr = process.env.BROWSERLESS_API_KEYS || process.env.BROWSERLESS_API_KEY || '';
      const browserlessKeys = browserlessKeysStr.split(',').map(k => k.trim()).filter(Boolean);

      if (browserlessKeys.length > 0) {
        for (const currentKey of browserlessKeys) {
          try {
            const endpoint = `https://chrome.browserless.io/content?token=${currentKey}`;
            const res = await fetch(endpoint, {
              method: 'POST',
              signal: AbortSignal.timeout(9000),
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                url: context.url,
                gotoOptions: { waitUntil: 'domcontentloaded', timeout: 8000 },
                waitFor: 500
              })
            });

            if (res.ok) {
              html = await res.text();
              console.log(`[Queue] Browserless successfully fetched DOM (${html.length} bytes).`);
              break;
            }
          } catch (err) {
            console.warn(`[Queue] Browserless DOM fetch timed out or failed:`, err);
          }
        }
      }

      // Direct HTTP fetch fallback if Browserless did not return HTML
      if (!html || html.length < 50) {
        console.log(`[Queue] Using direct native fetch for ${context.url}...`);
        try {
          const directRes = await safeFetch(context.url, {
            signal: AbortSignal.timeout(9000),
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            }
          });
          if (directRes.ok) {
            html = await directRes.text();
            console.log(`[Queue] Direct fetch succeeded (${html.length} bytes)`);
          }
        } catch (directErr) {
          console.warn('[Queue] Direct fetch fallback failed:', directErr);
        }
      }

      return html || `<html><head><title>${scan.project.name}</title></head><body><h1>${scan.project.name}</h1></body></html>`;
    })();

    const screenshotPromise = captureScreenshot(context.url).catch(err => {
      console.warn('[Queue] Visual screenshot capture failed (non-fatal):', err);
      return undefined;
    });

    const [html, imageBase64] = await Promise.all([fetchDomPromise, screenshotPromise]);

    // 3. Parallel Execution: Run Analyzer Plugins, Gemini AI Visual Analysis, and Core Web Vitals
    const scanContext = {
      url: scan.project.websiteUrl,
      html,
      projectId: scan.projectId,
      scanId,
    };

    console.log(`[Queue] Running parallel analyzer suite: SEO, Lighthouse, AI Visual Analysis, and Core Web Vitals...`);
    const [pluginResults, aiResult, vitals] = await Promise.all([
      runScanner(scanContext),
      analyzeHtmlWithAI(html, imageBase64).catch(err => {
        console.warn('[Queue] Gemini AI analysis error, falling back to rule-based analysis:', err);
        return { issues: [], tokensConsumed: 0 };
      }),
      fetchCoreWebVitals(context.url).catch(err => {
        console.warn('[Queue] Core Web Vitals fetch error (non-fatal):', err);
        return null;
      }),
    ]);

    const aiIssues = aiResult.issues || [];
    const tokensConsumed = aiResult.tokensConsumed || 0;

    // 4. Aggregate Results & Save to Database
    const aggregatedIssues = [
      ...Object.values(pluginResults).flatMap(res => res.issues),
      ...aiIssues
    ];

    // Compute average score
    const scores = Object.keys(pluginResults).reduce((acc, category) => {
      acc[category] = pluginResults[category].score;
      return acc;
    }, {} as Record<string, number>);

    // Bulk insert issues
    const sanitizedIssues = aggregatedIssues
      .filter(issue => issue && issue.title && issue.description && issue.category)
      .map(issue => ({
        scanId,
        category: String(issue.category),
        title: String(issue.title),
        description: String(issue.description),
        priority: VALID_PRIORITIES.has(issue.priority) ? issue.priority : 'medium',
        severity: VALID_SEVERITIES.has(issue.severity) ? issue.severity : 'medium',
        businessImpact: issue.businessImpact,
        difficulty: issue.difficulty,
        expectedConversionGain: issue.expectedConversionGain,
        implementationSteps: issue.implementationSteps,
        aiGeneratedExample: issue.aiGeneratedExample,
        boundingBox: issue.boundingBox,
      }));

    if (sanitizedIssues.length > 0) {
      await db.insert(scanIssues).values(sanitizedIssues);
    }

    // Mark scan as completed
    await db.update(scans).set({
      status: 'completed',
      completedAt: new Date(),
      scores,
      coreWebVitals: vitals ?? undefined,
      screenshotBase64: imageBase64,
      tokensConsumed,
    }).where(eq(scans.id, scanId));

    console.log(`[Queue] Scan job ${scanId} completed successfully with visual report (${imageBase64 ? 'screenshot included' : 'no screenshot'}).`);

    // Record activity feed entry
    await logActivity('CRO Scan Report Completed', scan.project.name, 'success', undefined, scan.projectId);

  } catch (error) {
    console.error(`[Queue] Scan job ${scanId} failed:`, error);
    await db.update(scans).set({
      status: 'failed',
      completedAt: new Date()
    }).where(eq(scans.id, scanId));

    if (currentScan?.projectId) {
      await logActivity('CRO Scan Report Failed', currentScan.project?.name || 'Project', 'error', undefined, currentScan.projectId).catch(() => {});
    }
  }
}
