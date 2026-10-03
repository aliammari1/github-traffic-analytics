// SPDX-License-Identifier: MIT
import { describe, expect, it } from "vitest";
import { renderComparisonCard } from "./comparison-card";

describe("renderComparisonCard", () => {
  it("renders two repository metrics in an accessible SVG", () => {
    const svg = renderComparisonCard(
      {
        fullName: "vercel/next.js",
        starsCount: 125000,
        growth7d: 120,
        growth30d: 500,
        weeklyVelocity: 120,
      },
      {
        fullName: "nuxt/nuxt",
        starsCount: 60000,
        growth7d: 80,
        growth30d: 310,
        weeklyVelocity: 80,
      }
    );

    expect(svg).toContain('role="img"');
    expect(svg).toContain("vercel/next.js");
    expect(svg).toContain("nuxt/nuxt");
    expect(svg).toContain("+500 stars / 30d");
    expect(svg).toContain("+310 stars / 30d");
    expect(svg).toContain("Bar length compares recent 30-day star growth");
  });

  it("escapes repository-controlled text", () => {
    const svg = renderComparisonCard(
      {
        fullName: 'owner/<script>alert("x")</script>',
        starsCount: 1,
        growth7d: 0,
        growth30d: 0,
        weeklyVelocity: 0,
      },
      {
        fullName: "safe/repo",
        starsCount: 2,
        growth7d: 1,
        growth30d: 2,
        weeklyVelocity: 1,
      },
      "nord"
    );

    expect(svg).toContain("&lt;script&gt;");
    expect(svg).not.toContain("<script>");
    expect(svg).toContain("#2e3440");
  });
});
