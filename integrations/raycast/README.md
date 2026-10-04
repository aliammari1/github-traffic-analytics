<!-- SPDX-License-Identifier: MIT -->

# GitHub Traffic Analytics Raycast extension

Keyboard-driven repository growth intelligence for Raycast on macOS and Windows.
Look up observed star momentum, inspect recent growth velocity, compare repositories,
launch interactive release reports, and copy README growth cards without leaving
your launcher.

Uses the [versioned public analytics API](../../docs/public-api.md) without requiring
a product account or API key.

## Installation

From the repository checkout:

```bash
cd integrations/raycast
pnpm install --ignore-workspace
npm run dev # or npm run build
```

Or open Raycast, run **Import Extension**, and select the `integrations/raycast` folder.

## Available commands

| Command                     | Shortcut / Mode          | Description                                                                     |
| --------------------------- | ------------------------ | ------------------------------------------------------------------------------- |
| **Analyze Repository**      | View (`owner/repo`)      | Instant stars, 7d/30d growth, momentum score, latest release, and copy actions. |
| **Recent Star Velocity**    | View (`owner/repo`)      | Recent 14-day observed star data points and trajectory velocity notes.          |
| **Recent Repositories**     | View                     | Search and jump back to repositories you recently analyzed.                     |
| **Compare Repositories**    | View (`first`, `second`) | Side-by-side growth comparison table with browser jump actions.                 |
| **Launch Growth Report**    | No-view (`owner/repo`)   | Immediately opens the repository report in your default browser.                |
| **Copy README Growth Card** | No-view (`owner/repo`)   | Copies the embeddable SVG README markdown card into your clipboard.             |

## Configuration

In Raycast preferences under **GitHub Traffic Analytics**, you can optionally customize:

- **Analytics API**: URL base for the public analytics API (defaults to `https://github-traffic-analytics.ali-ammari.workers.dev/api/v1`).
