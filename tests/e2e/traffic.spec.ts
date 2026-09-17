// SPDX-License-Identifier: MIT
import { test, expect, type Page } from "@playwright/test";

/**
 * End-to-end happy path: sign in -> select a repository -> view its traffic.
 *
 * Real GitHub OAuth and the GitHub/Anthropic APIs cannot run in CI, so we mock
 * at the network boundary: the NextAuth session endpoint (to appear signed in)
 * and the app's own API routes (which would otherwise call Octokit server-side).
 * This is the Playwright equivalent of the MSW mocking used in the component tests.
 */

const SESSION = {
  user: { name: "alice", email: "alice@example.com", image: "https://example.com/a.png" },
  expires: "2999-01-01T00:00:00.000Z",
  accessToken: "fake-token",
};

const REPOS = [
  {
    id: 1,
    name: "repo-one",
    full_name: "alice/repo-one",
    private: false,
    owner: { login: "alice", avatar_url: "https://example.com/a.png" },
    description: "First repo",
    language: "TypeScript",
    stargazers_count: 10,
    forks_count: 2,
    updated_at: "2026-06-01T00:00:00Z",
    permissions: { admin: true, push: true, pull: true },
  },
];

const TRAFFIC = {
  views: {
    count: 1200,
    uniques: 300,
    views: [
      { timestamp: "2026-06-01T00:00:00Z", count: 600, uniques: 150 },
      { timestamp: "2026-06-02T00:00:00Z", count: 600, uniques: 150 },
    ],
  },
  clones: {
    count: 40,
    uniques: 20,
    clones: [{ timestamp: "2026-06-01T00:00:00Z", count: 40, uniques: 20 }],
  },
  referrers: [{ referrer: "github.com", count: 500, uniques: 120 }],
  paths: [{ path: "/alice/repo-one", title: "alice/repo-one", count: 800, uniques: 200 }],
};

async function mockBackend(page: Page) {
  await page.route("**/api/auth/session", (route) => route.fulfill({ json: SESSION }));
  await page.route("**/api/repositories", (route) => route.fulfill({ json: REPOS }));
  await page.route("**/api/traffic**", (route) => route.fulfill({ json: TRAFFIC }));
  // No D1 in e2e: the historical surface degrades gracefully on a 503.
  await page.route("**/api/snapshots**", (route) =>
    route.fulfill({ status: 503, json: { error: "Historical snapshots require the Cloudflare D1 deployment." } })
  );
}

test("signed-in user selects a repo and views its traffic", async ({ page }) => {
  await mockBackend(page);
  await page.goto("/");

  // Signed-in home shows the repository selector heading.
  await expect(page.getByRole("heading", { name: "Your Repositories" })).toBeVisible();

  // Select the repository.
  await page.getByText("repo-one").click();

  // Traffic dashboard renders the aggregate stats and chart for the repo.
  await expect(page.getByText("1,200")).toBeVisible();
  await expect(page.getByText("Views over time")).toBeVisible();
  await expect(page.getByText("github.com")).toBeVisible();
  await expect(page.getByText("Historical traffic")).toBeVisible();
});

test("unauthenticated visitor sees the marketing sign-in page", async ({ page }) => {
  // NextAuth's client treats any non-null body as a session; return null for "signed out".
  await page.route("**/api/auth/session", (route) => route.fulfill({ json: null }));
  await page.goto("/");

  await expect(page.getByRole("button", { name: /Continue with GitHub/i })).toBeVisible();
});
