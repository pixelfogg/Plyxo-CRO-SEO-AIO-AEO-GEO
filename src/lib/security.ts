import 'server-only'
import dns from 'dns/promises'
import net from 'net'

/**
 * SSRF protection for server-side fetches of user-supplied URLs.
 *
 * Blocks non-http(s) schemes and any hostname that resolves to a
 * loopback / private / link-local / metadata address. Call this before every
 * `fetch()` of a URL that originates from user input (project website URL,
 * competitor URL, crawled links, webhook targets, etc.).
 */

function isPrivateIpv4(ip: string): boolean {
  const parts = ip.split('.').map(Number)
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return true
  const [a, b] = parts
  if (a === 10) return true                       // 10.0.0.0/8
  if (a === 127) return true                      // loopback
  if (a === 0) return true                        // 0.0.0.0/8
  if (a === 172 && b >= 16 && b <= 31) return true // 172.16.0.0/12
  if (a === 192 && b === 168) return true         // 192.168.0.0/16
  if (a === 169 && b === 254) return true         // link-local / cloud metadata (169.254.169.254)
  if (a === 100 && b >= 64 && b <= 127) return true // carrier-grade NAT 100.64.0.0/10
  if (a >= 224) return true                       // multicast / reserved
  return false
}

function isPrivateIpv6(ip: string): boolean {
  const addr = ip.toLowerCase()
  if (addr === '::1' || addr === '::') return true
  if (addr.startsWith('fc') || addr.startsWith('fd')) return true // unique local fc00::/7
  if (addr.startsWith('fe80')) return true                         // link-local
  // IPv4-mapped (::ffff:169.254.169.254 etc.)
  const mapped = addr.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/)
  if (mapped) return isPrivateIpv4(mapped[1])
  return false
}

function isPrivateAddress(ip: string): boolean {
  if (net.isIPv4(ip)) return isPrivateIpv4(ip)
  if (net.isIPv6(ip)) return isPrivateIpv6(ip)
  return true // unknown format → treat as unsafe
}

/**
 * Validates and normalizes a user-supplied URL, throwing if it is unsafe to
 * fetch server-side. Returns the normalized absolute URL string.
 */
export async function assertUrlAllowed(rawUrl: string): Promise<string> {
  let url: URL
  try {
    url = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`)
  } catch {
    throw new Error('Invalid URL')
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Only http(s) URLs are allowed')
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, '') // strip IPv6 brackets

  // Direct IP literal in the URL.
  if (net.isIP(hostname)) {
    if (isPrivateAddress(hostname)) throw new Error('URL resolves to a private or reserved address')
    return url.toString()
  }

  if (hostname === 'localhost' || hostname.endsWith('.localhost') || hostname.endsWith('.internal')) {
    throw new Error('URL host is not allowed')
  }

  // Resolve DNS and ensure no record points at a private range.
  let records: { address: string }[]
  try {
    records = await dns.lookup(hostname, { all: true })
  } catch {
    throw new Error('Could not resolve URL host')
  }
  if (records.length === 0 || records.some((r) => isPrivateAddress(r.address))) {
    throw new Error('URL resolves to a private or reserved address')
  }

  return url.toString()
}

/** fetch() wrapper that enforces the SSRF allow-list first. */
export async function safeFetch(rawUrl: string, init?: RequestInit): Promise<Response> {
  const safeUrl = await assertUrlAllowed(rawUrl)
  return fetch(safeUrl, init)
}

/**
 * Resiliently fetches HTML from a URL with automatic WAF / Cloudflare bypass fallback.
 * 1. Tries standard modern Chrome Desktop browser headers.
 * 2. If 403 / 503 / blocked by bot challenge, falls back to Googlebot verified crawler headers.
 * 3. If still blocked, attempts a fast public reader proxy fallback.
 */
export async function fetchHtmlResilient(
  rawUrl: string,
  options?: { signal?: AbortSignal }
): Promise<{ html: string; status: number; statusText: string; headers: Headers; finalUrl: string }> {
  const safeUrl = await assertUrlAllowed(rawUrl)

  const browserHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Sec-Ch-Ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
  }

  // Attempt 1: Modern Chrome headers
  try {
    const res = await fetch(safeUrl, {
      headers: browserHeaders,
      signal: options?.signal || AbortSignal.timeout(12000),
      redirect: 'follow',
    })

    if (res.ok) {
      const text = await res.text()
      if (text && text.length > 50) {
        return { html: text, status: res.status, statusText: res.statusText || 'OK', headers: res.headers, finalUrl: res.url || safeUrl }
      }
    }
  } catch (err) {
    console.warn(`[fetchHtmlResilient] Standard browser fetch failed for ${safeUrl}:`, err)
  }

  // Attempt 2: Googlebot Crawler headers (bypasses Cloudflare / Akamai / Wordfence WAF bot blocks on VPS data-centers)
  try {
    const resBot = await fetch(safeUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      signal: options?.signal || AbortSignal.timeout(12000),
      redirect: 'follow',
    })

    if (resBot.ok) {
      const text = await resBot.text()
      if (text && text.length > 50) {
        return { html: text, status: resBot.status, statusText: resBot.statusText || 'OK', headers: resBot.headers, finalUrl: resBot.url || safeUrl }
      }
    }
  } catch (err) {
    console.warn(`[fetchHtmlResilient] Bot crawler fetch failed for ${safeUrl}:`, err)
  }

  // Attempt 3: Public Reader Proxy Fallback (r.jina.ai)
  try {
    const proxyUrl = `https://r.jina.ai/${encodeURI(safeUrl)}`
    const resProxy = await fetch(proxyUrl, {
      headers: { 'Accept': 'text/html,text/plain' },
      signal: options?.signal || AbortSignal.timeout(15000),
    })
    if (resProxy.ok) {
      const text = await resProxy.text()
      if (text && text.length > 50) {
        const wrappedHtml = text.includes('<html')
          ? text
          : `<!DOCTYPE html><html><head><title>Scanned Page</title></head><body><main>${text}</main></body></html>`
        return { html: wrappedHtml, status: 200, statusText: 'OK', headers: new Headers(), finalUrl: safeUrl }
      }
    }
  } catch (err) {
    console.warn(`[fetchHtmlResilient] Proxy fallback failed for ${safeUrl}:`, err)
  }

  throw new Error(`Failed to fetch URL: The target website returned a blocking response (403/WAF or network timeout) and could not be retrieved.`)
}

