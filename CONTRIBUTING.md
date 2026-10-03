<!-- SPDX-License-Identifier: MIT -->

# Contributing to GitHub Traffic Analytics

Thank you for your interest in improving GitHub Traffic Analytics! We are building an open-source growth intelligence platform to help maintainers and developers understand why repositories grow.

---

## 🏗️ Codebase Structure

```text
src/
├── app/
│   ├── api/
│   │   ├── card/[owner]/[repo]/ # Embeddable README SVG growth card generator
│   │   ├── badge/               # Shields-style live views badge endpoint
│   │   ├── public/repo/         # Unauthenticated public repository intelligence API
│   │   ├── insights/            # Contextual AI streaming endpoint (Anthropic)
│   │   ├── traffic/             # Authenticated GitHub traffic data proxy
│   │   ├── track/               # Toggle snapshot tracking per repo
│   │   ├── repositories/        # User repository listing with tracking status
│   │   └── snapshots/           # Historical D1 snapshot queries
│   ├── repo/[owner]/[repo]/     # Public canonical repository intelligence page
│   ├── compare/                 # Multi-repository comparative trajectory analysis
│   ├── repositories/            # Authenticated repository manager & portfolio view
│   ├── traffic/                 # Authenticated 14-day & long-term traffic dashboard
│   ├── page.tsx                 # Public homepage & instant repo analyzer
│   └── layout.tsx               # Root application layout & navigation
├── components/
│   ├── StarHistoryChart.tsx     # Trajectory line chart with release event markers
│   ├── ShareActions.tsx         # Share modal, copy link, and copy Markdown card
│   ├── InsightsPanel.tsx        # Contextual AI explanation buttons
│   ├── HistoricalTraffic.tsx    # Multi-month D1 historical views & clones chart
│   └── TrafficDashboard.tsx     # Private traffic analytics visualization
├── lib/
│   ├── analytics.ts             # Deterministic math engine (velocity, momentum, release impact)
│   ├── github-public.ts         # Unauthenticated typed public GitHub API client & cache
│   ├── github.ts                # Authenticated Octokit traffic proxy
│   ├── growth-card.ts           # Zero-dependency SVG generator & themes
│   ├── badge.ts                 # Zero-dependency SVG shields badge renderer
│   ├── insights.ts              # Zod validation & deterministic prompt construction for AI
│   └── snapshots.ts             # Cloudflare D1 query layer for daily snapshots
└── test/                        # Shared test setup, MSW handlers, and mocks
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

## 🧪 Running Tests & Quality Gates

All pull requests must pass the project's quality gates:

```bash
# 1. ESLint check
pnpm lint

# 2. TypeScript compilation
pnpm typecheck

# 3. Unit and component tests with coverage (must satisfy ≥ 80% thresholds)
pnpm test:coverage

# 4. Production Next.js build
pnpm build

# 5. Playwright end-to-end test suite
pnpm test:e2e

# 6. Documentation site build
cd docs && pnpm install --frozen-lockfile && pnpm build && cd ..
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
