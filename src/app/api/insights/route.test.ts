// SPDX-License-Identifier: MIT
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

const authMock = vi.fn();
vi.mock("@/lib/auth", () => ({ auth: () => authMock() }));

const streamMessage = vi.fn();
vi.mock("@anthropic-ai/sdk", () => ({
  default: vi.fn(() => ({
    messages: { stream: (...a: unknown[]) => streamMessage(...a) },
  })),
}));

import { POST } from "./route";

function textDelta(text: string, index = 0) {
  return {
    type: "content_block_delta" as const,
    index,
    delta: { type: "text_delta" as const, text },
  };
}

/** Build a fake Anthropic MessageStream yielding text delta events. */
function fakeStream(chunks: string[]) {
  return {
    async *[Symbol.asyncIterator]() {
      for (const [index, text] of chunks.entries()) {
        yield textDelta(text, index);
      }
    },
    abort: vi.fn(),
  };
}

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
    authMock.mockResolvedValue({ user: { id: "123" } });
    delete process.env.ANTHROPIC_API_KEY;
    const res = await POST(postReq(validPayload));
    expect(res.status).toBe(503);
  });

  it("returns 400 for an empty/invalid payload", async () => {
    authMock.mockResolvedValue({ user: { id: "123" } });
    const res = await POST(postReq({ ...validPayload, totalViews: 0, totalClones: 0, daily: [] }));
    expect(res.status).toBe(400);
  });

  it("streams the AI summary on success and uses claude-haiku-4-5", async () => {
    authMock.mockResolvedValue({ user: { id: "123" } });
    streamMessage.mockReturnValue(fakeStream(["Your ", "traffic ", "is up."]));
    const res = await POST(postReq(validPayload));
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/plain");
    expect(await res.text()).toBe("Your traffic is up.");
    expect(streamMessage).toHaveBeenCalledWith(
      expect.objectContaining({ model: "claude-haiku-4-5" })
    );
  });

  it("returns 502 when the model call fails to start", async () => {
    authMock.mockResolvedValue({ user: { id: "123" } });
    streamMessage.mockImplementation(() => {
      throw new Error("upstream");
    });
    const res = await POST(postReq(validPayload));
    expect(res.status).toBe(502);
  });

  it("ends the stream gracefully if it errors mid-flight", async () => {
    authMock.mockResolvedValue({ user: { id: "123" } });
    streamMessage.mockReturnValue({
      async *[Symbol.asyncIterator]() {
        yield textDelta("partial");
        throw new Error("mid-stream");
      },
      abort: vi.fn(),
    });
    const res = await POST(postReq(validPayload));
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("partial");
  });
});
