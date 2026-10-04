// SPDX-License-Identifier: MIT
import { calculateRepoMomentum, calculateReleaseImpact, starsGained } from "./analytics";
import { detectGrowthAnomalies } from "./anomalies";
import type { PublicRepoAnalysis } from "./github-public";

/** Stable, compact projection shared by external developer interfaces. */
export function publicGrowthSummary(analysis: PublicRepoAnalysis, now = new Date()) {
  const growth7d = starsGained(analysis.starHistory, 7, now);
  const growth30d = starsGained(analysis.starHistory, 30, now);
  const momentum =
    growth7d !== null && growth30d !== null
      ? calculateRepoMomentum({
          currentStars: analysis.repository.starsCount,
          growth7d,
          growth30d,
        })
      : null;
  return {
    version: 1 as const,
    repository: {
      fullName: analysis.repository.fullName,
      description: analysis.repository.description,
      url: analysis.repository.htmlUrl,
      stars: analysis.repository.starsCount,
      forks: analysis.repository.forksCount,
      language: analysis.repository.language,
    },
    observation: {
      latestStarDay: analysis.starHistory.at(-1)?.date ?? null,
      starHistoryDays: analysis.starHistory.length,
    },
    growth: {
      stars7d: growth7d,
      stars30d: growth30d,
      weeklyRunRate: growth7d,
      momentum,
    },
    latestRelease: analysis.releases[0]
      ? {
          tagName: analysis.releases[0].tagName,
          publishedAt: analysis.releases[0].publishedAt,
          url: analysis.releases[0].htmlUrl,
          impact: calculateReleaseImpact(analysis.starHistory, analysis.releases[0], now),
        }
      : null,
  };
}

export function publicStarHistory(analysis: PublicRepoAnalysis, days: number, now = new Date()) {
  const threshold = new Date(now.getTime() - days * 86_400_000).toISOString().slice(0, 10);
  return {
    version: 1 as const,
    repository: analysis.repository.fullName,
    points: analysis.starHistory
      .filter((point) => point.date >= threshold)
      .map((point) => ({ day: point.date, stars: point.stars })),
    note: "Recent observed GitHub stargazer history; dates without observations are omitted.",
  };
}

export function publicReleaseImpact(analysis: PublicRepoAnalysis, tag: string, now = new Date()) {
  const release = analysis.releases.find((item) => item.tagName === tag);
  if (!release) return null;
  return {
    version: 1 as const,
    repository: analysis.repository.fullName,
    release: {
      tagName: release.tagName,
      name: release.name,
      publishedAt: release.publishedAt,
      url: release.htmlUrl,
    },
    impact: calculateReleaseImpact(analysis.starHistory, release, now),
    note: "The before/after comparison is temporal and does not establish cause. Null impact means a complete observation window is unavailable.",
  };
}

export function publicAnomalies(analysis: PublicRepoAnalysis, now = new Date()) {
  return {
    version: 1 as const,
    repository: analysis.repository.fullName,
    signals: detectGrowthAnomalies(
      { stars: analysis.starHistory, releases: analysis.releases },
      now
    )
      .filter((signal) => signal.metric === "stars")
      .slice(0, 10),
  };
}
