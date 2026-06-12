<!-- SPDX-License-Identifier: MIT -->

# Banner & Social Preview Spec

Direction: **dark-tech charts**. The hero should read instantly as "developer
analytics dashboard at night" — deep charcoal canvas, a single luminous accent,
and abstract line/area charts as the visual motif.

## Deliverables

| Asset | Size | Path | Use |
| --- | --- | --- | --- |
| README hero | 1280 × 400 | `assets/hero.png` | Top of `README.md` |
| Social preview | 1280 × 640 | `assets/social-preview.png` | GitHub → Settings → Social preview |
| OG image (optional) | 1200 × 630 | `assets/og.png` | `next/metadata` `openGraph.images` |

## Art direction

- **Background:** near-black charcoal (`#0a0a0a`) with a subtle dark grid.
- **Accent:** a single cool luminous line color (off-white `#fafafa` primary,
  one cyan/teal glow accent) — matches the in-app chart palette.
- **Motif:** overlapping line + area charts trending up-and-to-the-right, plus a
  faint "14 → ∞ days" cue nodding to the snapshot feature.
- **Type:** geometric sans (Inter), tight tracking. Wordmark: **GitHub Traffic
  Analytics**. Tagline: *Beat GitHub's 14-day traffic window.*
- **Logo cue:** a bar/line-chart glyph inside a rounded square.

## How to generate (deferred)

Image generation is intentionally **not** run here. To produce these, use the
`brandkit` skill for the identity board + 1280×640 social card, and
`imagegen-frontend-web` for the wide README hero, then commit the PNGs to
`assets/` (committed locally so they never rate-limit or 404). The README links
these paths as a TODO until the images exist.
