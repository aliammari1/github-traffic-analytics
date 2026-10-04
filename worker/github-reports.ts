// SPDX-License-Identifier: MIT
import { getHistory, type D1Database } from "../src/lib/snapshots";
import { PublicGitHubService } from "../src/lib/github-public";
import { buildMonthlyReport, buildWeeklyReport } from "../src/lib/weekly-report";
import { reportWindow } from "../src/lib/digest-schedule";
import { getSourceWindows } from "../src/lib/source-snapshots";
import {
  GitHubReportProvider,
  type GitHubReportDestination,
} from "../src/lib/github-report-delivery";
import type { ReportDeliveryProvider } from "../src/lib/report-delivery";
import { verifyTrafficAccess } from "./digest";
import { RepositoryTokenProvider } from "./repository-token";

interface Preference {
  owner_login: string;
  repo_owner: string;
  repo_name: string;
  cadence: "weekly" | "monthly";
  destination: "issue" | "discussion";
  discussion_category_id: string | null;
  time_zone: string;
  access_token: string | null;
  installation_id: number | null;
  repository_id: number | null;
}

export interface GitHubReportEnv {
  DB: D1Database;
  SITE_URL?: string;
  GITHUB_APP_ID?: string;
  GITHUB_APP_PRIVATE_KEY?: string;
}

