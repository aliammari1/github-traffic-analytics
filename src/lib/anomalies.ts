// SPDX-License-Identifier: MIT
import { starsGained, type StarPoint } from "./analytics";

export type AnomalyType =
  | "traffic_spike"
  | "traffic_drop"
  | "weekend_surge"
  | "clone_spike"
  | "clone_drop"
  | "star_acceleration"
  | "star_deceleration"
  | "new_top_referrer"
  | "referrer_share_change"
  | "popular_path_surge"
  | "period_change";

export interface GrowthAnomaly {
  type: AnomalyType;
  severity: "info" | "notable" | "high";
  metric: "views" | "clones" | "stars" | "referrers" | "paths";
  observedValue: number;
  baselineValue: number;
  percentageChange: number | null;
  zScore: number | null;
  startedAt: string;
  relatedRelease?: { tagName: string; publishedAt: string };
  attribution?: {
    platform: string;
    searchUrl?: string;
    verifiedQuery?: string;
  };
  explanation: string;
}

export interface DailyMetric {
  day: string;
  count: number;
}
export interface NamedCount {
  name: string;
  count: number;
}
export interface ComparisonWindow {
  previous: NamedCount[];
  current: NamedCount[];
}
export interface AnomalyInput {
  repository?: string;
  views?: DailyMetric[];
  clones?: DailyMetric[];
  stars?: StarPoint[];
  referrers?: ComparisonWindow;
  paths?: ComparisonWindow;
  releases?: Array<{ tagName: string; publishedAt: string }>;
}

const DAY_MS = 86_400_000;
const dayKey = (time: number) => new Date(time).toISOString().slice(0, 10);
const dateTime = (day: string) => Date.parse(`${day}T00:00:00Z`);
const sum = (numbers: number[]) => numbers.reduce((total, value) => total + value, 0);
const round = (value: number) => Math.round(value * 10) / 10;
const percent = (current: number, previous: number): number | null =>
  previous === 0 ? null : round(((current - previous) / previous) * 100);

