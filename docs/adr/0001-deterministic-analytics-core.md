<!-- SPDX-License-Identifier: MIT -->

# ADR 0001: Deterministic Analytics Core

## Status

Accepted

## Context

GitHub Traffic Analytics is accessed through multiple client surfaces and delivery channels:

1. Public Web UI (`/repo/[owner]/[repo]`, `/compare`, `/launch/[owner]/[repo]`)
2. Private Traffic Dashboard (`/traffic`, `/repositories`)
3. Embeddable SVG Cards (`/api/card/...`, `/api/card/compare`, `/api/card/milestone/...`, `/api/certificate/...`)
4. Versioned Public REST API (`/api/v1/...`)
5. Official GitHub CLI Extension (`gh traffic`)
6. Model Context Protocol (MCP) Server for AI coding agents (Antigravity, Cursor, Claude Code)
7. Raycast macOS Extension
8. Standalone GitHub Action (`action/`)
9. Automated Scheduled Delivery (Email digests, Discord/Slack webhooks, GitHub Discussions/Issues)

In early prototyping, there was a risk that analytics math (such as star velocity, acceleration ratio, momentum score, release window impact, or anomaly detection) could diverge across these interfaces or rely on nondeterministic LLM evaluation.

## Decision

All analytics calculations are strictly isolated as **pure, deterministic TypeScript functions** in `src/lib/analytics.ts`, `src/lib/anomalies.ts`, and `src/lib/weekly-report.ts`:

1. **Zero LLM Math:** Language models are strictly prohibited from calculating numbers, ratios, or statistical anomalies. LLMs are downstream-only consumers used exclusively to generate prose explanations of precomputed, verified telemetry.
2. **Surface Independence:** Every interface (Web UI, API v1, SVG Cards, CLI, MCP Server, Raycast Extension, and Cron Workers) imports and evaluates the exact same domain functions or calls the single versioned REST API.
3. **Non-Causal Language:** Temporal associations (e.g., comparing star velocity 14 days before vs. 14 days after a release tag) are always articulated as non-causal observations, preserving scientific integrity.
4. **Zero-Dependency SVG Rendering:** All embeddable cards and certificates are generated using pure string templating with strict XML escaping and accessible `<title>`/`<desc>` attributes, ensuring microsecond cold-start latency and zero external library bloat.

## Consequences

- **Consistency:** Maintainers see the exact same star velocity, momentum scores, and anomaly alerts whether viewing the Web dashboard, running `gh traffic view`, querying through an AI agent via MCP, or reading an automated weekly report.
- **Testability:** Analytics math can be tested with 100% deterministic coverage without spinning up servers, browsers, or LLM mocks.
- **Portability:** The analytics core has zero browser or Node.js runtime dependencies, allowing it to run seamlessly on Cloudflare Workers, Edge middleware, serverless functions, or local CLI runtimes.
