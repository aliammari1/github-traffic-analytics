// SPDX-License-Identifier: MIT
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const getD1Mock = vi.fn();
vi.mock("@/lib/d1", () => ({ getD1: () => getD1Mock() }));

import { GET } from "./route";

function req(url: string) {
  return new NextRequest(new Request(url));
}

describe("GET /api/badge", () => {
  beforeEach(() => {
    getD1Mock.mockReset();
  });

  it("always returns an SVG image", async () => {
    getD1Mock.mockResolvedValue(null);
    const res = await GET(req("http://x/api/badge?owner=o&repo=r"));
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("image/svg+xml");
  });

  it("renders a hint badge when owner/repo are missing (never 404s)", async () => {
    const res = await GET(req("http://x/api/badge"));
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toContain("owner &amp; repo required");
  });

  it("renders 'no data' when D1 is unavailable", async () => {
    getD1Mock.mockResolvedValue(null);
    const res = await GET(req("http://x/api/badge?owner=o&repo=r"));
    const body = await res.text();
    expect(body).toContain("no data");
  });

  it("renders the summed view count from D1", async () => {
    const all = vi.fn().mockResolvedValue({ results: [{ total: 1200 }] });
    const bind = vi.fn().mockReturnValue({ all });
    getD1Mock.mockResolvedValue({ prepare: vi.fn().mockReturnValue({ bind }) });

    const res = await GET(req("http://x/api/badge?owner=o&repo=r"));
    const body = await res.text();
    expect(body).toContain("repo views");
    expect(body).toContain("1.2k");
    expect(bind).toHaveBeenCalledWith("o", "r");
  });

  it("renders 'error' when the query throws", async () => {
    getD1Mock.mockResolvedValue({
      prepare: vi.fn().mockImplementation(() => {
        throw new Error("boom");
      }),
    });
    const res = await GET(req("http://x/api/badge?owner=o&repo=r"));
    const body = await res.text();
    expect(body).toContain("error");
  });
});
