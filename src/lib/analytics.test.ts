// SPDX-License-Identifier: MIT
import { describe, it, expect } from "vitest";
import {
  parseRepoInput,
  calculatePercentageChange,
  calculateMovingAverage,
  calculateStarVelocity,
  detectTrafficSpikes,
  comparePeriods,
  generateChangeHighlights,
} from "./analytics";

describe("analytics layer", () => {
  describe("parseRepoInput", () => {
    it("parses plain owner/repo strings", () => {
      expect(parseRepoInput("vercel/next.js")).toEqual({ owner: "vercel", repo: "next.js" });
      expect(parseRepoInput("facebook/react")).toEqual({ owner: "facebook", repo: "react" });
      expect(parseRepoInput("astral-sh/ruff")).toEqual({ owner: "astral-sh", repo: "ruff" });
    });

    it("parses full HTTPS and HTTP GitHub URLs", () => {
      expect(parseRepoInput("https://github.com/vercel/next.js")).toEqual({
        owner: "vercel",
        repo: "next.js",
      });
      expect(parseRepoInput("http://github.com/facebook/react/")).toEqual({
        owner: "facebook",
        repo: "react",
      });
      expect(parseRepoInput("https://www.github.com/astral-sh/ruff")).toEqual({
        owner: "astral-sh",
        repo: "ruff",
      });
    });

    it("handles trailing .git, subpaths, and whitespace", () => {
      expect(parseRepoInput("  vercel/next.js.git  ")).toEqual({
        owner: "vercel",
        repo: "next.js",
      });
      expect(parseRepoInput("https://github.com/vercel/next.js/tree/main")).toEqual({
        owner: "vercel",
        repo: "next.js",
      });
    });

    it("returns null for invalid inputs", () => {
      expect(parseRepoInput("")).toBeNull();
      expect(parseRepoInput("   ")).toBeNull();
      expect(parseRepoInput("just-owner")).toBeNull();
      expect(parseRepoInput("https://gitlab.com/owner/repo")).toBeNull();
      expect(parseRepoInput("-invalid-owner/repo")).toBeNull();
      expect(parseRepoInput("owner/invalid repo with spaces")).toBeNull();
    });
  });

  describe("calculatePercentageChange", () => {
    it("computes positive and negative percentage changes", () => {
      expect(calculatePercentageChange(150, 100)).toBe(50);
      expect(calculatePercentageChange(75, 100)).toBe(-25);
      expect(calculatePercentageChange(100, 100)).toBe(0);
    });

    it("handles zero edge cases", () => {
      expect(calculatePercentageChange(0, 0)).toBe(0);
      expect(calculatePercentageChange(100, 0)).toBeNull();
      expect(calculatePercentageChange(0, 100)).toBe(-100);
    });
  });

  describe("calculateMovingAverage", () => {
    it("computes simple rolling average", () => {
      expect(calculateMovingAverage([10, 20, 30, 40, 50], 3)).toEqual([10, 15, 20, 30, 40]);
    });

    it("handles empty or single item arrays", () => {
      expect(calculateMovingAverage([])).toEqual([]);
      expect(calculateMovingAverage([5], 3)).toEqual([5]);
      expect(calculateMovingAverage([10, 20], 1)).toEqual([10, 20]);
    });
  });

  describe("calculateStarVelocity", () => {
    it("computes velocity from star trajectory points", () => {
      const now = new Date();
      const d = (daysAgo: number) => {
        const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
        return date.toISOString().slice(0, 10);
      };

      const points = [
        { date: d(35), stars: 100 },
        { date: d(30), stars: 120 },
        { date: d(7), stars: 180 },
        { date: d(0), stars: 200 },
      ];

      const res = calculateStarVelocity(points, 200);
      expect(res.currentStars).toBe(200);
      expect(res.growth7d).toBe(20);
      expect(res.growth30d).toBe(80);
      expect(res.dailyVelocity).toBeCloseTo(2.9, 1);
      expect(res.weeklyVelocity).toBe(20);
    });

    it("handles empty points list gracefully", () => {
      const res = calculateStarVelocity([], 50);
      expect(res.currentStars).toBe(50);
      expect(res.growth7d).toBe(0);
      expect(res.growth30d).toBe(0);
      expect(res.weeklyVelocity).toBe(0);
    });
  });

  describe("detectTrafficSpikes", () => {
    it("identifies anomalous traffic peaks exceeding baseline", () => {
      const points = [
        { date: "2026-09-01", count: 20 },
        { date: "2026-09-02", count: 22 },
        { date: "2026-09-03", count: 21 },
        { date: "2026-09-04", count: 25 },
        { date: "2026-09-05", count: 120 }, // Spike!
        { date: "2026-09-06", count: 24 },
      ];

      const spikes = detectTrafficSpikes(points, 2.0);
      expect(spikes).toHaveLength(1);
      expect(spikes[0].date).toBe("2026-09-05");
      expect(spikes[0].count).toBe(120);
      expect(spikes[0].multiplier).toBeGreaterThanOrEqual(2.0);
    });

    it("returns empty when traffic is steady", () => {
      const points = [
        { date: "2026-09-01", count: 50 },
        { date: "2026-09-02", count: 52 },
        { date: "2026-09-03", count: 48 },
        { date: "2026-09-04", count: 55 },
      ];
      expect(detectTrafficSpikes(points)).toEqual([]);
    });
  });

  describe("comparePeriods", () => {
    it("calculates differences between two periods", () => {
      const current = { views: 3000, viewUniques: 1000, clones: 150, cloneUniques: 75 };
      const previous = { views: 2000, viewUniques: 800, clones: 200, cloneUniques: 80 };

      const comparison = comparePeriods(current, previous);
      expect(comparison.viewsChangePercent).toBe(50);
      expect(comparison.uniquesChangePercent).toBe(25);
      expect(comparison.clonesChangePercent).toBe(-25);
    });
  });

  describe("generateChangeHighlights", () => {
    it("builds clear, human-readable bullet highlights", () => {
      const highlights = generateChangeHighlights({
        repoName: "next.js",
        currentStars: 125000,
        starVelocity: {
          currentStars: 125000,
          growth7d: 350,
          growth30d: 1400,
          weeklyVelocity: 350,
          dailyVelocity: 50,
        },
        periodComparison: {
          viewsChangePercent: 32.5,
          uniquesChangePercent: 20,
          clonesChangePercent: -5,
        },
        spikes: [{ date: "2026-09-12", count: 4500, baseline: 1200, multiplier: 3.8 }],
        topReferrer: { name: "news.ycombinator.com", count: 2100 },
        recentRelease: { name: "v16.3.0", tag: "v16.3.0", publishedAt: "2026-09-10T12:00:00Z" },
        isTrackingActive: false,
      });

      expect(highlights.length).toBeGreaterThanOrEqual(5);
      expect(highlights.some((h) => h.includes("Traffic increased 32.5%"))).toBe(true);
      expect(highlights.some((h) => h.includes("news.ycombinator.com"))).toBe(true);
      expect(
        highlights.some((h) => h.includes("growth activity tracked around this release"))
      ).toBe(true);
      expect(highlights.some((h) => h.includes("Historical persistence is not enabled yet"))).toBe(
        true
      );
    });

    it("handles negative percentage changes and alternative branches in highlights", () => {
      const highlights = generateChangeHighlights({
        repoName: "test",
        periodComparison: {
          viewsChangePercent: -20,
          uniquesChangePercent: -15,
          clonesChangePercent: 10,
        },
        starVelocity: {
          currentStars: 100,
          growth7d: 0,
          growth30d: 0,
          weeklyVelocity: 0,
          dailyVelocity: 0,
        },
        isTrackingActive: true,
      });

      expect(highlights.some((h) => h.includes("Traffic declined 20%"))).toBe(true);
      expect(highlights.some((h) => h.includes("Repository has 100 total stars."))).toBe(true);

      const stableHighlights = generateChangeHighlights({
        repoName: "test",
        periodComparison: {
          viewsChangePercent: 0,
          uniquesChangePercent: 0,
          clonesChangePercent: 0,
        },
      });
      expect(stableHighlights.some((h) => h.includes("Traffic remained stable"))).toBe(true);
    });
  });
});