function median(numbers: number[]): number {
  const sorted = [...numbers].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function robustZ(observed: number, baseline: number, samples: number[]): number | null {
  const mad = median(samples.map((value) => Math.abs(value - baseline)));
  return mad === 0 ? null : round((observed - baseline) / (mad * 1.4826));
}

function sanitizedDaily(points: DailyMetric[]): Map<string, number> {
  const values = new Map<string, number>();
  for (const point of points) {
    if (
      /^\d{4}-\d{2}-\d{2}$/.test(point.day) &&
      Number.isFinite(dateTime(point.day)) &&
      Number.isFinite(point.count) &&
      point.count >= 0
    )
      values.set(point.day, point.count);
  }
  return values;
}

function dailySignals(
  points: DailyMetric[],
  metric: "views" | "clones",
  now: Date
): GrowthAnomaly[] {
  const days = sanitizedDaily(points);
  const completed = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - DAY_MS;
  const observedDay = dayKey(completed);
  const observed = days.get(observedDay);
  if (observed === undefined) return [];
  const baseline = Array.from({ length: 7 }, (_, index) =>
    days.get(dayKey(completed - (index + 1) * DAY_MS))
  ).filter((value): value is number => value !== undefined);
  if (baseline.length < 5) return [];

  const typical = median(baseline);
  const delta = observed - typical;
  const ratio = typical === 0 ? null : observed / typical;
  const kind = metric === "views" ? "traffic" : "clone";
  const result: GrowthAnomaly[] = [];
  if (typical >= 5 && delta >= 10 && ratio !== null && ratio >= 2) {
    result.push({
      type: `${kind}_spike` as AnomalyType,
      metric,
      severity: ratio >= 3 ? "high" : "notable",
      observedValue: observed,
      baselineValue: typical,
      percentageChange: percent(observed, typical),
      zScore: robustZ(observed, typical, baseline),
      startedAt: observedDay,
      explanation: `${metric === "views" ? "Views" : "Clones"} rose to ${observed} on ${observedDay}, versus a ${typical}-per-day median over the preceding week.`,
    });
  } else if (typical >= 20 && delta <= -10 && ratio !== null && ratio <= 0.5) {
    result.push({
      type: `${kind}_drop` as AnomalyType,
      metric,
      severity: ratio <= 0.25 ? "high" : "notable",
      observedValue: observed,
      baselineValue: typical,
      percentageChange: percent(observed, typical),
      zScore: robustZ(observed, typical, baseline),
      startedAt: observedDay,
      explanation: `${metric === "views" ? "Views" : "Clones"} fell to ${observed} on ${observedDay}, versus a ${typical}-per-day median over the preceding week.`,
    });
  }

  // Compare full seven-day periods only. Partial history must not look like a drop.
  const current = Array.from({ length: 7 }, (_, index) =>
    days.get(dayKey(completed - index * DAY_MS))
  );
  const prior = Array.from({ length: 7 }, (_, index) =>
    days.get(dayKey(completed - (index + 7) * DAY_MS))
  );
  if (
    metric === "views" &&
    current.every((value) => value !== undefined) &&
    prior.every((value) => value !== undefined)
  ) {
    const currentTotal = sum(current as number[]);
    const priorTotal = sum(prior as number[]);
    if (
      priorTotal >= 25 &&
      Math.abs(currentTotal - priorTotal) >= 25 &&
      (currentTotal >= priorTotal * 1.5 || currentTotal <= priorTotal * 0.5)
    ) {
      result.push({
        type: "period_change",
        metric,
        severity: "notable",
        observedValue: currentTotal,
        baselineValue: priorTotal,
        percentageChange: percent(currentTotal, priorTotal),
        zScore: null,
        startedAt: dayKey(completed - 6 * DAY_MS),
        explanation: `Views totaled ${currentTotal} over seven complete days, compared with ${priorTotal} in the previous seven days.`,
      });
    }
  }
  return result;
}

const EXTERNAL_ATTRIBUTION_PLATFORMS: Array<{
  match: RegExp;
  platform: string;
  searchUrl: (domain: string, repo?: string) => string;
}> = [
  {
    match: /news\.ycombinator\.com/i,
    platform: "Hacker News",
    searchUrl: (_domain, repo) =>
      repo
        ? `https://hn.algolia.com/?q=${encodeURIComponent(repo)}`
        : "https://news.ycombinator.com",
  },
  {
    match: /(^|\.)reddit\.com$/i,
    platform: "Reddit",
    searchUrl: (_domain, repo) =>
      repo
        ? `https://www.reddit.com/search/?q=${encodeURIComponent(repo)}`
        : "https://www.reddit.com",
  },
  {
    match: /^(x\.com|twitter\.com|t\.co)$/i,
    platform: "X / Twitter",
    searchUrl: (_domain, repo) =>
      repo ? `https://x.com/search?q=${encodeURIComponent(repo)}` : "https://x.com",
  },
  {
    match: /^dev\.to$/i,
    platform: "DEV Community",
    searchUrl: (_domain, repo) =>
      repo ? `https://dev.to/search?q=${encodeURIComponent(repo)}` : "https://dev.to",
  },
  {
    match: /^producthunt\.com$/i,
    platform: "Product Hunt",
    searchUrl: (_domain, repo) =>
      repo
        ? `https://www.producthunt.com/search?q=${encodeURIComponent(repo)}`
        : "https://www.producthunt.com",
  },
  {
    match: /^lobste\.rs$/i,
    platform: "Lobsters",
    searchUrl: (_domain, repo) =>
      repo ? `https://lobste.rs/search?q=${encodeURIComponent(repo)}` : "https://lobste.rs",
  },
];

export function resolveAttribution(
  referrerDomain: string,
  repository?: string
): { platform: string; searchUrl?: string; verifiedQuery?: string } | undefined {
  const match = EXTERNAL_ATTRIBUTION_PLATFORMS.find((p) => p.match.test(referrerDomain));
  if (!match) return undefined;
  return {
    platform: match.platform,
    searchUrl: match.searchUrl(referrerDomain, repository),
    verifiedQuery: repository,
  };
}

function weekendSignals(points: DailyMetric[], now: Date): GrowthAnomaly[] {
  const days = sanitizedDaily(points);
  const completed = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - DAY_MS;

  const weekendCounts: number[] = [];
  const weekdayCounts: number[] = [];
  let latestWeekendDay: string | null = null;

  for (let offset = 0; offset < 14; offset++) {
    const time = completed - offset * DAY_MS;
    const day = dayKey(time);
    const count = days.get(day);
    if (count === undefined) continue;

    const dayOfWeek = new Date(time).getUTCDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      weekendCounts.push(count);
      if (!latestWeekendDay) {
        latestWeekendDay = day;
      }
    } else {
      weekdayCounts.push(count);
    }
  }

  if (weekendCounts.length < 2 || weekdayCounts.length < 5 || !latestWeekendDay) {
    return [];
  }

  const weekdayAvg = sum(weekdayCounts) / weekdayCounts.length;
  const weekendAvg = sum(weekendCounts) / weekendCounts.length;

  if (weekdayAvg <= 0 || weekdayAvg < 5) {
    return [];
  }

  const ratio = weekendAvg / weekdayAvg;
  const delta = weekendAvg - weekdayAvg;

  if (ratio >= 2.0 && delta >= 10) {
    const formattedRatio = round(ratio);
    return [
      {
        type: "weekend_surge",
        metric: "views",
        severity: ratio >= 3.0 ? "high" : "notable",
        observedValue: round(weekendAvg),
        baselineValue: round(weekdayAvg),
        percentageChange: percent(weekendAvg, weekdayAvg),
        zScore: null,
        startedAt: latestWeekendDay,
        explanation: `Weekend traffic averaged ${round(weekendAvg)} views/day, observed at ${formattedRatio}x the weekday baseline (${round(weekdayAvg)} views/day).`,
      },
    ];
  }

  return [];
}

