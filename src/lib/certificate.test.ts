// SPDX-License-Identifier: MIT
import { describe, expect, it } from "vitest";
import { renderCertificate } from "./certificate";

describe("renderCertificate", () => {
  it("renders an escaped, shareable social certificate with verified figures", () => {
    const svg = renderCertificate({
      fullName: "alice/<script>",
      milestone: 1000,
      starsCount: 1342,
      growth7d: 81,
      issuedOn: "2026-10-03",
    });
    expect(svg).toContain('width="1200" height="630"');
    expect(svg).toContain("alice/&lt;script&gt;");
    expect(svg).toContain("1,000 GitHub stars");
    expect(svg).toContain("+81 in 7 days");
    expect(svg).not.toContain("<script>");
  });
});
