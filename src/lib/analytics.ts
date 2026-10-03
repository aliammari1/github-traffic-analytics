// SPDX-License-Identifier: MIT
/**
 * Deterministic analytics layer for GitHub repository telemetry.
 *
 * All calculations here are pure functions: deterministic, fast, testable,
 * and completely independent of any UI framework or external LLM service.
 */

export interface RepoIdentifier {
  owner: string;
  repo: string;
}

export interface MetricPoint {
  timestamp: string;
  count: number;
  uniques: number;
}

export interface StarPoint {
  date: string;
  stars: number;
}

export interface StarVelocityResult {
  currentStars: number;
  growth7d: number;
  growth30d: number;
  weeklyVelocity: number;
  dailyVelocity: number;
}

export interface TrafficPoint {
  date: string;
  count: number;
}

export interface SpikeDetectionResult {
  date: string;
  count: number;
  baseline: number;
  multiplier: number;
}

export interface PeriodMetrics {
  views: number;
  viewUniques: number;
  clones: number;
  cloneUniques: number;
}

export interface PeriodComparisonResult {
  viewsChangePercent: number | null;
  uniquesChangePercent: number | null;
  clonesChangePercent: number | null;
  cloneUniquesChangePercent: number | null;
}

export interface HighlightInput {
  repoName?: string;
  currentStars?: number;
  starVelocity?: StarVelocityResult;
  periodComparison?: PeriodComparisonResult;
  spikes?: SpikeDetectionResult[];
  recentRelease?: {
    name?: string | null;
    tag?: string;
    tagName?: string;
    publishedAt: string;
  } | null;
  topReferrer?: {
    referrer?: string;
    name?: string;
    count: number;
    uniques?: number;
  } | null;
  isTrackingEnabled?: boolean;
  isTrackingActive?: boolean;
}

/**
 * Robustly parses GitHub repository identifiers from arbitrary user input.
 * Accepts:
 * - "owner/repo"
 * - "https://github.com/owner/repo"
 * - "github.com/owner/repo"
 * - "owner/repo.git"
 * - "owner/repo.git/"
 */
export function parseRepoInput(input: string): RepoIdentifier | null {
  if (!input || typeof input !== "string") return null;

  let cleaned = input.trim();
  if (!cleaned) return null;

  // Strip protocol and domain if present
  cleaned = cleaned.replace(/^(?:https?:\/\/)?(?:www\.)?github\.com\//i, "");

  // Strip leading and trailing slashes
  cleaned = cleaned.replace(/^\/+|\/+$/g, "");

  // Strip .git extension if present at end or before a slash
  cleaned = cleaned.replace(/\.git(?:\/|$)/i, "");
  cleaned = cleaned.replace(/\/+$/g, "");

  // Extract owner and repo parts
  const parts = cleaned.split("/").filter(Boolean);
  if (parts.length < 2) return null;

  const owner = parts[0].trim();
  const repo = parts[1].trim();

  // Validate GitHub username / repo naming constraints
  // Owner: alphanumeric + single hyphens, 1-39 chars
  // Repo: alphanumeric + hyphens + underscores + dots, 1-100 chars
  const ownerRegex = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;
  const repoRegex = /^[a-zA-Z0-9_.-]{1,100}$/;

  if (!ownerRegex.test(owner) || !repoRegex.test(repo)) {
    return null;
  }

  return { owner, repo };
}

/**
 * Calculate the percentage change between current and previous values.
 * Returns 0 if both current and previous are 0; returns null if previous is 0 and current > 0.
 */
export function calculatePercentageChange(current: number, previous: number): number | null {
  if (previous === 0) {
    if (current === 0) return 0;
    return null;
  }
  const diff = current - previous;
  return Math.round((diff / previous) * 1000) / 10;
}

/**
 * Calculate simple moving average over an array of numbers.
 */
export function calculateMovingAverage(data: number[], windowSize = 3): number[] {
  if (!data || data.length === 0) return [];
  if (windowSize <= 1) return [...data];

  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - windowSize + 1);
    const window = data.slice(start, i + 1);
    const sum = window.reduce((acc, val) => acc + val, 0);
    result.push(Math.round((sum / window.length) * 10) / 10);
  }
  return result;
}

/**
 * Compute star growth rates and velocities over recent intervals.
 */
export function calculateStarVelocity(
  history: StarPoint[],
  currentStars: number
): StarVelocityResult {
  if (!history || history.length === 0) {
    return {
      currentStars,
      growth7d: 0,
      growth30d: 0,
      weeklyVelocity: 0,
      dailyVelocity: 0,
    };
  }

  const sorted = [...history].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const now = Date.now();
  const ms7d = 7 * 24 * 60 * 60 * 1000;
  const ms30d = 30 * 24 * 60 * 60 * 1000;

  const cutoff7d = now - ms7d;
  const cutoff30d = now - ms30d;

  // We want the latest observation at or before each cutoff as the baseline
  const point7d = [...sorted].reverse().find((p) => new Date(p.date).getTime() <= cutoff7d);
  const point30d = [...sorted].reverse().find((p) => new Date(p.date).getTime() <= cutoff30d);

  const base7d = point7d ? point7d.stars : sorted[0].stars;
  const base30d = point30d ? point30d.stars : sorted[0].stars;

  const growth7d = Math.max(0, currentStars - base7d);
  const growth30d = Math.max(0, currentStars - base30d);

  const weeklyVelocity = growth7d;
  const dailyVelocity = Math.round((growth7d / 7) * 10) / 10;

  return {
    currentStars,
    growth7d,
    growth30d,
    weeklyVelocity,
    dailyVelocity,
  };
}

