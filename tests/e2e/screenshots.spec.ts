// SPDX-License-Identifier: MIT
import { test } from "@playwright/test";

const MOCK_PUBLIC_ANALYSIS = {
  repository: {
    id: 70107786,
    name: "next.js",
    fullName: "vercel/next.js",
    owner: {
      login: "vercel",
      avatarUrl: "https://avatars.githubusercontent.com/u/14985020?v=4",
    },
    description: "The React Framework – created and maintained by @vercel",
    language: "JavaScript",
    starsCount: 125000,
    forksCount: 26000,
    openIssuesCount: 2400,
    createdAt: "2016-10-25T18:00:00Z",
    updatedAt: "2026-10-01T12:00:00Z",
    htmlUrl: "https://github.com/vercel/next.js",
    homepage: "https://nextjs.org",
    topics: ["react", "framework", "nextjs"],
    license: "MIT",
  },
  starHistory: [
    { date: "2016-10-25", stars: 0 },
    { date: "2018-01-01", stars: 22000 },
    { date: "2020-01-01", stars: 45000 },
    { date: "2022-01-01", stars: 78000 },
    { date: "2024-01-01", stars: 110000 },
    { date: "2026-09-01", stars: 124500 },
    { date: "2026-10-01", stars: 125000 },
  ],
  starVelocity: {
    currentStars: 125000,
    growth7d: 120,
    growth30d: 500,
    weeklyVelocity: 120,
    dailyVelocity: 17.1,
  },
  releases: [
    {
      id: 999,
      name: "Next.js 16.0.0",
      tagName: "v16.0.0",
      publishedAt: "2026-09-15T12:00:00Z",
      htmlUrl: "https://github.com/vercel/next.js/releases/tag/v16.0.0",
      isPrerelease: false,
    },
  ],
  highlights: [
    "Added 500 stars over the last 30 days (~120 stars/week), reaching 125,000 total stars.",
    "Release v16.0.0 published on 2026-09-15; growth activity tracked around this release.",
    "Historical persistence is not enabled yet for this repository; GitHub will delete traffic data older than 14 days.",
  ],
  isRateLimited: false,
};

test.describe("Product Screenshots Capture", () => {
  test("captures public analyzer homepage and repository analytics", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });

    // Mock unauthenticated session & public repo API
    await page.route("**/api/auth/session", (route) => route.fulfill({ json: null }));
    await page.route("**/api/public/repo**", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        json: MOCK_PUBLIC_ANALYSIS,
      })
    );

    // 1. Capture homepage
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: "assets/screenshots/01-homepage-analyzer.png", fullPage: true });

    // 2. Capture repository overview
    await page.goto("/repo/vercel/next.js");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: "assets/screenshots/02-repo-overview.png", fullPage: true });

    // 3. Switch to Stars tab and capture
    await page.getByRole("tab", { name: /Stars/i }).click();
    await page.screenshot({ path: "assets/screenshots/03-repo-stars.png", fullPage: false });
  });
});
