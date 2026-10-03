<!-- SPDX-License-Identifier: MIT -->

# 🗺️ Product Roadmap: GitHub Traffic Analytics

> Understand why GitHub repositories grow.
>
> Track star trajectory, measure release impact, compare repositories, and preserve private traffic analytics beyond GitHub's 14-day limit.

---

## 🎯 Strategic Flywheel

Our development priorities are organized around the open-source distribution loop:

```text
Developer discovers tool
        ↓
Analyzes any public repository without login
        ↓
Gets instant star velocity & release insights
        ↓
Shares interactive chart or embeds README card
        ↓
Other developers discover the project
        ↓
They analyze their own repositories
        ↓
More legitimate GitHub stars & organic adoption
```

---

## 1. Shipped (What Works Today)

### 🌟 Public Growth Intelligence Engine

- [x] **Instant public repository analyzer** (`/repo/[owner]/[repo]`): Zero-login, unauthenticated growth intelligence for any public GitHub repository.
- [x] **Deterministic star history & velocity**: 7-day star growth, 30-day growth, weekly run-rate, and moving-average velocity comparisons.
- [x] **Repository momentum scoring**: Transparent 0–100 momentum score based on acceleration ratio damped by repository scale.
- [x] **Release event timeline & impact**: Temporal association analysis comparing 14 days before vs. 14 days after release events with strictly non-causal language.
- [x] **Shareable launch reports (`/launch/[owner]/[repo]?tag=...`)**: Public before/after release reports with deterministic velocity deltas, a marked star trajectory, and share/copy actions.
- [x] **Multi-repository comparison (`/compare`)**: Side-by-side growth trajectory comparison supporting 2–4 repositories with shareable URL state (`?repos=owner/repo,owner2/repo2`).
- [x] **Embeddable README growth card (`/api/card/[owner]/[repo]`)**: Zero-dependency SVG growth cards with multiple themes (`github-dark`, `github-light`, `transparent`, `dracula`, `nord`, `catppuccin`) and one-click "Copy Markdown" action.
- [x] **Dynamic OpenGraph social cards (`/repo/[owner]/[repo]/opengraph-image`)**: Native Next.js 16 Edge OpenGraph and Twitter cards for rich unfurls on X, LinkedIn, Discord, and Slack.
- [x] **Contextual AI explanations**: Structured LLM insights (`claude-haiku-4-5`) explaining precomputed telemetry without hallucinating math.

### 🔒 Private Traffic Retention

- [x] **14-day window bypass**: Daily automated Cloudflare Cron Worker snapshotting views and clones into Cloudflare D1.
- [x] **Private traffic dashboard**: 14-day views, clones, top referrers, popular paths, and multi-month historical D1 snapshots.
- [x] **Progressive disclosure & security**: Public metrics open to everyone; private traffic securely unlocked for verified repository owners via encrypted httpOnly OAuth sessions.

---

## 2. Next — Distribution

High-leverage features that turn existing users into discovery channels:

- [ ] **Growth milestone alerts via webhooks**: Automated Discord / Slack webhook notifications when a repository crosses major star milestones (e.g., 1k, 5k, 10k stars) or detects growth acceleration.
- [ ] **Interactive SVG growth charts for GitHub READMEs**: Expanding the growth card into an interactive sparkline SVG option (`/api/card/[owner]/[repo]?style=sparkline`).
- [ ] **Sharable growth milestone certificates**: Single-click exportable social assets celebrating repository velocity milestones.
- [ ] **Embeddable comparison widget**: Compact SVG comparison badge comparing two rival open-source tools (`/api/badge/compare?a=vercel/next.js&b=nuxt/nuxt`).

---

## 3. Next — Retention

Deep utility features that keep maintainers coming back:

- [ ] **Weekly digest email**: Optional Monday morning briefing summarizing 7-day stars, clones, views, top referrer spikes, and release momentum.
- [ ] **Anomaly & spike attribution**: Advanced referral pattern detection linking private traffic spikes to external Hacker News, Reddit, or X threads.
- [ ] **Historical snapshot CSV / JSON export**: One-click download of all D1-persisted daily traffic snapshots for custom BI and archival.
- [ ] **Automated GitHub Discussion / Issue digest**: GitHub Action or scheduled worker posting monthly traffic summaries directly into repository discussions.

---

## 4. Ecosystem & Developer Tools

Extending the intelligence engine into maintainer terminals and IDEs:

- [ ] **`gh traffic` CLI extension**: Query star velocity, release impact, and traffic snapshots directly from the command line (`gh traffic view owner/repo`).
- [ ] **Standalone GitHub Action**: Archive repository traffic into git branch artifacts (`gh-pages` or data branch) for maintainers who prefer not to host a database.
- [ ] **Raycast extension**: Instant keyboard-driven lookup of repository growth velocity and milestones.
- [ ] **MCP (Model Context Protocol) server**: Expose repository growth telemetry to agentic AI coding tools (Antigravity, Cursor, Claude Code).

---

## 5. Explicitly Not Planned

To maintain product focus, zero bloat, and trustworthy data, the following are intentionally out of scope:

- ❌ **Unbounded AI chatbots**: We do not provide generic conversational chat widgets; AI is strictly scoped to contextual explanations of precomputed metrics.
- ❌ **Synthetic vanity metrics**: No fake engagement scores or opaque algorithms without transparent statistical formulas.
- ❌ **Paid artificial star boosts or growth hacks**: This tool is designed strictly for authentic open-source discovery and analytics.
- ❌ **3D / WebGL canvas dashboards**: Heavy 3D visualizations add hundreds of kilobytes of bundle overhead without improving developer insight.
- ❌ **Native mobile apps**: A responsive, fast web application with PWA capabilities serves all platforms without fragmentation.
