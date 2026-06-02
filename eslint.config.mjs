import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Build artifacts (Cloudflare adapter, wrangler, deployment outputs).
    ".open-next/**",
    ".wrangler/**",
    ".deploy/**",
    ".vercel/**",
    // Generated database types (hand-maintained, but very long).
    "src/lib/database.types.ts",
  ]),
]);

export default eslintConfig;
