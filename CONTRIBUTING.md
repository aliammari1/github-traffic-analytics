<!-- SPDX-License-Identifier: MIT -->

# Contributing to GitHub Traffic Analytics

Thank you for your interest in improving GitHub Traffic Analytics! We are building an open-source growth intelligence platform to help maintainers and developers understand why repositories grow.

---

## 🏗️ Codebase Structure

```text
├── action/                      # Standalone GitHub Action for traffic archiving into git branch
├── integrations/
│   ├── gh-traffic/              # Official GitHub CLI extension (`gh traffic view/compare/export`)
│   ├── mcp-server/              # Model Context Protocol server for AI coding agents
│   └── raycast/                 # Native Raycast macOS extension
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── card/            # Zero-dependency SVG cards (growth, comparison, milestone)
│   │   │   ├── certificate/     # Milestone completion SVG certificates
│   │   │   ├── badge/           # Shields-style live views badge endpoint
│   │   │   ├── public/repo/     # Unauthenticated public repository intelligence API
│   │   │   ├── v1/              # Versioned REST API v1 (`/api/v1/repositories/...`, `/api/v1/compare`)
│   │   │   ├── report/          # Neutral weekly report delivery preview & scheduling
│   │   │   ├── alerts/          # Webhook notifications (Slack, Discord)
│   │   │   ├── digest/          # Email digest preferences and delivery
│   │   │   ├── github-app/      # GitHub App setup & webhook handlers
│   │   │   ├── traffic/         # Authenticated GitHub traffic data proxy
│   │   │   ├── track/           # Toggle snapshot tracking per repo
│   │   │   ├── repositories/    # User repository listing with tracking status
│   │   │   └── snapshots/       # Historical D1 snapshot queries & CSV/JSON export
│   │   ├── repo/[owner]/[repo]/ # Public canonical repository intelligence page
│   │   ├── compare/             # Multi-repository comparative trajectory analysis
│   │   ├── launch/[owner]/[repo]# Shareable launch event impact reports
│   │   ├── repositories/        # Authenticated repository manager & portfolio view
│   │   ├── traffic/             # Authenticated 14-day & long-term traffic dashboard
│   │   ├── page.tsx             # Public homepage & instant repo analyzer
│   │   └── manifest.ts          # PWA web app manifest
│   ├── components/              # Shared UI components (Charts, Cards, Panels, Settings)
│   ├── lib/
│   │   ├── analytics.ts         # Deterministic math engine (velocity, momentum, release impact)
│   │   ├── anomalies.ts         # Explainable anomaly detection engine
│   │   ├── weekly-report.ts     # Delivery-neutral weekly analytics report generator
│   │   ├── github-public.ts     # Unauthenticated typed public GitHub API client & cache
│   │   ├── github.ts            # Authenticated Octokit traffic proxy
│   │   ├── webhook-alerts.ts    # Slack / Discord webhook notification dispatcher
│   │   ├── growth-card.ts       # Zero-dependency SVG generator & themes
│   │   ├── comparison-card.ts   # Two-repository SVG comparison card renderer
│   │   ├── milestone-card.ts    # Star milestone badge & threshold logic
│   │   ├── certificate.ts       # Social milestone certificate SVG renderer
│   │   └── snapshots.ts         # Cloudflare D1 query layer for daily snapshots
│   └── test/                    # Shared MSW handlers, deterministic mock data, and test setup
├── worker/
│   ├── snapshot.ts              # Daily Cloudflare Cron Worker (traffic snapshotting)
│   └── digest.ts                # Weekly Monday Cron Worker (email digests & alerts)
└── docs/                        # Project documentation, launch kit, and ADRs
```

---

## 🧮 How Analytics Calculations Work

All metrics in this project are computed using **pure, deterministic TypeScript functions** in [`src/lib/analytics.ts`](src/lib/analytics.ts).

### Principles:

1. **Never ask an LLM to calculate metrics**: Math is computed strictly in code with unit tests. AI is only used downstream to explain precomputed metrics.
2. **Strictly non-causal language**: Releases and events are described as _temporal associations_ (e.g., `"Growth accelerated around this release window"`), never causal claims (e.g., `"This release caused the growth"`).
3. **Preserve resolution**: When GitHub provides bucketed star history, we calculate velocity from observed data points without inventing synthetic timestamps.

### Key Formulas:

- **7-Day Star Velocity (`growth7d`)**: Stars gained between $(T - 7\text{ days})$ and $T$.
- **30-Day Star Velocity (`growth30d`)**: Stars gained between $(T - 30\text{ days})$ and $T$.
- **Weekly Run-Rate**: Projected 7-day velocity based on current daily run-rate.
- **Repository Momentum (0–100 score)**:
  $$\text{Acceleration Ratio} = \frac{\text{growth7d}}{\max(1, \text{growth30d} \times \frac{7}{30})}$$
  Combines scale-damped volume run-rate (40%) and acceleration ratio vs. 30-day baseline (60%).
- **Release Impact Analysis**: Compares star accumulation in a deterministic 14-day window before publication versus the 14-day window after publication:
  $$\text{Velocity Change \%} = \frac{\text{stars}_{\text{after}} - \text{stars}_{\text{before}}}{\text{stars}_{\text{before}}} \times 100$$

---

## ➕ How to Add a New Metric

1. **Implement pure calculation** in [`src/lib/analytics.ts`](src/lib/analytics.ts):
   - Add a typed interface for the metric output.
   - Ensure the function is deterministic and handles edge cases (zero stars, missing baselines, brand new repos).
