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

## The one prompt (copy-paste into your image generator)

> A dark-tech hero graphic for a developer analytics product called **"GitHub
> Traffic Analytics."** Near-black charcoal canvas (`#0a0a0a`) with a faint
> technical grid. Foreground: several **layered, semi-transparent line and area
> charts** trending up-and-to-the-right, the topmost being a single bright
> **electric-cyan (`#06b6d4`) growth line** with a soft glow and a glowing node at
> its peak. Off-white (`#fafafa`) secondary lines behind it. A subtle, elegant
> **"14 → ∞"** motif worked into the chart axis, nodding to data that outlives
> GitHub's 14-day window. Small rounded-square logo glyph containing a minimal
> bar/line chart, top-left. Wordmark **"GitHub Traffic Analytics"** in a geometric
> sans (Inter), tight tracking, with the tagline *"Beat GitHub's 14-day traffic
> window."* beneath it. Cinematic, premium, lots of negative space, no UI chrome,
> no photoreal screenshots. Flat vector-meets-glow aesthetic.

Render this prompt at the three target sizes below and commit the PNGs to
`assets/`. Keep one consistent composition so the hero, social card, and OG image
read as the same identity.

| Output | Aspect | Save as |
| --- | --- | --- |
| Wide README hero | 1280 × 400 | `assets/hero.png` |
| Social / OG card | 1280 × 640 | `assets/social-preview.png` |
| Open Graph (optional) | 1200 × 630 | `assets/og.png` |

Image generation is intentionally **not** run in this pass. Generate with the
`brandkit` / `imagegen-frontend-web` skills, commit locally (so the images never
rate-limit or 404), then uncomment the `assets/hero.png` line in `README.md`.
Also copy `og.png` to `public/og.png` and uncomment the `openGraph.images` line in
`src/app/layout.tsx` so the metadata card resolves at a real URL.
