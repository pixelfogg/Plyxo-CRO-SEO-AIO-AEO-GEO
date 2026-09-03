import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { deadLinks } from '@/db/schema';
import { eq } from 'drizzle-orm';
import * as cheerio from 'cheerio';
import { logActivity } from '@/lib/audit';
import { requireUser, assertProjectAccess, authErrorStatus } from '@/lib/auth';
import { assertUrlAllowed } from '@/lib/security';
import { runAutomationsForEvent } from '@/lib/automations/engine';

export const maxDuration = 55; // 55 seconds for Hobby plan

async function checkLink(url: string): Promise<{ isDead: boolean, statusCode: number, errorMsg: string, skipped?: boolean }> {
  // Never probe internal/private addresses.
  const safeUrl = await assertUrlAllowed(url).catch(() => null);
  if (!safeUrl) return { isDead: false, statusCode: 0, errorMsg: '', skipped: true };

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
  };

  try {
    // Each request gets its own 8s budget
    let res = await fetch(safeUrl, {
      method: 'HEAD',
      signal: AbortSignal.timeout(8000),
      headers,
    }).catch(() => null);

    // Many servers reject HEAD (405) or bot HEADs (403), or might return 401. Retry with GET.
    if (!res || res.status === 405 || res.status === 403 || res.status === 401 || res.status >= 500) {
      res = await fetch(safeUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(8000),
        headers,
      }).catch(() => null);
    }

    if (!res) {
      return { isDead: true, statusCode: 0, errorMsg: 'Network Error or Timeout' };
    }

    // Treat 403 Forbidden / 401 Unauthorized as alive to prevent false positives from bot protection.
    if (res.ok || res.status < 400 || res.status === 403 || res.status === 401) {
      return { isDead: false, statusCode: res.status, errorMsg: '' };
    }
    return { isDead: true, statusCode: res.status, errorMsg: res.statusText };
  } catch (error: any) {
    return { isDead: true, statusCode: 0, errorMsg: error.message || 'Network Error' };
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;

    const user = await requireUser();
    const project = await assertProjectAccess(projectId, user.id);

    // 1. Crawl and collect links
    const visitedPages = new Set<string>();
    const queue = [project.websiteUrl];
    const maxPagesToCrawl = 50; // Increased for deeper analysis
    const baseOrigin = new URL(project.websiteUrl).origin;
    
    // Maps a found link -> the page it was found on
    const allDiscoveredLinks = new Map<string, string>(); 
    
    while (queue.length > 0 && visitedPages.size < maxPagesToCrawl) {
      const currentUrl = queue.shift()!;
      if (visitedPages.has(currentUrl)) continue;
      visitedPages.add(currentUrl);

      try {
        const safePageUrl = await assertUrlAllowed(currentUrl).catch(() => null);
        if (!safePageUrl) continue;
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(safePageUrl, { 
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
          }
        });
        clearTimeout(id);

        if (!res.ok) {
           allDiscoveredLinks.set(currentUrl, currentUrl); // Record if the page itself is dead
           continue;
        }

        const html = await res.text();
        const $ = cheerio.load(html);
        
        const processUrl = (href: string | undefined) => {
          if (!href || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:') || href.startsWith('#')) return;
          
          try {
            // Accurately resolve relative URLs against the current page URL
            const resolvedUrlObj = new URL(href, currentUrl);
            const resolvedUrl = resolvedUrlObj.href;
            
            // Record link
            if (!allDiscoveredLinks.has(resolvedUrl)) {
              allDiscoveredLinks.set(resolvedUrl, currentUrl);
            }

            // Queue internal links for crawling
            if (resolvedUrlObj.origin === baseOrigin && !visitedPages.has(resolvedUrl) && !queue.includes(resolvedUrl)) {
              const ext = resolvedUrlObj.pathname.split('.').pop()?.toLowerCase();
              const ignoredExts = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'css', 'js', 'svg', 'mp4', 'mp3', 'webm', 'ogg', 'wav'];
              if (!ignoredExts.includes(ext || '')) {
                queue.push(resolvedUrl);
              }
            }
          } catch (e) {
            // Invalid URL format
          }
        };

        // Extract from standard link elements
        $('a, link').each((_, element) => processUrl($(element).attr('href')));
        
        // Extract from media and script elements
        $('img, script, iframe, source, video, audio').each((_, element) => {
          processUrl($(element).attr('src'));
          
          // Deep analysis: also extract from srcset if present
          const srcset = $(element).attr('srcset');
          if (srcset) {
            srcset.split(',').forEach(part => {
              const url = part.trim().split(' ')[0];
              if (url) processUrl(url);
            });
          }
        });
      } catch (e) {
        // failed to fetch page
      }
    }

    // 2. Only clear old results if we actually managed to crawl something,
    // so a transient crawl failure doesn't wipe the previous report.
    if (visitedPages.size > 0 && allDiscoveredLinks.size > 0) {
      await db.delete(deadLinks).where(eq(deadLinks.projectId, projectId));
    }

    // 3. Check all discovered links concurrently in chunks
    const linksToCheck = Array.from(allDiscoveredLinks.entries());
    const CHUNK_SIZE = 40; // Increased concurrency to process larger volume faster
    const foundDeadLinks = [];

    for (let i = 0; i < linksToCheck.length; i += CHUNK_SIZE) {
      const chunk = linksToCheck.slice(i, i + CHUNK_SIZE);
      
      const results = await Promise.all(
        chunk.map(async ([targetUrl, foundOnUrl]) => {
          const { isDead, statusCode, errorMsg } = await checkLink(targetUrl);
          if (isDead) {
            return {
              projectId,
              foundOnUrl,
              targetUrl,
              statusCode,
              errorMessage: errorMsg.substring(0, 255)
            };
          }
          return null;
        })
      );
      
      const validDeadLinks = results.filter(Boolean) as any[];
      if (validDeadLinks.length > 0) {
        const inserted = await db.insert(deadLinks).values(validDeadLinks).returning();
        foundDeadLinks.push(...inserted);
      }
    }

    await logActivity('Dead Link Check Executed', project.name, 'success', undefined, projectId);

    if (foundDeadLinks.length > 0) {
      await runAutomationsForEvent(project.organizationId, 'deadlink.detected', { projectId, count: foundDeadLinks.length });
    }

    return NextResponse.json({ success: true, deadLinks: foundDeadLinks });

  } catch (error) {
    console.error('Link Checker Error:', error);
    const status = authErrorStatus(error);
    return NextResponse.json(
      { error: status === 500 ? 'Failed to run link checker' : (error as Error).message },
      { status }
    );
  }
}
