# Open Source Growth Plan

This plan converts the repository review into an actionable backlog for GitHub Traffic Analytics.

## Quick wins

- Add screenshots of the dashboard, charts, referrers, clones, and popular paths.
- Add a one-click Vercel deployment section with required environment variables.
- Add end-to-end tests for authentication, repository selection, and dashboard rendering.
- Add API error handling guidance for GitHub rate limits and token failures.
- Add caching guidance for GitHub API responses.
- Add `good first issue` tasks for charts, empty states, docs, and accessibility.

## Bugs and bad practices to watch

- Exposing GitHub tokens or secrets in client-side bundles.
- Missing empty/error/loading states for traffic APIs.
- Excessive API calls without caching or backoff.
- Chart components tightly coupled to raw API responses.
- Date range bugs around timezone boundaries.

## Star growth strategy

1. Put sample dashboard screenshots above the fold.
2. Add a live demo with mock traffic data.
3. Add GitHub topics such as `github-api`, `analytics`, `nextjs`, and `dashboard`.
4. Publish a short guide about tracking repository growth.
5. Add exportable Markdown reports for maintainers.

## Trending-library opportunities

- Use Polars in an optional analytics worker for deeper traffic aggregation.
- Use Data-Formulator-style chart ideas for auto-generated visualizations.
- Use MarkItDown-style export for Markdown traffic summaries.

## Suggested next PRs

- Add Playwright smoke tests.
- Add cache/backoff utilities around GitHub API calls.
- Add mock-data demo mode.
