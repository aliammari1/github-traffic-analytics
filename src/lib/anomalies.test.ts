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

  describe("weekend_surge signal", () => {
    // 14 complete days ending 2026-09-27 (Sunday):
    // Weekdays (10 days): Sep 14-18, Sep 21-25
    // Weekends (4 days): Sep 19, 20, 26, 27
    const weekdays = [14, 15, 16, 17, 18, 21, 22, 23, 24, 25];
    const weekends = [19, 20, 26, 27];

    it("detects a weekend traffic surge when weekend views exceed weekday baseline by >= 2.0x", () => {
      const views = [...weekdays.map((day) => at(day, 20)), ...weekends.map((day) => at(day, 50))];
      const anomalies = detectGrowthAnomalies({ views }, now);
      const surge = anomalies.find((item) => item.type === "weekend_surge");

      expect(surge).toBeDefined();
      expect(surge?.metric).toBe("views");
      expect(surge?.observedValue).toBe(50);
      expect(surge?.baselineValue).toBe(20);
      expect(surge?.percentageChange).toBe(150);
      expect(surge?.startedAt).toBe("2026-09-27");
      expect(surge?.explanation).toBe(
        "Weekend traffic averaged 50 views/day, observed at 2.5x the weekday baseline (20 views/day)."
      );
    });

    it("does not flag weekend surge when traffic is flat or below 2.0x threshold", () => {
      const views = [...weekdays.map((day) => at(day, 30)), ...weekends.map((day) => at(day, 35))];
      const anomalies = detectGrowthAnomalies({ views }, now);
      expect(anomalies.some((item) => item.type === "weekend_surge")).toBe(false);
    });

    it("ignores zero baseline or tiny baseline to avoid division by zero or noisy alerts", () => {
      const zeroWeekday = [
        ...weekdays.map((day) => at(day, 0)),
        ...weekends.map((day) => at(day, 50)),
      ];
      expect(
        detectGrowthAnomalies({ views: zeroWeekday }, now).some(
          (item) => item.type === "weekend_surge"
        )
      ).toBe(false);

      const tinyViews = [
        ...weekdays.map((day) => at(day, 2)),
        ...weekends.map((day) => at(day, 5)),
      ];
      expect(
        detectGrowthAnomalies({ views: tinyViews }, now).some(
          (item) => item.type === "weekend_surge"
        )
      ).toBe(false);
    });

    it("requires complete observations and ignores incomplete windows with missing days", () => {
      const missingWeekdays = [
        at(14, 20),
        at(15, 20),
        at(16, 20),
        ...weekends.map((day) => at(day, 50)),
      ];
      expect(
        detectGrowthAnomalies({ views: missingWeekdays }, now).some(
          (item) => item.type === "weekend_surge"
        )
      ).toBe(false);
    });
  });

  describe("external spike attribution", () => {
    it("attaches verifiable public search attribution for known platforms", () => {
      const anomalies = detectGrowthAnomalies(
        {
          repository: "aliammari1/github-traffic-analytics",
          referrers: {
            previous: [],
            current: [
              { name: "news.ycombinator.com", count: 45 },
              { name: "github.com", count: 15 },
            ],
          },
        },
        now
      );

      const referrer = anomalies.find((item) => item.type === "new_top_referrer");
      expect(referrer).toBeDefined();
      expect(referrer?.attribution?.platform).toBe("Hacker News");
      expect(referrer?.attribution?.searchUrl).toContain(
        "hn.algolia.com/?q=aliammari1%2Fgithub-traffic-analytics"
      );
      expect(referrer?.explanation).toContain("Hacker News");
      expect(referrer?.explanation).toContain("Public mentions can be verified");
    });
  });
});
