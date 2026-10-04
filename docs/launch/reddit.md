<!-- SPDX-License-Identifier: MIT -->

# Reddit Launch Draft: r/opensource & r/webdev

**Title:**
I built an open-source tool to bypass GitHub's 14-day traffic limit and analyze repository growth velocity

**Post Body:**

Hey everyone,

One of the most frustrating limitations of GitHub is the Traffic dashboard: GitHub discards your daily view counts, visitor stats, clones, and top referrers after just 14 days. If you release a major update or get featured on Hacker News or Reddit, you have no way to look back six months later to see long-term referral patterns.

To fix this, I created **GitHub Traffic Analytics**:

- **Live web app**: https://github-traffic-analytics.ali-ammari.workers.dev
- **Source code (MIT)**: https://github.com/aliammari1/github-traffic-analytics

### How it works:

1. **Unauthenticated Public Growth Analysis**: Paste any public repo (`owner/repo`) and immediately see its observed star history, 7-day velocity, 30-day velocity, momentum score, and release timeline context. No login or authorization required.
2. **Long-Term Traffic Retention**: For your own repositories, sign in with GitHub or install the GitHub App. An automated daily Cloudflare Cron Worker snapshots your views and clones into Cloudflare D1 (SQLite at the Edge).
3. **Embeddable README Cards & Certificates**: Generate theme-aware, zero-dependency SVG growth cards or verified milestone certificates for your README or social channels.
4. **Multiple Developer Interfaces**:
   - `gh traffic`: Query star momentum or export data directly from your terminal.
   - MCP Server: Connect your AI coding assistant (Cursor, Antigravity, Claude Code) to repository telemetry.
   - Raycast Extension: Keyboard-driven repo lookup from your desktop launcher.
   - GitHub Action Lite: Prefer no database? Use our standalone GitHub Action to archive daily traffic directly to a `traffic-history` git branch in your repository.

Stack: Next.js 16 (App Router), OpenNext, Cloudflare Workers, Cloudflare D1, Tailwind CSS, Recharts, and Vitest.

All feedback, bug reports, and feature suggestions are very welcome!
