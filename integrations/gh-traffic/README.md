<!-- SPDX-License-Identifier: MIT -->

# gh traffic

A focused GitHub CLI extension for public repository growth and your own
traffic history. Public commands use the [versioned analytics API](../../docs/public-api.md)
without a product login. Owner commands call `gh api` locally, so your GitHub
token is never sent to the analytics service.

The extension source lives here and is published as a separate repository named
`aliammari1/gh-traffic` because [GitHub CLI requires](https://cli.github.com/manual/gh_extension)
extension repositories to start with `gh-` and contain an executable with the
same name at their root.

```bash
gh extension install aliammari1/gh-traffic
gh traffic view cli/cli
gh traffic stars cli/cli --days 30
gh traffic release cli/cli v2.0.0
gh traffic compare cli/cli vercel/next.js
gh traffic report OWNER/REPO
gh traffic export OWNER/REPO --format csv > traffic.csv
```

`report` and `export` need local `gh auth` access to the repository traffic API.
`export` first reads `data/daily.json` from the `traffic-history` branch created
by [GitHub Traffic Analytics Lite](../../docs/github-action.md). If that branch
does not exist, it uses GitHub's current traffic API window. Select
`--source archive` or `--source live` to require one source. The seven-day
traffic report needs all seven complete daily observations; gaps display as
unavailable rather than zero. Public star growth is the API's recent seven-day
window and may end on a different day than the completed traffic window.

Requires GitHub CLI and Node.js 20 or newer. Run `gh traffic help` for all
commands. Set `GTA_API_BASE` to a different deployment's `/api/v1` URL when
needed.
