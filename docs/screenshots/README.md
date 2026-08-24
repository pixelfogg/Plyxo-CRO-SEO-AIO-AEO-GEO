# Screenshots

The `*.svg` files here are **labeled placeholders** so the main README renders
cleanly before real screenshots exist. Replace each with a real screenshot when
you're ready to publish.

## How to capture

1. Run the app in community edition (no login required):
   ```bash
   NEXT_PUBLIC_IS_CLOUD_EDITION=false npm run dev
   ```
2. Create a project and run a scan so the screens have real data.
3. Capture each route below (1000×600 or wider looks best) and save as PNG.
4. Either save as the same base name (e.g. `01-cro-audit.png`) and update the
   README image links from `.svg` → `.png`, or overwrite the `.svg` files.

| File | Route | What to show |
|------|-------|--------------|
| `01-cro-audit` | `/dashboard/projects/<id>/scans/<id>` | The visual CRO report with bounding boxes, category scores and Core Web Vitals |
| `02-seo` | `/dashboard/seo/<id>` | SEO Intelligence health scores + issues |
| `03-aio` | `/dashboard/aio/<id>` | AIO citation score + recommendations |
| `04-keywords` | `/dashboard/keywords/<id>` | Keyword opportunities table |
| `05-automations` | `/dashboard/automations` | Automations with real run history |
| `06-compliance` | `/superadmin/compliance` | Audit log + compliance posture |

Tip: a short GIF of a scan running (drop it in as `demo.gif`) makes a great hero.
