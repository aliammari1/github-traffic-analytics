<!-- SPDX-License-Identifier: MIT -->

# Public analytics API v1

The versioned API powers command-line and editor integrations. It analyzes
public repositories without a product login. All values come from GitHub
observations and the same deterministic analytics used by the web app.
Traffic views, clones, referrers, paths, and stored owner history are private
and are not included here.

Base URL:

```text
https://github-traffic-analytics.ali-ammari.workers.dev/api/v1
```

| Request                                             | Result                                                                 |
| --------------------------------------------------- | ---------------------------------------------------------------------- |
| `GET /repositories/OWNER/REPO`                      | Compact growth summary, momentum and latest release.                   |
| `GET /repositories/OWNER/REPO?view=history&days=90` | Recent observed star points; `days` is 1–180.                          |
| `GET /repositories/OWNER/REPO?view=release&tag=TAG` | Before/after release comparison when both 14-day windows are observed. |
| `GET /repositories/OWNER/REPO?view=anomalies`       | Up to ten recent deterministic public star signals.                    |
| `GET /compare?repos=OWNER/REPO,OTHER/REPO`          | Compact summaries for two to four repositories.                        |

The `version` field is `1`. Star growth and momentum can be `null` when a
complete observation window is unavailable. Release `impact` can be `null`
while its post-release window is in progress or history is incomplete.
Missing data is never returned as measured zero. Release impact describes
temporal association, not causation. Star history contains only observed
dates, not an all-time reconstruction.

Successful responses are cached at the edge for five minutes. Invalid input
returns 400, a private or missing repository returns 404, and a GitHub rate
limit returns 429 with `resetAt` when GitHub supplies it. Errors use
`Cache-Control: no-store`. The public API has a per-isolate request limit;
large integrations should cache responses and avoid polling.

Example:

```bash
curl -fsS 'https://github-traffic-analytics.ali-ammari.workers.dev/api/v1/repositories/aliammari1/github-traffic-analytics'
```
