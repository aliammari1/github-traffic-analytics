// SPDX-License-Identifier: MIT
import { describe, expect, it } from "vitest";
import { renderGrowthCard } from "./growth-card";

describe("renderGrowthCard", () => {
  const repo = {
    fullName: 'owner/<script>alert("x")</script>',
    starsCount: 12482,
    growth30d: 821,
    velocityChangePercent: 34,
    latestRelease: "v2.1",
  };

  it("produces an accessible SVG without interpreting repository-controlled text", () => {
    const svg = renderGrowthCard(repo, "github-dark");
    expect(svg).toContain('<svg xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toContain("&lt;script&gt;");
    expect(svg).not.toContain("<script>");
    expect(svg).toContain("12,482 stars");
    expect(svg).toContain("+821 stars / 30d");
    expect(svg).toContain("Latest release: v2.1");
  });

  it("uses the selected palette and handles unavailable growth honestly", () => {
    const svg = renderGrowthCard({ ...repo, growth30d: null, latestRelease: null }, "nord");
    expect(svg).toContain("#2e3440");
    expect(svg).toContain("30-day growth unavailable");
    expect(svg).not.toContain("Latest release:");
  });
});
