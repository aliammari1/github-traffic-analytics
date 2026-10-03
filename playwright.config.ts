// SPDX-License-Identifier: MIT
import fs from "node:fs";
import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

function findPlaywrightChromium(): boolean {
  try {
    const cacheDir =
      process.env.PLAYWRIGHT_BROWSERS_PATH ||
      path.join(process.env.HOME || "", ".cache/ms-playwright");
    if (!fs.existsSync(cacheDir)) return false;
    const entries = fs.readdirSync(cacheDir);
    return entries.some((entry) => entry.startsWith("chromium_headless_shell-1243"));
  } catch {
    return false;
  }
}

const systemChromium =
  !process.env.CI && !findPlaywrightChromium()
    ? ["/usr/bin/chromium", "/usr/bin/google-chrome"].find((p) => fs.existsSync(p))
    : undefined;

/**
 * Playwright e2e config. The dev server is started by Playwright; OAuth, Octokit
 * and Anthropic are mocked at the network layer inside the specs (see
 * tests/e2e/traffic.spec.ts), so no real credentials are required.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          ...(systemChromium ? { executablePath: systemChromium } : {}),
        },
      },
    },
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      NEXTAUTH_SECRET: "e2e-secret",
      NEXTAUTH_URL: "http://localhost:3000",
      GITHUB_CLIENT_ID: "e2e",
      GITHUB_CLIENT_SECRET: "e2e",
    },
  },
});
