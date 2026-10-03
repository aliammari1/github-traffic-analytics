// SPDX-License-Identifier: MIT
import { test, expect } from "@playwright/test";
import { MOCK_PUBLIC_ANALYSIS } from "./fixtures";

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
      page.getByRole("heading", { name: "Understand why GitHub repositories grow." })
    ).toBeVisible();

    // 2. Click the vercel/next.js example button
    await page.getByRole("button", { name: "vercel/next.js" }).click();

    // 3. Verify URL navigation to /repo/vercel/next.js
    await expect(page).toHaveURL(/\/repo\/vercel\/next\.js/);

    // 4. Verify repository details are rendered
    await expect(page.getByText("vercel/next.js")).toBeVisible();
    await expect(page.getByText(/The React Framework/)).toBeVisible();
    await expect(page.getByText("125,000").first()).toBeVisible();

    // 5. Verify Overview highlights
    await expect(page.getByText("What Changed & Growth Highlights")).toBeVisible();
    await expect(page.getByText(/Added 500 stars over the last 30 days/)).toBeVisible();
    await expect(page.getByRole("heading", { name: "Growth signals" })).toBeVisible();
    await expect(page.getByText(/No change crossed the signal thresholds/)).toBeVisible();

    // A public report can be distributed through its link and README card.
    await expect(page.getByRole("button", { name: "Share" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Copy link" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Copy Markdown card" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Copy 100k milestone card" })).toBeVisible();
    const growthCard = page.locator('img[src*="/api/card/vercel/next.js"]');
    await expect(growthCard).toBeVisible();
    await page.getByLabel("Card style").selectOption("sparkline");
    await expect(growthCard).toHaveAttribute("src", /style=sparkline/);

    // 6. Navigate to Star History tab
    await page.getByRole("tab", { name: /Star/i }).click();
    await expect(page.getByText("Star Growth Trajectory")).toBeVisible();
    await expect(page.getByText("120 / wk", { exact: true })).toBeVisible();

    // 7. Navigate to Releases tab
    await page.getByRole("tab", { name: /Releases/i }).click();
    await expect(page.getByText("v16.0.0").first()).toBeVisible();
    await expect(page.getByText("Release Timeline & Events")).toBeVisible();
    await expect(page.getByRole("link", { name: /Launch report/i })).toBeVisible();

    // 8. Navigate to private tab (Traffic) as unauthenticated visitor
    await page.getByRole("tab", { name: /Traffic/i }).click();
    await expect(page.getByText("Unlock Private traffic analytics", { exact: true })).toBeVisible();

    // 9. Open and verify the shareable launch report
    await page.getByRole("tab", { name: /Releases/i }).click();
    await page.getByRole("link", { name: /Launch report/i }).click();
    await expect(page).toHaveURL(/\/launch\/vercel\/next\.js\?tag=v16\.0\.0/);
    await expect(page.getByRole("heading", { name: "v16.0.0" })).toBeVisible();
    await expect(page.getByText("+140", { exact: true })).toBeVisible();
    await expect(page.getByText("+350", { exact: true })).toBeVisible();
    await expect(page.getByText("+150%", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: /Share launch report/i })).toBeVisible();
  });
});