/** Send only reports explicitly configured by a traffic-authorized maintainer. */
export async function runGitHubReports(
  env: GitHubReportEnv,
  now = new Date(),
  provider: ReportDeliveryProvider<GitHubReportDestination> = new GitHubReportProvider()
): Promise<{ due: number; sent: number; failed: number; revoked: number }> {
  const { results: preferences } = await env.DB.prepare(
    `SELECT p.owner_login, p.repo_owner, p.repo_name, p.cadence, p.destination,
            p.discussion_category_id, p.time_zone, t.access_token,
            CASE WHEN i.active = 1 THEN a.installation_id END AS installation_id,
            CASE WHEN i.active = 1 THEN a.repository_id END AS repository_id
       FROM github_report_preferences p
       LEFT JOIN tracked_repos t ON t.owner_login = p.owner_login
         AND t.repo_owner = p.repo_owner AND t.repo_name = p.repo_name
       LEFT JOIN app_tracked_repos a ON a.owner_login = p.owner_login
         AND a.repo_owner = p.repo_owner AND a.repo_name = p.repo_name
       LEFT JOIN github_app_installations i ON i.installation_id = a.installation_id
      WHERE p.enabled = 1 AND (t.id IS NOT NULL OR (a.repository_id IS NOT NULL AND i.active = 1))`
  ).all<Preference>();
  const tokens = new RepositoryTokenProvider(env);
  let due = 0;
  let sent = 0;
  let failed = 0;
  let revoked = 0;
  for (const pref of preferences) {
    let window: ReturnType<typeof reportWindow>;
    try {
      window = reportWindow(now, pref.time_zone, pref.cadence);
    } catch {
      failed++;
      continue;
    }
    if (!window.isDue) continue;
    due++;
    const { results: claims } = await env.DB.prepare(
      `INSERT INTO github_report_deliveries
         (owner_login, repo_owner, repo_name, period_to, cadence, destination, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')
       ON CONFLICT (owner_login, repo_owner, repo_name, period_to, cadence, destination)
       DO UPDATE SET status = 'pending', attempted_at = datetime('now')
       WHERE status = 'failed'
          OR (status = 'pending' AND attempted_at < datetime('now', '-20 minutes'))
       RETURNING id`
    )
      .bind(
        pref.owner_login,
        pref.repo_owner,
        pref.repo_name,
        window.endingOn,
        pref.cadence,
        pref.destination
      )
      .all<{ id: number }>();
    const deliveryId = claims[0]?.id;
    if (!deliveryId) continue;
    try {
      const accessToken = await tokens.get(pref, pref.destination);
      if (!(await verifyTrafficAccess({ ...pref, access_token: accessToken }))) {
        await env.DB.prepare(
          `DELETE FROM github_report_preferences
           WHERE owner_login = ? AND repo_owner = ? AND repo_name = ?`
        )
          .bind(pref.owner_login, pref.repo_owner, pref.repo_name)
          .run();
        await env.DB.prepare(
          `DELETE FROM github_report_deliveries WHERE id = ? AND status = 'pending'`
        )
          .bind(deliveryId)
          .run();
        revoked++;
        continue;
      }
      const endMs = Date.parse(`${window.endingOn}T00:00:00Z`);
      const days = pref.cadence === "monthly" ? 60 : 14;
      const fromDay = new Date(endMs - (days - 1) * 86_400_000).toISOString().slice(0, 10);
      const [snapshots, sources, analysis] = await Promise.all([
        getHistory(env.DB, {
          ownerLogin: pref.owner_login,
          repoOwner: pref.repo_owner,
          repoName: pref.repo_name,
          fromDay,
          toDay: window.endingOn,
        }),
        getSourceWindows(env.DB, {
          ownerLogin: pref.owner_login,
          repoOwner: pref.repo_owner,
          repoName: pref.repo_name,
          endingOn: window.endingOn,
        }).catch(() => null),
        new PublicGitHubService({ token: accessToken })
          .analyzePublicRepository(pref.repo_owner, pref.repo_name)
          .catch(() => null),
      ]);
      const report = (pref.cadence === "weekly" ? buildWeeklyReport : buildMonthlyReport)({
        fullName: `${pref.repo_owner}/${pref.repo_name}`,
        endingOn: window.endingOn,
        snapshots,
        stars: analysis?.starHistory ?? null,
        releases: analysis?.releases ?? [],
        topReferrer: sources?.topReferrer,
        referrers: sources?.referrers,
        paths: sources?.paths,
      });
      const { results: active } = await env.DB.prepare(
        `SELECT cadence, destination, discussion_category_id, time_zone
           FROM github_report_preferences
          WHERE owner_login = ? AND repo_owner = ? AND repo_name = ? AND enabled = 1`
      )
        .bind(pref.owner_login, pref.repo_owner, pref.repo_name)
        .all<
          Pick<Preference, "cadence" | "destination" | "discussion_category_id" | "time_zone">
        >();
      if (
        active[0]?.cadence !== pref.cadence ||
        active[0]?.destination !== pref.destination ||
        active[0]?.discussion_category_id !== pref.discussion_category_id ||
        active[0]?.time_zone !== pref.time_zone
      ) {
        await env.DB.prepare(
          `DELETE FROM github_report_deliveries WHERE id = ? AND status = 'pending'`
        )
          .bind(deliveryId)
          .run();
        continue;
      }
      const providerId = await provider.deliver(
        report,
        {
          owner: pref.repo_owner,
          repo: pref.repo_name,
          token: accessToken,
          kind: pref.destination,
          categoryId: pref.discussion_category_id ?? undefined,
          siteUrl: env.SITE_URL ?? "https://github-traffic-analytics.ali-ammari.workers.dev",
        },
        [
          pref.owner_login,
          pref.repo_owner,
          pref.repo_name,
          window.endingOn,
          pref.cadence,
          pref.destination,
        ].join(":")
      );
      await env.DB.prepare(
        `UPDATE github_report_deliveries
           SET status = 'sent', provider_id = ?, delivered_at = datetime('now')
         WHERE id = ? AND status = 'pending'`
      )
        .bind(providerId, deliveryId)
        .run();
      sent++;
    } catch (cause) {
      await env.DB.prepare(
        `UPDATE github_report_deliveries SET status = 'failed' WHERE id = ? AND status = 'pending'`
      )
        .bind(deliveryId)
        .run();
      failed++;
      console.error("GitHub report delivery failed", {
        repository: `${pref.repo_owner}/${pref.repo_name}`,
        reason: cause instanceof Error ? cause.name : "unknown",
      });
    }
  }
  return { due, sent, failed, revoked };
}
