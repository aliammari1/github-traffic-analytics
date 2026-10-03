// SPDX-License-Identifier: MIT
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

export type GrowthCardTheme = keyof typeof GROWTH_CARD_THEMES;

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

export function renderGrowthCard(
  data: {
    fullName: string;
    starsCount: number;
    growth30d: number | null;
    velocityChangePercent: number | null;
    latestRelease: string | null;
  },
  theme: GrowthCardTheme = "github-dark"
): string {
  const palette = GROWTH_CARD_THEMES[theme];
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
  return `<svg xmlns="http://www.w3.org/2000/svg" width="540" height="176" viewBox="0 0 540 176" role="img" aria-labelledby="title desc">
<title id="title">${escapeXml(title)}</title><desc id="desc">${escapeXml(`${growth}. ${momentum}${release ? `. ${release}` : ""}`)}</desc>
<rect x="0.5" y="0.5" width="539" height="175" rx="12" fill="${palette.background}" stroke="${palette.border}"/>
<text x="24" y="35" fill="${palette.foreground}" font-family="Arial, sans-serif" font-size="18" font-weight="700">${escapeXml(data.fullName)}</text>
<text x="24" y="75" fill="${palette.foreground}" font-family="Arial, sans-serif" font-size="24" font-weight="700">★ ${escapeXml(data.starsCount.toLocaleString("en-US"))} stars</text>
<text x="24" y="103" fill="${palette.accent}" font-family="Arial, sans-serif" font-size="15" font-weight="600">${escapeXml(growth)}</text>
<text x="24" y="128" fill="${palette.muted}" font-family="Arial, sans-serif" font-size="13">${escapeXml(momentum)}</text>
${release ? `<text x="24" y="151" fill="${palette.muted}" font-family="Arial, sans-serif" font-size="12">${escapeXml(release)}</text>` : ""}
<text x="520" y="151" text-anchor="end" fill="${palette.muted}" font-family="Arial, sans-serif" font-size="11">GitHub Traffic Analytics</text>
</svg>`;
}
