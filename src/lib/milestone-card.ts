// SPDX-License-Identifier: MIT
import { GROWTH_CARD_THEMES, type GrowthCardTheme } from "./growth-card";

export const STAR_MILESTONES = [
  100, 500, 1_000, 5_000, 10_000, 25_000, 50_000, 100_000, 250_000, 500_000, 1_000_000,
] as const;

export type StarMilestone = (typeof STAR_MILESTONES)[number];

export interface MilestoneCardData {
  fullName: string;
  starsCount: number;
  milestone: StarMilestone;
  growth30d: number | null;
  latestRelease: string | null;
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

export function getHighestMilestone(starsCount: number): StarMilestone | null {
  let reached: StarMilestone | null = null;
  for (const milestone of STAR_MILESTONES) {
    if (starsCount >= milestone) reached = milestone;
    else break;
  }
  return reached;
}

export function isStarMilestone(value: number): value is StarMilestone {
  return STAR_MILESTONES.includes(value as StarMilestone);
}

export function formatMilestone(value: number): string {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `${Number.isInteger(millions) ? millions : millions.toFixed(1)}M`;
  }
  if (value >= 1_000) {
    const thousands = value / 1_000;
    return `${Number.isInteger(thousands) ? thousands : thousands.toFixed(1)}k`;
  }
  return value.toLocaleString("en-US");
}

export function renderMilestoneCard(
  data: MilestoneCardData,
  theme: GrowthCardTheme = "github-dark"
): string {
  const palette = GROWTH_CARD_THEMES[theme];
  const milestoneLabel = formatMilestone(data.milestone);
  const title = `${data.fullName} reached ${milestoneLabel}+ GitHub stars`;
  const growth =
    data.growth30d === null
      ? "Recent growth unavailable"
      : `+${data.growth30d.toLocaleString("en-US")} stars in the recent 30-day window`;
  const release = data.latestRelease ? `Latest release: ${data.latestRelease}` : null;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="320" viewBox="0 0 640 320" role="img" aria-labelledby="title desc">
<title id="title">${escapeXml(title)}</title>
<desc id="desc">${escapeXml(
    `${data.fullName} has ${data.starsCount.toLocaleString("en-US")} GitHub stars. ${growth}${release ? `. ${release}` : ""}`
  )}</desc>
<defs>
  <linearGradient id="glow" x1="0" x2="1">
    <stop offset="0%" stop-color="${palette.accent}" stop-opacity="0.25"/>
    <stop offset="100%" stop-color="${palette.accent}" stop-opacity="0"/>
  </linearGradient>
</defs>
<rect x="0.5" y="0.5" width="639" height="319" rx="18" fill="${palette.background}" stroke="${palette.border}"/>
<circle cx="548" cy="64" r="108" fill="url(#glow)"/>
<text x="32" y="42" fill="${palette.muted}" font-family="Arial, sans-serif" font-size="12" font-weight="700" letter-spacing="1.5">OPEN SOURCE MILESTONE</text>
<text x="32" y="78" fill="${palette.foreground}" font-family="Arial, sans-serif" font-size="20" font-weight="700">${escapeXml(data.fullName)}</text>
<text x="32" y="160" fill="${palette.accent}" font-family="Arial, sans-serif" font-size="62" font-weight="800">★ ${escapeXml(milestoneLabel)}+</text>
<text x="34" y="190" fill="${palette.foreground}" font-family="Arial, sans-serif" font-size="17" font-weight="600">GitHub stars milestone reached</text>
<text x="34" y="226" fill="${palette.muted}" font-family="Arial, sans-serif" font-size="13">Current public star count: ${escapeXml(data.starsCount.toLocaleString("en-US"))}</text>
<text x="34" y="250" fill="${palette.accent}" font-family="Arial, sans-serif" font-size="13">${escapeXml(growth)}</text>
${release ? `<text x="34" y="274" fill="${palette.muted}" font-family="Arial, sans-serif" font-size="12">${escapeXml(release)}</text>` : ""}
<text x="608" y="296" text-anchor="end" fill="${palette.muted}" font-family="Arial, sans-serif" font-size="11">GitHub Traffic Analytics</text>
</svg>`;
}
