// SPDX-License-Identifier: MIT
import { NextRequest, NextResponse } from "next/server";
import { parseRepoInput } from "@/lib/analytics";
import { getServerAuth } from "@/lib/server-auth";
import { getD1 } from "@/lib/d1";
import { GitHubService, TrafficAccessError } from "@/lib/github";
import { ALERT_EVENTS, isAlertEvent } from "@/lib/webhook-alerts";
import {
  encryptWebhookUrl,
  validateWebhookUrl,
  webhookContext,
  type WebhookPlatform,
} from "@/lib/webhook-secrets";

const reply = (body: Record<string, unknown>, status = 200) =>
  NextResponse.json(body, { status, headers: { "cache-control": "private, no-store" } });

function platform(value: unknown): value is WebhookPlatform {
  return value === "slack" || value === "discord";
}

async function context(request: NextRequest) {
  const identity = await getServerAuth(request);
  if (!identity) return { response: reply({ error: "Sign in to manage alerts." }, 401) };
  const owner = request.nextUrl.searchParams.get("owner") ?? "";
  const repo = request.nextUrl.searchParams.get("repo") ?? "";
  const parsed = parseRepoInput(`${owner}/${repo}`);
  if (!parsed || parsed.owner !== owner || parsed.repo !== repo)
    return { response: reply({ error: "Choose a valid repository." }, 400) };
  const db = await getD1();
  if (!db) return { response: reply({ error: "Alerts require Cloudflare D1." }, 503) };
  return { identity, owner, repo, db };
}

export async function GET(request: NextRequest) {
  const result = await context(request);
  if (result.response) return result.response;
  const { identity, owner, repo, db } = result;
  try {
    const { results } = await db
      .prepare(
        `SELECT platform, event_types FROM webhook_preferences
         WHERE owner_login = ? AND repo_owner = ? AND repo_name = ? AND enabled = 1`
      )
      .bind(identity.userId, owner, repo)
      .all<{ platform: WebhookPlatform; event_types: string }>();
    return reply({
      available: Boolean(process.env.WEBHOOK_ENCRYPTION_KEY),
      options: ALERT_EVENTS,
      webhooks: results.map((row) => ({
        platform: row.platform,
        configured: true,
        events: JSON.parse(row.event_types) as string[],
      })),
    });
  } catch {
    return reply({ error: "Could not load alert settings. Try again shortly." }, 503);
  }
}

export async function PUT(request: NextRequest) {
  const result = await context(request);
  if (result.response) return result.response;
  if (request.headers.get("origin") !== request.nextUrl.origin)
    return reply({ error: "Request origin is invalid." }, 403);
  const { identity, owner, repo, db } = result;
  const secret = process.env.WEBHOOK_ENCRYPTION_KEY;
  if (!secret)
    return reply({ error: "Webhook delivery is not configured on this deployment." }, 503);
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return reply({ error: "Choose a webhook and alert events." }, 400);
  }
  const { platform: destination, url, events } = body;
  if (
    !platform(destination) ||
    !Array.isArray(events) ||
    events.length === 0 ||
    events.length > ALERT_EVENTS.length ||
    new Set(events).size !== events.length ||
    !events.every(isAlertEvent) ||
    (url !== undefined && (typeof url !== "string" || !validateWebhookUrl(url, destination)))
  )
    return reply({ error: "Choose a valid Slack or Discord webhook and at least one event." }, 400);

  try {
    await new GitHubService(identity.accessToken).getTrafficViews(owner, repo);
  } catch (cause) {
    return cause instanceof TrafficAccessError
      ? reply({ error: "GitHub does not grant you traffic access to this repository." }, 403)
      : reply({ error: "GitHub could not verify traffic access. Try again shortly." }, 502);
  }

  try {
    const existing = await db
      .prepare(
        `SELECT url_ciphertext FROM webhook_preferences
         WHERE owner_login = ? AND repo_owner = ? AND repo_name = ? AND platform = ?`
      )
      .bind(identity.userId, owner, repo, destination)
      .all<{ url_ciphertext: string }>();
    if (!url && !existing.results[0])
      return reply({ error: "Enter the webhook URL to enable this destination." }, 400);
    const ciphertext = url
      ? await encryptWebhookUrl(
          url,
          secret,
          webhookContext(identity.userId, owner, repo, destination)
        )
      : existing.results[0].url_ciphertext;
    const { results: installed } = await db
      .prepare(
        `SELECT 1 FROM app_tracked_repos WHERE owner_login = ? AND repo_owner = ? AND repo_name = ? LIMIT 1`
      )
      .bind(identity.userId, owner, repo)
      .all<{ "1": number }>();
    const tracking = db
      .prepare(
        `INSERT INTO tracked_repos (owner_login, repo_owner, repo_name, access_token)
           VALUES (?, ?, ?, ?)
           ON CONFLICT (owner_login, repo_owner, repo_name)
           DO UPDATE SET access_token = excluded.access_token`
      )
      .bind(identity.userId, owner, repo, identity.accessToken);
    const preference = db
      .prepare(
        `INSERT INTO webhook_preferences
             (owner_login, repo_owner, repo_name, platform, url_ciphertext, event_types)
           VALUES (?, ?, ?, ?, ?, ?)
           ON CONFLICT (owner_login, repo_owner, repo_name, platform)
           DO UPDATE SET url_ciphertext = excluded.url_ciphertext,
             event_types = excluded.event_types, enabled = 1, updated_at = datetime('now')`
      )
      .bind(identity.userId, owner, repo, destination, ciphertext, JSON.stringify(events));
    await db.batch(installed.length ? [preference] : [tracking, preference]);
    return reply({ platform: destination, configured: true, events });
  } catch {
    return reply({ error: "Could not save the webhook. Check encryption setup and retry." }, 503);
  }
}

export async function DELETE(request: NextRequest) {
  const result = await context(request);
  if (result.response) return result.response;
  if (request.headers.get("origin") !== request.nextUrl.origin)
    return reply({ error: "Request origin is invalid." }, 403);
  const destination = request.nextUrl.searchParams.get("platform");
  if (!platform(destination)) return reply({ error: "Choose Slack or Discord." }, 400);
  const { identity, owner, repo, db } = result;
  try {
    await db
      .prepare(
        `DELETE FROM webhook_preferences
         WHERE owner_login = ? AND repo_owner = ? AND repo_name = ? AND platform = ?`
      )
      .bind(identity.userId, owner, repo, destination)
      .run();
    return reply({ platform: destination, configured: false });
  } catch {
    return reply({ error: "Could not remove the webhook. Try again shortly." }, 503);
  }
}
