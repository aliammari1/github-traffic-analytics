import fs from "node:fs";
import { defineConfig, devices } from "@playwright/test";

const systemChromium = ["/usr/bin/chromium", "/usr/bin/google-chrome"].find((p) =>
  fs.existsSync(p)
);

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
          ...(process.env.CI || !systemChromium ? {} : { executablePath: systemChromium }),
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
