// SPDX-License-Identifier: MIT

/**
 * Deterministic analytics layer for repository growth and traffic.
 * Pure TypeScript functions with zero external dependencies, designed for
 * reuse across the web dashboard, CLI tools, GitHub Actions, and LLM input prep.
 */

export interface RepoIdentifier {
  owner: string;
  repo: string;
}

export interface StarPoint {
  date: string; // YYYY-MM-DD
  stars: number;
}

export interface StarVelocityResult {
  currentStars: number;
  growth7d: number;
  growth30d: number;
  weeklyVelocity: number; // stars gained per 7 days on average
  dailyVelocity: number;
}

export interface TrafficPoint {
  date: string; // YYYY-MM-DD or ISO
  count: number;
  uniques?: number;
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
}

export interface HighlightInput {
  repoName: string;
  currentStars?: number;
  starVelocity?: StarVelocityResult;
  periodComparison?: PeriodComparisonResult;
  spikes?: SpikeDetectionResult[];
  topReferrer?: { name: string; count: number };
  recentRelease?: { name: string; tag: string; publishedAt: string };
  isTrackingActive?: boolean;
}

/**
 * Parse flexible user input into a canonical GitHub { owner, repo }.
 * Accepts:
 * - "owner/repo"
 * - "https://github.com/owner/repo"
 * - "http://github.com/owner/repo"
 * - "github.com/owner/repo"
 * - "owner/repo.git"
 * - trailing slashes or subpaths (e.g. /tree/main, /issues)
 */
export function parseRepoInput(input: string): RepoIdentifier | null {
  if (!input || typeof input !== "string") return null;

  let cleaned = input.trim();
  if (!cleaned) return null;

  // Strip protocol and domain if present
  cleaned = cleaned.replace(/^(?:https?:\/\/)?(?:www\.)?github\.com\//i, "");

  // Strip leading slash if any
  cleaned = cleaned.replace(/^\/+/, "");

  // Strip .git extension if present
  cleaned = cleaned.replace(/\.git$/i, "");

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
 * Returns null if previous is 0 and current is 0, or handles edge cases cleanly.
 */
export function calculatePercentageChange(current: number, previous: number): number | null {
  if (previous === 0) {
    if (current === 0) return 0;
    return null; // Cannot divide by zero; represents new baseline from zero
  }
  const change = ((current - previous) / previous) * 100;
  return Math.round(change * 10) / 10;
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
 * Compute star growth rates and velocities from a timeline of star points.
 */
export function calculateStarVelocity(
  points: StarPoint[],
  currentTotal?: number
): StarVelocityResult {
  if (!points || points.length === 0) {
    const stars = currentTotal ?? 0;
    return {
      currentStars: stars,
      growth7d: 0,
      growth30d: 0,
      weeklyVelocity: 0,
      dailyVelocity: 0,
    };
  }

  // Sort chronological
  const sorted = [...points].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const latestStars = currentTotal ?? sorted[sorted.length - 1].stars;
  const now = new Date(sorted[sorted.length - 1].date).getTime();

  const ms7d = 7 * 24 * 60 * 60 * 1000;
  const ms30d = 30 * 24 * 60 * 60 * 1000;

  // Find point closest to 7 days before latest
  const point7d = sorted.find((p) => now - new Date(p.date).getTime() <= ms7d);
  // Find point closest to 30 days before latest
  const point30d = sorted.find((p) => now - new Date(p.date).getTime() <= ms30d);

  const base7d = point7d ? point7d.stars : sorted[0].stars;
  const base30d = point30d ? point30d.stars : sorted[0].stars;

  const growth7d = Math.max(0, latestStars - base7d);
  const growth30d = Math.max(0, latestStars - base30d);

  const dailyVelocity = Math.round((growth7d / 7) * 10) / 10;
  const weeklyVelocity = Math.round(growth7d * 10) / 10;

  return {
    currentStars: latestStars,
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
    const pct = input.periodComparison.viewsChangePercent;
    if (pct > 0) {
      highlights.push(`Traffic increased ${pct}% compared to the prior period.`);
    } else if (pct < 0) {
      highlights.push(`Traffic declined ${Math.abs(pct)}% compared to the prior period.`);
    } else {
      highlights.push(`Traffic remained stable across the comparison period.`);
    }
  }

  // 2. Star growth & velocity highlights
  if (input.starVelocity) {
    const { weeklyVelocity, growth30d, currentStars } = input.starVelocity;
    if (growth30d > 0) {
      highlights.push(
        `Added ${growth30d.toLocaleString()} stars over the last 30 days (~${weeklyVelocity} stars/week), reaching ${currentStars.toLocaleString()} total stars.`
      );
    } else if (currentStars > 0) {
      highlights.push(`Repository has ${currentStars.toLocaleString()} total stars.`);
    }
  }

  // 3. Traffic spike highlights
  if (input.spikes && input.spikes.length > 0) {
    const latestSpike = input.spikes[input.spikes.length - 1];
    highlights.push(
      `Notable traffic spike on ${latestSpike.date}: ${latestSpike.count.toLocaleString()} views (${latestSpike.multiplier}x above normal baseline).`
    );
  }

  // 4. Acquisition / Referrer highlights
  if (input.topReferrer && input.topReferrer.count > 0) {
    highlights.push(
      `Top discovery channel: ${input.topReferrer.name} (${input.topReferrer.count.toLocaleString()} visits).`
    );
  }

  // 5. Release correlation highlights (strictly non-causal language)
  if (input.recentRelease) {
    highlights.push(
      `Release ${input.recentRelease.tag} published on ${input.recentRelease.publishedAt.slice(0, 10)}; growth activity tracked around this release.`
    );
  }

  // 6. 14-day tracking persistence reminder if not tracked
  if (input.isTrackingActive === false) {
    highlights.push(
      `Historical persistence is not enabled yet for this repository; GitHub will delete traffic data older than 14 days.`
    );
  }

  return highlights;
}
