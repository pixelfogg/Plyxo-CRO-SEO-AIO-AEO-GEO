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
