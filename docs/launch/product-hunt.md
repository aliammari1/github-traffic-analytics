<!-- SPDX-License-Identifier: MIT -->

# Product Hunt Launch Kit

**Tagline:**
Understand why GitHub repositories grow & preserve traffic beyond 14 days

**Short Description:**
Instant public star velocity & release analytics for any repository, plus automated Edge retention for your private GitHub traffic data beyond GitHub's native 14-day limit.

**Category:**
Developer Tools, Open Source, Analytics

**Maker's First Comment:**

Hello Product Hunt community! 👋

GitHub only keeps traffic analytics (views, clones, referrers) for 14 days. Once that window passes, your growth data vanishes.

We built **GitHub Traffic Analytics** to give maintainers complete ownership over their repository data while providing zero-login public growth insights for the open-source community:

🚀 **Key Highlights:**

- **Zero-Login Public Analyzer**: Look up star history, 7d/30d momentum, and release correlations for any open-source project.
- **Private Traffic Retention**: Automated Cloudflare Cron Worker continuously snapshots views and clones to Cloudflare D1.
- **Side-by-Side Comparison**: Compare up to 4 repositories with embeddable SVG comparison cards for your README.
- **Developer-Native Interfaces**: Use the web dashboard, the `gh traffic` CLI extension, the Model Context Protocol (MCP) server for coding agents, or the Raycast extension.
- **Data Portability**: Download your persisted traffic snapshots as CSV or JSON with one click.

We're 100% open-source under MIT, deployed on Cloudflare Workers and D1. We would love your thoughts and feedback!
