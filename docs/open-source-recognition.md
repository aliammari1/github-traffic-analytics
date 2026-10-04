<!-- SPDX-License-Identifier: MIT -->

# Open-source recognition & ecosystem opportunities (October 2026)

This document tracks legitimate, active open-source programs, showcases, developer directories,
and recognition venues suitable for **GitHub Traffic Analytics**.

No applications, sponsorship requests, or directory submissions should be submitted
automatically. Each entry details current requirements, submission criteria, and the exact
evidence or artifacts maintainers should verify before applying.

---

## 1. Official GitHub programs & showcases

### GitHub Marketplace (GitHub Action & GitHub App)

- **Official URL**: [https://github.com/marketplace](https://github.com/marketplace)
- **Status**: Active (continuous submission).
- **Eligibility**:
  - Open-source GitHub Actions with valid `action.yml`, semver release tags, and permissive open-source license.
  - Public GitHub Apps with valid webhook endpoints, privacy policy, terms of service, and least-privilege permission grants.
- **Application process**:
  - Action: In repository releases, check "Publish this Action to the GitHub Marketplace".
  - App: In GitHub Developer Settings > GitHub Apps, complete listing profile and submit for review.
- **Deadlines**: Rolling review.
- **Evidence currently in repository**:
  - `action.yml` and `action/index.mjs` implemented and tested.
  - GitHub App setup and webhook handlers implemented in `src/app/api/github-app/`.
- **Preparation needed before submission**:
  - Tag a semver release (e.g. `v2.1.0`) on the default branch.
  - Publish public terms of service and privacy policy on the documentation site.

### The ReadME Project & Community Stories

- **Official URL**: [https://github.com/readme](https://github.com/readme)
- **Status**: Active (editorial nomination).
- **Eligibility**: Open-source maintainers building high-utility, developer-first tools with demonstrated community impact and authentic growth.
- **Submission process**: Editorial pitching via GitHub ReadME contributor submission form and community maintainer spotlight nominations.
- **Deadlines**: Rolling monthly editorial calendar.
- **Missing evidence / prerequisites**:
  - Needs documented production adoption stories from real maintainers using the 14-day traffic retention or weekly digest.
- **Preparation needed**:
  - Collect 3–5 real user case studies or testimonials from active repository maintainers.

### GitHub Sponsors

- **Official URL**: [https://github.com/sponsors](https://github.com/sponsors)
- **Status**: Active.
- **Eligibility**: Active maintainers with a track record of open-source contributions in supported regions.
- **Application process**:
  - Maintainer enables GitHub Sponsors through their personal or organization profile.
  - Configure `.github/FUNDING.yml` to display sponsor links on the repository.
- **Deadlines**: Rolling.
- **Preparation needed**:
  - Maintainer enables Stripe Connect / bank payout account in supported region.
  - Add tier descriptions focused on sustaining serverless D1 and notification costs.

---

## 2. Cloudflare Developer ecosystem

### Cloudflare Workers Launchpad & Developer Showcase

- **Official URL**: [https://workers.cloudflare.com](https://workers.cloudflare.com) / [https://community.cloudflare.com/c/developers/built-with-workers/](https://community.cloudflare.com/c/developers/built-with-workers/)
- **Status**: Active.
- **Eligibility**: Projects built natively on Cloudflare Workers, Cloudflare D1, Cron Triggers, and `@opennextjs/cloudflare`.
- **Submission process**:
  - Submit project description, architecture overview, and GitHub repository to the Cloudflare "Built with Workers" showcase.
  - Share engineering post on Cloudflare Developer Discord (`#built-with-workers`).
- **Deadlines**: Rolling review.
- **Evidence currently in repository**:
  - Native OpenNext/Workers build (`pnpm cf:build`).
  - Production D1 persistence and Cron Workers for daily snapshots and digests.
  - Architectural documentation in `docs/content/architecture.mdx`.
- **Preparation needed**:
  - Publish a concise architecture breakdown showcasing how zero-login Edge compute enables sub-50ms analytics.

---

## 3. Curated developer tooling directories & newsletters

### Console.dev (Curated Developer Tools Weekly)

- **Official URL**: [https://console.dev](https://console.dev)
- **Status**: Active.
- **Eligibility**: Open-source or developer-first tools with clean terminal, API, or web interfaces. Editors review tools independently.
- **Submission process**: Submit tool via [https://console.dev/submit](https://console.dev/submit).
- **Deadlines**: Evaluated bi-weekly.
- **Preparation needed**:
  - Highlight the three distinct developer interfaces: Web, `gh traffic` CLI, and local MCP server.

### Product Hunt (Developer Tools Category)

- **Official URL**: [https://www.producthunt.com](https://www.producthunt.com)
- **Status**: Active.
- **Eligibility**: New release or major version launch of digital products.
- **Submission process**: Schedule launch date with prepared screenshots, animated GIF/video demo, and maker comment.
- **Deadlines**: Maintainer schedules target launch day (typically Tuesday or Wednesday UTC).
- **Preparation needed**:
  - Use prepared drafts from `docs/launch/product-hunt.md`.

### Hacker News (Show HN)

- **Official URL**: [https://news.ycombinator.com](https://news.ycombinator.com)
- **Status**: Active.
- **Eligibility**: Open-source, working software that others can try immediately without forced registration.
- **Submission process**: Post title prefixed with `Show HN:`. Include direct link and brief technical description as the first comment.
- **Preparation needed**:
  - Direct zero-login link (`https://github-traffic-analytics.ali-ammari.workers.dev/repo/owner/repo`).
  - Use prepared text from `docs/launch/hacker-news.md`.

---

## 4. Submission readiness checklist

Before applying to any program or showcase:

- [x] Zero-login public analyzer works for any public repository.
- [x] Embeddable SVG README cards render across dark and light themes without external dependencies.
- [x] Standalone `gh traffic` CLI extension and MCP server operational.
- [x] Raycast extension functional and typed.
- [x] Cloudflare Workers deployment verified with production D1 database.
- [ ] Maintainer tags official release `v2.1.0`.
- [ ] Maintainer confirms funding/support links in `.github/FUNDING.yml`.
