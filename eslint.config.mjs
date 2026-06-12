// SPDX-License-Identifier: MIT
// Next 16 removed `next lint`; we drive ESLint directly with `eslint .` and the
// flat config that `eslint-config-next` ships natively (no FlatCompat/eslintrc).
import next from "eslint-config-next";

const eslintConfig = [
  {
    // Without eslintrc's defaults we must declare our own ignore set.
    ignores: [
      ".next/**",
      ".open-next/**",
      ".wrangler/**",
      "node_modules/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
      "next-env.d.ts",
      // The Nextra docs site is a separate project with its own toolchain.
      "docs/**",
    ],
  },
  ...next,
  {
    files: ["**/*.test.{ts,tsx}", "tests/**/*.{ts,tsx}", "src/test/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];

export default eslintConfig;
