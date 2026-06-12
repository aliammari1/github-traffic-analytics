// SPDX-License-Identifier: MIT
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

/**
 * Shared MSW server for component tests. Mocks the app's own API routes
 * (which in turn proxy Octokit / NextAuth on the server), so components can be
 * driven end-to-end without hitting GitHub or Anthropic.
 */
export const server = setupServer();

export { http, HttpResponse };

export const sampleTraffic = {
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
  paths: [{ path: "/owner/repo", title: "owner/repo", count: 800, uniques: 200 }],
};

export const sampleRepos = [
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
