# 📊 GitHub Traffic Analytics — Product Roadmap (2026)

> A GitHub growth intelligence platform that explains why repositories are growing, preserves analytics GitHub deletes after 14 days, and provides clear briefings when something meaningful changes.

---

## 🎯 Product Positioning

- **Core Promise:** See what is driving your GitHub repository's growth, preserve the analytics GitHub deletes after 14 days, and understand what changed.
- **Key Differentiator:**
  1. Long-term traffic history beyond GitHub's 14-day retention window.
  2. Public-first repository analytics without requiring login.
  3. Star growth velocity and release event correlation.
  4. Deterministic explanations and contextual AI insights rather than raw charts.

---

## 🚀 Status & Roadmap

```
[Shipped: Core & Public Analytics] ──▶ [Next: Intelligence & Action] ──▶ [Later: Ecosystem & Distribution]
```

### 1. Shipped (Current Release)

#### Core Analytics & Persistence

- [x] **14-day window bypass**: Daily automated Cloudflare Cron Worker snapshotting views and clones into Cloudflare D1.
- [x] **Traffic dashboard**: Interactive views, clones, top referrers, and popular content paths.
- [x] **Public repository analyzer**: Instant analysis of any public repository (`owner/repo` or full GitHub URL) without authentication.
- [x] **Star history & velocity**: Real-time star trajectory, 7-day/30-day growth, and current weekly velocity.
- [x] **Release event timeline**: Public release markers overlaid with growth periods using non-causal attribution.
- [x] **README badge generator**: Dynamic Shields-style SVG (`/api/badge`) rendering accumulated views since tracking began.

#### Intelligence & User Experience

- [x] **Deterministic analytics layer**: Pure TypeScript statistical engine computing moving averages, percentage changes, star velocity, and traffic spikes.
- [x] **"What Changed" briefings**: Pre-computed bulleted change summaries before diving into raw charts.
- [x] **Contextual AI explanations**: Structured LLM insights (`claude-haiku-4-5`) explaining already-computed deterministic metrics.
- [x] **Progressive disclosure**: Public metrics accessible to anyone; private traffic analytics securely unlocked for verified repository owners/collaborators.
- [x] **Secure token architecture**: GitHub OAuth tokens are encrypted in an httpOnly session cookie and never exposed to client JavaScript.

---

### 2. Next (Immediate Focus)

#### Deeper Intelligence

- [ ] **Deterministic anomaly detection**: Add z-score analysis and sudden-drop detection beyond the shipped moving-average spike detector.
- [ ] **Release impact analysis**: Windowed comparison of traffic and star velocity 14 days before vs 14 days after major releases.
- [ ] **Weekly digest summaries**: Automated Monday morning markdown briefings summarizing the past 7 days of repository growth.
- [ ] **Multi-repository comparison**: Side-by-side growth and star velocity comparison across public and private repositories.
- [ ] **CSV / JSON export**: One-click download of full accumulated snapshot histories for external BI and spreadsheets.

#### Distribution & Sharing

- [ ] **Public shareable report cards**: OpenGraph dynamic preview cards showcasing a repository's growth milestone.
- [ ] **Standalone GitHub Action**: Action to snapshot traffic directly into repository artifacts or external storage without hosting the web app.

---

### 3. Later (Future Horizons)

#### Retention & Integrations

- [ ] **Slack & Discord webhooks**: Notifications for major milestones (e.g., 1k stars, 10k views) and unexpected traffic spikes.
- [ ] **GitHub Issue/Discussion automated reports**: Optional scheduled weekly growth report posted to repository discussions.
- [ ] **`gh` CLI extension**: `gh traffic` extension querying the analytics engine directly from the developer terminal.
- [ ] **MCP (Model Context Protocol) server**: Expose repository growth telemetry to agentic AI workflows.
- [ ] **Opt-in weekly email reports**: Transactional email dispatch summarizing tracked portfolio metrics.

---

### 4. Explicitly Not Planned

To maintain product focus, reliability, and security, the following are intentionally out of scope:

- ❌ **3D / WebGL dashboards / VR / AR**: Complex 3D visualizations add unnecessary bundle size and degrade accessibility. Clean, responsive SVG/Canvas charts are faster and more readable.
- ❌ **Native mobile apps (React Native / iOS / Android)**: The responsive web app is fully mobile-compatible across desktop and mobile browsers.
- ❌ **Blockchain / Web3 analytics**: Unrelated to developer tools and repository growth intelligence.
- ❌ **Autonomous AI agents altering repositories**: The platform provides analytical intelligence, not unmonitored code generation.
- ❌ **Heavy enterprise multi-tenant database clusters**: The architecture leverages serverless edge compute (Cloudflare Pages, D1, Cron Triggers) to maintain zero server maintenance and a free tier.

---

## 🛠️ Architecture Principles

1. **Developer-native**: Built for developers who value fast, clean, and reliable data over decorative fluff.
2. **Show value before asking for auth**: Anyone can analyze public repositories immediately; authentication is reserved for private metrics.
3. **Deterministic metrics first**: Math and anomaly detection are computed by tested code; AI is used strictly to narrate and explain, never to calculate.
4. **Tokens never touch client JavaScript**: NextAuth session tokens are stored in encrypted httpOnly cookies, keeping GitHub access tokens inaccessible to client-side code.
