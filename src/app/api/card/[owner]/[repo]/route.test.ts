// SPDX-License-Identifier: MIT
import { describe, expect, it, vi } from "vitest";
import { publicGitHub, PublicRepoNotFoundError } from "@/lib/github-public";
import { GET } from "./route";

vi.mock("@/lib/github-public", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/github-public")>();
  return { ...actual, publicGitHub: { analyzePublicRepository: vi.fn() } };
});

const context = (owner: string, repo: string) => ({ params: Promise.resolve({ owner, repo }) });

describe("public growth card", () => {
  it("returns an embeddable SVG with cache headers for a public repository", async () => {
    vi.mocked(publicGitHub.analyzePublicRepository).mockResolvedValue({
      repository: { fullName: "owner/repo", starsCount: 42 },
      starHistory: [],
      releases: [],
    } as any);
    const res = await GET(
      new Request("https://example.com/api/card/owner/repo?theme=dracula"),
      context("owner", "repo")
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("image/svg+xml");
    expect(res.headers.get("cache-control")).toContain("s-maxage");
    expect(await res.text()).toContain("owner/repo");
  });

  it("does not render private or missing repositories", async () => {
    vi.mocked(publicGitHub.analyzePublicRepository).mockRejectedValue(
      new PublicRepoNotFoundError("owner", "secret")
    );
    const res = await GET(
      new Request("https://example.com/api/card/owner/secret"),
      context("owner", "secret")
    );
    expect(res.status).toBe(404);
    expect(res.headers.get("cache-control")).toBe("private, no-store");
  });

  it("rejects malformed paths and unknown themes", async () => {
    const invalid = await GET(
      new Request("https://example.com/api/card/-bad/repo"),
      context("-bad", "repo")
    );
    expect(invalid.status).toBe(400);
    const theme = await GET(
      new Request("https://example.com/api/card/owner/repo?theme=evil"),
      context("owner", "repo")
    );
    expect(theme.status).toBe(400);
  });
});
