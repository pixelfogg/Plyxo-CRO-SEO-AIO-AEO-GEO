import { CoreWebVitals } from '../types';

/**
 * Fetches REAL Core Web Vitals for a URL from the Google PageSpeed Insights API.
 * Prefers CrUX field data (real users) and falls back to Lighthouse lab metrics.
 */
export async function fetchCoreWebVitals(url: string, customApiKey?: string): Promise<CoreWebVitals | null> {
  const apiKey = customApiKey || process.env.GOOGLE_PSI_API_KEY;

  let apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=performance&strategy=mobile`;
  if (apiKey) apiUrl += `&key=${apiKey}`;

  try {
    const res = await fetch(apiUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) {
      console.warn(`[Vitals] PageSpeed API returned ${res.status}`);
      return null;
    }

    const data = await res.json();
    const field = data.loadingExperience?.metrics;
    const lab = data.lighthouseResult;

    // Field (real-user / CrUX) data is authoritative when present.
    const fieldLcp = field?.LARGEST_CONTENTFUL_PAINT_MS?.percentile;
    const fieldClsRaw = field?.CUMULATIVE_LAYOUT_SHIFT_SCORE?.percentile;
    const fieldInp = field?.INTERACTION_TO_NEXT_PAINT?.percentile;

    // Lab (Lighthouse) fallbacks.
    const labLcp = lab?.audits?.['largest-contentful-paint']?.numericValue;
    const labCls = lab?.audits?.['cumulative-layout-shift']?.numericValue;
    const labScore = lab?.categories?.performance?.score;

    const lcp = fieldLcp ?? labLcp;
    // CrUX reports CLS score * 100 (integer); normalize back to a 0-1 scale.
    const cls = fieldClsRaw != null ? fieldClsRaw / 100 : labCls;
    const inp = fieldInp; // INP has no reliable single-run lab equivalent.
    const score = labScore != null ? Math.round(labScore * 100) : null;

    if (lcp == null && cls == null && inp == null && score == null) {
      return null;
    }

    return {
      lcp: lcp ?? null,
      cls: cls ?? null,
      inp: inp ?? null,
      score: score ?? null,
    };
  } catch (err) {
    console.warn('[Vitals] Failed to fetch Core Web Vitals:', err);
    return null;
  }
}
