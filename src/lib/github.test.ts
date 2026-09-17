// SPDX-License-Identifier: MIT
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock @octokit/rest so GitHubService talks to a controllable fake.
const mocks = {
  listForAuthenticatedUser: vi.fn(),
  getViews: vi.fn(),
  getClones: vi.fn(),
  getTopReferrers: vi.fn(),
  getTopPaths: vi.fn(),
};

// The factory references the live `mocks` object, so re-binding the inner fns in
// beforeEach is enough — the global afterEach `restoreAllMocks` doesn't strip a
// module-factory mock, but we keep the wiring here for clarity and isolation.
vi.mock("@octokit/rest", () => ({
  Octokit: vi.fn(() => ({
    rest: {
      repos: {
        listForAuthenticatedUser: (...a: unknown[]) => mocks.listForAuthenticatedUser(...a),
        getViews: (...a: unknown[]) => mocks.getViews(...a),
        getClones: (...a: unknown[]) => mocks.getClones(...a),
        getTopReferrers: (...a: unknown[]) => mocks.getTopReferrers(...a),
        getTopPaths: (...a: unknown[]) => mocks.getTopPaths(...a),
      },
    },
  })),
}));

import { GitHubService, TrafficAccessError } from "./github";

function forbidden() {
  const err = new Error("HttpError") as Error & { status: number };
  err.status = 403;
  return err;
}

describe("GitHubService", () => {
  beforeEach(() => {
    Object.values(mocks).forEach((m) => m.mockReset());
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("returns repositories from the authenticated-user endpoint", async () => {
    mocks.listForAuthenticatedUser.mockResolvedValue({ data: [{ id: 1, name: "repo" }] });
    const svc = new GitHubService("token");
    const repos = await svc.getRepositories();
    expect(repos).toEqual([{ id: 1, name: "repo" }]);
  });

  it("returns traffic views data", async () => {
    mocks.getViews.mockResolvedValue({ data: { count: 5, uniques: 3, views: [] } });
    const svc = new GitHubService("token");
    await expect(svc.getTrafficViews("o", "r")).resolves.toEqual({
      count: 5,
      uniques: 3,
      views: [],
    });
  });

  it("throws TrafficAccessError on a 403 from views", async () => {
    mocks.getViews.mockRejectedValue(forbidden());
    const svc = new GitHubService("token");
    await expect(svc.getTrafficViews("o", "r")).rejects.toBeInstanceOf(TrafficAccessError);
  });

  it("uses an English (not French) access-denied message", async () => {
    mocks.getClones.mockRejectedValue(forbidden());
    const svc = new GitHubService("token");
    await expect(svc.getClones("o", "r")).rejects.toThrow(/Access denied/);
    await expect(svc.getClones("o", "r")).rejects.not.toThrow(/Accès refusé/);
  });

  it("propagates non-403 errors from referrers", async () => {
    const boom = new Error("network");
    mocks.getTopReferrers.mockRejectedValue(boom);
    const svc = new GitHubService("token");
    await expect(svc.getReferrers("o", "r")).rejects.toThrow("network");
  });

  it("returns popular paths data", async () => {
    mocks.getTopPaths.mockResolvedValue({
      data: [{ path: "/x", title: "X", count: 1, uniques: 1 }],
    });
    const svc = new GitHubService("token");
    await expect(svc.getPopularPaths("o", "r")).resolves.toHaveLength(1);
  });

  it("throws TrafficAccessError on a 403 from paths", async () => {
    mocks.getTopPaths.mockRejectedValue(forbidden());
    const svc = new GitHubService("token");
    await expect(svc.getPopularPaths("o", "r")).rejects.toBeInstanceOf(TrafficAccessError);
  });

  it("propagates non-403 errors from views (not wrapped)", async () => {
    mocks.getViews.mockRejectedValue(new Error("rate limited"));
    const svc = new GitHubService("token");
    await expect(svc.getTrafficViews("o", "r")).rejects.toThrow("rate limited");
  });

  it("throws TrafficAccessError on a 403 from clones", async () => {
    mocks.getClones.mockRejectedValue(forbidden());
    const svc = new GitHubService("token");
    await expect(svc.getClones("o", "r")).rejects.toBeInstanceOf(TrafficAccessError);
  });

  it("throws TrafficAccessError on a 403 from referrers", async () => {
    mocks.getTopReferrers.mockRejectedValue(forbidden());
    const svc = new GitHubService("token");
    await expect(svc.getReferrers("o", "r")).rejects.toBeInstanceOf(TrafficAccessError);
  });

  it("propagates non-403 errors from paths", async () => {
    mocks.getTopPaths.mockRejectedValue(new Error("boom"));
    const svc = new GitHubService("token");
    await expect(svc.getPopularPaths("o", "r")).rejects.toThrow("boom");
  });

  it("propagates a repositories list failure", async () => {
    mocks.listForAuthenticatedUser.mockRejectedValue(new Error("list failed"));
    const svc = new GitHubService("token");
    await expect(svc.getRepositories()).rejects.toThrow("list failed");
  });
});
