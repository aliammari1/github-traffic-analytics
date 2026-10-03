// SPDX-License-Identifier: MIT
import { test, expect } from "@playwright/test";

const MOCK_PUBLIC_ANALYSIS = {
  repository: {
    id: 70107786,
    name: "next.js",
    fullName: "vercel/next.js",
    owner: {
      login: "vercel",
      avatarUrl: "https://avatars.githubusercontent.com/u/14985020?v=4",
    },
    description: "The React Framework",
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
    { date: "2020-01-01", stars: 45000 },
    { date: "2023-01-01", stars: 95000 },
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
      name: "v16.0.0",
      tagName: "v16.0.0",
      publishedAt: "2026-09-15T12:00:00Z",
      htmlUrl: "https://github.com/vercel/next.js/releases/tag/v16.0.0",
      isPrerelease: false,
    },
  ],
  highlights: [
    "Added 500 stars over the last 30 days (~120 stars/week), reaching 125,000 total stars.",
    "Release v16.0.0 published on 2026-09-15; growth activity tracked around this release.",
  ],
  isRateLimited: false,
};

test.describe("Public Repository Growth Intelligence", () => {
  test("unauthenticated visitor analyzes a public repository and inspects tabs", async ({
    page,
  }) => {
    // Intercept session (unauthenticated)
    await page.route("**/api/auth/session", (route) => route.fulfill({ json: null }));

    // Intercept public repo analysis API
    await page.route("**/api/public/repo**", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        json: MOCK_PUBLIC_ANALYSIS,
      })
    );

    // 1. Visit homepage
    await page.goto("/");

    // Verify hero positioning
    await expect(
      page.getByRole("heading", { name: "Understand why a GitHub repository is growing." })
    ).toBeVisible();

    // 2. Click the vercel/next.js example button
    await page.getByRole("button", { name: "vercel/next.js" }).click();

    // 3. Verify URL navigation to /repo/vercel/next.js
    await expect(page).toHaveURL(/\/repo\/vercel\/next\.js/);

    // 4. Verify repository details are rendered
    await expect(page.getByRole("heading", { name: "vercel/next.js" })).toBeVisible();
    await expect(page.getByText("The React Framework")).toBeVisible();
    await expect(page.getByText("125,000", { exact: true })).toBeVisible();

    // 5. Verify Overview highlights
    await expect(page.getByText("What Changed & Growth Highlights")).toBeVisible();
    await expect(page.getByText(/Added 500 stars over the last 30 days/)).toBeVisible();

    // 6. Navigate to Stars tab
    await page.getByRole("tab", { name: /Stars/i }).click();
    await expect(page.getByText("Star Growth Trajectory")).toBeVisible();
    await expect(page.getByText("120 / wk")).toBeVisible();

    // 7. Navigate to Releases tab
    await page.getByRole("tab", { name: /Releases/i }).click();
    await expect(page.getByText("v16.0.0").first()).toBeVisible();
    await expect(page.getByText("Release Timeline & Events")).toBeVisible();

    // 8. Navigate to private tab (Traffic) as unauthenticated visitor
    await page.getByRole("tab", { name: /Traffic/i }).click();
    await expect(page.getByText("Unlock Private traffic analytics")).toBeVisible();
  });
});
