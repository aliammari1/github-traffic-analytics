// SPDX-License-Identifier: MIT
import { GROWTH_CARD_THEMES, type GrowthCardTheme } from "./growth-card";

export interface ComparisonCardRepo {
  fullName: string;
  starsCount: number;
  growth7d: number;
  growth30d: number;
  weeklyVelocity: number;
}

function escapeXml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[char] ?? char
  );
}

function formatSigned(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toLocaleString("en-US")}`;
}

function growthBarWidth(value: number, maxValue: number): number {
  if (maxValue <= 0 || value <= 0) return 0;
  return Math.max(8, Math.round((value / maxValue) * 220));
}

export function renderComparisonCard(
  left: ComparisonCardRepo,
  right: ComparisonCardRepo,
  theme: GrowthCardTheme = "github-dark"
): string {
  const palette = GROWTH_CARD_THEMES[theme];
  const maxGrowth = Math.max(left.growth30d, right.growth30d, 0);
  const leftBar = growthBarWidth(left.growth30d, maxGrowth);
  const rightBar = growthBarWidth(right.growth30d, maxGrowth);
  const title = `${left.fullName} vs ${right.fullName} GitHub growth comparison`;
  const description =
    `${left.fullName}: ${left.starsCount.toLocaleString("en-US")} stars, ${formatSigned(left.growth30d)} in 30 days. ` +
    `${right.fullName}: ${right.starsCount.toLocaleString("en-US")} stars, ${formatSigned(right.growth30d)} in 30 days.`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="660" height="224" viewBox="0 0 660 224" role="img" aria-labelledby="title desc">
<title id="title">${escapeXml(title)}</title>
<desc id="desc">${escapeXml(description)}</desc>
<rect x="0.5" y="0.5" width="659" height="223" rx="14" fill="${palette.background}" stroke="${palette.border}"/>
<text x="24" y="32" fill="${palette.muted}" font-family="Arial, sans-serif" font-size="12" font-weight="600">PUBLIC REPOSITORY GROWTH COMPARISON</text>

<text x="24" y="66" fill="${palette.foreground}" font-family="Arial, sans-serif" font-size="17" font-weight="700">${escapeXml(left.fullName)}</text>
<text x="24" y="96" fill="${palette.foreground}" font-family="Arial, sans-serif" font-size="22" font-weight="700">★ ${escapeXml(left.starsCount.toLocaleString("en-US"))}</text>
<text x="24" y="120" fill="${palette.accent}" font-family="Arial, sans-serif" font-size="13" font-weight="600">${escapeXml(formatSigned(left.growth30d))} stars / 30d</text>
<text x="24" y="141" fill="${palette.muted}" font-family="Arial, sans-serif" font-size="12">${escapeXml(formatSigned(left.growth7d))} / 7d · ~${escapeXml(left.weeklyVelocity.toLocaleString("en-US"))}/wk</text>
<rect x="24" y="155" width="220" height="7" rx="3.5" fill="${palette.border}"/>
<rect x="24" y="155" width="${leftBar}" height="7" rx="3.5" fill="${palette.accent}"/>

<text x="330" y="104" text-anchor="middle" fill="${palette.muted}" font-family="Arial, sans-serif" font-size="12" font-weight="700">VS</text>

<text x="416" y="66" fill="${palette.foreground}" font-family="Arial, sans-serif" font-size="17" font-weight="700">${escapeXml(right.fullName)}</text>
<text x="416" y="96" fill="${palette.foreground}" font-family="Arial, sans-serif" font-size="22" font-weight="700">★ ${escapeXml(right.starsCount.toLocaleString("en-US"))}</text>
<text x="416" y="120" fill="${palette.accent}" font-family="Arial, sans-serif" font-size="13" font-weight="600">${escapeXml(formatSigned(right.growth30d))} stars / 30d</text>
<text x="416" y="141" fill="${palette.muted}" font-family="Arial, sans-serif" font-size="12">${escapeXml(formatSigned(right.growth7d))} / 7d · ~${escapeXml(right.weeklyVelocity.toLocaleString("en-US"))}/wk</text>
<rect x="416" y="155" width="220" height="7" rx="3.5" fill="${palette.border}"/>
<rect x="416" y="155" width="${rightBar}" height="7" rx="3.5" fill="${palette.accent}"/>

<text x="24" y="196" fill="${palette.muted}" font-family="Arial, sans-serif" font-size="11">Bar length compares recent 30-day star growth, not overall project quality.</text>
<text x="636" y="196" text-anchor="end" fill="${palette.muted}" font-family="Arial, sans-serif" font-size="11">GitHub Traffic Analytics</text>
</svg>`;
}
