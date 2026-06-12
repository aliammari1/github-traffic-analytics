<!-- SPDX-License-Identifier: MIT -->
<div align="center">

# GitHub Traffic Analytics

### Self-hosted, open-source GitHub repo analytics — keep your traffic, clones, and stars forever (GitHub deletes them after 14 days). A free Repobeats / star-history alternative.

<!-- Banner committed under assets/ — generate per BANNER.md (dark-tech charts), then uncomment. -->
<!-- ![GitHub Traffic Analytics](assets/hero.png) -->

[![CI](https://github.com/aliammari1/github-traffic-analytics/actions/workflows/ci.yml/badge.svg)](https://github.com/aliammari1/github-traffic-analytics/actions/workflows/ci.yml)
[![CodeQL](https://github.com/aliammari1/github-traffic-analytics/actions/workflows/codeql.yml/badge.svg)](https://github.com/aliammari1/github-traffic-analytics/actions/workflows/codeql.yml)
[![codecov](https://codecov.io/gh/aliammari1/github-traffic-analytics/branch/main/graph/badge.svg)](https://codecov.io/gh/aliammari1/github-traffic-analytics)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-10-f69220?logo=pnpm)](https://pnpm.io/)

[**▶ Live demo**](https://github-traffic-analytics.pages.dev) · [Docs](docs/) · [Deploy your own](#deploy-your-own-cloudflare) · [⭐ Star this repo](https://github.com/aliammari1/github-traffic-analytics)

[![▶ Live dashboard demo](https://img.shields.io/badge/▶_Live_dashboard-demo-2ea44f?style=for-the-badge)](https://github-traffic-analytics.pages.dev)
[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/aliammari1/github-traffic-analytics)
[![⭐ Star](https://img.shields.io/github/stars/aliammari1/github-traffic-analytics?style=for-the-badge&logo=github&label=Star&color=yellow)](https://github.com/aliammari1/github-traffic-analytics)

</div>

---

## ⚡ Add a live traffic badge to your README

The fastest way to try it: once your instance is deployed, drop a **live traffic
badge** into any repo's README. It renders total views since you started tracking
— the number GitHub throws away after 14 days — and links back to your dashboard:

```md
[![Repo traffic](https://YOUR-APP.pages.dev/api/badge?owner=you&repo=your-repo)](https://YOUR-APP.pages.dev)
```

The `/api/badge` endpoint is public, edge-cached (Cache-Control + ETag) and
Cloudflare rate-limited, so it's safe to embed anywhere. A standalone
**"persist traffic → badge + JSON" GitHub Action** (so you don't even need to
host the app) is being extracted as **Wave 2** — ⭐ to follow along.

## GitHub Traffic Analytics vs the alternatives

| | **GitHub Traffic Analytics** | GitHub's built-in Insights | Repobeats | star-history |
| --- | :---: | :---: | :---: | :---: |
| Keeps traffic/clones past 14 days | ✅ forever | ❌ 14-day window | ❌ image only | n/a |
| Self-hosted / own your data | ✅ | n/a | ❌ hosted SaaS | ❌ hosted |
| Price | **$0** (CF free tier) | free | free/paid tiers | free |
| Embeddable README badge | ✅ live SVG | ❌ | ✅ | ✅ (stars only) |
| Star history | ✅ | ❌ | ➖ | ✅ |
| AI traffic summary | ✅ | ❌ | ❌ | ❌ |
| Open source (MIT) | ✅ | ❌ | ❌ | ✅ |

---

> [!IMPORTANT]
> **GitHub's traffic API only returns the last 14 days.** That's a hard limit on
> GitHub's side. This app works around it by writing a **daily snapshot** of each
> tracked repo's traffic to a database, so your history accumulates indefinitely
> from the day you enable tracking. Live (un-tracked) data is still capped at 14 days.

## What it does

- **Traffic dashboard** — views, clones, top referrers, and popular paths per repo.
- **Historical traffic** — daily snapshots persisted to Cloudflare **D1** via a
  **Cron Worker**, so you see the full timeline beyond GitHub's 14-day window.
- **AI insights** — a "Summarize my traffic" panel that calls the Anthropic
  Messages API (`claude-haiku-4-5`) over your aggregated traffic and returns an
  actionable growth briefing.
- **Aggregated overview** — totals across all your repositories.

## Quickstart

```bash
git clone https://github.com/aliammari1/github-traffic-analytics.git
cd github-traffic-analytics
pnpm install
cp .env.example .env.local   # fill in the values (see below)
pnpm dev                     # http://localhost:3000
```

### GitHub OAuth setup

Create an OAuth App at **Settings → Developer settings → OAuth Apps → New OAuth App**:

- **Homepage URL:** `http://localhost:3000`
- **Authorization callback URL:** `http://localhost:3000/api/auth/callback/github`

The app requests the `repo` and `user:email` scopes — both are required to read
repository traffic. Each user only ever sees their own data; tokens are never
exposed to the client.

### Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `NEXTAUTH_SECRET` | yes | NextAuth session secret (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | yes | App URL (`http://localhost:3000` locally) |
| `GITHUB_CLIENT_ID` | yes | GitHub OAuth App client id |
| `GITHUB_CLIENT_SECRET` | yes | GitHub OAuth App client secret |
| `ANTHROPIC_API_KEY` | no | Enables the AI insights panel; the panel degrades gracefully if unset |

> `next build` needs these present. For CI builds without real credentials, dummy
> values are sufficient (the build doesn't call the providers).

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Dev server (Turbopack) |
| `pnpm lint` | ESLint (`next lint` was removed in Next 16 → ESLint CLI) |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` / `pnpm test:coverage` | Vitest unit/component tests (80% coverage gate) |
| `pnpm test:e2e` | Playwright e2e (sign-in → select repo → view traffic, MSW-mocked) |
| `pnpm build` | Production build |
| `pnpm cf:build` / `pnpm cf:deploy` | Build/deploy for Cloudflare via `@opennextjs/cloudflare` |

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui ·
NextAuth · Octokit · Recharts · Anthropic SDK · Vitest · Playwright + MSW ·
Cloudflare Pages + D1 + Cron Triggers.

## Deploy your own (Cloudflare)

Hosted on **Cloudflare's free tier**: Pages (Next via `@opennextjs/cloudflare`),
**D1** for snapshots, and a daily **Cron Worker** (`worker/snapshot.ts`).

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/aliammari1/github-traffic-analytics)

One click clones the repo to your account and provisions the Worker; you then
create the D1 database (`wrangler d1 create traffic_analytics`) and set the
OAuth/Anthropic secrets. The full step-by-step (D1 schema, cron worker, gated CI
deploy) lives in [`docs/`](docs/) (Nextra) → **Deployment**.

CI deploy is gated on `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` and the
`ENABLE_CF_DEPLOY` repo variable — forks and this repo never auto-deploy.

## Show your traffic off (embeddable badge)

See [**⚡ Add a live traffic badge to your README**](#-add-a-live-traffic-badge-to-your-readme)
above for the snippet. The badge renders a Shields-style SVG of total views since
you started tracking — the number GitHub throws away after 14 days — and is
edge-cached + rate-limited. Endpoint contract: [`docs/`](docs/) → **Features →
Traffic badge**. A no-host **GitHub Action** version is coming in Wave 2.

## How I beat GitHub's 14-day limit

GitHub's traffic API is a sliding 14-day window — older data is gone forever.
The fix is unglamorous and reliable: a **daily Cloudflare Cron Worker** snapshots
each tracked repo's views/clones into **D1**, so history accumulates indefinitely
from day one of tracking. Write-up:
[*How I beat GitHub's 14-day traffic limit*](docs/) (Architecture → Daily snapshots).

## Engineering decisions

- **Cloudflare over Vercel** — Pages + D1 + Cron Triggers natively support the
  snapshot feature on one free platform.
- **pnpm over Bun** — reproducible lockfile and first-class CI setup.
- **Typed `TrafficAccessError`** instead of matching a localized error string, so
  the previous French-vs-English 403 bug cannot recur.

## Documentation

Full docs live in [`docs/`](docs/) as a Nextra site (Getting Started, Features,
Architecture, Deployment). Build locally with `cd docs && pnpm install && pnpm dev`.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). PR titles follow
[Conventional Commits](https://www.conventionalcommits.org/) (enforced in CI).

## Related projects

Part of a wider open-source toolkit by [@aliammari1](https://github.com/aliammari1):

- [**awesome-ai-tools**](https://github.com/aliammari1/awesome-ai-tools) — a curated, weekly-updated index of AI tools.
- [**JobPrep**](https://github.com/aliammari1/JobPrep) — open-source, BYOK AI interview-prep platform (Final Round AI alternative).
- [**Leetcode_problems**](https://github.com/aliammari1/Leetcode_problems) — solutions including real wrong/TLE submissions.

⭐ If this saved your traffic history, a star helps others find it.

## License

[MIT](LICENSE) © Ali Ammari.
