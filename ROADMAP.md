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
- [x] **Embeddable two-repository comparison card (`/api/card/compare`)**: README-safe SVG comparing total stars, 7-day growth, 30-day growth, and weekly velocity for two public repositories.
- [x] **Embeddable README growth cards (`/api/card/[owner]/[repo]`)**: Zero-dependency SVG cards with metric and `?style=sparkline` variants, multiple themes (`github-dark`, `github-light`, `transparent`, `dracula`, `nord`, `catppuccin`), and one-click "Copy Markdown" actions.
- [x] **Verified star milestone cards (`/api/card/milestone/[owner]/[repo]`)**: Shareable SVG assets for supported star thresholds; requests for milestones the repository has not reached are rejected.
- [x] **Dynamic OpenGraph social cards (`/repo/[owner]/[repo]/opengraph-image`)**: Native Next.js 16 Edge OpenGraph and Twitter cards for rich unfurls on X, LinkedIn, Discord, and Slack.
- [x] **Contextual AI explanations**: Structured LLM insights (`claude-haiku-4-5`) explaining precomputed telemetry without hallucinating math.

### 🔒 Private Traffic Retention

- [x] **14-day window bypass**: Daily automated Cloudflare Cron Worker snapshotting views and clones into Cloudflare D1.
- [x] **Private traffic dashboard**: 14-day views, clones, top referrers, popular paths, and multi-month historical D1 snapshots.
- [x] **Historical snapshot CSV / JSON export**: Owners and authorized collaborators can download their D1-persisted daily traffic records.
- [x] **Progressive disclosure & security**: Public metrics open to everyone; private traffic securely unlocked for verified repository owners via encrypted httpOnly OAuth sessions.
- [x] **Deterministic anomaly detection**: Explainable traffic, clone, star, referrer, and content change signals with release context.
- [x] **Weekly report preview**: Delivery-neutral report engine and owner-only preview using complete observation windows.
- [x] **Opt-in weekly email**: Timezone-aware Monday digest to a verified GitHub email, with duplicate protection and explicit opt-out when the deployment has an email provider configured.

---

- [x] **Growth milestone alerts via webhooks**: Automated Discord / Slack webhook notifications when a repository crosses major star milestones (e.g., 1k, 5k, 10k stars) or detects growth acceleration.
- [x] **Sharable growth milestone certificates**: Single-click exportable SVG social assets celebrating verified repository velocity milestones.
- [x] **Automated GitHub Discussion / Issue digest**: GitHub Action or scheduled worker posting weekly or monthly traffic summaries directly into repository discussions.
- [x] **`gh traffic` CLI extension**: Query star velocity, release impact, and traffic snapshots directly from the command line (`gh traffic view owner/repo`).
- [x] **Standalone GitHub Action**: Archive repository traffic into git branch artifacts (`traffic-history` branch) for maintainers who prefer not to host a database.
- [x] **Raycast extension**: Instant keyboard-driven lookup of repository growth velocity, comparisons, and README growth card copying.
- [x] **MCP (Model Context Protocol) server**: Expose repository growth telemetry to agentic AI coding tools (Antigravity, Cursor, Claude Code).

---

## 2. Next — Retention

Deep utility features for ongoing research:

- [ ] **External spike attribution**: Link observed referrer changes to verifiable external posts where public evidence is available.

---

## 5. Explicitly Not Planned

To maintain product focus, zero bloat, and trustworthy data, the following are intentionally out of scope:

- ❌ **Unbounded AI chatbots**: We do not provide generic conversational chat widgets; AI is strictly scoped to contextual explanations of precomputed metrics.
- ❌ **Synthetic vanity metrics**: No fake engagement scores or opaque algorithms without transparent statistical formulas.
- ❌ **Paid artificial star boosts or growth hacks**: This tool is designed strictly for authentic open-source discovery and analytics.
- ❌ **3D / WebGL canvas dashboards**: Heavy 3D visualizations add hundreds of kilobytes of bundle overhead without improving developer insight.
- ❌ **Native mobile apps**: A responsive, fast web application with PWA capabilities serves all platforms without fragmentation.
