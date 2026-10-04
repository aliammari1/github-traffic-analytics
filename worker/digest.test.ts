// SPDX-License-Identifier: MIT
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { runWeeklyDigests } from "./digest";
import type { D1Database } from "../src/lib/snapshots";

const analyze = vi.fn();
vi.mock("../src/lib/github-public", () => ({
  PublicGitHubService: class {
    analyzePublicRepository(...args: unknown[]) {
      return analyze(...args);
    }
  },
}));

describe("weekly digest worker", () => {
  const preference = {
    owner_login: "user-1",
    repo_owner: "alice",
    repo_name: "project",
    recipient_email: "alice@example.com",
    time_zone: "UTC",
    access_token: "server-only-token",
  };
  beforeEach(() => {
    analyze.mockReset().mockResolvedValue({ starHistory: null, releases: [] });
  });
  afterEach(() => vi.unstubAllGlobals());

  it("claims a due report once and never sends a duplicate", async () => {
    let sent = false;
    const provider = { deliver: vi.fn().mockResolvedValue("em_1") };
    const db = {
      prepare: vi.fn((sql: string) => ({
        bind: (...values: unknown[]) => ({
          all: async () => {
            if (sql.includes("FROM weekly_digest_preferences")) return { results: [preference] };
            if (sql.includes("INSERT INTO report_deliveries"))
              return { results: sent ? [] : [{ id: 1 }] };
            if (sql.includes("FROM traffic_snapshots")) return { results: [] };
            throw new Error(`Unexpected query: ${sql}`);
          },
          run: async () => {
            if (sql.includes("status = 'sent'")) sent = true;
            return { values };
          },
        }),
        all: async () => ({ results: [preference] }),
      })),
      batch: vi.fn(),
    };
    const env = { DB: db as unknown as D1Database, SITE_URL: "https://example.com" };
    const now = new Date("2026-10-05T09:00:00Z");
    expect(await runWeeklyDigests(env, now, provider, async () => true)).toEqual({
      due: 1,
      sent: 1,
      failed: 0,
      revoked: 0,
    });
    expect(await runWeeklyDigests(env, now, provider, async () => true)).toEqual({
      due: 1,
      sent: 0,
      failed: 0,
      revoked: 0,
    });
    expect(provider.deliver).toHaveBeenCalledTimes(1);
    expect(provider.deliver.mock.calls[0][1].email).toBe("alice@example.com");
    expect(provider.deliver.mock.calls[0][2]).toBe("user-1:alice:project:2026-10-04:email");
  });

  it("never sends outside the local Monday morning window", async () => {
    const provider = { deliver: vi.fn() };
    const db = {
      prepare: vi.fn(() => ({ all: async () => ({ results: [preference] }) })),
      batch: vi.fn(),
    };
    expect(
      await runWeeklyDigests(
        { DB: db as unknown as D1Database },
        new Date("2026-10-05T16:00:00Z"),
        provider,
        async () => true
      )
    ).toEqual({
      due: 0,
      sent: 0,
      failed: 0,
      revoked: 0,
    });
    expect(provider.deliver).not.toHaveBeenCalled();
  });

  it("honors an opt-out that happens while a report is being built", async () => {
    let claimRemoved = false;
    const provider = { deliver: vi.fn() };
    const db = {
      prepare: vi.fn((sql: string) => ({
        bind: () => ({
          all: async () => ({
            results: sql.includes("INSERT INTO report_deliveries") ? [{ id: 1 }] : [],
          }),
          run: async () => {
            if (sql.includes("DELETE FROM report_deliveries")) claimRemoved = true;
          },
        }),
        all: async () => ({ results: [preference] }),
      })),
      batch: vi.fn(),
    };
    expect(
      await runWeeklyDigests(
        { DB: db as unknown as D1Database },
        new Date("2026-10-05T09:00:00Z"),
        provider,
        async () => true
      )
    ).toEqual({ due: 1, sent: 0, failed: 0, revoked: 0 });
    expect(claimRemoved).toBe(true);
    expect(provider.deliver).not.toHaveBeenCalled();
  });

  it("removes a subscription when GitHub traffic access was revoked", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ status: 403, ok: false }));
    const provider = { deliver: vi.fn() };
    const deleted: string[] = [];
    const db = {
      prepare: vi.fn((sql: string) => ({
        bind: () => ({
          all: async () => ({ results: [{ id: 1 }] }),
          run: async () => {
            if (sql.includes("DELETE")) deleted.push(sql);
          },
        }),
        all: async () => ({ results: [preference] }),
      })),
      batch: vi.fn(),
    };
    expect(
      await runWeeklyDigests(
        { DB: db as unknown as D1Database },
        new Date("2026-10-05T09:00:00Z"),
        provider
      )
    ).toEqual({ due: 1, sent: 0, failed: 0, revoked: 1 });
    expect(deleted).toHaveLength(2);
    expect(provider.deliver).not.toHaveBeenCalled();
  });

  it("retries a failed provider call without changing the report key", async () => {
    let status = "";
    const keys: string[] = [];
    const provider = {
      deliver: vi.fn(async (_report: unknown, _destination: unknown, key: string) => {
        keys.push(key);
        if (keys.length === 1) throw new Error("temporary");
        return "em_2";
      }),
    };
    const db = {
      prepare: vi.fn((sql: string) => ({
        bind: () => ({
          all: async () => {
            if (sql.includes("FROM weekly_digest_preferences")) return { results: [preference] };
            if (sql.includes("INSERT INTO report_deliveries"))
              return { results: status === "sent" ? [] : [{ id: 1 }] };
            return { results: [] };
          },
          run: async () => {
            if (sql.includes("status = 'failed'")) status = "failed";
            if (sql.includes("status = 'sent'")) status = "sent";
          },
        }),
        all: async () => ({ results: [preference] }),
      })),
      batch: vi.fn(),
    };
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      expect(
        await runWeeklyDigests(
          { DB: db as unknown as D1Database },
          new Date("2026-10-05T09:00:00Z"),
          provider,
          async () => true
        )
      ).toMatchObject({ sent: 0, failed: 1 });
      expect(
        await runWeeklyDigests(
          { DB: db as unknown as D1Database },
          new Date("2026-10-05T10:00:00Z"),
          provider,
          async () => true
        )
      ).toMatchObject({ sent: 1, failed: 0 });
      expect(keys).toEqual([
        "user-1:alice:project:2026-10-04:email",
        "user-1:alice:project:2026-10-04:email",
      ]);
      expect(error.mock.calls.flat().join(" ")).not.toContain("server-only-token");
    } finally {
      error.mockRestore();
    }
  });
});
