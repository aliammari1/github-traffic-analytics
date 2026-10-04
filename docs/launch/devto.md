<!-- SPDX-License-Identifier: MIT -->

# DEV.to Article Draft

**Title:**
Understanding Why Open-Source Repositories Grow: Building GitHub Traffic Analytics

**Tags:**
#opensource #github #webdev #showdev

**Cover Image Suggestion:**
Screenshot of the repository growth chart comparing before/after release windows.

**Body:**

GitHub's Insights tab gives maintainers a brief 14-day window of traffic data. When a project experiences a surge in attention—from a viral blog post, a tech newsletter mention, or a major release—that traffic spike disappears from GitHub's charts within two weeks.

We built [GitHub Traffic Analytics](https://github.com/aliammari1/github-traffic-analytics) to make repository growth understandable, durable, and shareable.

## What it solves

1. **Persistent Private Traffic**: A scheduled Cloudflare Cron Worker captures daily views and clones into Cloudflare D1. You can inspect multi-month historical trends, compare seasonal traffic, or export everything to CSV or JSON.
2. **Instant Public Intelligence**: Analyze any public GitHub repository without an account. Get transparent star velocity (7-day and 30-day run rates), momentum scores based on acceleration ratios, and temporal release impact analysis.
3. **Embeddable README Cards**: Clean, zero-dependency SVG badges and cards that adapt to GitHub's light and dark modes.
4. **Developer Workflows**: Beyond the web interface, maintainers can query analytics from the command line (`gh traffic view owner/repo`), connect agentic coding tools via an MCP server, or use the Raycast extension.

## Architecture

- **Frontend**: Next.js 16 App Router with React 19 and Tailwind CSS.
- **Compute**: Cloudflare Workers via `@opennextjs/cloudflare` for edge delivery.
- **Database**: Cloudflare D1 (serverless SQLite at the edge).
- **Integrations**: Standalone GitHub Action, GitHub CLI extension, MCP server, and Raycast extension.

Check out the live deployment at [github-traffic-analytics.ali-ammari.workers.dev](https://github-traffic-analytics.ali-ammari.workers.dev) or explore the code on [GitHub](https://github.com/aliammari1/github-traffic-analytics).
