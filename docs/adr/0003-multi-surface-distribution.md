<!-- SPDX-License-Identifier: MIT -->

# ADR 0003: Multi-Surface Distribution Architecture

## Status

Accepted

## Context

Open-source developer tools often struggle with user acquisition because they require users to repeatedly visit a separate web dashboard. Developer workflows naturally happen across diverse environments:

- In developer terminals (`git`, `gh`)
- In IDEs and AI coding agents (Antigravity, Cursor, Claude Code)
- In desktop application launchers (Raycast on macOS)
- In CI/CD pipelines (GitHub Actions)
- In team communication channels (Slack, Discord)
- In repository collaboration spaces (GitHub Discussions, Issues)

## Decision

We treat **distribution surfaces as first-class citizens**, powered by a single core analytics engine:

1. **Web Dashboard:** Interactive exploration, comparative analysis, launch reports, and configuration.
2. **Embeddable SVG Cards:** Zero-dependency growth and comparison cards designed to be copy-pasted into READMEs, driving organic viral discovery.
3. **Milestone Certificates:** Exportable SVG vector certificates celebrating star milestones (1k, 5k, 10k, 25k, etc.) for social and release announcements.
4. **GitHub CLI Extension (`gh traffic`):** Terminal-native insights for command-line developers.
5. **Model Context Protocol (MCP) Server:** Structured JSON-RPC tools enabling AI agents to reason over repository telemetry.
6. **Raycast Extension:** Instant keyboard-driven lookup and card copying on macOS.
7. **Standalone GitHub Action:** Direct git-branch archiving for maintainers who do not wish to use hosted databases.
8. **Automated Report Delivery:** Timezone-aware Monday digests to verified emails, Slack/Discord webhooks, and GitHub Issues/Discussions.

## Consequences

- Every surface acts as an organic acquisition loop back to the open-source repository.
- Developers interact with traffic analytics within their existing daily workflows rather than having to remember a bookmark.
- The underlying architecture remains unified because all surfaces share the same pure TypeScript analytics core or query the versioned `/api/v1/` REST endpoints.
