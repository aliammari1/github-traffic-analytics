<!-- SPDX-License-Identifier: MIT -->

# Show HN Draft: GitHub Traffic Analytics

**Title:**
Show HN: GitHub Traffic Analytics – Preserve repo traffic beyond 14 days and track star velocity

**URL:**
https://github-traffic-analytics.ali-ammari.workers.dev

**First Comment / Context:**

Hi HN,

If you maintain open-source projects on GitHub, you've probably noticed that GitHub's native Traffic tab only retains daily views, unique visitors, clones, referrers, and popular paths for 14 days. Once that window rolls over, the historical data is permanently lost unless you scrape or store it yourself.

I built GitHub Traffic Analytics to solve this and make repository growth transparent and measurable:
https://github.com/aliammari1/github-traffic-analytics

Key capabilities:

1. **Zero-login public intelligence**: Anyone can analyze any public GitHub repository (e.g. `/repo/facebook/react`) to inspect observed star trajectory, 7d/30d velocity, momentum scoring, and release timeline correlations without creating an account or providing permissions.
2. **Private traffic retention beyond 14 days**: Repository maintainers can authenticate or install our GitHub App to have daily views and clones snapshotted into Cloudflare D1 via automated Edge cron workers.
3. **Multi-repository comparisons**: Compare 2–4 repositories side-by-side with shareable URLs and zero-dependency SVG comparison cards for READMEs.
4. **Developer surfaces**: Available as a web app, a `gh traffic` CLI extension (`gh traffic view owner/repo`), a local Model Context Protocol (MCP) server for coding agents, a Raycast extension, and a standalone GitHub Action for maintainers who prefer storing history directly in a git branch rather than hosting a database.

The entire stack is open-source (MIT), built on Next.js App Router deployed to Cloudflare Workers via OpenNext, using Cloudflare D1 for SQLite edge storage. All analytics calculations are pure TypeScript with transparent deterministic formulas (no synthetic vanity scores or hallucinated AI numbers).

I'd love feedback on the analytics formulas, CLI workflow, and data visualizations!
