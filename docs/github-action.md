<!-- SPDX-License-Identifier: MIT -->

# GitHub Traffic Analytics Lite Action

Archive your own repository traffic to a Git branch without the hosted
dashboard or a database. The Action reads GitHub's traffic API, merges each
**complete UTC day** into JSON and CSV, saves daily captures of GitHub's
rolling top-referrer and popular-path lists, and writes a seven-day Markdown
summary. Missing daily observations appear as unavailable. Source captures
are rolling 14-day lists, not per-day referrals.

## Set it up

1. Create a fine-grained GitHub token with **Administration: read** for the
   repository (or generate an installation token from a GitHub App granted
   that permission). Save it as `TRAFFIC_READ_TOKEN` in the repository's
   Actions secrets. The ordinary workflow `GITHUB_TOKEN` [cannot request
   Administration read](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#defining-access-for-the-github_token-scopes),
   while the [traffic API requires it](https://docs.github.com/en/rest/metrics/traffic).
2. Copy [the example workflow](../examples/traffic-archive.yml) to
   `.github/workflows/traffic-archive.yml` in your repository.
3. In a public repository, keep `allow_public_archive: "true"` only if you
   intend to publish traffic counts. Remove that line for a private repository.
4. Run the workflow once with **Run workflow**, then inspect the
   `traffic-history` branch. The scheduled run will append future days.

The workflow grants `contents: write` only for saving the archive. The
traffic token only needs Administration read. Prefer a GitHub App installation
token when possible because it expires after one hour. If you use a
fine-grained token, restrict it to this repository and rotate it according to
your organization policy. The Action never prints either token.

## Archive layout

```text
traffic-history branch
├── .github-traffic-analytics.json
├── README.md
└── data
    ├── daily.json
    ├── daily.csv
    └── sources
        └── YYYY-MM-DD.json
```

The Action creates an orphan data branch on its first run and refuses to
write to the default branch or an existing branch without its archive marker.
Its `branch` and `path_prefix` inputs can change the paths. For a public
repository, every file in the archive branch is public.

The Action uses GitHub's [JavaScript action runtime](https://docs.github.com/en/actions/tutorials/create-actions/create-a-javascript-action)
with no third-party runtime dependencies. It does not require checkout, a
hosted service, or Cloudflare credentials.
