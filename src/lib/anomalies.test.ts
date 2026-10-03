// SPDX-License-Identifier: MIT
import { describe, expect, it } from "vitest";
import { detectGrowthAnomalies, type DailyMetric } from "./anomalies";

const at = (day: number, count: number): DailyMetric => ({
  day: `2026-09-${String(day).padStart(2, "0")}`,
  count,
});
const baseline = (count: number) => Array.from({ length: 7 }, (_, index) => at(index + 20, count));
const now = new Date("2026-09-28T12:00:00Z");

describe("detectGrowthAnomalies", () => {
  it("finds a traffic spike against a complete, flat baseline", () => {
    const anomalies = detectGrowthAnomalies({ views: [...baseline(20), at(27, 60)] }, now);
    expect(anomalies).toContainEqual(
      expect.objectContaining({
        type: "traffic_spike",
        metric: "views",
        observedValue: 60,
        baselineValue: 20,
        percentageChange: 200,
        startedAt: "2026-09-27",
      })
    );
  });

  it("finds a traffic drop and a clone spike independently", () => {
    const anomalies = detectGrowthAnomalies(
      {
        views: [...baseline(40), at(27, 10)],
        clones: [...baseline(8), at(27, 24)],
      },
      now
    );
    expect(anomalies.map((item) => item.type)).toEqual(
      expect.arrayContaining(["traffic_drop", "clone_spike"])
    );
  });

  it("does not call a partial current day, missing baseline, or tiny volume a spike", () => {
    expect(detectGrowthAnomalies({ views: [...baseline(20), at(28, 100)] }, now)).toEqual([]);
    expect(detectGrowthAnomalies({ views: [at(25, 20), at(26, 20), at(27, 100)] }, now)).toEqual(
      []
    );
    expect(detectGrowthAnomalies({ views: [...baseline(1), at(27, 3)] }, now)).toEqual([]);
  });

  it("resists a single outlier in the prior week", () => {
    const anomalies = detectGrowthAnomalies(
      {
        views: [
          ...baseline(20).map((point, index) => (index === 2 ? { ...point, count: 200 } : point)),
          at(27, 60),
        ],
      },
      now
    );
    expect(anomalies.some((item) => item.type === "traffic_spike")).toBe(true);
  });

  it("reports star acceleration and deceleration only with complete windows", () => {
    const dates = ["2026-09-13", "2026-09-20", "2026-09-27"];
    const accelerated = dates.map((date, index) => ({ date, stars: [100, 108, 130][index] }));
    const slowed = dates.map((date, index) => ({ date, stars: [100, 125, 130][index] }));
    expect(
      detectGrowthAnomalies({ stars: accelerated }, new Date("2026-09-27T00:00:00Z")).map(
        (item) => item.type
      )
    ).toContain("star_acceleration");
    expect(
      detectGrowthAnomalies({ stars: slowed }, new Date("2026-09-27T00:00:00Z")).map(
        (item) => item.type
      )
    ).toContain("star_deceleration");
    expect(
      detectGrowthAnomalies({ stars: accelerated.slice(1) }, new Date("2026-09-27T00:00:00Z"))
    ).toEqual([]);
  });

  it("detects a new top referrer and large share movement", () => {
    const anomalies = detectGrowthAnomalies(
      {
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
      },
      now
    );
    expect(anomalies.map((item) => item.type)).toEqual(
      expect.arrayContaining(["new_top_referrer", "referrer_share_change"])
    );
  });

  it("detects a popular-path surge and a large period change", () => {
    const anomalies = detectGrowthAnomalies(
      {
        views: [
          ...Array.from({ length: 7 }, (_, index) => at(index + 13, 10)),
          ...baseline(25),
          at(27, 25),
        ],
        paths: { previous: [{ name: "/docs", count: 5 }], current: [{ name: "/docs", count: 35 }] },
      },
      now
    );
    expect(anomalies.map((item) => item.type)).toEqual(
      expect.arrayContaining(["popular_path_surge", "period_change"])
    );
  });

  it("adds nearby release context without claiming causality", () => {
    const anomalies = detectGrowthAnomalies(
      {
        views: [...baseline(20), at(27, 60)],
        releases: [{ tagName: "v2.0.0", publishedAt: "2026-09-26T12:00:00Z" }],
      },
      now
    );
    const spike = anomalies.find((item) => item.type === "traffic_spike");
    expect(spike?.relatedRelease).toEqual({
      tagName: "v2.0.0",
      publishedAt: "2026-09-26T12:00:00Z",
    });
    expect(spike?.explanation).toContain("near");
    expect(spike?.explanation).not.toContain("caused");
  });

  it("uses null rather than infinity for a zero baseline and ignores flat/no data", () => {
    const anomalies = detectGrowthAnomalies(
      {
        referrers: { previous: [], current: [{ name: "reddit.com", count: 30 }] },
        views: [...baseline(0), at(27, 0)],
      },
      now
    );
    expect(anomalies.find((item) => item.type === "new_top_referrer")?.percentageChange).toBeNull();
    expect(anomalies.some((item) => item.metric === "views")).toBe(false);
  });
});
