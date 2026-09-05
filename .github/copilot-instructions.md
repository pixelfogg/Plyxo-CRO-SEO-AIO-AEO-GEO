# GitHub Copilot Workspace Instructions for Plyxo

When contributing code or generating audit rules in Plyxo:

1. **Shared Engine Package**:
   - All core scanning, auditing, scraping, and scoring logic lives in `packages/core/src/`.
   - Export shared functionality via `@plyxo/core` entry points.

2. **Visual CRO & Friction Rules**:
   - Return normalized 0-1000 coordinate bounding boxes `[ymin, xmin, ymax, xmax]` for friction zones.
   - Always supply concrete, copy-paste Tailwind CSS / JSX code remediation.

3. **AEO & LLM Citation Likelihood**:
   - Benchmark structured data (Schema.org JSON-LD), Knowledge Graph entity density, and direct-answer formatting for ChatGPT Search, Perplexity, Gemini, and Claude.

4. **Code Quality**:
   - Use TypeScript strict mode with explicit return types on all scanner engines.
   - Handle network failures gracefully using the resilient fallback crawler pipeline.
