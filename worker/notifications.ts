// SPDX-License-Identifier: MIT
import type { D1Database } from "../src/lib/snapshots";
import { PublicGitHubService } from "../src/lib/github-public";
import { getSourceWindows } from "../src/lib/source-snapshots";
import { detectAlerts } from "../src/lib/alert-engine";
import {
  deliverWebhookAlert,
  isAlertEvent,
  WebhookDeliveryError,
  type GrowthAlert,
} from "../src/lib/webhook-alerts";
import {
  decryptWebhookUrl,
  validateWebhookUrl,
  webhookContext,
  type WebhookPlatform,
} from "../src/lib/webhook-secrets";
import { verifyTrafficAccess } from "./digest";
import { RepositoryTokenProvider } from "./repository-token";

interface Preference {
  owner_login: string;
  repo_owner: string;
  repo_name: string;
  platform: WebhookPlatform;
  url_ciphertext: string;
  event_types: string;
  access_token: string | null;
  installation_id: number | null;
  repository_id: number | null;
}

interface DeliveryRow {
  id: number;
  event_key: string;
  payload_json: string;
}

export interface NotificationEnv {
  DB: D1Database;
  WEBHOOK_ENCRYPTION_KEY?: string;
  SITE_URL?: string;
  GITHUB_APP_ID?: string;
  GITHUB_APP_PRIVATE_KEY?: string;
}

async function claim(db: D1Database, pref: Preference, alert: GrowthAlert): Promise<number | null> {
  const { results } = await db
    .prepare(
      `INSERT INTO webhook_deliveries
         (owner_login, repo_owner, repo_name, platform, event_key, payload_json, status, attempts)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', 1)
       ON CONFLICT (owner_login, repo_owner, repo_name, platform, event_key)
       DO UPDATE SET status = 'pending', attempted_at = datetime('now'),
                     attempts = attempts + 1
       WHERE status = 'failed' AND attempts < 3
       RETURNING id`
    )
    .bind(
      pref.owner_login,
      pref.repo_owner,
      pref.repo_name,
      pref.platform,
      alert.key,
      JSON.stringify(alert)
    )
    .all<{ id: number }>();
  return results[0]?.id ?? null;
}

async function sendClaimed(
  env: NotificationEnv,
  pref: Preference,
  deliveryId: number,
  alert: GrowthAlert,
  deliver: typeof deliverWebhookAlert
): Promise<"sent" | "failed" | "skipped"> {
  try {
    const { results: active } = await env.DB.prepare(
      `SELECT url_ciphertext, event_types FROM webhook_preferences
       WHERE owner_login = ? AND repo_owner = ? AND repo_name = ? AND platform = ? AND enabled = 1`
    )
      .bind(pref.owner_login, pref.repo_owner, pref.repo_name, pref.platform)
      .all<{ url_ciphertext: string; event_types: string }>();
    if (!active[0] || !(JSON.parse(active[0].event_types) as string[]).includes(alert.event)) {
      await env.DB.prepare(`DELETE FROM webhook_deliveries WHERE id = ? AND status = 'pending'`)
        .bind(deliveryId)
        .run();
      return "skipped";
    }
    const url = await decryptWebhookUrl(
      active[0].url_ciphertext,
      env.WEBHOOK_ENCRYPTION_KEY!,
      webhookContext(pref.owner_login, pref.repo_owner, pref.repo_name, pref.platform)
    );
    if (!validateWebhookUrl(url, pref.platform)) throw new Error("Invalid saved webhook URL");
    await deliver(url, pref.platform, alert);
    await env.DB.prepare(
      `UPDATE webhook_deliveries SET status = 'sent', delivered_at = datetime('now')
       WHERE id = ? AND status = 'pending'`
    )
      .bind(deliveryId)
      .run();
    return "sent";
  } catch (cause) {
    const state =
      cause instanceof WebhookDeliveryError
        ? cause.retryable
          ? "failed"
          : cause.status >= 500
            ? "uncertain"
            : "permanent_failed"
        : "uncertain";
    await env.DB.prepare(
      `UPDATE webhook_deliveries SET status = ? WHERE id = ? AND status = 'pending'`
    )
      .bind(state, deliveryId)
      .run();
    console.error("Webhook alert delivery failed", {
      repository: `${pref.repo_owner}/${pref.repo_name}`,
      platform: pref.platform,
      reason: cause instanceof WebhookDeliveryError ? cause.status : "transport",
    });
    return "failed";
  }
}

