// SPDX-License-Identifier: MIT
import { starsGained, type StarPoint } from "./analytics";
import {
  detectGrowthAnomalies,
  type ComparisonWindow,
  type GrowthAnomaly,
  type NamedCount,
} from "./anomalies";
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
  cadence: "weekly" | "monthly";
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
  topReferrer?: NamedCount | null;
}

function sumCompletePeriod(
  rows: Map<string, SnapshotRow>,
  end: number,
  field: "count" | "uniques",
  days: number
): { total: number | null; days: number } {
  let total = 0;
  let observed = 0;
  for (let offset = 0; offset < days; offset++) {
    const row = rows.get(dayKey(end - offset * DAY_MS));
    if (!row) continue;
    total += row[field];
    observed++;
  }
  return { total: observed === days ? total : null, days: observed };
}

function trafficMetric(
  rows: Map<string, SnapshotRow>,
  end: number,
  field: "count" | "uniques",
  days: number
): WeeklyMetric {
  const current = sumCompletePeriod(rows, end, field, days);
  const prior = sumCompletePeriod(rows, end - days * DAY_MS, field, days);
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
  return buildPeriodicReport(input, "weekly");
}

/** The monthly delivery is a comparable rolling 30-day report. */
export function buildMonthlyReport(input: WeeklyReportInput): WeeklyRepositoryReport {
  return buildPeriodicReport(input, "monthly");
}

function buildPeriodicReport(
  input: WeeklyReportInput,
  cadence: "weekly" | "monthly"
): WeeklyRepositoryReport {
  const days = cadence === "weekly" ? 7 : 30;
  const end = Date.parse(`${input.endingOn}T00:00:00Z`);
  if (!Number.isFinite(end) || dayKey(end) !== input.endingOn)
    throw new Error("endingOn must be an ISO UTC day");
  const from = dayKey(end - (days - 1) * DAY_MS);
  const previousFrom = dayKey(end - (days * 2 - 1) * DAY_MS);
  const previousTo = dayKey(end - days * DAY_MS);
  const viewsRows = new Map(
    input.snapshots.filter((row) => row.metric === "views").map((row) => [row.day, row])
  );
  const cloneRows = new Map(
    input.snapshots.filter((row) => row.metric === "clones").map((row) => [row.day, row])
  );
  const views = trafficMetric(viewsRows, end, "count", days);
  const viewUniques = trafficMetric(viewsRows, end, "uniques", days);
  const clones = trafficMetric(cloneRows, end, "count", days);
  const cloneUniques = trafficMetric(cloneRows, end, "uniques", days);
  const starCount = input.stars ? starsGained(input.stars, days, new Date(end)) : null;
  const previousStars = input.stars
    ? starsGained(input.stars, days, new Date(end - days * DAY_MS))
    : null;
  const stars: WeeklyMetric = {
    count: starCount,
    previous: previousStars,
    changePercent: percentage(starCount, previousStars),
    observedDays: starCount === null ? 0 : days,
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
  const topReferrer =
    input.referrers?.current.toSorted((a, b) => b.count - a.count)[0] ?? input.topReferrer ?? null;
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
      cadence === "weekly"
        ? `Star growth: +${stars.count} this week versus +${stars.previous} in the previous week.`
        : `Star growth: +${stars.count} in the last 30 days versus +${stars.previous} in the previous 30 days.`
    );
  } else if (stars.count !== null) {
    highlights.push(
      cadence === "weekly"
        ? `Star growth: +${stars.count} this week; prior week unavailable.`
        : `Star growth: +${stars.count} in the last 30 days; prior period unavailable.`
    );
  }
  if (views.count === null) {
    highlights.push(
      `Views are unavailable for a complete ${days}-day comparison (${views.observedDays} of ${days} days captured).`
    );
  } else {
    highlights.push(
      `${views.count} views across ${days} complete days${views.previous === null ? "; prior period unavailable" : ` versus ${views.previous} in the previous ${days} days`}.`
    );
  }
  if (clones.count !== null)
    highlights.push(`${clones.count} clones across ${days} complete days.`);
  if (topReferrer)
    highlights.push(
      `Leading referrer: ${topReferrer.name} (${topReferrer.count} views in GitHub's captured rolling 14-day window).`
    );
  if (releases.length)
    highlights.push(
      `${releases.length} release${releases.length === 1 ? "" : "s"} published during this period; any growth association is temporal.`
    );

  return {
    fullName: input.fullName,
    cadence,
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
