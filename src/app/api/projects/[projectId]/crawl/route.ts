import { NextResponse } from 'next/server';
import { db } from '@/db';
import { projectPages } from '@/db/schema';
import { eq } from 'drizzle-orm';
import * as cheerio from 'cheerio';
import { URL } from 'url';
import { requireUser, assertProjectAccess, authErrorStatus } from '@/lib/auth';
import { assertUrlAllowed } from '@/lib/security';

const MAX_PAGES = 20; // Hard limit for demo purposes
const MAX_DEPTH = 2; // Deep crawl limit

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;

    // 1. Authenticate and authorize access to this project.
    const user = await requireUser();
    const project = await assertProjectAccess(projectId, user.id);

    const rootUrl = project.websiteUrl;
    let rootOrigin = '';

    try {
      const parsedRoot = new URL(rootUrl);
      rootOrigin = parsedRoot.origin;
    } catch (e) {
      return NextResponse.json({ error: 'Invalid project URL' }, { status: 400 });
    }

    // 2. Setup Crawler State
    const visited = new Set<string>();
    const queue: { url: string; depth: number }[] = [{ url: rootUrl, depth: 0 }];
    const discoveredPages: { url: string; title: string }[] = [];

    // 3. Crawler Loop
    while (queue.length > 0 && discoveredPages.length < MAX_PAGES) {
      const current = queue.shift()!;
      
      // Clean URL (remove hash)
      let cleanUrl = current.url.split('#')[0];
      // Ensure trailing slash consistency if needed, but let's just use it raw for now
      if (cleanUrl.endsWith('/') && cleanUrl !== rootOrigin + '/') {
        cleanUrl = cleanUrl.slice(0, -1);
      }

      if (visited.has(cleanUrl)) continue;
      visited.add(cleanUrl);

      try {
        console.log(`Crawling: ${cleanUrl} (Depth: ${current.depth})`);
        // Guard against SSRF: skip any URL resolving to a private/internal host.
        const safeUrl = await assertUrlAllowed(cleanUrl).catch(() => null);
        if (!safeUrl) continue;
        const response = await fetch(safeUrl, {
          headers: {
            'User-Agent': 'Plyxo-CRO-Bot/1.0',
          },
        });
        
        if (!response.ok) continue;
        
        const html = await response.text();
        const $ = cheerio.load(html);
        const title = $('title').text().trim() || cleanUrl;

        discoveredPages.push({ url: cleanUrl, title });

        // Extract links if depth < MAX_DEPTH
        if (current.depth < MAX_DEPTH) {
          $('a').each((_, element) => {
            const href = $(element).attr('href');
            if (href) {
              try {
                // Resolve relative URLs against the current cleanUrl
                const absoluteUrl = new URL(href, cleanUrl);
                
                // Helper to check if two domains are the same, ignoring www.
                const isSameDomain = (url1: string, url2: string) => {
                  try {
                    const host1 = new URL(url1).hostname.replace(/^www\./, '');
                    const host2 = new URL(url2).hostname.replace(/^www\./, '');
                    return host1 === host2;
                  } catch {
                    return false;
                  }
                };
                
                // Only crawl pages on the exact same domain
                if (isSameDomain(absoluteUrl.href, rootUrl)) {
                  let nextUrl = absoluteUrl.href.split('#')[0];
                  // Don't arbitrarily strip trailing slashes unless it's the root url, to prevent 404s
                  if (nextUrl.endsWith('/') && nextUrl !== new URL(nextUrl).origin + '/') {
                    nextUrl = nextUrl.slice(0, -1);
                  }
                  
                  if (!visited.has(nextUrl)) {
                    // Check if already in queue to prevent massive queue bloat
                    const inQueue = queue.some(q => q.url === nextUrl);
                    if (!inQueue) {
                      queue.push({ url: nextUrl, depth: current.depth + 1 });
                    }
                  }
                }
              } catch (e) {
                // Ignore invalid URLs
              }
            }
          });
        }
      } catch (e) {
        console.error(`Failed to crawl ${cleanUrl}`, e);
      }
    }

    // 4. Save to Database
    // Fetch existing pages to avoid duplicates
    const existingPages = await db.query.projectPages.findMany({
      where: eq(projectPages.projectId, projectId),
    });
    
    const existingUrls = new Set(existingPages.map(p => p.url));
    const newPagesToInsert = discoveredPages.filter(p => !existingUrls.has(p.url));

    if (newPagesToInsert.length > 0) {
      await db.insert(projectPages).values(
        newPagesToInsert.map(page => ({
          projectId,
          url: page.url,
          title: page.title,
          status: 'pending'
        }))
      );
    }

    return NextResponse.json({ 
      success: true, 
      crawled: visited.size,
      discovered: discoveredPages.length,
      inserted: newPagesToInsert.length,
      pages: discoveredPages 
    });

  } catch (error: any) {
    console.error('Crawler Error:', error);
    const status = authErrorStatus(error);
    return NextResponse.json(
      { error: status === 500 ? 'Failed to crawl website' : error.message },
      { status }
    );
  }
}
