<!-- SPDX-License-Identifier: MIT -->

# Contributing

Thanks for your interest in improving GitHub Traffic Analytics!

## Development setup

```bash
pnpm install
cp .env.example .env.local   # fill in GitHub OAuth + (optional) Anthropic key
pnpm dev
```

Optionally install the git hooks (mirror CI locally):

```bash
pnpm dlx lefthook install
```

## Before opening a PR

Run the same checks CI runs:

```bash
pnpm lint
pnpm typecheck
pnpm test:coverage   # must keep ≥ 80% coverage
pnpm build
pnpm test:e2e        # Playwright
```

## Pull requests

- PR **titles** must follow [Conventional Commits](https://www.conventionalcommits.org/)
  (`feat:`, `fix:`, `docs:`, `chore:`, …) — enforced by the Semantic PR check.
- Keep PRs focused; add/adjust tests for behavior changes.
- New code should carry an `// SPDX-License-Identifier: MIT` header where practical.

## Reporting bugs / requesting features

Use the issue templates under **Issues → New issue**.
