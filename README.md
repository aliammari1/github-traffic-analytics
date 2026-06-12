<!-- SPDX-License-Identifier: MIT -->
<div align="center">

# GitHub Traffic Analytics

Track your GitHub repository traffic — and **keep history past GitHub's 14-day limit**.

<!-- Banner is committed under assets/ once generated — see BANNER.md (dark-tech charts). TODO -->
<!-- ![GitHub Traffic Analytics](assets/hero.png) -->

[![CI](https://github.com/aliammari1/github-traffic-analytics/actions/workflows/ci.yml/badge.svg)](https://github.com/aliammari1/github-traffic-analytics/actions/workflows/ci.yml)
[![CodeQL](https://github.com/aliammari1/github-traffic-analytics/actions/workflows/codeql.yml/badge.svg)](https://github.com/aliammari1/github-traffic-analytics/actions/workflows/codeql.yml)
[![codecov](https://codecov.io/gh/aliammari1/github-traffic-analytics/branch/main/graph/badge.svg)](https://codecov.io/gh/aliammari1/github-traffic-analytics)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-10-f69220?logo=pnpm)](https://pnpm.io/)

</div>

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

## Deployment (Cloudflare)

Hosted on **Cloudflare's free tier**: Pages (Next via `@opennextjs/cloudflare`),
**D1** for snapshots, and a daily **Cron Worker** (`worker/snapshot.ts`).
See [`docs/`](docs/) (Nextra) → **Deployment** for the full guide. CI deploy is
gated on `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` and the
`ENABLE_CF_DEPLOY` repo variable — forks and this repo never auto-deploy.

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

## License

[MIT](LICENSE) © Ali Ammari.
