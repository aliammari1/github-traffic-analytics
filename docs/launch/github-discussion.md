<!-- SPDX-License-Identifier: MIT -->

# GitHub Discussion Announcement Template

**Category:** Announcements / Show and Tell

**Title:**
Introducing GitHub Traffic Analytics: Long-term traffic retention & public star velocity

**Body:**

Hello everyone,

We are excited to share **GitHub Traffic Analytics**, an open-source tool designed to help developers and maintainers understand why GitHub repositories grow.

### The Problem

GitHub's native traffic metrics expire after 14 days. Maintainers lose access to long-term trends, referral history from launches, and seasonal traffic movements unless they manually export data every two weeks.

### The Solution

- **Public Growth Analyzer**: Instant, zero-login telemetry for any public GitHub project—tracking star velocity (7-day and 30-day run rates), momentum scores, and before/after release trajectory.
- **Automated D1 Retention**: Cloudflare Cron Workers snapshot daily views, unique visitors, and clones to Cloudflare D1 (serverless SQLite at the Edge).
- **Multiple Interfaces**:
  - Web application: https://github-traffic-analytics.ali-ammari.workers.dev
  - GitHub CLI extension: `gh traffic view owner/repo`
  - Model Context Protocol (MCP) server for local coding agents
  - Raycast extension for keyboard-driven lookup
  - Standalone GitHub Action for archiving directly to a git branch

### Try it out

You can paste any public repository into the homepage to explore its growth trajectory, or connect your own repositories to begin archiving daily traffic.

Let us know your feedback, ideas for new deterministic metrics, or questions in this discussion!