/**
 * Detect days where traffic exceeded expected baseline.
 * Uses a baseline of moving average * thresholdMultiplier (default 2.0x, min difference 10).
 */
export function detectTrafficSpikes(
  points: TrafficPoint[],
  thresholdMultiplier = 2.0
): SpikeDetectionResult[] {
  if (!points || points.length < 3) return [];

  const counts = points.map((p) => p.count);
  const ma = calculateMovingAverage(counts, 5);

  const spikes: SpikeDetectionResult[] = [];

  for (let i = 0; i < points.length; i++) {
    const baseline = ma[Math.max(0, i - 1)];
    const count = points[i].count;

    if (baseline > 5 && count >= baseline * thresholdMultiplier && count - baseline >= 10) {
      spikes.push({
        date: points[i].date.slice(0, 10),
        count,
        baseline: Math.round(baseline),
        multiplier: Math.round((count / baseline) * 10) / 10,
      });
    }
  }

  return spikes;
}

/**
 * Compare two equivalent duration periods (e.g. this week vs last week).
 */
export function comparePeriods(
  current: PeriodMetrics,
  previous: PeriodMetrics
): PeriodComparisonResult {
  return {
    viewsChangePercent: calculatePercentageChange(current.views, previous.views),
    uniquesChangePercent: calculatePercentageChange(current.viewUniques, previous.viewUniques),
    clonesChangePercent: calculatePercentageChange(current.clones, previous.clones),
    cloneUniquesChangePercent: calculatePercentageChange(
      current.cloneUniques,
      previous.cloneUniques
    ),
  };
}

/**
 * Generate human-readable "What Changed" bullet highlights based purely on
 * deterministic calculations.
 */
export function generateChangeHighlights(input: HighlightInput): string[] {
  const highlights: string[] = [];

  // 1. Traffic comparison highlights
  if (
    input.periodComparison?.viewsChangePercent !== undefined &&
    input.periodComparison.viewsChangePercent !== null
  ) {
    const change = input.periodComparison.viewsChangePercent;
    if (Math.abs(change) >= 5) {
      const direction = change > 0 ? "increased" : "decreased";
      highlights.push(`Traffic ${direction} ${Math.abs(change)}% compared to the prior period.`);
    } else {
      highlights.push(`Traffic remained stable across the comparison period.`);
    }
  }

  // 2. Cloner changes
  if (
    input.periodComparison?.cloneUniquesChangePercent !== undefined &&
    input.periodComparison.cloneUniquesChangePercent !== null
  ) {
    const cloneChange = input.periodComparison.cloneUniquesChangePercent;
    if (Math.abs(cloneChange) >= 20) {
      const direction = cloneChange > 0 ? "grew" : "dropped";
      highlights.push(
        `Unique repository cloners ${direction} ${Math.abs(cloneChange)}% in the same window.`
      );
    }
  }

  // 3. Star velocity highlights
  if (input.starVelocity) {
    const { growth7d, dailyVelocity, currentStars } = input.starVelocity;
    if (growth7d > 0) {
      highlights.push(
        `Added +${growth7d.toLocaleString()} stars in the last 7 days (~${dailyVelocity}/day).`
      );
    } else if (currentStars > 0) {
      highlights.push(`Star count held steady with zero net gain over the past week.`);
    }
  }

  // 4. Traffic spike highlights
  if (input.spikes && input.spikes.length > 0) {
    const latestSpike = input.spikes[input.spikes.length - 1];
    highlights.push(
      `Notable traffic spike on ${latestSpike.date}: ${latestSpike.count.toLocaleString()} views (${latestSpike.multiplier}x above normal baseline).`
    );
  }

  // 5. Acquisition highlights
  if (input.topReferrer && input.topReferrer.count > 0) {
    const channelName = input.topReferrer.referrer || input.topReferrer.name || "Unknown channel";
    const uniquesText = input.topReferrer.uniques
      ? ` (${input.topReferrer.uniques.toLocaleString()} unique visitors)`
      : "";
    highlights.push(
      `Top acquisition channel is ${channelName} driving ${input.topReferrer.count.toLocaleString()} views${uniquesText}.`
    );
  }

  // 6. Release highlights
  if (input.recentRelease) {
    const relTag =
      input.recentRelease.tagName ||
      input.recentRelease.tag ||
      input.recentRelease.name ||
      "latest";
    highlights.push(
      `Recent release ${relTag} published on ${input.recentRelease.publishedAt.slice(0, 10)}.`
    );
  }

  // 7. Persistence status notice
  const isTracking = input.isTrackingEnabled ?? input.isTrackingActive ?? false;
  if (!isTracking) {
    highlights.push(
      `Historical persistence is not enabled yet for this repository; GitHub will delete traffic data older than 14 days.`
    );
  }

  return highlights;
}
