// SPDX-License-Identifier: MIT
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET, checkIpRateLimit, resetIpRateLimit } from "./route";
import {
  publicGitHub,
  PublicRepoError,
  PublicRepoNotFoundError,
  PublicRepoRateLimitError,
} from "@/lib/github-public";

vi.mock("@/lib/github-public", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/github-public")>();
  return {
    ...actual,
    publicGitHub: {
      analyzePublicRepository: vi.fn(),
    },
  };
});

function req(url: string, ip?: string) {
  const headers = new Headers();
  if (ip) headers.set("x-forwarded-for", ip);
  return new NextRequest(new Request(url, { headers }));
}

describe("GET /api/public/repo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when owner or repo is missing", async () => {
    const res = await GET(req("http://localhost/api/public/repo"));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Invalid owner or repo");
  });

  it("returns 200 with analysis data on success", async () => {
    const mockAnalysis = {
      repository: { name: "react", fullName: "facebook/react", starsCount: 220000 },
      starHistory: [{ date: "2026-01-01", stars: 200000 }],
      starVelocity: { currentStars: 220000, growth7d: 500, weeklyVelocity: 500 },
      releases: [],
      highlights: ["Strong growth"],
    };

    vi.mocked(publicGitHub.analyzePublicRepository).mockResolvedValue(mockAnalysis as any);

    const res = await GET(req("http://localhost/api/public/repo?owner=facebook&repo=react"));
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toContain("s-maxage=300");
    const body = await res.json();
    expect(body.repository.name).toBe("react");
  });

  it("maps PublicRepoNotFoundError to 404", async () => {
    vi.mocked(publicGitHub.analyzePublicRepository).mockRejectedValue(
      new PublicRepoNotFoundError("foo", "bar")
    );

    const res = await GET(req("http://localhost/api/public/repo?owner=foo&repo=bar"));
    expect(res.status).toBe(404);
  });

  it("maps PublicRepoRateLimitError to 429", async () => {
    vi.mocked(publicGitHub.analyzePublicRepository).mockRejectedValue(
      new PublicRepoRateLimitError(1800000000)
    );

    const res = await GET(req("http://localhost/api/public/repo?owner=foo&repo=bar"));
    expect(res.status).toBe(429);
  });

  it("maps PublicRepoError with custom status", async () => {
    vi.mocked(publicGitHub.analyzePublicRepository).mockRejectedValue(
      new PublicRepoError("Forbidden", 403)
    );

    const res = await GET(req("http://localhost/api/public/repo?owner=foo&repo=bar"));
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toBe("Forbidden");
  });

  it("returns 500 on unexpected errors", async () => {
    vi.mocked(publicGitHub.analyzePublicRepository).mockRejectedValue(
      new Error("Unexpected crash")
    );

    const res = await GET(req("http://localhost/api/public/repo?owner=foo&repo=bar"));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toContain("Failed to analyze repository");
  });

  it("prefers cf-connecting-ip header over x-forwarded-for", async () => {
    vi.mocked(publicGitHub.analyzePublicRepository).mockResolvedValue({} as any);
    const headers = new Headers();
    headers.set("cf-connecting-ip", "198.51.100.50");
    headers.set("x-forwarded-for", "1.2.3.4, 5.6.7.8");
    const res = await GET(
      new NextRequest(new Request("http://localhost/api/public/repo?owner=a&repo=b", { headers }))
    );
    expect(res.status).toBe(200);
  });

  it("enforces sliding-window IP rate limit and resets after window expires", async () => {
    vi.useFakeTimers();
    const testIp = "203.0.113.199";
    vi.mocked(publicGitHub.analyzePublicRepository).mockResolvedValue({} as any);

    // Make 60 requests that succeed
    for (let i = 0; i < 60; i++) {
      const res = await GET(req("http://localhost/api/public/repo?owner=a&repo=b", testIp));
      expect(res.status).toBe(200);
    }

    // 61st request should be rate limited
    const limitedRes = await GET(req("http://localhost/api/public/repo?owner=a&repo=b", testIp));
    expect(limitedRes.status).toBe(429);
    const body = await limitedRes.json();
    expect(body.error).toContain("Too many requests from your IP");

    // Advance clock past the 60s sliding window
    vi.advanceTimersByTime(61_000);

    // Request should now succeed again
    const postExpiryRes = await GET(req("http://localhost/api/public/repo?owner=a&repo=b", testIp));
    expect(postExpiryRes.status).toBe(200);

    vi.useRealTimers();
  });

  it("prunes expired IP entries when table capacity is exceeded", () => {
    resetIpRateLimit();
    const now = 1_000_000;
    for (let i = 0; i < 5000; i++) {
      checkIpRateLimit(`ip-${i}`, 60, 1000, now);
    }
    const allowed = checkIpRateLimit("new-ip", 60, 1000, now + 2000);
    expect(allowed).toBe(true);
  });
});
