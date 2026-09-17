// SPDX-License-Identifier: MIT
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { TrafficAccessError } from "@/lib/github";

const authMock = vi.fn();
vi.mock("@/lib/auth", () => ({ auth: () => authMock() }));

const serviceMock = {
  getTrafficViews: vi.fn(),
  getClones: vi.fn(),
  getReferrers: vi.fn(),
  getPopularPaths: vi.fn(),
};
vi.mock("@/lib/github", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/github")>();
  return {
    ...actual,
    GitHubService: vi.fn(() => serviceMock),
  };
});

import { GET } from "./route";

function req(url: string) {
  return new NextRequest(new Request(url));
}

describe("GET /api/traffic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("returns 401 without an access token", async () => {
    authMock.mockResolvedValue(null);
    const res = await GET(req("http://x/api/traffic?owner=o&repo=r"));
    expect(res.status).toBe(401);
  });

  it("returns 400 when owner/repo missing", async () => {
    authMock.mockResolvedValue({ accessToken: "t" });
    const res = await GET(req("http://x/api/traffic"));
    expect(res.status).toBe(400);
  });

  it("aggregates and returns traffic data on success", async () => {
    authMock.mockResolvedValue({ accessToken: "t" });
    serviceMock.getTrafficViews.mockResolvedValue({ count: 1, uniques: 1, views: [] });
    serviceMock.getClones.mockResolvedValue({ count: 2, uniques: 1, clones: [] });
    serviceMock.getReferrers.mockResolvedValue([]);
    serviceMock.getPopularPaths.mockResolvedValue([]);

    const res = await GET(req("http://x/api/traffic?owner=o&repo=r"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("views");
    expect(body).toHaveProperty("clones");
  });

  it("maps TrafficAccessError to 403 with the English message", async () => {
    authMock.mockResolvedValue({ accessToken: "t" });
    serviceMock.getTrafficViews.mockRejectedValue(new TrafficAccessError());
    const res = await GET(req("http://x/api/traffic?owner=o&repo=r"));
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toMatch(/Access denied/);
  });

  it("returns 500 on other errors", async () => {
    authMock.mockResolvedValue({ accessToken: "t" });
    serviceMock.getTrafficViews.mockRejectedValue(new Error("boom"));
    const res = await GET(req("http://x/api/traffic?owner=o&repo=r"));
    expect(res.status).toBe(500);
  });
});
