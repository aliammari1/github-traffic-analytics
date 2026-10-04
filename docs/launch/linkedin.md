<!-- SPDX-License-Identifier: MIT -->

# LinkedIn Launch Post

GitHub's native traffic analytics have a significant blind spot for open-source maintainers: daily views, unique visitors, clones, and referrers are only retained for 14 days.

Once that window passes, valuable historical insight into which articles, conferences, or releases drove repository adoption is lost.

To solve this, we created **GitHub Traffic Analytics**, an open-source growth intelligence platform:
https://github-traffic-analytics.ali-ammari.workers.dev

### Key capabilities:

- **Instant Public Growth Telemetry**: Anyone can analyze any public GitHub repository without logging in. View deterministic star trajectories, 7-day/30-day velocity, momentum scores, and before/after release correlation analysis.
- **Durable 14-Day Bypass**: Maintainers can opt in to automated daily Edge snapshots to Cloudflare D1, unlocking multi-month traffic history, weekly digests, and CSV/JSON data exports.
- **Embeddable README Cards & Certificates**: Zero-dependency SVG assets that automatically adapt to light and dark themes.
- **Developer Interfaces**: Use the web dashboard, the `gh traffic` CLI extension in your terminal, the Model Context Protocol (MCP) server with AI coding assistants, or the Raycast extension.

The project is fully open-source (MIT license) built on Next.js 16, OpenNext, Cloudflare Workers, and Cloudflare D1.

Explore the repository and source code on GitHub:
https://github.com/aliammari1/github-traffic-analytics
