// SPDX-License-Identifier: MIT
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const authMock = vi.fn();
vi.mock("@/lib/auth", () => ({ auth: () => authMock() }));

const getD1Mock = vi.fn();
vi.mock("@/lib/d1", () => ({ getD1: () => getD1Mock() }));

import { GET } from "./route";

function req(url: string) {
  return new NextRequest(new Request(url));
}

describe("GET /api/snapshots", () => {
  beforeEach(() => {
    authMock.mockReset();
    getD1Mock.mockReset();
  });

  it("returns 401 when unauthenticated", async () => {
    authMock.mockResolvedValue(null);
    const res = await GET(req("http://x/api/snapshots?owner=o&repo=r"));
    expect(res.status).toBe(401);
  });

  it("returns 400 when owner/repo missing", async () => {
    authMock.mockResolvedValue({ accessToken: "t", user: { name: "alice" } });
    const res = await GET(req("http://x/api/snapshots"));
    expect(res.status).toBe(400);
  });

  it("returns 503 when no D1 binding is available", async () => {
    authMock.mockResolvedValue({ accessToken: "t", user: { name: "alice" } });
    getD1Mock.mockResolvedValue(null);
    const res = await GET(req("http://x/api/snapshots?owner=o&repo=r"));
    expect(res.status).toBe(503);
  });

  it("returns merged history from D1 within the default window", async () => {
    authMock.mockResolvedValue({ accessToken: "t", user: { name: "alice" } });
    const all = vi.fn().mockResolvedValue({
      results: [
        { day: "2026-06-01", metric: "views", count: 10, uniques: 4 },
        { day: "2026-06-01", metric: "clones", count: 2, uniques: 1 },
      ],
    });
    const bind = vi.fn().mockReturnValue({ all });
    getD1Mock.mockResolvedValue({ prepare: vi.fn().mockReturnValue({ bind }) });

    const res = await GET(req("http://x/api/snapshots?owner=o&repo=r"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.history).toEqual([
      { day: "2026-06-01", views: 10, viewUniques: 4, clones: 2, cloneUniques: 1 },
    ]);
  });

  it("honors explicit from/to query params", async () => {
    authMock.mockResolvedValue({ accessToken: "t", user: { name: "alice" } });
    const all = vi.fn().mockResolvedValue({ results: [] });
    const bind = vi.fn().mockReturnValue({ all });
    getD1Mock.mockResolvedValue({ prepare: vi.fn().mockReturnValue({ bind }) });

    const res = await GET(
      req("http://x/api/snapshots?owner=o&repo=r&from=2026-01-01&to=2026-02-01")
    );
    expect(res.status).toBe(200);
    expect(bind).toHaveBeenCalledWith("alice", "o", "r", "2026-01-01", "2026-02-01");
  });
});
