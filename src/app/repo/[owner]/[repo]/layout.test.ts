// SPDX-License-Identifier: MIT
import { describe, expect, it, vi } from "vitest";
import { publicGitHub, PublicRepoNotFoundError } from "@/lib/github-public";
import { generateMetadata } from "./layout";

vi.mock("@/lib/github-public", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/github-public")>();
  return { ...actual, publicGitHub: { getRepositoryMetadata: vi.fn() } };
});

describe("public report metadata", () => {
  it("describes a public repository and canonical report URL", async () => {
    vi.mocked(publicGitHub.getRepositoryMetadata).mockResolvedValue({
      fullName: "vercel/next.js",
      starsCount: 120000,
      description: "The React Framework",
    } as any);
    const metadata = await generateMetadata({
      params: Promise.resolve({ owner: "vercel", repo: "next.js" }),
      children: null,
    });
    expect(metadata.title).toContain("vercel/next.js Star Growth");
    expect(metadata.description).toContain("120,000 stars");
    expect(metadata.alternates?.canonical).toBe("/repo/vercel/next.js");
    expect(metadata.openGraph).toBeDefined();
    expect(metadata.twitter).toBeDefined();
  });

  it("keeps unavailable reports out of search results", async () => {
    vi.mocked(publicGitHub.getRepositoryMetadata).mockRejectedValue(
      new PublicRepoNotFoundError("x", "y")
    );
    const metadata = await generateMetadata({
      params: Promise.resolve({ owner: "x", repo: "y" }),
      children: null,
    });
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