function starSignals(stars: StarPoint[], now: Date): GrowthAnomaly[] {
  const current = starsGained(stars, 7, now);
  const previous = starsGained(stars, 7, new Date(now.getTime() - 7 * DAY_MS));
  if (current === null || previous === null) return [];
  const accelerating = current >= 10 && current >= Math.max(1, previous) * 2;
  const decelerating = previous >= 10 && current <= previous * 0.5;
  if (!accelerating && !decelerating) return [];
  return [
    {
      type: accelerating ? "star_acceleration" : "star_deceleration",
      metric: "stars",
      severity:
        (accelerating && current >= previous * 3) || (decelerating && current <= previous * 0.25)
          ? "high"
          : "notable",
      observedValue: current,
      baselineValue: previous,
      percentageChange: percent(current, previous),
      zScore: null,
      startedAt: dayKey(now.getTime() - 7 * DAY_MS),
      explanation: `Star growth was +${current} in the latest complete seven-day window versus +${previous} in the prior seven days.`,
    },
  ];
}

function namedCounts(items: NamedCount[]): Map<string, number> {
  const values = new Map<string, number>();
  for (const item of items) {
    if (item.name && Number.isFinite(item.count) && item.count >= 0)
      values.set(item.name, item.count);
  }
  return values;
}

function referralSignals(
  windows: ComparisonWindow,
  day: string,
  repository?: string
): GrowthAnomaly[] {
  const previous = namedCounts(windows.previous);
  const current = namedCounts(windows.current);
  const previousTotal = sum([...previous.values()]);
  const currentTotal = sum([...current.values()]);
  if (currentTotal < 20) return [];
  const result: GrowthAnomaly[] = [];
  const top = [...current].sort((a, b) => b[1] - a[1])[0];
  if (top && !previous.has(top[0]) && top[1] >= 10 && top[1] / currentTotal >= 0.15) {
    const attribution = resolveAttribution(top[0], repository);
    result.push({
      type: "new_top_referrer",
      metric: "referrers",
      severity: "notable",
      observedValue: top[1],
      baselineValue: 0,
      percentageChange: null,
      zScore: null,
      startedAt: day,
      attribution,
      explanation: attribution
        ? `${top[0]} (${attribution.platform}) leads the current captured top-referrer list with ${top[1]} views and was absent from the previous captured list. Public mentions can be verified on ${attribution.platform}.`
        : `${top[0]} leads the current captured top-referrer list with ${top[1]} views and was absent from the previous captured list.`,
    });
  }
  if (previousTotal >= 20) {
    for (const [name, count] of current) {
      const old = previous.get(name);
      if (old === undefined || count < 10) continue;
      const beforeShare = old / previousTotal;
      const afterShare = count / currentTotal;
      if (Math.abs(afterShare - beforeShare) < 0.2) continue;
      const attribution = resolveAttribution(name, repository);
      result.push({
        type: "referrer_share_change",
        metric: "referrers",
        severity: "notable",
        observedValue: round(afterShare * 100),
        baselineValue: round(beforeShare * 100),
        percentageChange: percent(afterShare, beforeShare),
        zScore: null,
        startedAt: day,
        attribution,
        explanation: `${name}'s share of captured top-referrer counts changed from ${round(beforeShare * 100)}% to ${round(afterShare * 100)}% between comparison windows.`,
      });
    }
  }
  return result;
}

function pathSignals(windows: ComparisonWindow, day: string): GrowthAnomaly[] {
  const before = namedCounts(windows.previous);
  const result: GrowthAnomaly[] = [];
  for (const [path, count] of namedCounts(windows.current)) {
    const baseline = before.get(path) ?? 0;
    if (count < 10 || count - baseline < 10 || (baseline > 0 && count < baseline * 2)) continue;
    result.push({
      type: "popular_path_surge",
      metric: "paths",
      severity: count >= Math.max(30, baseline * 3) ? "high" : "notable",
      observedValue: count,
      baselineValue: baseline,
      percentageChange: percent(count, baseline),
      zScore: null,
      startedAt: day,
      explanation: `${path} received ${count} views in the current window versus ${baseline} in the previous window.`,
    });
  }
  return result;
}

/** Deterministic signals from complete UTC days and comparable observation windows. */
export function detectGrowthAnomalies(input: AnomalyInput, now = new Date()): GrowthAnomaly[] {
  const results = [
    ...dailySignals(input.views ?? [], "views", now),
    ...dailySignals(input.clones ?? [], "clones", now),
    ...weekendSignals(input.views ?? [], now),
    ...starSignals(input.stars ?? [], now),
    ...(input.referrers
      ? referralSignals(input.referrers, dayKey(now.getTime()), input.repository)
      : []),
    ...(input.paths ? pathSignals(input.paths, dayKey(now.getTime())) : []),
  ];
  if (!input.releases?.length) return results;
  return results.map((anomaly) => {
    const at = dateTime(anomaly.startedAt);
    const release = input.releases?.find(
      (candidate) => Math.abs(Date.parse(candidate.publishedAt) - at) <= 3 * DAY_MS
    );
    return release
      ? {
          ...anomaly,
          relatedRelease: release,
          explanation: `${anomaly.explanation} Release ${release.tagName} was published near this observation; this is a timing association, not evidence of cause.`,
        }
      : anomaly;
  });
}
