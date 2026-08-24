import 'server-only'

/**
 * Real keyword-metrics provider (DataForSEO).
 *
 * When DATAFORSEO_LOGIN + DATAFORSEO_PASSWORD are set, this fetches real
 * Google Ads search volume + CPC + competition for a batch of keywords.
 * When they are NOT set, `isKeywordProviderConfigured()` returns false and
 * callers fall back to the AI estimate (clearly labelled in the UI).
 *
 * Docs: https://docs.dataforseo.com/v3/keywords_data/google_ads/search_volume/live/
 * This is intentionally gated + fault-tolerant: any failure returns an empty
 * map so keyword discovery still succeeds with estimates.
 */

export type RealKeywordMetric = {
  volume: number | null
  cpc: number | null
  competitionIndex: number | null // 0-100, usable as a KD proxy
}

export function isKeywordProviderConfigured(): boolean {
  return !!(process.env.DATAFORSEO_LOGIN && process.env.DATAFORSEO_PASSWORD)
}

export async function fetchRealKeywordMetrics(
  keywords: string[],
  opts: { locationCode?: number; languageCode?: string } = {},
): Promise<Map<string, RealKeywordMetric>> {
  const out = new Map<string, RealKeywordMetric>()
  if (!isKeywordProviderConfigured() || keywords.length === 0) return out

  const login = process.env.DATAFORSEO_LOGIN!
  const password = process.env.DATAFORSEO_PASSWORD!
  const auth = Buffer.from(`${login}:${password}`).toString('base64')

  // DataForSEO accepts up to 1000 keywords per task; we cap defensively.
  const batch = keywords.slice(0, 700)

  try {
    const res = await fetch('https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        {
          keywords: batch,
          location_code: opts.locationCode ?? 2840, // United States
          language_code: opts.languageCode ?? 'en',
        },
      ]),
      signal: AbortSignal.timeout(30000),
    })

    if (!res.ok) {
      console.warn(`[KeywordProvider] DataForSEO returned HTTP ${res.status}`)
      return out
    }

    const json = await res.json()
    const results = json?.tasks?.[0]?.result
    if (!Array.isArray(results)) return out

    for (const r of results) {
      if (!r?.keyword) continue
      out.set(String(r.keyword).toLowerCase(), {
        volume: typeof r.search_volume === 'number' ? r.search_volume : null,
        cpc: typeof r.cpc === 'number' ? r.cpc : null,
        competitionIndex: typeof r.competition_index === 'number' ? r.competition_index : null,
      })
    }
  } catch (err) {
    console.warn('[KeywordProvider] Failed to fetch real keyword metrics:', err)
  }

  return out
}
