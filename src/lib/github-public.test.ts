// SPDX-License-Identifier: MIT
import { describe, it, expect, vi, afterEach } from "vitest";
import {
  PublicGitHubService,
  PublicRepoNotFoundError,
  PublicRepoRateLimitError,
} from "./github-public";

describe("PublicGitHubService", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("fetches repository metadata successfully", async () => {
    const mockRepoData = {
      id: 12345,
      name: "next.js",
      full_name: "vercel/next.js",
      owner: {
        login: "vercel",
        avatar_url: "https://avatars.githubusercontent.com/u/14985020",
      },
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
      headers: new Headers({ "x-ratelimit-remaining": "50", "x-ratelimit-reset": "1800000000" }),
      json: async () => mockRepoData,
    });

    const service = new PublicGitHubService({ fetchFn: mockFetch });
    const metadata = await service.getRepositoryMetadata("vercel", "next.js");

    expect(metadata.name).toBe("next.js");
    expect(metadata.starsCount).toBe(125000);
    expect(metadata.owner.login).toBe("vercel");
    expect(metadata.license).toBe("MIT");
  });

  it("throws PublicRepoNotFoundError on 404", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
      headers: new Headers({ "x-ratelimit-remaining": "50" }),
    });

    const service = new PublicGitHubService({ fetchFn: mockFetch });
    await expect(service.getRepositoryMetadata("nonexistent", "repo")).rejects.toBeInstanceOf(
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

    // Also assert empty release list handling with distinct key to bypass cache
    const emptyMockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "x-ratelimit-remaining": "50" }),
      json: async () => [],
    });
    const emptyService = new PublicGitHubService({ fetchFn: emptyMockFetch });
    const emptyReleases = await emptyService.getRecentReleases("empty", "repo");
    expect(emptyReleases).toEqual([]);
  });

  it("builds a star trajectory and computes velocity with fixed clock", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-25T00:00:00Z"));

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
    expect(analysis.starVelocity.currentStars).toBe(50);
    expect(analysis.starVelocity.growth7d).toBe(19);
    expect(analysis.starVelocity.growth30d).toBe(50);
  });

  it("builds star trajectory using modern /stargazers/history weekly buckets", async () => {
    const mockHistory = [
      {
        week: 1789862400, // 2026-09-20
        total: 10,
        days: [1, 2, 1, 1, 2, 1, 2],
      },
    ];

    const mockFetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/stargazers/history")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ "x-ratelimit-remaining": "50" }),
          json: async () => mockHistory,
        });
      }
      return Promise.resolve({
        ok: false,
        status: 404,
        statusText: "Not Found",
      });
    });

    const service = new PublicGitHubService({ fetchFn: mockFetch });
    const points = await service.getStarHistory("fast", "repo", 20, "2026-01-01T00:00:00Z");
    expect(points.length).toBeGreaterThan(1);
    expect(points[points.length - 1].stars).toBe(20);
  });

  it("uses cached negative result when repository is repeatedly queried after 404", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
      headers: new Headers({ "x-ratelimit-remaining": "50" }),
    });

    const service = new PublicGitHubService({ fetchFn: mockFetch });
    await expect(service.getRepositoryMetadata("ghost", "repo")).rejects.toBeInstanceOf(
      PublicRepoNotFoundError
    );
    // Second call should hit the negative cache without calling fetch
    await expect(service.getRepositoryMetadata("ghost", "repo")).rejects.toBeInstanceOf(
      PublicRepoNotFoundError
    );
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("gracefully flags isRateLimited when star history hits rate limits", async () => {
    const mockFetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/stargazers")) {
        return Promise.resolve({
          ok: false,
          status: 403,
          headers: new Headers({ "x-ratelimit-remaining": "0" }),
          statusText: "rate limit exceeded",
        });
      }
      if (url.includes("/releases")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ "x-ratelimit-remaining": "50" }),
          json: async () => [],
        });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        headers: new Headers({ "x-ratelimit-remaining": "50" }),
        json: async () => ({
          id: 2,
          name: "limited-repo",
          full_name: "user/limited-repo",
          owner: { login: "user", avatar_url: "" },
          stargazers_count: 100,
          created_at: "2026-01-01T00:00:00Z",
        }),
      });
    });

    const service = new PublicGitHubService({ fetchFn: mockFetch });
    const analysis = await service.analyzePublicRepository("user", "limited-repo");
    expect(analysis.isRateLimited).toBe(true);
    expect(analysis.starHistory).toHaveLength(2);
  });

  it("handles zero stars gracefully in star history", async () => {
    const service = new PublicGitHubService({ fetchFn: vi.fn() });
    const points = await service.getStarHistory("test", "zero", 0, "2026-01-01T00:00:00Z");
    expect(points).toEqual([{ date: "2026-01-01", stars: 0 }]);
  });

  it("throws PublicRepoError on forbidden 403 when remaining > 0", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      statusText: "Forbidden",
      headers: new Headers({ "x-ratelimit-remaining": "10" }),
    });
    const service = new PublicGitHubService({ fetchFn: mockFetch });
    await expect(service.getRepositoryMetadata("private", "repo")).rejects.toThrow(
      "Access Forbidden"
    );
  });

  it("throws PublicRepoError on 500 server error", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      headers: new Headers({ "x-ratelimit-remaining": "50" }),
    });
    const service = new PublicGitHubService({ fetchFn: mockFetch });
    await expect(service.getRepositoryMetadata("err", "repo")).rejects.toThrow(
      "GitHub request failed: Internal Server Error"
    );
  });

  it("returns empty array when releases call fails with 404 or error", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
      headers: new Headers({ "x-ratelimit-remaining": "50" }),
    });
    const service = new PublicGitHubService({ fetchFn: mockFetch });
    const releases = await service.getRecentReleases("none", "releases");
    expect(releases).toEqual([]);
  });
});
