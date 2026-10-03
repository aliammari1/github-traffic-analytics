// SPDX-License-Identifier: MIT
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route";
import {
  publicGitHub,
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

function req(url: string) {
  return new NextRequest(new Request(url));
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
});
