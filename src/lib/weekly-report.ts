// SPDX-License-Identifier: MIT
import { starsGained, type StarPoint } from "./analytics";
import { detectGrowthAnomalies, type ComparisonWindow, type GrowthAnomaly } from "./anomalies";
import type { SnapshotRow } from "./snapshots";

const DAY_MS = 86_400_000;
const dayKey = (timestamp: number) => new Date(timestamp).toISOString().slice(0, 10);
const percentage = (value: number | null, previous: number | null) =>
  value === null || previous === null
    ? null
    : previous === 0
      ? value === 0
        ? 0
        : null
      : Math.round(((value - previous) / previous) * 1_000) / 10;

export interface WeeklyMetric {
  count: number | null;
  previous: number | null;
  changePercent: number | null;
  observedDays: number;
}

export interface WeeklyRepositoryReport {
  fullName: string;
  period: { from: string; to: string; previousFrom: string; previousTo: string };
  stars: WeeklyMetric;
  views: WeeklyMetric;
  viewUniques: WeeklyMetric;
  clones: WeeklyMetric;
  cloneUniques: WeeklyMetric;
  topReferrer: { name: string; count: number } | null;
  biggestReferrerMovement: GrowthAnomaly | null;
  biggestContentMovement: GrowthAnomaly | null;
  releases: Array<{ tagName: string; publishedAt: string }>;
  anomalies: GrowthAnomaly[];
  strongestAnomaly: GrowthAnomaly | null;
  biggestGrowthEvent: GrowthAnomaly | null;
  highlights: string[];
}

export interface WeeklyReportInput {
  fullName: string;
  /** Latest complete UTC day, inclusive. */
  endingOn: string;
  snapshots: SnapshotRow[];
  stars: StarPoint[] | null;
  releases: Array<{ tagName: string; publishedAt: string }>;
  referrers?: ComparisonWindow;
  paths?: ComparisonWindow;
}

function sumCompleteWeek(
  rows: Map<string, SnapshotRow>,
  end: number,
  field: "count" | "uniques"
): { total: number | null; days: number } {
  let total = 0;
  let days = 0;
  for (let offset = 0; offset < 7; offset++) {
    const row = rows.get(dayKey(end - offset * DAY_MS));
    if (!row) continue;
    total += row[field];
    days++;
  }
  return { total: days === 7 ? total : null, days };
}

function trafficMetric(
  rows: Map<string, SnapshotRow>,
  end: number,
  field: "count" | "uniques"
): WeeklyMetric {
  const current = sumCompleteWeek(rows, end, field);
  const prior = sumCompleteWeek(rows, end - 7 * DAY_MS, field);
  return {
    count: current.total,
    previous: prior.total,
    changePercent: percentage(current.total, prior.total),
    observedDays: current.days,
  };
}

function strongest(signals: GrowthAnomaly[]): GrowthAnomaly | null {
  const rank = { high: 3, notable: 2, info: 1 };
  return (
    [...signals].sort(
      (a, b) =>
        rank[b.severity] - rank[a.severity] ||
        Math.abs(b.percentageChange ?? 0) - Math.abs(a.percentageChange ?? 0)
    )[0] ?? null
  );
}

/** Build one delivery-neutral, deterministic weekly report from comparable observations. */
export function buildWeeklyReport(input: WeeklyReportInput): WeeklyRepositoryReport {
  const end = Date.parse(`${input.endingOn}T00:00:00Z`);
  if (!Number.isFinite(end) || dayKey(end) !== input.endingOn)
    throw new Error("endingOn must be an ISO UTC day");
  const from = dayKey(end - 6 * DAY_MS);
  const previousFrom = dayKey(end - 13 * DAY_MS);
  const previousTo = dayKey(end - 7 * DAY_MS);
  const viewsRows = new Map(
    input.snapshots.filter((row) => row.metric === "views").map((row) => [row.day, row])
  );
  const cloneRows = new Map(
    input.snapshots.filter((row) => row.metric === "clones").map((row) => [row.day, row])
  );
  const views = trafficMetric(viewsRows, end, "count");
  const viewUniques = trafficMetric(viewsRows, end, "uniques");
  const clones = trafficMetric(cloneRows, end, "count");
  const cloneUniques = trafficMetric(cloneRows, end, "uniques");
  const starCount = input.stars ? starsGained(input.stars, 7, new Date(end)) : null;
  const previousStars = input.stars
    ? starsGained(input.stars, 7, new Date(end - 7 * DAY_MS))
    : null;
  const stars: WeeklyMetric = {
    count: starCount,
    previous: previousStars,
    changePercent: percentage(starCount, previousStars),
    observedDays: starCount === null ? 0 : 7,
  };
  const releases = input.releases.filter((release) => {
    const published = release.publishedAt.slice(0, 10);
    return published >= from && published <= input.endingOn;
  });
  const anomalies = [
    ...detectGrowthAnomalies(
      {
        views: [...viewsRows.values()].map((row) => ({ day: row.day, count: row.count })),
        clones: [...cloneRows.values()].map((row) => ({ day: row.day, count: row.count })),
        referrers: input.referrers,
        paths: input.paths,
        releases: input.releases,
      },
      new Date(end + DAY_MS)
    ),
    ...detectGrowthAnomalies(
      { stars: input.stars ?? [], releases: input.releases },
      new Date(end)
    ).filter((signal) => signal.metric === "stars"),
  ];
  const topReferrer = input.referrers?.current.toSorted((a, b) => b.count - a.count)[0] ?? null;
  const biggestReferrerMovement = strongest(
    anomalies.filter((item) => item.type === "referrer_share_change")
  );
  const biggestContentMovement = strongest(
    anomalies.filter((item) => item.type === "popular_path_surge")
  );
  const biggestGrowthEvent = strongest(
    anomalies.filter((item) => (item.percentageChange ?? 0) > 0)
  );
  const highlights: string[] = [];
  if (stars.count !== null && stars.previous !== null) {
    highlights.push(
      `Star growth: +${stars.count} this week versus +${stars.previous} in the previous week.`
    );
  } else if (stars.count !== null) {
    highlights.push(`Star growth: +${stars.count} this week; prior week unavailable.`);
  }
  if (views.count === null) {
    highlights.push(
      `Views are unavailable for a complete seven-day comparison (${views.observedDays} of 7 days captured).`
    );
  } else {
    highlights.push(
      `${views.count} views across seven complete days${views.previous === null ? "; prior week unavailable" : ` versus ${views.previous} the previous week`}.`
    );
  }
  if (clones.count !== null) highlights.push(`${clones.count} clones across seven complete days.`);
  if (topReferrer)
    highlights.push(
      `Leading referrer: ${topReferrer.name} (${topReferrer.count} views in the supplied window).`
    );
  if (releases.length)
    highlights.push(
      `${releases.length} release${releases.length === 1 ? "" : "s"} published during this week; any growth association is temporal.`
    );

  return {
    fullName: input.fullName,
    period: { from, to: input.endingOn, previousFrom, previousTo },
    stars,
    views,
    viewUniques,
    clones,
    cloneUniques,
    topReferrer,
    biggestReferrerMovement,
    biggestContentMovement,
    releases,
    anomalies,
    strongestAnomaly: strongest(anomalies),
    biggestGrowthEvent,
    highlights,
  };
}
