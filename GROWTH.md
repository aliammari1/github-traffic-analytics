<!-- SPDX-License-Identifier: MIT -->
# Growth & distribution kit

Ready-to-paste assets for launching **github-traffic-analytics**. Owner action
items are marked 👤. The one-line hook: *"keep your GitHub traffic past 14 days."*

---

## 1. Repo metadata (👤 set in GitHub Settings)

### Topics (add under "About" → gear icon)

```
github-analytics
self-hosted
repository-analytics
star-history
nextjs
cloudflare
github-api
```

Optional extras if room (limit 20): `traffic-analytics`, `repobeats-alternative`,
`d1`, `open-source`, `developer-tools`, `analytics`.

### About (description field)

> Self-hosted, open-source GitHub repo analytics. Keep your traffic, clones &
> stars forever (GitHub deletes them after 14 days). Free Repobeats /
> star-history alternative — Next.js + Cloudflare D1, with an embeddable badge.

### Website field

`https://github-traffic-analytics.pages.dev`

---

## 2. Show HN (👤 post Tue–Thu ~13:00–16:00 UTC)

**Title:**

> Show HN: Keep your GitHub traffic past 14 days

**URL:** the live demo (`https://github-traffic-analytics.pages.dev`), repo link
in the first comment.

**First comment (seed it yourself, then reply fast):**

> I kept losing my repo traffic data — GitHub's traffic API only returns the last
> 14 days, then it's gone forever. So I built a self-hosted dashboard that takes a
> daily snapshot of views/clones/stars into Cloudflare D1, so your history
> accumulates from day one and never expires.
>
> It runs entirely on Cloudflare's free tier (Pages + D1 + a Cron Worker), it's
> MIT-licensed, and there's an embeddable live traffic badge you can drop into any
> README. Think of it as a self-hosted, free alternative to Repobeats /
> star-history where *you* own the data.
>
> Stack: Next.js 16 (App Router), Cloudflare D1, NextAuth (GitHub OAuth), optional
> Anthropic-powered "summarize my traffic" panel. Deploy-your-own is one button.
>
> Next up (Wave 2): extracting the snapshot loop into a standalone GitHub Action
> so you get the badge without hosting anything. Happy to answer questions about
> the D1 schema, the cron, or the 14-day workaround.

---

## 3. Reddit posts (👤 build karma first; post natively, no link-only)

### r/github

**Title:** I built a self-hosted dashboard so GitHub traffic stops vanishing after 14 days

> GitHub's traffic API only keeps the last 14 days of views/clones. I got tired of
> losing that history, so I made an open-source dashboard that snapshots it daily
> into Cloudflare D1 — your timeline then grows forever. Free tier, MIT, one-click
> deploy, plus an embeddable live traffic badge for your READMEs. Would love
> feedback on the approach. [repo + demo links]

### r/selfhosted

**Title:** Self-hosted GitHub repo analytics (Repobeats/star-history alternative) — own your traffic data

> Runs on Cloudflare's free tier (Pages + D1 + Cron Worker). Snapshots
> views/clones/stars daily so nothing is lost after GitHub's 14-day window, keeps
> star history, has an embeddable badge, and an optional AI "summarize my traffic"
> panel. No external SaaS — your data stays in your own D1. MIT licensed.
> [repo + demo links]

---

## 4. awesome-selfhosted submission (👤 open PR)

Submit to [`awesome-selfhosted/awesome-selfhosted`](https://github.com/awesome-selfhosted/awesome-selfhosted)
under **Analytics** (alphabetical), matching the list's format:

```
- [GitHub Traffic Analytics](https://github.com/aliammari1/github-traffic-analytics) - Self-hosted GitHub repository analytics that keeps your traffic, clones and stars beyond GitHub's 14-day limit; includes an embeddable live traffic badge. ([Demo](https://github-traffic-analytics.pages.dev), [Source Code](https://github.com/aliammari1/github-traffic-analytics)) `MIT` `Nodejs`
```

Checklist before submitting: 30+ days old, clear docs, demo link, license file,
passes `awesome-lint` formatting.

---

## 5. Other directories (👤 compounding faucet)

- **OpenAlternative** — list as a Repobeats / star-history open-source alternative.
- **LibHunt / SaaSHub** — "GitHub repo analytics" category.
- **opensource.builders** — alternative-to entry.
- **awesome-nextjs** — under apps/projects built with Next.js.

---

## 6. Wave 2 — the compounding artifact

Extract the snapshot loop into a **"persist repo traffic → badge + JSON" GitHub
Action** and publish to the **Actions Marketplace**. Each install adds a README
badge that backlinks here — the viral loop. Dogfood it across the whole portfolio.
