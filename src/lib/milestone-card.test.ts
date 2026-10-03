// SPDX-License-Identifier: MIT
import { describe, expect, it } from "vitest";
import { formatMilestone, getHighestMilestone, renderMilestoneCard } from "./milestone-card";

describe("milestone cards", () => {
  it("selects the highest star milestone actually reached", () => {
    expect(getHighestMilestone(99)).toBeNull();
    expect(getHighestMilestone(100)).toBe(100);
    expect(getHighestMilestone(9_999)).toBe(5_000);
    expect(getHighestMilestone(125_000)).toBe(100_000);
  });

  it("formats milestone labels compactly", () => {
    expect(formatMilestone(500)).toBe("500");
    expect(formatMilestone(10_000)).toBe("10k");
    expect(formatMilestone(1_000_000)).toBe("1M");
  });

  it("renders an accessible, escaped milestone SVG", () => {
    const svg = renderMilestoneCard({
      fullName: 'owner/<repo & "friends">',
      starsCount: 125_000,
      milestone: 100_000,
      growth30d: 2_400,
      latestRelease: "v2.0.0",
    });

    expect(svg).toContain('role="img"');
    expect(svg).toContain("★ 100k+");
    expect(svg).toContain("Current public star count: 125,000");
    expect(svg).toContain("+2,400 stars in the recent 30-day window");
    expect(svg).toContain("&lt;repo &amp; &quot;friends&quot;&gt;");
    expect(svg).not.toContain("<repo");
  });
});
