// SPDX-License-Identifier: MIT
import { describe, it, expect, vi, beforeEach } from "vitest";

const authMock = vi.fn();
vi.mock("@/lib/auth", () => ({ auth: () => authMock() }));

const getRepositories = vi.fn();
vi.mock("@/lib/github", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/github")>();
  return {
    ...actual,
    GitHubService: vi.fn(() => ({ getRepositories })),
  };
});

import { GET } from "./route";

describe("GET /api/repositories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("returns 401 without an access token", async () => {
    authMock.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns the repository list on success", async () => {
    authMock.mockResolvedValue({ accessToken: "t" });
    getRepositories.mockResolvedValue([{ id: 1, name: "repo" }]);
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([{ id: 1, name: "repo" }]);
  });

  it("returns 500 when the service throws", async () => {
    authMock.mockResolvedValue({ accessToken: "t" });
    getRepositories.mockRejectedValue(new Error("boom"));
    const res = await GET();
    expect(res.status).toBe(500);
  });
});
