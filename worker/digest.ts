// SPDX-License-Identifier: MIT
import { getHistory, type D1Database } from "../src/lib/snapshots";
import { PublicGitHubService } from "../src/lib/github-public";
import { buildWeeklyReport } from "../src/lib/weekly-report";
import { digestWindow } from "../src/lib/digest-schedule";
import { getSourceWindows } from "../src/lib/source-snapshots";
import {
  EmailReportProvider,
  type ReportDeliveryProvider,
  type EmailDestination,
} from "../src/lib/report-delivery";
import { RepositoryTokenProvider } from "./repository-token";

export interface DigestEnv {
  DB: D1Database;
  GITHUB_APP_ID?: string;
  GITHUB_APP_PRIVATE_KEY?: string;
  RESEND_API_KEY?: string;
  REPORT_FROM_EMAIL?: string;
  SITE_URL?: string;
}

interface Preference {
  owner_login: string;
  repo_owner: string;
  repo_name: string;
  recipient_email: string;
  time_zone: string;
  access_token: string | null;
  installation_id: number | null;
  repository_id: number | null;
}

const DAY_MS = 86_400_000;

export async function verifyTrafficAccess(pref: {
  repo_owner: string;
  repo_name: string;
  access_token: string;
}): Promise<boolean> {
  const response = await fetch(
    `https://api.github.com/repos/${encodeURIComponent(pref.repo_owner)}/${encodeURIComponent(pref.repo_name)}/traffic/views?per=day`,
    {
      headers: {
        Authorization: `Bearer ${pref.access_token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "github-traffic-analytics-digest",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      signal: AbortSignal.timeout(10_000),
    }
  );
  if (response.status === 404) return false;
  if (response.status === 403) {
    const remaining = response.headers?.get?.("x-ratelimit-remaining");
    if (remaining === "0") {
      throw new Error("GitHub rate limit reached");
    }
    return false;
  }
  if (!response.ok) throw new Error(`GitHub traffic verification returned ${response.status}`);
  return true;
}

/** Process explicit opt-ins only; every email has a D1 claim and provider idempotency key. */
export async function runWeeklyDigests(
  env: DigestEnv,
  now = new Date(),
  provider?: ReportDeliveryProvider<EmailDestination>,
  verifyAccess: (
    pref: Preference & { access_token: string }
  ) => Promise<boolean> = verifyTrafficAccess
): Promise<{ due: number; sent: number; failed: number; revoked: number }> {
  const { results: preferences } = await env.DB.prepare(
    `SELECT p.owner_login, p.repo_owner, p.repo_name, p.recipient_email, p.time_zone,
            t.access_token,
            CASE WHEN i.active = 1 THEN a.installation_id END AS installation_id,
            CASE WHEN i.active = 1 THEN a.repository_id END AS repository_id
       FROM weekly_digest_preferences p
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
    let window: ReturnType<typeof digestWindow>;
    try {
      window = digestWindow(now, pref.time_zone);
    } catch {
      // An invalid stored timezone needs an operator fix; it must not crash all
      // other subscribers or fall back to an unexpected delivery time.
      failed++;
      continue;
    }
    if (!window.isDue) continue;
    due++;
    const { results: claims } = await env.DB.prepare(
      `INSERT INTO report_deliveries
           (owner_login, repo_owner, repo_name, period_to, channel, status)
         VALUES (?, ?, ?, ?, 'email', 'pending')
         ON CONFLICT (owner_login, repo_owner, repo_name, period_to, channel)
         DO UPDATE SET status = 'pending', attempted_at = datetime('now')
         WHERE status = 'failed'
            OR (status = 'pending' AND attempted_at < datetime('now', '-20 minutes'))
         RETURNING id`
    )
      .bind(pref.owner_login, pref.repo_owner, pref.repo_name, window.endingOn)
      .all<{ id: number }>();
    const deliveryId = claims[0]?.id;
    if (!deliveryId) continue;

    try {
      const accessToken = await tokens.get(pref);
      if (!(await verifyAccess({ ...pref, access_token: accessToken }))) {
        await env.DB.prepare(
          `DELETE FROM weekly_digest_preferences
             WHERE owner_login = ? AND repo_owner = ? AND repo_name = ?`
        )
          .bind(pref.owner_login, pref.repo_owner, pref.repo_name)
          .run();
        await env.DB.prepare(`DELETE FROM report_deliveries WHERE id = ? AND status = 'pending'`)
          .bind(deliveryId)
          .run();
        revoked++;
        continue;
      }
      if (!provider && (!env.RESEND_API_KEY || !env.REPORT_FROM_EMAIL))
        throw new Error("Weekly email provider is not configured");
      const endingOnMs = Date.parse(`${window.endingOn}T00:00:00Z`);
      const fromDay = new Date(endingOnMs - 13 * DAY_MS).toISOString().slice(0, 10);
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
      const report = buildWeeklyReport({
        fullName: `${pref.repo_owner}/${pref.repo_name}`,
        endingOn: window.endingOn,
        snapshots,
        stars: analysis?.starHistory ?? null,
        releases: analysis?.releases ?? [],
        topReferrer: sources?.topReferrer,
        referrers: sources?.referrers,
        paths: sources?.paths,
      });
      // A maintainer can opt out while this report is being assembled. Confirm
      // the same destination is still authorized immediately before sending.
      const { results: active } = await env.DB.prepare(
        `SELECT recipient_email, time_zone FROM weekly_digest_preferences
           WHERE owner_login = ? AND repo_owner = ? AND repo_name = ? AND enabled = 1`
      )
        .bind(pref.owner_login, pref.repo_owner, pref.repo_name)
        .all<{ recipient_email: string; time_zone: string }>();
      if (
        active[0]?.recipient_email !== pref.recipient_email ||
        active[0]?.time_zone !== pref.time_zone
      ) {
        await env.DB.prepare(`DELETE FROM report_deliveries WHERE id = ? AND status = 'pending'`)
          .bind(deliveryId)
          .run();
        continue;
      }
      const deliveryKey = [
        pref.owner_login,
        pref.repo_owner,
        pref.repo_name,
        window.endingOn,
        "email",
      ].join(":");
      const deliveryProvider =
        provider ?? new EmailReportProvider(env.RESEND_API_KEY!, env.REPORT_FROM_EMAIL!);
      const providerId = await deliveryProvider.deliver(
        report,
        {
          email: pref.recipient_email,
          siteUrl: env.SITE_URL ?? "https://github-traffic-analytics.ali-ammari.workers.dev",
        },
        deliveryKey
      );
      await env.DB.prepare(
        `UPDATE report_deliveries
           SET status = 'sent', provider_id = ?, delivered_at = datetime('now')
           WHERE id = ? AND status = 'pending'`
      )
        .bind(providerId, deliveryId)
        .run();
      sent++;
    } catch (cause) {
      await env.DB.prepare(
        `UPDATE report_deliveries SET status = 'failed' WHERE id = ? AND status = 'pending'`
      )
        .bind(deliveryId)
        .run();
      failed++;
      // Log only an error category and repository; never email, OAuth token,
      // provider key, response body, or outgoing message text.
      console.error("Weekly report delivery failed", {
        repository: `${pref.repo_owner}/${pref.repo_name}`,
        reason: cause instanceof Error ? cause.name : "unknown",
      });
    }
  }
  return { due, sent, failed, revoked };
}
