// SPDX-License-Identifier: MIT
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const serverAuthMock = vi.fn();
vi.mock("@/lib/server-auth", () => ({ getServerAuth: (...args: unknown[]) => serverAuthMock(...args) }));

const getRepositories = vi.fn();
vi.mock("@/lib/github", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/github")>();
  return {
    ...actual,
    GitHubService: vi.fn(() => ({ getRepositories })),
  };
});

import { GET } from "./route";

function req() {
  return new NextRequest(new Request("http://x/api/repositories"));
}

describe("GET /api/repositories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("returns 401 without an access token", async () => {
    serverAuthMock.mockResolvedValue(null);
    const res = await GET(req());
    expect(res.status).toBe(401);
  });

  it("returns the repository list on success", async () => {
    serverAuthMock.mockResolvedValue({ accessToken: "t", userId: "123" });
    getRepositories.mockResolvedValue([{ id: 1, name: "repo" }]);
    const res = await GET(req());
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([{ id: 1, name: "repo" }]);
  });

  it("returns 500 when the service throws", async () => {
    serverAuthMock.mockResolvedValue({ accessToken: "t", userId: "123" });
    getRepositories.mockRejectedValue(new Error("boom"));
    const res = await GET(req());
    expect(res.status).toBe(500);
  });
});
