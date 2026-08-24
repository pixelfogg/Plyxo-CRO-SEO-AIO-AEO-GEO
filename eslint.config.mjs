import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  // Only lint application source. Generated output, tooling, migrations,
  // the standalone MCP server and skill scripts are not part of the app build.
  globalIgnores([
    ".next/**",
    ".next-community/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    ".agents/**",
    "drizzle/**",
    "plyxo-mcp-server/**",
    "scripts/**",
    "supabase/**",
    "public/**",
    "*.config.*",
    "*.cjs",
    "*.mjs",
  ]),
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/ban-ts-comment": "warn",
      "@typescript-eslint/no-require-imports": "warn",
      "@next/next/no-img-element": "warn",
      "react/no-unescaped-entities": "warn",
      "react/jsx-no-comment-textnodes": "warn",
      "prefer-const": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/error-boundaries": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/rules-of-hooks": "warn",
      "react-hooks/purity": "warn",
    },
  },
]);

export default eslintConfig;
