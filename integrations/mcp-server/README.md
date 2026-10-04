<!-- SPDX-License-Identifier: MIT -->

# GitHub Traffic Analytics MCP server

A local, analytics-focused MCP server for coding agents. Public growth tools use
the [versioned analytics API](../../docs/public-api.md) without a product login.
Owner traffic tools call your locally authenticated `gh` executable; your GitHub
token is never sent to the analytics service.

## Install and connect

Requires Node.js 20 or newer. From this repository:

```bash
pnpm install --dir integrations/mcp-server --ignore-workspace --frozen-lockfile
```

Add a stdio server in your MCP client configuration, replacing the path with
your checkout's absolute path:

```json
{
  "mcpServers": {
    "github-traffic-analytics": {
      "command": "node",
      "args": ["/absolute/path/to/github-traffic-analytics/integrations/mcp-server/index.mjs"]
    }
  }
}
```

For private owner traffic, also install GitHub CLI, run `gh auth login`, and
confirm your account has access to the repository's Insights traffic. To use a
different analytics deployment, set `GTA_API_BASE` to its `/api/v1` URL in the
server environment.

| Public tools            | What they return                                    |
| ----------------------- | --------------------------------------------------- |
| `get_repository_growth` | Stars, observed growth, momentum, latest release    |
| `get_star_history`      | Up to 180 days of observed star points              |
| `get_release_impact`    | Measured before/after release window, when complete |
| `compare_repositories`  | Compact comparison of two to four repositories      |
| `get_growth_anomalies`  | Up to ten recent star-growth signals                |

| Owner-only tools      | What they return                                                      |
| --------------------- | --------------------------------------------------------------------- |
| `get_traffic_history` | At most 90 daily view/clone rows from the Action archive or live API  |
| `get_top_referrers`   | Ten leading referrers in GitHub's current traffic window              |
| `get_popular_content` | Ten popular paths in GitHub's current traffic window                  |
| `get_weekly_report`   | Seven complete UTC days of views/clones and latest public star growth |

The owner tools use a repository's `traffic-history` branch when the companion
[GitHub Action](../../docs/github-action.md) has archived it. Otherwise, they use
GitHub's short live traffic window. Missing days and incomplete analytics are
reported as missing or `null`, never fabricated zeroes. A release comparison
shows timing association; it does not establish causation.

Tool responses include compact JSON text and structured content. Errors omit
CLI stderr so credentials and unrelated local details do not enter the agent
conversation.
