import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { projectPages } from '@/db/schema';
import { eq } from 'drizzle-orm';
import * as cheerio from 'cheerio';
import { logActivity } from '@/lib/audit';
import { requireUser, assertProjectAccess, authErrorStatus } from '@/lib/auth';
import { assertUrlAllowed } from '@/lib/security';
import { assertScanAllowed } from '@/lib/billing/quota';

// Configure route to run for longer
export const maxDuration = 60; // 60 seconds is max on vercel hobby

async function crawlRecursively(baseUrl: string, maxPages = 20) {
  const visited = new Set<string>();
  const queue = [baseUrl];
  const results: { url: string; title: string }[] = [];

  const baseOrigin = new URL(baseUrl).origin;

  while (queue.length > 0 && visited.size < maxPages) {
    const currentUrl = queue.shift()!;
    if (visited.has(currentUrl)) continue;
    visited.add(currentUrl);

    try {
      // Guard against SSRF before fetching a discovered link.
      const safeUrl = await assertUrlAllowed(currentUrl).catch(() => null);
      if (!safeUrl) continue;

      // Abort if taking too long for a single fetch
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(safeUrl, { signal: controller.signal });
      clearTimeout(id);

      if (!res.ok) continue;

      const html = await res.text();
      const $ = cheerio.load(html);
      
      const title = $('title').text() || currentUrl;
      results.push({ url: currentUrl, title });

      // Extract all internal links
      $('a').each((_, element) => {
        let href = $(element).attr('href');
        if (!href) return;
        
        // Remove hash fragments
        href = href.split('#')[0];
        
        try {
          // Resolve relative URLs using currentUrl as the base
          const urlObj = new URL(href, currentUrl);
          
          const isSameDomain = (url1: string, url2: string) => {
            try {
              const host1 = new URL(url1).hostname.replace(/^www\./, '');
              const host2 = new URL(url2).hostname.replace(/^www\./, '');
              return host1 === host2;
            } catch {
              return false;
            }
          };

          // Only follow links on the same origin and not already visited or queued
          if (isSameDomain(urlObj.href, baseUrl) && !visited.has(urlObj.href) && !queue.includes(urlObj.href)) {
            // Basic filtering to avoid assets
            const ext = urlObj.pathname.split('.').pop()?.toLowerCase();
            const ignoredExts = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'css', 'js', 'svg'];
            if (!ignoredExts.includes(ext || '')) {
              queue.push(urlObj.href);
            }
          }
        } catch (e) {
          // invalid URL, ignore
        }
      });
    } catch (e) {
      console.warn(`Failed to crawl ${currentUrl}:`, e);
    }
  }

  return results;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;

    const user = await requireUser();
    const project = await assertProjectAccess(projectId, user.id);
    await assertScanAllowed(project.organizationId);

    // Run simple recursive crawl
    const crawledData = await crawlRecursively(project.websiteUrl, 25);

    // Save discovered pages to DB, avoiding duplicates. Single read + single
    // bulk insert instead of an N+1 query per discovered URL.
    const existingPages = await db.query.projectPages.findMany({
      where: eq(projectPages.projectId, projectId),
    });
    const existingUrls = new Set(existingPages.map((p) => p.url));
    const newPages = crawledData.filter((d) => !existingUrls.has(d.url));

    let inserted: typeof existingPages = [];
    if (newPages.length > 0) {
      inserted = await db.insert(projectPages).values(
        newPages.map((data) => ({
          projectId,
          url: data.url,
          title: data.title,
          status: 'pending',
        }))
      ).returning();
    }

    await logActivity('Website Crawl Executed', project.name, 'success', undefined, projectId);

    return NextResponse.json({
      success: true,
      pages: [...existingPages, ...inserted],
      discovered: crawledData.length,
      inserted: inserted.length,
    });

  } catch (error) {
    console.error('Crawl Error:', error);
    const status = authErrorStatus(error);
    return NextResponse.json(
      { error: status === 500 ? 'Failed to crawl website' : (error as Error).message },
      { status }
    );
  }
}
