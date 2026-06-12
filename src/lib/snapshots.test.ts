// SPDX-License-Identifier: MIT
import { describe, it, expect, vi } from "vitest";
import {
  toDayKey,
  upsertDailyCounts,
  getHistory,
  mergeHistory,
  type D1Database,
  type D1PreparedStatement,
  type SnapshotRow,
} from "./snapshots";

/** Minimal in-memory fake of the D1 surface used by the snapshot helpers. */
function makeFakeD1(rows: SnapshotRow[] = []) {
  const batched: unknown[][] = [];
  const bound: unknown[] = [];

  const stmt = (): D1PreparedStatement => {
    const s: D1PreparedStatement = {
      bind: vi.fn((...v: unknown[]) => {
        bound.push(v);
        return s;
      }),
      run: vi.fn(async () => ({})),
      all: vi.fn(async () => ({ results: rows as never[] })),
    };
    return s;
  };

  const db: D1Database = {
    prepare: vi.fn(() => stmt()),
    batch: vi.fn(async (statements: D1PreparedStatement[]) => {
      batched.push(statements);
      return {};
    }),
  };
  return { db, batched, bound };
}

describe("toDayKey", () => {
  it("normalizes an ISO timestamp to a UTC day", () => {
    expect(toDayKey("2026-06-01T00:00:00Z")).toBe("2026-06-01");
    expect(toDayKey("2026-06-01T23:30:00Z")).toBe("2026-06-01");
  });
});

describe("upsertDailyCounts", () => {
  it("batches one statement per point and returns the count", async () => {
    const { db, batched } = makeFakeD1();
    const n = await upsertDailyCounts(db, {
      ownerLogin: "alice",
      repoOwner: "alice",
      repoName: "repo",
      metric: "views",
      points: [
        { day: "2026-06-01", count: 10, uniques: 4 },
        { day: "2026-06-02", count: 12, uniques: 5 },
      ],
    });
    expect(n).toBe(2);
    expect((batched[0] as unknown[]).length).toBe(2);
    expect(db.batch).toHaveBeenCalledOnce();
  });

  it("no-ops on an empty point list", async () => {
    const { db } = makeFakeD1();
    const n = await upsertDailyCounts(db, {
      ownerLogin: "alice",
      repoOwner: "alice",
      repoName: "repo",
      metric: "clones",
      points: [],
    });
    expect(n).toBe(0);
    expect(db.batch).not.toHaveBeenCalled();
  });
});

describe("getHistory", () => {
  it("queries with the user/repo/window bound parameters", async () => {
    const rows: SnapshotRow[] = [{ day: "2026-06-01", metric: "views", count: 10, uniques: 4 }];
    const { db, bound } = makeFakeD1(rows);
    const result = await getHistory(db, {
      ownerLogin: "alice",
      repoOwner: "alice",
      repoName: "repo",
      fromDay: "2026-05-01",
      toDay: "2026-06-30",
    });
    expect(result).toEqual(rows);
    expect(bound[0]).toEqual(["alice", "alice", "repo", "2026-05-01", "2026-06-30"]);
  });
});

describe("mergeHistory", () => {
  it("pivots views and clones into per-day records sorted by day", () => {
    const rows: SnapshotRow[] = [
      { day: "2026-06-02", metric: "clones", count: 2, uniques: 1 },
      { day: "2026-06-01", metric: "views", count: 10, uniques: 4 },
      { day: "2026-06-01", metric: "clones", count: 3, uniques: 2 },
    ];
    const merged = mergeHistory(rows);
    expect(merged).toEqual([
      { day: "2026-06-01", views: 10, viewUniques: 4, clones: 3, cloneUniques: 2 },
      { day: "2026-06-02", views: 0, viewUniques: 0, clones: 2, cloneUniques: 1 },
    ]);
  });
});