export async function runNotifications(
  env: NotificationEnv,
  now = new Date(),
  deliver: typeof deliverWebhookAlert = deliverWebhookAlert
): Promise<{ repos: number; sent: number; failed: number }> {
  if (!env.WEBHOOK_ENCRYPTION_KEY) throw new Error("Webhook encryption key is not configured");
  const { results: preferences } = await env.DB.prepare(
    `SELECT p.owner_login, p.repo_owner, p.repo_name, p.platform,
            p.url_ciphertext, p.event_types, t.access_token,
            CASE WHEN i.active = 1 THEN a.installation_id END AS installation_id,
            CASE WHEN i.active = 1 THEN a.repository_id END AS repository_id
       FROM webhook_preferences p
       LEFT JOIN tracked_repos t ON t.owner_login = p.owner_login
         AND t.repo_owner = p.repo_owner AND t.repo_name = p.repo_name
       LEFT JOIN app_tracked_repos a ON a.owner_login = p.owner_login
         AND a.repo_owner = p.repo_owner AND a.repo_name = p.repo_name
       LEFT JOIN github_app_installations i ON i.installation_id = a.installation_id
      WHERE p.enabled = 1 AND (t.id IS NOT NULL OR (a.repository_id IS NOT NULL AND i.active = 1))`
  ).all<Preference>();
  const tokens = new RepositoryTokenProvider(env);
  const groups = new Map<string, Preference[]>();
  for (const pref of preferences) {
    const key = [pref.owner_login, pref.repo_owner, pref.repo_name].join("\0");
    groups.set(key, [...(groups.get(key) ?? []), pref]);
  }
  const day = now.toISOString().slice(0, 10);
  const endingOn = new Date(Date.parse(`${day}T00:00:00Z`) - 86_400_000).toISOString().slice(0, 10);
  let sent = 0;
  let failed = 0;
  await env.DB.prepare(
    `UPDATE webhook_deliveries SET status = 'uncertain'
     WHERE status = 'pending' AND attempted_at < datetime('now', '-20 minutes')`
  ).run();
  for (const prefs of groups.values()) {
    const first = prefs[0];
    try {
      const accessToken = await tokens.get(first);
      if (!(await verifyTrafficAccess({ ...first, access_token: accessToken }))) {
        await env.DB.prepare(
          `DELETE FROM webhook_preferences
           WHERE owner_login = ? AND repo_owner = ? AND repo_name = ?`
        )
          .bind(first.owner_login, first.repo_owner, first.repo_name)
          .run();
        continue;
      }
      const selected = new Set(
        prefs.flatMap((pref) => {
          try {
            return (JSON.parse(pref.event_types) as unknown[]).filter(isAlertEvent);
          } catch {
            return [];
          }
        })
      );
      const service = new PublicGitHubService({ token: accessToken });
      const metadata = await service.getRepositoryMetadata(first.repo_owner, first.repo_name);
      await env.DB.prepare(
        `INSERT INTO repo_star_snapshots (owner_login, repo_owner, repo_name, day, stars)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT (owner_login, repo_owner, repo_name, day)
         DO UPDATE SET stars = excluded.stars`
      )
        .bind(first.owner_login, first.repo_owner, first.repo_name, day, metadata.starsCount)
        .run();
      const fromDay = new Date(Date.parse(`${day}T00:00:00Z`) - 35 * 86_400_000)
        .toISOString()
        .slice(0, 10);
      const [history, sources, analysis, appReleases] = await Promise.all([
        env.DB.prepare(
          `SELECT day, stars AS count FROM repo_star_snapshots
           WHERE owner_login = ? AND repo_owner = ? AND repo_name = ?
             AND day >= ? AND day <= ? ORDER BY day`
        )
          .bind(first.owner_login, first.repo_owner, first.repo_name, fromDay, day)
          .all<{ day: string; count: number }>(),
        selected.has("referrer_spike")
          ? getSourceWindows(env.DB, {
              ownerLogin: first.owner_login,
              repoOwner: first.repo_owner,
              repoName: first.repo_name,
              endingOn,
            }).catch(() => null)
          : Promise.resolve(null),
        selected.has("release_impact")
          ? service.analyzePublicRepository(first.repo_owner, first.repo_name).catch(() => null)
          : Promise.resolve(null),
        selected.has("release_impact") && first.repository_id
          ? env.DB.prepare(
              `SELECT tag_name, published_at FROM app_release_events
               WHERE repository_id = ? AND published_at >= ?`
            )
              .bind(first.repository_id, fromDay)
              .all<{ tag_name: string; published_at: string }>()
              .then((value) => value.results)
              .catch(() => [])
          : Promise.resolve([]),
      ]);
      const releaseMap = new Map<string, { tagName: string; publishedAt: string }>();
      for (const release of analysis?.releases ?? []) releaseMap.set(release.tagName, release);
      for (const release of appReleases)
        releaseMap.set(release.tag_name, {
          tagName: release.tag_name,
          publishedAt: release.published_at,
        });
      const alerts = detectAlerts({
        fullName: `${first.repo_owner}/${first.repo_name}`,
        day,
        stars: history.results,
        referrers: sources?.referrers,
        releases: [...releaseMap.values()],
        starHistory: analysis?.starHistory.length
          ? analysis.starHistory
          : history.results.map((point) => ({ date: point.day, stars: point.count })),
        siteUrl: env.SITE_URL ?? "https://github-traffic-analytics.ali-ammari.workers.dev",
      });
      for (const pref of prefs) {
        const events = new Set((JSON.parse(pref.event_types) as unknown[]).filter(isAlertEvent));
        const handled = new Set<string>();
        const pending = await env.DB.prepare(
          `SELECT id, event_key, payload_json FROM webhook_deliveries
           WHERE owner_login = ? AND repo_owner = ? AND repo_name = ? AND platform = ?
             AND status = 'failed'
             AND attempts < 3`
        )
          .bind(pref.owner_login, pref.repo_owner, pref.repo_name, pref.platform)
          .all<DeliveryRow>();
        for (const row of pending.results) {
          let alert: GrowthAlert;
          try {
            alert = JSON.parse(row.payload_json) as GrowthAlert;
          } catch {
            continue;
          }
          if (!events.has(alert.event)) continue;
          const id = await claim(env.DB, pref, alert);
          if (!id) continue;
          handled.add(alert.key);
          const result = await sendClaimed(env, pref, id, alert, deliver);
          if (result === "sent") sent++;
          if (result === "failed") failed++;
        }
        for (const alert of alerts.filter((candidate) => events.has(candidate.event))) {
          if (handled.has(alert.key)) continue;
          const id = await claim(env.DB, pref, alert);
          if (!id) continue;
          const result = await sendClaimed(env, pref, id, alert, deliver);
          if (result === "sent") sent++;
          if (result === "failed") failed++;
        }
      }
    } catch (cause) {
      failed++;
      console.error("Webhook alert processing failed", {
        repository: `${first.repo_owner}/${first.repo_name}`,
        reason: cause instanceof Error ? cause.name : "unknown",
      });
    }
  }
  return { repos: groups.size, sent, failed };
}
