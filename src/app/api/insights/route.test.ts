// SPDX-License-Identifier: MIT
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

const authMock = vi.fn();
vi.mock("@/lib/auth", () => ({ auth: () => authMock() }));

const createMessage = vi.fn();
vi.mock("@anthropic-ai/sdk", () => ({
  default: vi.fn(() => ({
    messages: { create: (...a: unknown[]) => createMessage(...a) },
  })),
}));

import { POST } from "./route";

const validPayload = {
  repoCount: 2,
  totalViews: 500,
  totalUniques: 100,
  totalClones: 20,
  totalCloneUniques: 10,
  totalStars: 5,
  topReferrers: [{ referrer: "github.com", count: 300, uniques: 80 }],
  topPaths: [{ path: "/o/r", count: 400, uniques: 90 }],
  daily: [{ date: "Jun 1", views: 100, uniques: 30 }],
};

function postReq(body: unknown) {
  return new NextRequest(
    new Request("http://x/api/insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
  );
}

describe("POST /api/insights", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
    process.env.ANTHROPIC_API_KEY = "sk-test";
  });
  afterEach(() => {
    delete process.env.ANTHROPIC_API_KEY;
  });

  it("returns 401 without an access token", async () => {
    authMock.mockResolvedValue(null);
    const res = await POST(postReq(validPayload));
    expect(res.status).toBe(401);
  });

  it("returns 503 when ANTHROPIC_API_KEY is not set", async () => {
    authMock.mockResolvedValue({ accessToken: "t" });
    delete process.env.ANTHROPIC_API_KEY;
    const res = await POST(postReq(validPayload));
    expect(res.status).toBe(503);
  });

  it("returns 400 for an empty/invalid payload", async () => {
    authMock.mockResolvedValue({ accessToken: "t" });
    const res = await POST(postReq({ ...validPayload, totalViews: 0, totalClones: 0, daily: [] }));
    expect(res.status).toBe(400);
  });

  it("returns the AI summary on success and uses claude-haiku-4-5", async () => {
    authMock.mockResolvedValue({ accessToken: "t" });
    createMessage.mockResolvedValue({
      content: [{ type: "text", text: "Your traffic is up." }],
    });
    const res = await POST(postReq(validPayload));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ summary: "Your traffic is up." });
    expect(createMessage).toHaveBeenCalledWith(
      expect.objectContaining({ model: "claude-haiku-4-5" })
    );
  });

  it("returns 502 when the model call fails", async () => {
    authMock.mockResolvedValue({ accessToken: "t" });
    createMessage.mockRejectedValue(new Error("upstream"));
    const res = await POST(postReq(validPayload));
    expect(res.status).toBe(502);
  });

  it("returns 502 when the model returns no text", async () => {
    authMock.mockResolvedValue({ accessToken: "t" });
    createMessage.mockResolvedValue({ content: [] });
    const res = await POST(postReq(validPayload));
    expect(res.status).toBe(502);
  });
});
