// SPDX-License-Identifier: MIT
import { describe, expect, it } from "vitest";
import { buildWeeklyReport } from "./weekly-report";
import type { SnapshotRow } from "./snapshots";

const day = (index: number) => new Date(Date.UTC(2026, 8, 14 + index)).toISOString().slice(0, 10);
const rows = (metric: "views" | "clones", count: number, uniques: number): SnapshotRow[] =>
  Array.from({ length: 14 }, (_, index) => ({ day: day(index), metric, count, uniques }));

describe("buildWeeklyReport", () => {
  it("totals complete comparable weeks and calculates changes", () => {
    const report = buildWeeklyReport({
      fullName: "alice/project",
      endingOn: "2026-09-27",
      snapshots: [...rows("views", 10, 10), ...rows("clones", 2, 1)],
      stars: [
        { date: "2026-09-13", stars: 100 },
        { date: "2026-09-20", stars: 110 },
        { date: "2026-09-27", stars: 130 },
      ],
      releases: [{ tagName: "v2.0.0", publishedAt: "2026-09-25T12:00:00Z" }],
    });
    expect(report.period).toEqual({
      from: "2026-09-21",
      to: "2026-09-27",
      previousFrom: "2026-09-14",
      previousTo: "2026-09-20",
    });
    expect(report.views).toEqual({ count: 70, previous: 70, changePercent: 0, observedDays: 7 });
    expect(report.viewUniques.count).toBe(70);
    expect(report.clones.count).toBe(14);
    expect(report.stars).toEqual({ count: 20, previous: 10, changePercent: 100, observedDays: 7 });
    expect(report.releases).toEqual([{ tagName: "v2.0.0", publishedAt: "2026-09-25T12:00:00Z" }]);
  });

  it("marks incomplete traffic as unavailable instead of reporting a false zero", () => {
    const report = buildWeeklyReport({
      fullName: "alice/project",
      endingOn: "2026-09-27",
      snapshots: rows("views", 0, 0).filter((row) => row.day !== "2026-09-25"),
      stars: null,
      releases: [],
    });
    expect(report.views).toEqual({
      count: null,
      previous: 0,
      changePercent: null,
      observedDays: 6,
    });
    expect(report.clones.count).toBeNull();
    expect(report.stars.count).toBeNull();
    expect(report.highlights).toContain(
      "Views are unavailable for a complete 7-day comparison (6 of 7 days captured)."
    );
  });

  it("keeps referrer and content movement separate from unavailable historical windows", () => {
    const report = buildWeeklyReport({
      fullName: "alice/project",
      endingOn: "2026-09-27",
      snapshots: [],
      stars: null,
      releases: [],
      referrers: {
        previous: [
          { name: "google.com", count: 80 },
          { name: "reddit.com", count: 20 },
        ],
        current: [
          { name: "news.ycombinator.com", count: 40 },
          { name: "google.com", count: 35 },
          { name: "reddit.com", count: 5 },
        ],
      },
      paths: { previous: [{ name: "/docs", count: 5 }], current: [{ name: "/docs", count: 35 }] },
    });
    expect(report.topReferrer).toEqual({ name: "news.ycombinator.com", count: 40 });
    expect(report.biggestReferrerMovement?.type).toBe("referrer_share_change");
    expect(report.biggestContentMovement?.type).toBe("popular_path_surge");
    expect(report.strongestAnomaly).not.toBeNull();
  });

  it("includes a real star acceleration and a concise growth highlight", () => {
    const report = buildWeeklyReport({
      fullName: "alice/project",
      endingOn: "2026-09-27",
      snapshots: [],
      stars: [
        { date: "2026-09-13", stars: 100 },
        { date: "2026-09-20", stars: 108 },
        { date: "2026-09-27", stars: 130 },
      ],
      releases: [],
    });
    expect(report.anomalies.map((item) => item.type)).toContain("star_acceleration");
    expect(report.highlights).toContain(
      "Star growth: +22 this week versus +8 in the previous week."
    );
  });

  it("describes a lone captured referrer without inventing movement", () => {
    const report = buildWeeklyReport({
      fullName: "alice/project",
      endingOn: "2026-09-27",
      snapshots: [],
      stars: null,
      releases: [],
      topReferrer: { name: "news.ycombinator.com", count: 24 },
    });
    expect(report.topReferrer?.name).toBe("news.ycombinator.com");
    expect(report.biggestReferrerMovement).toBeNull();
    expect(report.highlights).toContain(
      "Leading referrer: news.ycombinator.com (24 views in GitHub's captured rolling 14-day window)."
    );
  });
});
