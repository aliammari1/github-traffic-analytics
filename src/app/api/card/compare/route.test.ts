// SPDX-License-Identifier: MIT
import { beforeEach, describe, expect, it, vi } from "vitest";
import { publicGitHub, PublicRepoNotFoundError } from "@/lib/github-public";
import { GET } from "./route";

vi.mock("@/lib/github-public", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/github-public")>();
  return { ...actual, publicGitHub: { analyzePublicRepository: vi.fn() } };
});

function analysis(fullName: string, stars: number, growth7d: number, growth30d: number) {
  return {
    repository: { fullName, starsCount: stars },
    starVelocity: {
      currentStars: stars,
      growth7d,
      growth30d,
      weeklyVelocity: growth7d,
      dailyVelocity: growth7d / 7,
    },
    starHistory: [],
    releases: [],
    highlights: [],
    isRateLimited: false,
  } as any;
}

describe("comparison growth card", () => {
  beforeEach(() => {
    vi.mocked(publicGitHub.analyzePublicRepository).mockReset();
  });

  it("renders a cacheable SVG for two distinct public repositories", async () => {
    vi.mocked(publicGitHub.analyzePublicRepository)
      .mockResolvedValueOnce(analysis("vercel/next.js", 125000, 120, 500))
      .mockResolvedValueOnce(analysis("nuxt/nuxt", 60000, 80, 310));

    const res = await GET(
      new Request(
        "https://example.com/api/card/compare?a=vercel%2Fnext.js&b=nuxt%2Fnuxt&theme=dracula"
      )
    );

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("image/svg+xml");
    expect(res.headers.get("cache-control")).toContain("s-maxage");
    const svg = await res.text();
    expect(svg).toContain("vercel/next.js");
    expect(svg).toContain("nuxt/nuxt");
    expect(svg).toContain("#282a36");
    expect(publicGitHub.analyzePublicRepository).toHaveBeenCalledTimes(2);
  });

  it("rejects missing, duplicate, or malformed repository input", async () => {
    expect(
      (await GET(new Request("https://example.com/api/card/compare?a=vercel%2Fnext.js"))).status
    ).toBe(400);

    expect(
      (
        await GET(
          new Request("https://example.com/api/card/compare?a=vercel%2Fnext.js&b=VERCEL%2Fnext.js")
        )
      ).status
    ).toBe(400);

    expect(
      (await GET(new Request("https://example.com/api/card/compare?a=-bad%2Frepo&b=nuxt%2Fnuxt")))
        .status
    ).toBe(400);
  });

  it("does not expose private or missing repository data", async () => {
    vi.mocked(publicGitHub.analyzePublicRepository).mockRejectedValue(
      new PublicRepoNotFoundError("owner", "secret")
    );

    const res = await GET(
      new Request("https://example.com/api/card/compare?a=owner%2Fsecret&b=nuxt%2Fnuxt")
    );

    expect(res.status).toBe(404);
    expect(res.headers.get("cache-control")).toBe("private, no-store");
  });
});
