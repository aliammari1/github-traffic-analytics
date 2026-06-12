// SPDX-License-Identifier: MIT

/**
 * Dependency-free Shields-style SVG badge generator for the embeddable
 * "repo traffic" badge (the README viral loop). Renders a two-segment pill:
 * a dark label on the left and an electric-cyan value on the right, matching the
 * app's dark-tech chart palette (see BANNER.md).
 *
 * Kept framework-free (returns a string) so it can be unit-tested without Next.js.
 */

const LABEL_BG = "#0a0a0a"; // near-black charcoal — matches the in-app canvas
const VALUE_BG = "#06b6d4"; // electric cyan growth accent
const TEXT = "#ffffff";

/** Escape the few characters that are unsafe inside SVG text/attributes. */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Compact human-readable count: 1234 -> "1.2k", 2_500_000 -> "2.5M". */
export function formatCount(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "0";
  if (n < 1000) return String(Math.trunc(n));
  if (n < 1_000_000) return `${(n / 1000).toFixed(n < 10_000 ? 1 : 0)}k`.replace(".0", "");
  return `${(n / 1_000_000).toFixed(1)}M`.replace(".0", "");
}

/** Approximate pixel width of a string in the 11px font Shields uses (~7px/char). */
function textWidth(text: string): number {
  return text.length * 7 + 10;
}

/**
 * Build a static SVG badge. `label` is the left segment ("repo views"), `value`
 * the right segment (the formatted count). Output is deterministic for testing.
 */
export function renderBadge(label: string, value: string): string {
  const labelText = escapeXml(label);
  const valueText = escapeXml(value);
  const labelW = textWidth(label);
  const valueW = textWidth(value);
  const total = labelW + valueW;
  const labelMid = labelW / 2;
  const valueMid = labelW + valueW / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${total}" height="20" role="img" aria-label="${labelText}: ${valueText}">
  <title>${labelText}: ${valueText}</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r"><rect width="${total}" height="20" rx="3" fill="#fff"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelW}" height="20" fill="${LABEL_BG}"/>
    <rect x="${labelW}" width="${valueW}" height="20" fill="${VALUE_BG}"/>
    <rect width="${total}" height="20" fill="url(#s)"/>
  </g>
  <g fill="${TEXT}" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
    <text x="${labelMid}" y="14">${labelText}</text>
    <text x="${valueMid}" y="14">${valueText}</text>
  </g>
</svg>`;
}

/** Convenience: badge for a repo's total accumulated views. */
export function renderViewsBadge(totalViews: number): string {
  return renderBadge("repo views", formatCount(totalViews));
}
