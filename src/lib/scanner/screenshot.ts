import { safeFetch } from '../security';

/**
 * Resilient website screenshot capturer.
 * Strategy:
 * 1. Browserless.io (if keys available)
 * 2. Microlink API fallback (no key required)
 */
export async function captureScreenshot(url: string): Promise<string | undefined> {
  console.log(`[Screenshot] Capturing screenshot for ${url}...`);

  // 1. Browserless.io
  const browserlessKeysStr = process.env.BROWSERLESS_API_KEYS || process.env.BROWSERLESS_API_KEY || '';
  const browserlessKeys = browserlessKeysStr.split(',').map(k => k.trim()).filter(Boolean);

  if (browserlessKeys.length > 0) {
    for (const key of browserlessKeys) {
      try {
        console.log(`[Screenshot] Trying Browserless.io...`);
        const endpoint = `https://chrome.browserless.io/screenshot?token=${key}`;
        const res = await fetch(endpoint, {
          method: 'POST',
          signal: AbortSignal.timeout(14000),
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url,
            options: { type: 'jpeg', quality: 80, fullPage: true },
            viewport: { width: 1440, height: 900, deviceScaleFactor: 1 },
            gotoOptions: { waitUntil: 'networkidle2', timeout: 10000 }
          })
        });

        if (res.ok) {
          const buffer = await res.arrayBuffer();
          if (buffer.byteLength > 1000) {
            const base64 = Buffer.from(buffer).toString('base64');
            console.log(`[Screenshot] Browserless captured successfully (${base64.length} chars base64).`);
            return base64;
          }
        }
      } catch (err) {
        console.warn(`[Screenshot] Browserless key failed:`, err);
      }
    }
  }

  // 2. Microlink API Fallback (explicit 1440x900 full page desktop viewport)
  try {
    console.log(`[Screenshot] Trying Microlink fallback...`);
    const microlinkUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url&viewport.width=1440&viewport.height=900&viewport.deviceScaleFactor=1&viewport.isFullPage=true`;
    const res = await fetch(microlinkUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(12000),
    });

    if (res.ok) {
      const buffer = await res.arrayBuffer();
      if (buffer.byteLength > 1000) {
        const base64 = Buffer.from(buffer).toString('base64');
        console.log(`[Screenshot] Microlink captured successfully (${base64.length} chars base64).`);
        return base64;
      }
    }
  } catch (err) {
    console.warn('[Screenshot] Microlink fallback failed:', err);
  }

  console.warn(`[Screenshot] All screenshot providers failed for ${url}`);
  return undefined;
}
