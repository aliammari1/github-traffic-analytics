// SPDX-License-Identifier: MIT
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const auth = vi.fn();
const d1 = vi.fn();
const traffic = vi.fn();
vi.mock("@/lib/server-auth", () => ({ getServerAuth: (...args: unknown[]) => auth(...args) }));
vi.mock("@/lib/d1", () => ({ getD1: () => d1() }));
vi.mock("@/lib/github", () => ({
  GitHubService: class {
    getTrafficViews(...args: unknown[]) {
      return traffic(...args);
    }
  },
}));
import { DELETE, GET, PUT } from "./route";

const request = (method: string, body?: unknown) =>
  new NextRequest("http://localhost/api/digest/preferences?owner=alice&repo=project", {
    method,
    headers: method === "GET" ? {} : { origin: "http://localhost" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

describe("weekly digest preferences", () => {
  const all = vi.fn();
  const run = vi.fn();
  const bind = vi.fn().mockReturnValue({ all, run });
  const batch = vi.fn().mockResolvedValue([]);
  beforeEach(() => {
    vi.stubEnv("DIGEST_EMAIL_ENABLED", "true");
    vi.clearAllMocks();
    auth.mockResolvedValue({ userId: "user-1", accessToken: "secret" });
    d1.mockResolvedValue({ prepare: vi.fn().mockReturnValue({ bind }), batch });
    traffic.mockResolvedValue({ count: 1 });
    all.mockResolvedValue({ results: [] });
    run.mockResolvedValue({});
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [{ email: "verified@example.com", verified: true, primary: true }],
      })
    );
  });
  afterEach(() => vi.unstubAllEnvs());

  it("never reads or writes preferences without a session", async () => {
    auth.mockResolvedValue(null);
    expect((await GET(request("GET"))).status).toBe(401);
    expect((await PUT(request("PUT", { timeZone: "UTC" }))).status).toBe(401);
    expect((await DELETE(request("DELETE"))).status).toBe(401);
    expect(d1).not.toHaveBeenCalled();
  });

  it("requires a valid zone, current traffic access, and a verified GitHub email", async () => {
    expect((await PUT(request("PUT", { timeZone: "Mars/Olympus" }))).status).toBe(400);
    traffic.mockRejectedValueOnce(Object.assign(new Error("denied"), { status: 403 }));
    expect((await PUT(request("PUT", { timeZone: "UTC" }))).status).toBe(403);
    vi.mocked(fetch).mockResolvedValueOnce({ ok: true, json: async () => [] } as Response);
    expect((await PUT(request("PUT", { timeZone: "UTC" }))).status).toBe(409);
    expect(batch).not.toHaveBeenCalled();
  });

  it("keeps settings private and disables opt-in until delivery is configured", async () => {
    const response = await GET(request("GET"));
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(bind).toHaveBeenCalledWith("user-1", "alice", "project");
    vi.stubEnv("DIGEST_EMAIL_ENABLED", "false");
    expect((await PUT(request("PUT", { timeZone: "UTC" }))).status).toBe(503);
    expect(batch).not.toHaveBeenCalled();
  });

  it("explains a missing or unavailable settings table", async () => {
    all.mockRejectedValueOnce(new Error("no such table"));
    const response = await GET(request("GET"));
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ error: expect.stringContaining("Try again") });
  });

  it("rejects a cross-origin settings change", async () => {
    const crossOrigin = new NextRequest(
      "http://localhost/api/digest/preferences?owner=alice&repo=project",
      { method: "DELETE", headers: { origin: "https://evil.example" } }
    );
    expect((await DELETE(crossOrigin)).status).toBe(403);
    expect(run).not.toHaveBeenCalled();
  });

  it("opts in only for the signed-in user and supports opting out", async () => {
    const enabled = await PUT(request("PUT", { timeZone: "Africa/Tunis" }));
    expect(enabled.status).toBe(200);
    expect(await enabled.json()).toMatchObject({
      enabled: true,
      recipientEmail: "verified@example.com",
    });
    expect(bind).toHaveBeenCalledWith(
      "user-1",
      "alice",
      "project",
      "verified@example.com",
      "Africa/Tunis"
    );
    expect(batch).toHaveBeenCalledTimes(1);
    const disabled = await DELETE(request("DELETE"));
    expect(disabled.status).toBe(200);
    expect(await disabled.json()).toMatchObject({ enabled: false, recipientEmail: null });
    expect(bind).toHaveBeenCalledWith("user-1", "alice", "project");
  });
});
