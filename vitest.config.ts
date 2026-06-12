// SPDX-License-Identifier: MIT
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    // Playwright specs live in tests/e2e and are run by `playwright test`, not vitest.
    include: ["src/**/*.test.{ts,tsx}", "tests/unit/**/*.test.{ts,tsx}"],
    exclude: ["node_modules", ".next", ".open-next", "tests/e2e/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov", "json-summary"],
      reportsDirectory: "./coverage",
      // Scope coverage to the units we actually test so the 80% gate is meaningful
      // rather than diluted by presentational page shells / shadcn primitives.
      include: [
        "src/lib/github.ts",
        "src/lib/insights.ts",
        "src/lib/snapshots.ts",
        "src/lib/utils.ts",
        "src/components/TrafficDashboard.tsx",
        "src/components/RepositorySelector.tsx",
        "src/components/InsightsPanel.tsx",
        "src/app/api/traffic/route.ts",
        "src/app/api/repositories/route.ts",
        "src/app/api/insights/route.ts",
        "src/app/api/snapshots/route.ts",
        "src/app/api/track/route.ts",
      ],
      exclude: [
        "src/**/*.test.{ts,tsx}",
        "src/test/**",
        "src/types/**",
        // NextAuth wiring and the CF-runtime D1 accessor are exercised by the
        // app/e2e at runtime, not unit tests — excluded so the gate stays honest.
        "src/app/api/auth/**",
        "src/lib/auth.ts",
        "src/lib/d1.ts",
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});
