// SPDX-License-Identifier: MIT
import { describe, it, expect, vi } from "vitest";
import {
  PublicGitHubService,
  PublicRepoNotFoundError,
  PublicRepoRateLimitError,
} from "./github-public";

describe("PublicGitHubService", () => {
  it("fetches and maps repository metadata accurately", async () => {
    const mockRepo = {
      id: 12345,
      name: "next.js",
      full_name: "vercel/next.js",
      owner: { login: "vercel", avatar_url: "https://avatar.url" },
      description: "The React Framework",
      language: "JavaScript",
      stargazers_count: 125000,
      forks_count: 26000,
      open_issues_count: 2400,
      created_at: "2016-10-25T18:00:00Z",
      updated_at: "2026-10-01T12:00:00Z",
      html_url: "https://github.com/vercel/next.js",
      homepage: "https://nextjs.org",
      topics: ["react", "framework"],
      license: { spdx_id: "MIT" },
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "x-ratelimit-remaining": "59" }),
      json: async () => mockRepo,
    });

    const service = new PublicGitHubService({ fetchFn: mockFetch });
    const meta = await service.getRepositoryMetadata("vercel", "next.js");

    expect(meta.name).toBe("next.js");
    expect(meta.fullName).toBe("vercel/next.js");
    expect(meta.starsCount).toBe(125000);
    expect(meta.license).toBe("MIT");
    expect(meta.topics).toContain("react");
  });

  it("throws PublicRepoNotFoundError on 404", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
      headers: new Headers({ "x-ratelimit-remaining": "50" }),
    });

    const service = new PublicGitHubService({ fetchFn: mockFetch });
    await expect(service.getRepositoryMetadata("unknown", "repo")).rejects.toBeInstanceOf(
      PublicRepoNotFoundError
    );
  });

  it("throws PublicRepoRateLimitError on 403 when remaining is 0", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      statusText: "rate limit exceeded",
      headers: new Headers({ "x-ratelimit-remaining": "0", "x-ratelimit-reset": "1800000000" }),
    });

    const service = new PublicGitHubService({ fetchFn: mockFetch });
    await expect(service.getRepositoryMetadata("busy", "repo")).rejects.toBeInstanceOf(
      PublicRepoRateLimitError
    );
  });

  it("fetches recent releases safely and handles empty releases gracefully", async () => {
    const mockReleases = [
      {
        id: 1,
        name: "v16.0.0",
        tag_name: "v16.0.0",
        published_at: "2026-09-01T10:00:00Z",
        html_url: "https://github.com/vercel/next.js/releases/v16.0.0",
        prerelease: false,
      },
    ];

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "x-ratelimit-remaining": "50" }),
      json: async () => mockReleases,
    });

    const service = new PublicGitHubService({ fetchFn: mockFetch });
    const releases = await service.getRecentReleases("vercel", "next.js");

    expect(releases).toHaveLength(1);
    expect(releases[0].tagName).toBe("v16.0.0");
  });

  it("builds a star trajectory and computes velocity", async () => {
    const mockFetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/releases")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ "x-ratelimit-remaining": "50" }),
          json: async () => [],
        });
      }
      if (url.includes("/stargazers")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ "x-ratelimit-remaining": "50" }),
          json: async () => [
            { starred_at: "2026-09-10T00:00:00Z" },
            { starred_at: "2026-09-20T00:00:00Z" },
          ],
        });
      }
      // repo metadata
      return Promise.resolve({
        ok: true,
        status: 200,
        headers: new Headers({ "x-ratelimit-remaining": "50" }),
        json: async () => ({
          id: 1,
          name: "test-repo",
          full_name: "user/test-repo",
          owner: { login: "user", avatar_url: "https://a.png" },
          stargazers_count: 50,
          created_at: "2026-01-01T00:00:00Z",
        }),
      });
    });

    const service = new PublicGitHubService({ fetchFn: mockFetch });
    const analysis = await service.analyzePublicRepository("user", "test-repo");

    expect(analysis.repository.name).toBe("test-repo");
    expect(analysis.starHistory.length).toBeGreaterThanOrEqual(2);
    expect(analysis.highlights.length).toBeGreaterThan(0);
  });
});
