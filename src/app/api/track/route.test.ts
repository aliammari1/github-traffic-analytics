// SPDX-License-Identifier: MIT
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const authMock = vi.fn();
vi.mock("@/lib/auth", () => ({ auth: () => authMock() }));

const getD1Mock = vi.fn();
vi.mock("@/lib/d1", () => ({ getD1: () => getD1Mock() }));

import { POST } from "./route";

function postReq(body: unknown) {
  return new NextRequest(
    new Request("http://x/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
  );
}

describe("POST /api/track", () => {
  beforeEach(() => {
    authMock.mockReset();
    getD1Mock.mockReset();
  });

  it("returns 401 when unauthenticated", async () => {
    authMock.mockResolvedValue(null);
    const res = await POST(postReq({ owner: "o", repo: "r" }));
    expect(res.status).toBe(401);
  });

  it("returns 400 when owner/repo missing", async () => {
    authMock.mockResolvedValue({ accessToken: "t", user: { name: "alice" } });
    const res = await POST(postReq({ owner: "o" }));
    expect(res.status).toBe(400);
  });

  it("returns 503 when no D1 binding is available", async () => {
    authMock.mockResolvedValue({ accessToken: "t", user: { name: "alice" } });
    getD1Mock.mockResolvedValue(null);
    const res = await POST(postReq({ owner: "o", repo: "r" }));
    expect(res.status).toBe(503);
  });

  it("upserts the tracked repo and returns tracked:true", async () => {
    authMock.mockResolvedValue({ accessToken: "tok", user: { name: "alice" } });
    const run = vi.fn().mockResolvedValue({});
    const bind = vi.fn().mockReturnValue({ run });
    getD1Mock.mockResolvedValue({ prepare: vi.fn().mockReturnValue({ bind }) });

    const res = await POST(postReq({ owner: "o", repo: "r" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ tracked: true });
    expect(bind).toHaveBeenCalledWith("alice", "o", "r", "tok");
  });
});
