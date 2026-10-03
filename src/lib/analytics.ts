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

function starCountAt(history: StarPoint[], date: Date): number | null {
  const boundary = date.toISOString().slice(0, 10);
  let observed: StarPoint | undefined;
  for (const point of history) {
    if (point.date <= boundary && (!observed || point.date > observed.date)) observed = point;
  }
  if (!observed) return null;
  const ageDays =
    (Date.parse(`${boundary}T00:00:00Z`) - Date.parse(`${observed.date}T00:00:00Z`)) / 86_400_000;
  return ageDays <= 1 ? observed.stars : null;
}

/** A complete window requires observations at both boundaries. */
export function starsGained(history: StarPoint[], days: number, now = new Date()): number | null {
  const start = new Date(now.getTime() - days * 86_400_000);
  const before = starCountAt(history, start);
  const after = starCountAt(history, now);
  return before === null || after === null ? null : Math.max(0, after - before);
}

export function compareStarPeriods(history: StarPoint[], days: number, now = new Date()) {
  const previousEnd = new Date(now.getTime() - days * 86_400_000);
  const current = starsGained(history, days, now);
  const previous = starsGained(history, days, previousEnd);
  return {
    current,
    previous,
    changePercent:
      current === null || previous === null ? null : calculatePercentageChange(current, previous),
  };
}

export function releaseWindow(history: StarPoint[], publishedAt: string, now = new Date()) {
  const releaseDate = new Date(publishedAt);
  if (
    Number.isNaN(releaseDate.getTime()) ||
    releaseDate.getTime() + 14 * 86_400_000 > now.getTime()
  )
    return null;
  const before = starsGained(history, 14, releaseDate);
  const after = starsGained(history, 14, new Date(releaseDate.getTime() + 14 * 86_400_000));
  if (before === null || after === null) return null;
  return {
    before,
    after,
    beforePerDay: Math.round((before / 14) * 10) / 10,
    afterPerDay: Math.round((after / 14) * 10) / 10,
    velocityChangePercent: calculatePercentageChange(after, before),
  };
}

export interface ReleaseImpactAnalysis {
  tagName: string;
  publishedAt: string;
  windowDays: number;
  beforeStars: number;
  afterStars: number;
  beforeDailyVelocity: number;
  afterDailyVelocity: number;
  velocityChangePercent: number | null;
  associationLabel: string;
}

/**
 * Deterministically analyzes star growth velocity before and after a release event.
 * Uses strictly non-causal temporal association language.
 */
export function calculateReleaseImpact(
  history: StarPoint[],
  release: { tagName?: string; tag?: string; name?: string | null; publishedAt: string },
  now = new Date()
): ReleaseImpactAnalysis | null {
  const rw = releaseWindow(history, release.publishedAt, now);
  if (!rw) return null;

  const tag = release.tagName || release.tag || release.name || "Release";
  let associationLabel = "Growth remained steady around this release window.";
  if (rw.velocityChangePercent !== null) {
    if (rw.velocityChangePercent >= 20) {
      associationLabel = `Growth accelerated around this release (+${rw.velocityChangePercent}%).`;
    } else if (rw.velocityChangePercent <= -20) {
      associationLabel = `Growth moderated around this release (${rw.velocityChangePercent}%).`;
    }
  }

  return {
    tagName: tag,
    publishedAt: release.publishedAt,
    windowDays: 14,
    beforeStars: rw.before,
    afterStars: rw.after,
    beforeDailyVelocity: rw.beforePerDay,
    afterDailyVelocity: rw.afterPerDay,
    velocityChangePercent: rw.velocityChangePercent,
    associationLabel,
  };
}

/**
 * Deterministic Repository Momentum computation.
 *
 * Formula components:
 * 1. 7-day stars gained (`growth7d`) as normalized weekly run-rate.
 * 2. 30-day baseline expected weekly rate: `expectedWeeklyRate = growth30d * (7 / 30)`.
 * 3. Acceleration ratio: `growth7d / Math.max(1, expectedWeeklyRate)`.
 * 4. Scale dampening factor: For repositories with fewer than 50 total stars, percentage
 *    fluctuations can be noisy; dampening scales from 0.2 to 1.0 (at >= 50 stars).
 * 5. Normalized Score (0 - 100): Combines absolute run-rate weight (40%) and acceleration weight (60%),
 *    bounded between 0 and 100.
 */
export interface RepoMomentum {
  score: number;
  stage: "accelerating" | "steady" | "cooling" | "dormant";
  accelerationRatio: number;
  weeklyRunRate: number;
  monthlyGrowth: number;
  description: string;
}

export function calculateRepoMomentum({
  currentStars,
  growth7d,
  growth30d,
}: {
  currentStars: number;
  growth7d: number;
  growth30d: number;
}): RepoMomentum {
  const g7 = Math.max(0, growth7d);
  const g30 = Math.max(0, growth30d);

  if (g7 === 0 && g30 === 0) {
    return {
      score: 0,
      stage: "dormant",
      accelerationRatio: 0,
      weeklyRunRate: 0,
      monthlyGrowth: 0,
      description: "Dormant star momentum with no recent star growth detected in the last 30 days.",
    };
  }

  const expectedWeekly = g30 * (7 / 30);
  const accelerationRatio =
    expectedWeekly > 0 ? Math.round((g7 / expectedWeekly) * 100) / 100 : g7 > 0 ? 2.0 : 1.0;

  // Scale dampening for small repos under 50 stars
  const scaleDampening = Math.min(1.0, Math.max(0.2, currentStars / 50));

  // Volume run rate (log scale: 100/wk gives ~50 pts)
  const volumeComponent = Math.min(50, Math.log10(Math.max(1, g7) + 1) * 25);
  // Acceleration ratio (1.0 = 25 pts, 2.0+ = 50 pts)
  const accelerationComponent = Math.min(50, accelerationRatio * 25);

  const rawScore = (volumeComponent + accelerationComponent) * scaleDampening;
  const score = Math.min(100, Math.max(0, Math.round(rawScore)));

  let stage: RepoMomentum["stage"] = "steady";
  let description = "Steady star trajectory tracking consistent with the 30-day baseline.";

  if (accelerationRatio >= 1.25 && g7 >= 3) {
    stage = "accelerating";
    description = `Star acquisition is accelerating at ${Math.round((accelerationRatio - 1) * 100)}% above its 30-day baseline rate.`;
  } else if (accelerationRatio < 0.75) {
    stage = "cooling";
    description = `Star acquisition has slowed to ${Math.round(accelerationRatio * 100)}% of its 30-day average.`;
  }

  return {
    score,
    stage,
    accelerationRatio,
    weeklyRunRate: g7,
    monthlyGrowth: g30,
    description,
  };
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
  starVelocityChangePercent?: number | null;
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

  const growth7d = starsGained(history, 7) ?? 0;
  const growth30d = starsGained(history, 30) ?? 0;

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

  if (
    input.starVelocityChangePercent !== undefined &&
    input.starVelocityChangePercent !== null &&
    Math.abs(input.starVelocityChangePercent) >= 5
  ) {
    const direction = input.starVelocityChangePercent > 0 ? "increased" : "decreased";
    highlights.push(
      `Star velocity ${direction} ${Math.abs(input.starVelocityChangePercent)}% this week compared with the previous week.`
    );
  }

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
      highlights.push(
        `Star count held steady with zero net gain over the past week (no positive star growth detected).`
      );
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
