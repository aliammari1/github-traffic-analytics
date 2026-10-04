<!-- SPDX-License-Identifier: MIT -->

# Changelog

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-10-04

### 🌟 Public Growth Intelligence Engine

- **Zero-Login Public Analysis (`/repo/[owner]/[repo]`)**: Instant growth intelligence for any public GitHub repository without sign-in or OAuth scopes.
- **Deterministic Velocity & Momentum**: 7-day velocity, 30-day velocity, weekly run-rate, moving averages, and transparent 0–100 momentum score based on acceleration ratios.
- **Release Event Timeline & Impact**: Temporal association analysis measuring repository star velocity in a 14-day pre-release vs 14-day post-release window with strictly non-causal language.
- **Shareable Launch Reports (`/launch/[owner]/[repo]?tag=...`)**: Public launch impact summaries with before/after velocity deltas and share actions.
- **Multi-Repository Comparison (`/compare?repos=...`)**: Side-by-side growth trajectory comparison for 2–4 repositories with shareable URL state.
- **Embeddable README Growth Cards (`/api/card/[owner]/[repo]`)**: Zero-dependency SVG cards with default and sparkline variants across six developer themes (`github-dark`, `github-light`, `transparent`, `dracula`, `nord`, `catppuccin`).
- **Two-Repository Comparison Cards (`/api/card/compare?a=...&b=...`)**: Dynamic README SVG comparing stars, 7d/30d growth, and weekly run-rates between two repositories.
- **Verified Star Milestone Cards (`/api/card/milestone/[owner]/[repo]`)**: Shareable SVG cards celebrating verified repository star milestones (100, 500, 1k, 5k, 10k, 25k, 50k, 100k, 250k, 500k, 1M). Rejects milestones not yet reached.
- **Milestone Vector Certificates (`/api/certificate/[owner]/[repo]`)**: High-resolution downloadable SVG certificates for social announcements and maintainer portfolios.
- **Dynamic OpenGraph & Twitter Unfurls**: Native Next.js 16 Edge OpenGraph image generation with live repository stars and velocity statistics.
- **Contextual AI Explanations**: Server-side structured Claude Haiku streaming explaining precomputed telemetry without hallucinating math.

### 🔒 Private Traffic Retention & Security

- **14-Day Window Bypass**: Daily automated Cloudflare Cron Worker snapshotting views and clones into Cloudflare D1.
- **Historical Traffic Dashboard**: Views, unique visitors, clones, unique cloners, top referrers, and popular content paths with multi-month historical persistence.
- **Deterministic Anomaly Detection**: Explainable signals for traffic surges, clone spikes, referrer shifts, and release acceleration.
- **CSV & JSON Snapshot Exports**: One-click download of all D1-persisted historical traffic snapshots for authorized repository owners.
- **Weekly Delivery-Neutral Reports**: Complete-window weekly analytics summaries previewable by owners.
- **Opt-in Weekly Email Digest**: Timezone-aware Monday morning email digest to verified GitHub emails with duplicate prevention and one-click unsubscribe.
- **Encrypted Webhook Growth Alerts**: Instant Discord and Slack notifications on star milestones or traffic surges, with webhook URLs AES-GCM encrypted in D1.
- **GitHub App Installation Tracking**: Support for organization-wide installation and fine-grained repository permissions without wide user OAuth scopes.
- **Automated GitHub Discussion / Issue Delivery**: Scheduled delivery of weekly traffic summaries directly into repository discussions or tracking issues.

### 🔌 Multi-Surface Developer Distribution

- **Official GitHub CLI Extension (`gh traffic`)**: Query velocity, compare projects, and export snapshots directly from developer terminals (`gh traffic view`, `gh traffic compare`).
- **Model Context Protocol (MCP) Server (`integrations/mcp-server`)**: Expose deterministic repository telemetry to AI coding agents (Antigravity, Cursor, Claude Code).
- **Raycast macOS Extension (`integrations/raycast`)**: Instant keyboard-driven lookup of star velocity, comparisons, and one-click Markdown card copying.
- **Standalone GitHub Action (`action/`)**: Zero-infrastructure traffic archiving to a `traffic-history` git branch.
- **Versioned Public REST API v1 (`/api/v1/...`)**: Compact JSON endpoints for public repository intelligence and comparison.
- **Progressive Web App (PWA)**: Web app manifest and mobile icon support for desktop and mobile installation.

### ⚙️ Architecture & Reliability

- **Edge Runtime**: Migrated to Next.js 16 on Cloudflare Workers via `@opennextjs/cloudflare` with Cloudflare D1.
- **Zero-Vulnerability Security Posture**: Production dependency audit verified with 0 vulnerabilities; strict input sanitization and XML escaping on all SVG endpoints.
