// SPDX-License-Identifier: MIT
import type { StarPoint } from "./analytics";

export const GROWTH_CARD_THEMES = {
  "github-dark": {
    background: "#0d1117",
    foreground: "#e6edf3",
    muted: "#8b949e",
    accent: "#3fb950",
    border: "#30363d",
  },
  "github-light": {
    background: "#f6f8fa",
    foreground: "#24292f",
    muted: "#57606a",
    accent: "#1a7f37",
    border: "#d0d7de",
  },
  transparent: {
    background: "transparent",
    foreground: "#e6edf3",
    muted: "#8b949e",
    accent: "#3fb950",
    border: "#8b949e",
  },
  catppuccin: {
    background: "#1e1e2e",
    foreground: "#cdd6f4",
    muted: "#a6adc8",
    accent: "#a6e3a1",
    border: "#45475a",
  },
  dracula: {
    background: "#282a36",
    foreground: "#f8f8f2",
    muted: "#bd93f9",
    accent: "#50fa7b",
    border: "#6272a4",
  },
  nord: {
    background: "#2e3440",
    foreground: "#eceff4",
    muted: "#d8dee9",
    accent: "#a3be8c",
    border: "#4c566a",
  },
} as const;

export const GROWTH_CARD_STYLES = ["default", "sparkline"] as const;

export type GrowthCardTheme = keyof typeof GROWTH_CARD_THEMES;
export type GrowthCardStyle = (typeof GROWTH_CARD_STYLES)[number];

export interface GrowthCardData {
  fullName: string;
  starsCount: number;
  growth30d: number | null;
  velocityChangePercent: number | null;
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

function recentSparklineHistory(history: StarPoint[]): StarPoint[] {
  const sorted = [...history]
    .filter((point) => Number.isFinite(point.stars) && !Number.isNaN(Date.parse(point.date)))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (sorted.length <= 2) return sorted;

  const latestTime = Date.parse(`${sorted[sorted.length - 1].date}T00:00:00Z`);
  const cutoff = latestTime - 30 * 86_400_000;
  const recent = sorted.filter((point) => Date.parse(`${point.date}T00:00:00Z`) >= cutoff);
  return recent.length >= 2 ? recent : sorted.slice(-30);
}

export function buildSparklinePoints(
  history: StarPoint[],
  {
    x = 302,
    y = 52,
    width = 214,
    height = 78,
  }: { x?: number; y?: number; width?: number; height?: number } = {}
): string | null {
  const points = recentSparklineHistory(history);
  if (points.length < 2) return null;

  const minStars = Math.min(...points.map((point) => point.stars));
  const maxStars = Math.max(...points.map((point) => point.stars));
  const range = Math.max(1, maxStars - minStars);

  return points
    .map((point, index) => {
      const px = x + (index / (points.length - 1)) * width;
      const py = y + height - ((point.stars - minStars) / range) * height;
      return `${px.toFixed(1)},${py.toFixed(1)}`;
    })
    .join(" ");
}

export function renderGrowthCard(
  data: GrowthCardData,
  theme: GrowthCardTheme = "github-dark",
  options: { style?: GrowthCardStyle; history?: StarPoint[] } = {}
): string {
  const palette = GROWTH_CARD_THEMES[theme];
  const style = options.style ?? "default";
  const title = `${data.fullName} repository growth: ${data.starsCount.toLocaleString("en-US")} stars`;
  const growth =
    data.growth30d === null
      ? "30-day growth unavailable"
      : `+${data.growth30d.toLocaleString("en-US")} stars / 30d`;
  const momentum =
    data.velocityChangePercent === null
      ? "Momentum: insufficient history"
      : `Weekly velocity ${data.velocityChangePercent >= 0 ? "↑" : "↓"} ${Math.abs(data.velocityChangePercent)}%`;
  const release = data.latestRelease ? `Latest release: ${data.latestRelease}` : null;

  const sharedStart = `<svg xmlns="http://www.w3.org/2000/svg" width="540" height="176" viewBox="0 0 540 176" role="img" aria-labelledby="title desc">
<title id="title">${escapeXml(title)}</title><desc id="desc">${escapeXml(
    `${growth}. ${momentum}${release ? `. ${release}` : ""}${
      style === "sparkline" ? ". Includes a recent star-growth sparkline." : ""
    }`
  )}</desc>
<rect x="0.5" y="0.5" width="539" height="175" rx="12" fill="${palette.background}" stroke="${palette.border}"/>
<text x="24" y="35" fill="${palette.foreground}" font-family="Arial, sans-serif" font-size="18" font-weight="700">${escapeXml(data.fullName)}</text>`;

  if (style === "sparkline") {
    const points = buildSparklinePoints(options.history ?? []);
    const sparkline = points
      ? `<line x1="302" y1="130" x2="516" y2="130" stroke="${palette.border}" stroke-width="1"/>
<polyline points="${points}" fill="none" stroke="${palette.accent}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="516" cy="${points.split(" ").at(-1)?.split(",")[1] ?? "130"}" r="4" fill="${palette.accent}"/>
<text x="302" y="148" fill="${palette.muted}" font-family="Arial, sans-serif" font-size="11">Recent 30d star trend</text>`
      : `<rect x="302" y="52" width="214" height="78" rx="8" fill="none" stroke="${palette.border}" stroke-dasharray="4 4"/>
<text x="409" y="94" text-anchor="middle" fill="${palette.muted}" font-family="Arial, sans-serif" font-size="11">Trend unavailable</text>`;

    return `${sharedStart}
<text x="24" y="75" fill="${palette.foreground}" font-family="Arial, sans-serif" font-size="24" font-weight="700">★ ${escapeXml(data.starsCount.toLocaleString("en-US"))}</text>
<text x="24" y="103" fill="${palette.accent}" font-family="Arial, sans-serif" font-size="15" font-weight="600">${escapeXml(growth)}</text>
<text x="24" y="128" fill="${palette.muted}" font-family="Arial, sans-serif" font-size="13">${escapeXml(momentum)}</text>
${release ? `<text x="24" y="151" fill="${palette.muted}" font-family="Arial, sans-serif" font-size="12">${escapeXml(release)}</text>` : ""}
${sparkline}
<text x="520" y="165" text-anchor="end" fill="${palette.muted}" font-family="Arial, sans-serif" font-size="11">GitHub Traffic Analytics</text>
</svg>`;
  }

  return `${sharedStart}
<text x="24" y="75" fill="${palette.foreground}" font-family="Arial, sans-serif" font-size="24" font-weight="700">★ ${escapeXml(data.starsCount.toLocaleString("en-US"))} stars</text>
<text x="24" y="103" fill="${palette.accent}" font-family="Arial, sans-serif" font-size="15" font-weight="600">${escapeXml(growth)}</text>
<text x="24" y="128" fill="${palette.muted}" font-family="Arial, sans-serif" font-size="13">${escapeXml(momentum)}</text>
${release ? `<text x="24" y="151" fill="${palette.muted}" font-family="Arial, sans-serif" font-size="12">${escapeXml(release)}</text>` : ""}
<text x="520" y="151" text-anchor="end" fill="${palette.muted}" font-family="Arial, sans-serif" font-size="11">GitHub Traffic Analytics</text>
</svg>`;
}
