import { safeFetch } from '../security';

/**
 * Multi-layer resilient website screenshot capturer.
 * Strategy:
 * 1. ScreenshotOne API (if configured in env)
 * 2. Browserless.io (if keys available)
 * 3. Google PageSpeed / Lighthouse final-screenshot
 * 4. Microlink API fallback
 */
export async function captureScreenshot(url: string): Promise<string | undefined> {
  console.log(`[Screenshot] Attempting multi-provider screenshot capture for ${url}...`);

  // 1. ScreenshotOne API
  const s1Key = process.env.SCREENSHOTONE_ACCESS_KEY;
  if (s1Key) {
    try {
      console.log(`[Screenshot] Trying ScreenshotOne API...`);
      const s1Url = `https://api.screenshotone.com/take?access_key=${s1Key}&url=${encodeURIComponent(url)}&viewport_width=1440&viewport_height=900&device_scale_factor=1&format=jpg&image_quality=80&full_page=true&block_ads=true&block_cookie_banners=true&timeout=12`;
      const res = await fetch(s1Url, {
        method: 'GET',
        signal: AbortSignal.timeout(12000),
      });

      if (res.ok) {
        const buffer = await res.arrayBuffer();
        if (buffer.byteLength > 1000) {
          const base64 = Buffer.from(buffer).toString('base64');
          console.log(`[Screenshot] ScreenshotOne captured successfully (${base64.length} chars base64).`);
          return base64;
        }
      } else {
        console.warn(`[Screenshot] ScreenshotOne returned status ${res.status}`);
      }
    } catch (err) {
      console.warn('[Screenshot] ScreenshotOne failed:', err);
    }
  }

  // 2. Browserless.io
  const browserlessKeysStr = process.env.BROWSERLESS_API_KEYS || process.env.BROWSERLESS_API_KEY || '';
  const browserlessKeys = browserlessKeysStr.split(',').map(k => k.trim()).filter(Boolean);

  if (browserlessKeys.length > 0) {
    for (const key of browserlessKeys) {
      try {
        console.log(`[Screenshot] Trying Browserless.io with key ${key.substring(0, 4)}...`);
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

  // 3. Microlink API Fallback (explicit 1440x900 full page desktop viewport)
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
