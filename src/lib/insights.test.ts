// SPDX-License-Identifier: MIT
import { describe, it, expect } from "vitest";
import {
  parseTrafficPayload,
  buildInsightsPrompt,
  InvalidInsightsPayloadError,
  type AggregatedTrafficPayload,
} from "./insights";

const validBody = {
  repoCount: 3,
  totalViews: 1200,
  totalUniques: 300,
  totalClones: 80,
  totalCloneUniques: 40,
  totalStars: 25,
  topReferrers: [{ referrer: "github.com", count: 500, uniques: 120 }],
  topPaths: [{ path: "/owner/repo", count: 800, uniques: 200 }],
  daily: [
    { date: "Jun 1", views: 100, uniques: 30 },
    { date: "Jun 2", views: 120, uniques: 35 },
  ],
};

describe("parseTrafficPayload", () => {
  it("parses and normalizes a valid payload", () => {
    const result = parseTrafficPayload(validBody);
    expect(result.totalViews).toBe(1200);
    expect(result.topReferrers).toHaveLength(1);
    expect(result.daily).toHaveLength(2);
  });

  it("coerces missing numeric fields to 0", () => {
    const result = parseTrafficPayload({ ...validBody, totalUniques: undefined });
    expect(result.totalUniques).toBe(0);
  });

  it("drops malformed referrer/path entries", () => {
    const result = parseTrafficPayload({
      ...validBody,
      topReferrers: [null, "bad", { referrer: "x.com", count: 5, uniques: 2 }],
    });
    expect(result.topReferrers).toEqual([{ referrer: "x.com", count: 5, uniques: 2 }]);
  });

  it("caps referrers and paths at 10", () => {
    const many = Array.from({ length: 20 }, (_, i) => ({
      referrer: `r${i}`,
      count: i,
      uniques: i,
    }));
    const result = parseTrafficPayload({ ...validBody, topReferrers: many });
    expect(result.topReferrers).toHaveLength(10);
  });

  it("throws for a non-object body", () => {
    expect(() => parseTrafficPayload(null)).toThrow(InvalidInsightsPayloadError);
    expect(() => parseTrafficPayload("nope")).toThrow(InvalidInsightsPayloadError);
  });

  it("throws when there is no traffic to summarize", () => {
    expect(() =>
      parseTrafficPayload({ ...validBody, totalViews: 0, totalClones: 0, daily: [] })
    ).toThrow(/No traffic data/);
  });

  it("defaults a missing referrer name to 'Direct'", () => {
    const result = parseTrafficPayload({
      ...validBody,
      topReferrers: [{ count: 3, uniques: 1 }],
    });
    expect(result.topReferrers[0].referrer).toBe("Direct");
  });

  it("coerces malformed daily/path/referrer numeric fields to 0", () => {
    const result = parseTrafficPayload({
      ...validBody,
      daily: [{ date: "Jun 3", views: "x", uniques: null }, null, 5],
      topPaths: [{ path: "/a" }],
      topReferrers: [{ referrer: "r" }],
    });
    expect(result.daily).toEqual([{ date: "Jun 3", views: 0, uniques: 0 }]);
    expect(result.topPaths[0]).toEqual({ path: "/a", count: 0, uniques: 0 });
    expect(result.topReferrers[0]).toEqual({ referrer: "r", count: 0, uniques: 0 });
  });

  it("treats non-array referrers/paths/daily as empty", () => {
    const result = parseTrafficPayload({
      ...validBody,
      topReferrers: "nope",
      topPaths: 42,
    });
    expect(result.topReferrers).toEqual([]);
    expect(result.topPaths).toEqual([]);
  });

  it("accepts a payload with only daily data (no totals)", () => {
    const result = parseTrafficPayload({
      repoCount: 1,
      totalViews: 0,
      totalClones: 0,
      daily: [{ date: "Jun 1", views: 10, uniques: 3 }],
    });
    expect(result.daily).toHaveLength(1);
  });
});

describe("buildInsightsPrompt", () => {
  it("includes the key aggregate figures and series", () => {
    const payload = parseTrafficPayload(validBody) as AggregatedTrafficPayload;
    const prompt = buildInsightsPrompt(payload);
    expect(prompt).toContain("Repositories analyzed: 3");
    expect(prompt).toContain("Total views (14d): 1200");
    expect(prompt).toContain("github.com (500 views)");
    expect(prompt).toContain("Jun 1: 100 views");
  });

  it("omits sections that have no data", () => {
    const payload = parseTrafficPayload({
      ...validBody,
      topReferrers: [],
      topPaths: [],
    });
    const prompt = buildInsightsPrompt(payload);
    expect(prompt).not.toContain("Top referrers");
    expect(prompt).not.toContain("Top pages");
  });
});
