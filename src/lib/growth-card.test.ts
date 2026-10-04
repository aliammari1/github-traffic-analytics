// SPDX-License-Identifier: MIT
import { describe, expect, it } from "vitest";
import { buildSparklinePoints, renderGrowthCard } from "./growth-card";

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

  it("renders with tokyo-night and solarized-dark themes", () => {
    const tokyo = renderGrowthCard(repo, "tokyo-night");
    expect(tokyo).toContain("#1a1b26");
    expect(tokyo).toContain("#73daca");

    const solarized = renderGrowthCard(repo, "solarized-dark");
    expect(solarized).toContain("#002b36");
    expect(solarized).toContain("#2aa198");
  });

  it("renders a dependency-free sparkline from recent star history", () => {
    const history = [
      { date: "2026-09-01", stars: 100 },
      { date: "2026-09-15", stars: 125 },
      { date: "2026-10-01", stars: 180 },
    ];
    const points = buildSparklinePoints(history);
    expect(points).toBeTruthy();
    expect(points?.split(" ")).toHaveLength(3);

    const svg = renderGrowthCard(repo, "github-dark", { style: "sparkline", history });
    expect(svg).toContain("<polyline");
    expect(svg).toContain("Recent 30d star trend");
    expect(svg).toContain("Includes a recent star-growth sparkline");
  });

  it("degrades sparkline cards honestly when history is insufficient", () => {
    const svg = renderGrowthCard(repo, "github-dark", {
      style: "sparkline",
      history: [{ date: "2026-10-01", stars: 100 }],
    });
    expect(svg).toContain("Trend unavailable");
    expect(svg).not.toContain("<polyline");
  });
});
