// SPDX-License-Identifier: MIT
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const auth = vi.fn();
const d1 = vi.fn();
const traffic = vi.fn();
const analyze = vi.fn();
vi.mock("@/lib/server-auth", () => ({ getServerAuth: (...args: unknown[]) => auth(...args) }));
vi.mock("@/lib/d1", () => ({ getD1: () => d1() }));
vi.mock("@/lib/github", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/github")>();
  return {
    ...actual,
    GitHubService: class {
      getTrafficViews(...args: unknown[]) {
        return traffic(...args);
      }
    },
  };
});
vi.mock("@/lib/github-public", () => ({
  publicGitHub: { analyzePublicRepository: (...args: unknown[]) => analyze(...args) },
}));
import { GET } from "./route";

const req = (query: string) => new NextRequest(`http://localhost/api/report/weekly${query}`);

describe("weekly report preview", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-28T08:00:00Z"));
    auth.mockReset();
    d1.mockReset();
    traffic.mockReset();
    analyze.mockReset();
    auth.mockResolvedValue({ userId: "owner-id", accessToken: "token" });
    traffic.mockResolvedValue({ count: 1, uniques: 1, views: [] });
    analyze.mockResolvedValue({ starHistory: [], releases: [] });
  });
  afterEach(() => vi.useRealTimers());

  it("requires a session and a valid repository", async () => {
    auth.mockResolvedValueOnce(null);
    expect((await GET(req("?owner=alice&repo=project"))).status).toBe(401);
    expect((await GET(req("?owner=bad/path&repo=project"))).status).toBe(400);
  });

  it("does not query D1 after GitHub denies traffic access", async () => {
    traffic.mockRejectedValue(Object.assign(new Error("denied"), { status: 403 }));
    expect((await GET(req("?owner=alice&repo=project"))).status).toBe(403);
    expect(d1).not.toHaveBeenCalled();
  });

  it("returns a scoped report from snapshots even when public star data is unavailable", async () => {
    analyze.mockRejectedValue(new Error("private repository"));
    const all = vi.fn().mockResolvedValue({
      results: [{ day: "2026-09-27", metric: "views", count: 5, uniques: 3 }],
    });
    const bind = vi.fn().mockReturnValue({ all });
    d1.mockResolvedValue({ prepare: vi.fn().mockReturnValue({ bind }) });
    const response = await GET(req("?owner=alice&repo=project"));
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    const report = await response.json();
    expect(report.period.to).toBe("2026-09-27");
    expect(report.views.count).toBeNull();
    expect(report.views.observedDays).toBe(1);
    expect(report.stars.count).toBeNull();
    expect(bind).toHaveBeenCalledWith("owner-id", "alice", "project", "2026-09-14", "2026-09-27");
  });
});
