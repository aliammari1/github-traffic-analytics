// SPDX-License-Identifier: MIT
import { describe, expect, it, vi } from "vitest";
import { getSourceWindows, replaceSourceSnapshot } from "./source-snapshots";
import type { D1Database } from "./snapshots";

describe("captured traffic source windows", () => {
  it("replaces a daily top list atomically, including an empty list", async () => {
    const bind = vi.fn().mockReturnValue({});
    const batch = vi.fn().mockResolvedValue([]);
    const db = { prepare: vi.fn().mockReturnValue({ bind }), batch } as unknown as D1Database;
    await replaceSourceSnapshot(db, {
      ownerLogin: "user-1",
      repoOwner: "alice",
      repoName: "project",
      kind: "referrer",
      capturedDay: "2026-10-04",
      sources: [{ name: "news.ycombinator.com", count: 42, uniques: 30 }],
    });
    expect(batch).toHaveBeenCalledWith(expect.any(Array));
    expect((batch as ReturnType<typeof vi.fn>).mock.calls[0][0]).toHaveLength(2);
    await replaceSourceSnapshot(db, {
      ownerLogin: "user-1",
      repoOwner: "alice",
      repoName: "project",
      kind: "referrer",
      capturedDay: "2026-10-04",
      sources: [],
    });
    expect((batch as ReturnType<typeof vi.fn>).mock.calls[1][0]).toHaveLength(1);
  });

  it("compares separate rolling windows and keeps a lone current window descriptive", async () => {
    const rows = [
      { kind: "referrer", captured_day: "2026-10-04", name: "news.ycombinator.com", count: 50 },
      { kind: "referrer", captured_day: "2026-09-27", name: "github.com", count: 30 },
      { kind: "path", captured_day: "2026-10-04", name: "/README.md", count: 40 },
      { kind: "path", captured_day: "2026-09-27", name: "/README.md", count: 10 },
    ];
    const all = vi.fn().mockResolvedValue({ results: rows });
    const bind = vi.fn().mockReturnValue({ all });
    const db = { prepare: vi.fn().mockReturnValue({ bind }) } as unknown as D1Database;
    const windows = await getSourceWindows(db, {
      ownerLogin: "user-1",
      repoOwner: "alice",
      repoName: "project",
      endingOn: "2026-10-04",
    });
    expect(windows.topReferrer).toEqual({ name: "news.ycombinator.com", count: 50 });
    expect(windows.referrers?.previous).toEqual([{ name: "github.com", count: 30 }]);
    expect(windows.paths?.current).toEqual([{ name: "/README.md", count: 40 }]);
    expect(bind).toHaveBeenCalledWith("user-1", "alice", "project", "2026-09-24", "2026-10-05");
    all.mockResolvedValueOnce({ results: rows.filter((row) => row.captured_day === "2026-10-04") });
    const lone = await getSourceWindows(db, {
      ownerLogin: "user-1",
      repoOwner: "alice",
      repoName: "project",
      endingOn: "2026-10-04",
    });
    expect(lone.topReferrer?.name).toBe("news.ycombinator.com");
    expect(lone.referrers).toBeUndefined();
  });
});
