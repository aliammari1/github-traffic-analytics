<!-- SPDX-License-Identifier: MIT -->

# ADR 0002: Edge-First Runtime with Cloudflare Workers and D1

## Status

Accepted

## Context

GitHub native traffic analytics (views and clones) are ephemeral: GitHub automatically discards all historical traffic after 14 days. To deliver long-term growth intelligence without operational bloat, GitHub Traffic Analytics requires:

1. Automated daily snapshots of views, clones, referrers, and paths for opted-in repositories.
2. Low-latency edge delivery of dynamic SVG cards and badges to developer READMEs worldwide.
3. Minimal operational maintenance and zero monthly fixed server overhead.

Traditional architectures would employ containerized servers (e.g. Node.js on VPS/Kubernetes), persistent Redis instances, and centralized PostgreSQL databases.

## Decision

We adopt an **Edge-First Architecture** built entirely on the Cloudflare ecosystem:

1. **Application Runtime:** Next.js 16 deployed to Cloudflare Workers via `@opennextjs/cloudflare`.
2. **Database:** Cloudflare D1 (serverless SQL based on SQLite) for structured persistence of snapshots, tracked repositories, user alert preferences, and weekly digests.
3. **Scheduled Ingestion:** Cloudflare Cron Triggers executing lightweight worker scripts (`worker/snapshot.ts` and `worker/digest.ts`) directly against D1.
4. **Zero State in Memory:** All persistent state resides in D1 or encrypted httpOnly session cookies. Public API requests utilize Edge Memory Caches with explicit TTLs (5 minutes for repository intelligence, 10–60 minutes for SVG cards).

## Consequences

- **Global Latency:** SVG cards, certificates, and API endpoints are served from edge locations proximate to users and GitHub README viewers.
- **Reliability:** Serverless Workers scale automatically with zero cold-start penalty compared to containerized runtimes.
- **Cost & Maintenance:** No servers to patch, upgrade, or manage. Development and testing use local SQLite / Miniflare environments.
- **Isolation:** Private traffic data is partitioned and protected behind encrypted tokens, ensuring public routes never access private D1 tables.
