// SPDX-License-Identifier: MIT
/**
 * Daily-snapshot Cloudflare Worker (Cron Trigger).
 *
 * Every day it reads the opted-in repos from D1 (`tracked_repos`), calls the
 * GitHub traffic API for each, and upserts one row per day/metric into
 * `traffic_snapshots`. Because GitHub only serves the last 14 days, persisting a
 * daily snapshot lets the dashboard show history far beyond that window — the
 * app's headline value proposition.
 *
 * Configured via wrangler.jsonc (`triggers.crons` + the `DB` D1 binding).
 * It does not deploy from this environment (no Cloudflare creds); the deploy
 * workflow is gated on CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID secrets.
 */
import { upsertDailyCounts, toDayKey, type D1Database, type Metric } from "../src/lib/snapshots";

export interface Env {
  DB: D1Database;
}

interface TrackedRepo {
  owner_login: string;
  repo_owner: string;
  repo_name: string;
  access_token: string;
}

interface GitHubTrafficResponse {
  count: number;
  uniques: number;
  views?: Array<{ timestamp: string; count: number; uniques: number }>;
  clones?: Array<{ timestamp: string; count: number; uniques: number }>;
}

async function fetchTraffic(
  token: string,
  owner: string,
  repo: string,
  metric: Metric
): Promise<GitHubTrafficResponse | null> {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/traffic/${metric}?per=day`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "github-traffic-analytics-snapshot",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );
  if (!res.ok) {
    console.error(`GitHub ${metric} fetch failed for ${owner}/${repo}: ${res.status}`);
    return null;
  }
  return (await res.json()) as GitHubTrafficResponse;
}

/** Snapshot all tracked repos. Exported for testability; called by the cron handler. */
export async function runSnapshots(env: Env): Promise<{ repos: number; rows: number }> {
  const { results } = await env.DB.prepare(
    `SELECT owner_login, repo_owner, repo_name, access_token FROM tracked_repos`
  ).all<TrackedRepo>();

  let rows = 0;
  for (const repo of results) {
    for (const metric of ["views", "clones"] as Metric[]) {
      const data = await fetchTraffic(
        repo.access_token,
        repo.repo_owner,
        repo.repo_name,
        metric
      );
      if (!data) continue;

      const series = metric === "views" ? data.views : data.clones;
      const points = (series ?? []).map((p) => ({
        day: toDayKey(p.timestamp),
        count: p.count,
        uniques: p.uniques,
      }));

      rows += await upsertDailyCounts(env.DB, {
        ownerLogin: repo.owner_login,
        repoOwner: repo.repo_owner,
        repoName: repo.repo_name,
        metric,
        points,
      });
    }
  }
  return { repos: results.length, rows };
}

const handler = {
  async scheduled(_event: unknown, env: Env, ctx: { waitUntil(p: Promise<unknown>): void }) {
    ctx.waitUntil(
      runSnapshots(env)
        .then((r) => console.log(`Snapshot run complete: ${r.repos} repos, ${r.rows} rows`))
        .catch((err) => console.error("Snapshot run failed:", err))
    );
  },
};

export default handler;
