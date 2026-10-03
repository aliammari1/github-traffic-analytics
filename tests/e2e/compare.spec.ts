// SPDX-License-Identifier: MIT
import { test, expect } from "@playwright/test";
import { MOCK_PUBLIC_ANALYSIS } from "./fixtures";

test.describe("Multi-Repository Growth Comparison", () => {
  test("visitor opens comparison, clicks preset, and views comparative metrics", async ({
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

    // 1. Visit /compare directly
    await page.goto("/compare");

    await expect(page.getByRole("heading", { name: "Compare Repository Growth" })).toBeVisible();
    await expect(page.getByText("No repositories selected for comparison")).toBeVisible();

    // 2. Click a quick example preset
    await page.getByRole("button", { name: /Frameworks: Next.js vs Nuxt vs Svelte/i }).click();

    // 3. Verify URL state updated
    await expect(page).toHaveURL(/repos=vercel%2Fnext\.js/);

    // 4. Verify comparative metrics rendered
    await expect(page.getByText("Cumulative Star Trajectory Comparison")).toBeVisible();
    await expect(page.getByRole("link", { name: "vercel/next.js" })).toBeVisible();
    await expect(page.getByText("Total Stars").first()).toBeVisible();
    await expect(page.getByText("125,000").first()).toBeVisible();

    // 5. Verify share button is available
    await expect(page.getByRole("button", { name: /Share Comparison/i })).toBeVisible();
  });
});
