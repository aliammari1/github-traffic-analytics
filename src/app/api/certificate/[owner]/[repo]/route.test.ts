// SPDX-License-Identifier: MIT
import { describe, expect, it, vi } from "vitest";

const analyze = vi.fn();
vi.mock("@/lib/github-public", async (original) => {
  const real = await original<typeof import("@/lib/github-public")>();
  return {
    ...real,
    publicGitHub: { analyzePublicRepository: (...args: unknown[]) => analyze(...args) },
  };
});
import { GET } from "./route";

const context = { params: Promise.resolve({ owner: "alice", repo: "project" }) };
describe("milestone certificate", () => {
  it("rejects a milestone the public repository has not reached", async () => {
    analyze.mockResolvedValue({
      repository: { fullName: "alice/project", starsCount: 999 },
      starVelocity: { growth7d: 20 },
    });
    const response = await GET(
      new Request("http://localhost/api/certificate/alice/project?milestone=1000"),
      context
    );
    expect(response.status).toBe(409);
  });

  it("returns a downloadable SVG for a reached milestone", async () => {
    analyze.mockResolvedValue({
      repository: { fullName: "alice/project", starsCount: 1001 },
      starHistory: [],
      starVelocity: { growth7d: 20 },
    });
    const response = await GET(
      new Request("http://localhost/api/certificate/alice/project?milestone=1000"),
      context
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("content-disposition")).toContain("attachment");
    expect(await response.text()).toContain("1,000 GitHub stars");
  });
});
