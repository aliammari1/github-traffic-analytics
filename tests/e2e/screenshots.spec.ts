// SPDX-License-Identifier: MIT
import { test } from "@playwright/test";
import { MOCK_PUBLIC_ANALYSIS } from "./fixtures";

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

    // 3. Switch to Star History tab and capture
    await page.getByRole("tab", { name: /Star/i }).click();
    await page.screenshot({ path: "assets/screenshots/03-repo-stars.png", fullPage: false });
  });
});
