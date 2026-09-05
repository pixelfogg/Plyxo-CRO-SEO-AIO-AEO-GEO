import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/seo/utils.ts',
    'src/scanner/master-checklist.ts',
    'src/ai/gemini.ts',
    'src/security/index.ts'
  ],
  format: ['cjs', 'esm'],
  dts: false,
  splitting: false,
  sourcemap: true,
  clean: true,
  shims: true,
});
