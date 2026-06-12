// SPDX-License-Identifier: MIT
import { describe, it, expect } from "vitest";
import { formatCount, renderBadge, renderViewsBadge } from "./badge";

describe("formatCount", () => {
  it("passes through small numbers", () => {
    expect(formatCount(0)).toBe("0");
    expect(formatCount(42)).toBe("42");
    expect(formatCount(999)).toBe("999");
  });

  it("abbreviates thousands and millions", () => {
    expect(formatCount(1200)).toBe("1.2k");
    expect(formatCount(12000)).toBe("12k");
    expect(formatCount(2_500_000)).toBe("2.5M");
  });

  it("clamps invalid input to 0", () => {
    expect(formatCount(-5)).toBe("0");
    expect(formatCount(Number.NaN)).toBe("0");
  });
});

describe("renderBadge", () => {
  it("produces valid SVG containing the label and value", () => {
    const svg = renderBadge("repo views", "1.2k");
    expect(svg).toContain("<svg");
    expect(svg).toContain("</svg>");
    expect(svg).toContain("repo views");
    expect(svg).toContain("1.2k");
  });

  it("escapes XML-unsafe characters", () => {
    const svg = renderBadge("a&b", "<x>");
    expect(svg).toContain("a&amp;b");
    expect(svg).toContain("&lt;x&gt;");
    expect(svg).not.toContain("<x>");
  });
});

describe("renderViewsBadge", () => {
  it("labels the badge and formats the count", () => {
    const svg = renderViewsBadge(34000);
    expect(svg).toContain("repo views");
    expect(svg).toContain("34k");
  });
});
