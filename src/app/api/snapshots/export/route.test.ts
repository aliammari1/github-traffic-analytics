// SPDX-License-Identifier: MIT
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const auth = vi.fn();
const d1 = vi.fn();
vi.mock("@/lib/server-auth", () => ({ getServerAuth: (...args: unknown[]) => auth(...args) }));
vi.mock("@/lib/d1", () => ({ getD1: () => d1() }));
const getViews = vi.fn();
vi.mock("@/lib/github", () => ({
  GitHubService: class {
    getTrafficViews(...args: unknown[]) {
      return getViews(...args);
    }
  },
}));

import { GET } from "./route";
const req = (query: string) => new NextRequest(`http://localhost/api/snapshots/export${query}`);

describe("snapshot export", () => {
  beforeEach(() => {
    auth.mockReset();
    d1.mockReset();
    getViews.mockReset();
    getViews.mockResolvedValue({ count: 1, uniques: 1, views: [] });
  });

  it("does not expose a download without a session", async () => {
    auth.mockResolvedValue(null);
    expect((await GET(req("?owner=o&repo=r"))).status).toBe(401);
  });

  it("rejects invalid date ranges and formats", async () => {
    auth.mockResolvedValue({ userId: "user", accessToken: "token" });
    expect((await GET(req("?owner=o&repo=r&format=xml"))).status).toBe(400);
    expect((await GET(req("?owner=o&repo=r&from=2026-06-02&to=2026-06-01"))).status).toBe(400);
    expect((await GET(req("?owner=o&repo=r&from=2026-02-30"))).status).toBe(400);
  });

  it("rejects a user who no longer has GitHub traffic access", async () => {
    auth.mockResolvedValue({ userId: "user", accessToken: "token" });
    getViews.mockRejectedValue(Object.assign(new Error("Forbidden"), { status: 403 }));
    const response = await GET(req("?owner=o&repo=r"));
    expect(response.status).toBe(403);
    expect(d1).not.toHaveBeenCalled();
  });

  it("downloads all user-scoped rows as CSV", async () => {
    auth.mockResolvedValue({ userId: "user", accessToken: "token" });
    const all = vi.fn().mockResolvedValue({
      results: [{ day: "2026-06-01", metric: "views", count: 9, uniques: 4 }],
    });
    const bind = vi.fn().mockReturnValue({ all });
    d1.mockResolvedValue({ prepare: vi.fn().mockReturnValue({ bind }) });
    const response = await GET(req("?owner=o&repo=r&format=csv"));
    expect(response.status).toBe(200);
    expect(response.headers.get("content-disposition")).toContain("attachment");
    expect(await response.text()).toContain('"2026-06-01","views",9,4');
    expect(bind).toHaveBeenCalledWith("user", "o", "r", "0000-01-01", "9999-12-31");
    expect(getViews).toHaveBeenCalledWith("o", "r");
  });

  it("exports empty history clearly as CSV and JSON", async () => {
    auth.mockResolvedValue({ userId: "user", accessToken: "token" });
    const all = vi.fn().mockResolvedValue({ results: [] });
    d1.mockResolvedValue({ prepare: vi.fn().mockReturnValue({ bind: () => ({ all }) }) });
    expect(await (await GET(req("?owner=o&repo=r&format=csv"))).text()).toBe(
      "day,metric,count,uniques\r\n"
    );
    expect(await (await GET(req("?owner=o&repo=r&format=json"))).json()).toEqual([]);
  });
});
