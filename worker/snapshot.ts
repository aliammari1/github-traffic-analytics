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
import * as Sentry from "@sentry/cloudflare";
import { upsertDailyCounts, toDayKey, type D1Database, type Metric } from "../src/lib/snapshots";
import { runWeeklyDigests, type DigestEnv } from "./digest";
import { runGitHubReports } from "./github-reports";
import { runNotifications } from "./notifications";
import { replaceSourceSnapshot } from "../src/lib/source-snapshots";

export interface Env extends DigestEnv {
  DB: D1Database;
  WEBHOOK_ENCRYPTION_KEY?: string;
  /** Optional Sentry DSN — when set, snapshot-cron failures are reported + alerted. */
  SENTRY_DSN?: string;
  /** Cloudflare deploy environment label for Sentry (e.g. "production"). */
  SENTRY_ENVIRONMENT?: string;
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

interface GitHubSourceResponse {
  referrer?: string;
  path?: string;
  count: number;
  uniques: number;
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

async function fetchSources(
  token: string,
  owner: string,
  repo: string,
  kind: "referrer" | "path"
): Promise<Array<{ name: string; count: number; uniques: number }> | null> {
  const endpoint = kind === "referrer" ? "referrers" : "paths";
  const response = await fetch(
    `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/traffic/popular/${endpoint}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "github-traffic-analytics-snapshot",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );
  if (!response.ok) {
    console.error(`GitHub ${kind} fetch failed for ${owner}/${repo}: ${response.status}`);
    return null;
  }
  const data = (await response.json()) as GitHubSourceResponse[];
  return data
    .map((item) => ({
      name: kind === "referrer" ? (item.referrer ?? "") : (item.path ?? ""),
      count: item.count,
      uniques: item.uniques,
    }))
    .filter((item) => item.name.length > 0);
}

/** Snapshot all tracked repos. Exported for testability; called by the cron handler. */
export async function runSnapshots(
  env: Env,
  now = new Date()
): Promise<{ repos: number; rows: number; sources: number }> {
  const { results } = await env.DB.prepare(
    `SELECT owner_login, repo_owner, repo_name, access_token FROM tracked_repos`
  ).all<TrackedRepo>();

  let rows = 0;
  let sources = 0;
  for (const repo of results) {
    for (const metric of ["views", "clones"] as Metric[]) {
      const data = await fetchTraffic(repo.access_token, repo.repo_owner, repo.repo_name, metric);
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
    for (const kind of ["referrer", "path"] as const) {
      const observed = await fetchSources(repo.access_token, repo.repo_owner, repo.repo_name, kind);
      if (!observed) continue;
      await replaceSourceSnapshot(env.DB, {
        ownerLogin: repo.owner_login,
        repoOwner: repo.repo_owner,
        repoName: repo.repo_name,
        kind,
        capturedDay: now.toISOString().slice(0, 10),
        sources: observed,
      });
      sources += observed.length;
    }
  }
  return { repos: results.length, rows, sources };
}

const handler = {
  async scheduled(
    event: { cron: string; scheduledTime: number },
    env: Env,
    ctx: { waitUntil(p: Promise<unknown>): void }
  ) {
    if (event.cron === "0 * * * *") {
      ctx.waitUntil(
        Promise.allSettled([
          runWeeklyDigests(env, new Date(event.scheduledTime)),
          runGitHubReports(env, new Date(event.scheduledTime)),
        ])
          .then(([email, github]) => {
            if (email.status === "rejected") throw email.reason;
            if (github.status === "rejected") throw github.reason;
            const result = email.value;
            console.log(
              `Weekly digest run: ${result.due} due, ${result.sent} sent, ${result.failed} failed, ${result.revoked} access revoked`
            );
            const reports = github.value;
            console.log(
              `GitHub report run: ${reports.due} due, ${reports.sent} sent, ${reports.failed} failed, ${reports.revoked} access revoked`
            );
            if (result.failed || reports.failed)
              throw new Error(
                `${result.failed} emails and ${reports.failed} GitHub reports failed`
              );
          })
          .catch((error) => {
            Sentry.captureException(error, { tags: { job: "scheduled-reports" } });
            throw error;
          })
      );
      return;
    }
    ctx.waitUntil(
      runSnapshots(env, new Date(event.scheduledTime))
        .then(async (r) => {
          console.log(
            `Snapshot run complete: ${r.repos} repos, ${r.rows} traffic rows, ${r.sources} source rows`
          );
          if (env.WEBHOOK_ENCRYPTION_KEY) {
            try {
              const alerts = await runNotifications(env, new Date(event.scheduledTime));
              console.log(
                `Alert run: ${alerts.repos} repos, ${alerts.sent} sent, ${alerts.failed} failed`
              );
              if (alerts.failed) throw new Error(`${alerts.failed} alert deliveries failed`);
            } catch (error) {
              Sentry.captureException(error, { tags: { job: "daily-alerts" } });
              console.error("Daily alert run failed", {
                reason: error instanceof Error ? error.name : "unknown",
              });
            }
          }
        })
        .catch((err) => {
          // The cron is the headline feature (it beats GitHub's 14-day window). A
          // silent failure means history quietly stops accumulating, so surface it
          // to Sentry — wire an alert rule on this event to get paged.
          console.error("Snapshot run failed:", err);
          Sentry.captureException(err, { tags: { job: "daily-snapshot" } });
        })
    );
  },
};

// Wrap the Worker with Sentry so uncaught errors in the scheduled handler are
// reported. No-ops when SENTRY_DSN is unset (local/CI), so nothing else changes.
export default Sentry.withSentry(
  (env: Env) => ({
    dsn: env.SENTRY_DSN,
    environment: env.SENTRY_ENVIRONMENT ?? "production",
    tracesSampleRate: 0.1,
    enabled: Boolean(env.SENTRY_DSN),
  }),
  handler
);
