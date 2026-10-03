// SPDX-License-Identifier: MIT
import { beforeEach, describe, expect, it, vi } from "vitest";
import { publicGitHub } from "@/lib/github-public";
import { GET } from "./route";

vi.mock("@/lib/github-public", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/github-public")>();
  return { ...actual, publicGitHub: { analyzePublicRepository: vi.fn() } };
});

function context(owner: string, repo: string) {
  return { params: Promise.resolve({ owner, repo }) };
}

function analysis(starsCount = 125_000) {
  return {
    repository: { fullName: "owner/repo", starsCount },
    starVelocity: {
      currentStars: starsCount,
      growth7d: 600,
      growth30d: 2_400,
      weeklyVelocity: 600,
      dailyVelocity: 85.7,
    },
    releases: [{ tagName: "v2.0.0" }],
    starHistory: [],
    highlights: [],
    isRateLimited: false,
  } as any;
}

describe("milestone growth card", () => {
  beforeEach(() => {
    vi.mocked(publicGitHub.analyzePublicRepository).mockReset();
  });

  it("renders the highest reached milestone by default", async () => {
    vi.mocked(publicGitHub.analyzePublicRepository).mockResolvedValue(analysis());

    const res = await GET(
      new Request("https://example.com/api/card/milestone/owner/repo"),
      context("owner", "repo")
    );

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("image/svg+xml");
    expect(res.headers.get("cache-control")).toContain("s-maxage");
    expect(await res.text()).toContain("★ 100k+");
  });

  it("supports an explicitly reached milestone", async () => {
    vi.mocked(publicGitHub.analyzePublicRepository).mockResolvedValue(analysis());

    const res = await GET(
      new Request("https://example.com/api/card/milestone/owner/repo?milestone=10000&theme=nord"),
      context("owner", "repo")
    );

    expect(res.status).toBe(200);
    const svg = await res.text();
    expect(svg).toContain("★ 10k+");
    expect(svg).toContain("#2e3440");
  });

  it("rejects invalid or unreached milestone claims", async () => {
    vi.mocked(publicGitHub.analyzePublicRepository).mockResolvedValue(analysis(900));

    const invalid = await GET(
      new Request("https://example.com/api/card/milestone/owner/repo?milestone=1234"),
      context("owner", "repo")
    );
    expect(invalid.status).toBe(400);

    const unreached = await GET(
      new Request("https://example.com/api/card/milestone/owner/repo?milestone=1000"),
      context("owner", "repo")
    );
    expect(unreached.status).toBe(409);
    expect(unreached.headers.get("cache-control")).toBe("private, no-store");
  });
});