2. **Add unit tests** in [`src/lib/analytics.test.ts`](src/lib/analytics.test.ts):
   - Test normal scenarios, boundary dates, and missing historical points.
3. **Expose in analysis API** [`src/app/api/public/repo/route.ts`](src/app/api/public/repo/route.ts) if applicable.
4. **Display in UI** (`src/app/repo/[owner]/[repo]/page.tsx` or `src/app/compare/page.tsx`).

---

## 🎨 How to Add a New Growth-Card Theme

README growth cards are rendered dynamically as fast, zero-dependency SVGs at `/api/card/[owner]/[repo]?theme=<theme_name>`.

To add a new theme:

1. Open [`src/lib/growth-card.ts`](src/lib/growth-card.ts).
2. Add your theme to `CARD_THEMES`:
   ```ts
   export const CARD_THEMES: Record<string, CardTheme> = {
     // ...
     "my-theme": {
       name: "My Theme",
       background: "#1e1e2e",
       border: "#313244",
       textPrimary: "#cdd6f4",
       textSecondary: "#a6adc8",
       accent: "#89b4fa",
       badgeBg: "#45475a",
       badgeText: "#f5e0dc",
       starColor: "#f9e2af",
     },
   };
   ```
3. Ensure colors meet WCAG AA contrast standards.
4. Add a test in [`src/lib/growth-card.test.ts`](src/lib/growth-card.test.ts) verifying the theme renders properly.

---

## 🚨 How to Add a Deterministic Growth Signal

Growth signals and anomalies in [`src/lib/anomalies.ts`](src/lib/anomalies.ts) provide explainable insights on traffic, stars, clones, and referrers without opaque heuristics:

1. Define the signal type in `GrowthSignal['type']`.
2. Implement the deterministic detection logic comparing observation windows against baseline history.
3. Include explainable human-readable reasoning and release context when available.
4. Add unit tests in [`src/lib/anomalies.test.ts`](src/lib/anomalies.test.ts) testing threshold edges and zero baselines.

---

## 🔔 How to Add a Notification Provider

Webhook notifications are dispatched deterministically in [`src/lib/webhook-alerts.ts`](src/lib/webhook-alerts.ts):

1. Define provider format in `WebhookPlatform` (`slack`, `discord`, `custom`).
2. Construct payload adhering to the platform's incoming webhook schema.
3. Ensure webhook URLs are stored encrypted in Cloudflare D1 (`app_alert_webhooks`) via [`src/lib/webhook-secrets.ts`](src/lib/webhook-secrets.ts).
4. Add unit tests verifying delivery formatting and error handling.

---

## 🔌 Working with Integrations

- **GitHub CLI Extension (`integrations/gh-traffic`)**: Standalone CLI extension wrapping public and authenticated endpoints. Test with `node index.js view owner/repo`.
- **MCP Server (`integrations/mcp-server`)**: Model Context Protocol server exposing `analyze_repo_growth` and `explain_repo_changes` to agentic tools (Antigravity, Cursor, Claude Code). Run `pnpm --ignore-workspace build` and test with standard MCP JSON-RPC.
- **Raycast Extension (`integrations/raycast`)**: macOS command bar extension. Run `pnpm --ignore-workspace run build` and `tsc --noEmit`.
- **Standalone Action (`action/`)**: Standalone GitHub Action archiving traffic to `traffic-history` branch. Test with `node action/index.mjs`.

---

## 🧪 Test-Data Conventions

- **Never mock external APIs with live network calls**: Use MSW (`src/test/msw.ts`) or `vi.fn()` for all Octokit/GitHub REST requests.
- **Deterministic timestamps**: Always freeze time or use static ISO strings (`2026-10-01T00:00:00Z`) when testing date-dependent formulas.
- **Explicit error paths**: Always verify 400, 404, 409, 429, and 503 scenarios with appropriate `Cache-Control: private, no-store` responses.

---

## 🧪 Running Tests & Quality Gates

All pull requests must pass the project's quality gates:

```bash
# 1. ESLint check
pnpm lint

# 2. TypeScript compilation
pnpm typecheck

# 3. Code formatting check
pnpm format:check

# 4. Unit and component tests with coverage (must satisfy ≥ 80% thresholds)
pnpm test:coverage

# 5. Production Next.js build
pnpm build

# 6. Playwright end-to-end test suite
CI=true pnpm test:e2e

# 7. Cloudflare Worker OpenNext bundle build
SKIP_ENV_VALIDATION=true pnpm cf:build

# 8. Production dependency security audit
pnpm audit --prod

# 9. Documentation site build
cd docs && pnpm install --ignore-workspace --frozen-lockfile && pnpm build && cd ..
```

---

## 📋 Pull Request Guidelines

- **Conventional Commits**: PR titles must follow [Conventional Commits](https://www.conventionalcommits.org/) format:
  - `feat: add release velocity percentile comparison`
  - `fix: handle repositories with 0 releases gracefully`
  - `docs: update README embed instructions`
- **Zero-Dependency SVG Cards**: Endpoints like `/api/card` and `/api/badge` must remain lightweight, zero-dependency SVGs with fast cold-start performance.
- **Security & Privacy**:
  - OAuth tokens and credentials must **never** be passed to client components or exposed in HTML/SVGs.
  - Public repository analytics must never expose private repository data or private collaborator identities.
- **Strictly Non-Causal Wording**: Always frame release milestones as temporal associations rather than causal attribution.
