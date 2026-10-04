// SPDX-License-Identifier: MIT
import { afterEach, describe, expect, it, vi } from "vitest";
import { runSnapshots } from "./snapshot";
import type { D1Database } from "../src/lib/snapshots";

vi.mock("@sentry/cloudflare", () => ({
  withSentry: (_config: unknown, handler: unknown) => handler,
  captureException: vi.fn(),
}));

describe("daily snapshot worker", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("archives daily totals and rolling top-source lists for an opted-in repository", async () => {
    const fetcher = vi.fn(async (url: string) => {
      const body = url.endsWith("/views?per=day")
        ? { views: [{ timestamp: "2026-10-04T00:00:00Z", count: 5, uniques: 3 }] }
        : url.endsWith("/clones?per=day")
          ? { clones: [{ timestamp: "2026-10-04T00:00:00Z", count: 2, uniques: 2 }] }
          : url.endsWith("/referrers")
            ? [{ referrer: "news.ycombinator.com", count: 50, uniques: 30 }]
            : [{ path: "/README.md", count: 40, uniques: 20 }];
      return { ok: true, json: async () => body };
    });
    vi.stubGlobal("fetch", fetcher);
    const batch = vi.fn().mockResolvedValue([]);
    const db = {
      prepare: vi.fn((sql: string) => {
        const statement = {
          bind: () => statement,
          all: async () => ({
            results: sql.includes("FROM tracked_repos")
              ? [
                  {
                    owner_login: "user-1",
                    repo_owner: "alice",
                    repo_name: "project",
                    access_token: "private",
                  },
                ]
              : [],
          }),
          run: async () => ({}),
        };
        return statement;
      }),
      batch,
    } as unknown as D1Database;
    const result = await runSnapshots({ DB: db }, new Date("2026-10-05T06:00:00Z"));
    expect(result).toEqual({ repos: 1, rows: 2, sources: 2 });
    expect(batch).toHaveBeenCalledTimes(4);
    expect(fetcher.mock.calls.map((call) => call[0])).toEqual(
      expect.arrayContaining([
        expect.stringContaining("/traffic/popular/referrers"),
        expect.stringContaining("/traffic/popular/paths"),
      ])
    );
  });
});
