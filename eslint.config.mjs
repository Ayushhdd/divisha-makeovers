import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  {
    // Client-only portals and payment QR invalidation deliberately reset state
    // in effects. Review this performance advice without blocking the build.
    rules: { "react-hooks/set-state-in-effect": "warn" },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    ".local-logs/**",
    "backend/backups/**",
    "public/**",
    "assets/**",
  ]),
  {
    files: ["portal-frontend/**"],
    rules: {
      // This is a Vite/React Router app, served alongside the Next.js website.
      "@next/next/no-html-link-for-pages": "off",
      "@next/next/no-img-element": "off",
      "@next/next/no-location-assign-relative-destination": "off",
    },
  },
]);

export default eslintConfig;
