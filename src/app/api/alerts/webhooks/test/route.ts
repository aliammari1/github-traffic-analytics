// SPDX-License-Identifier: MIT
import { NextRequest, NextResponse } from "next/server";
import { parseRepoInput } from "@/lib/analytics";
import { getServerAuth } from "@/lib/server-auth";
import { getD1 } from "@/lib/d1";
import { decryptWebhookUrl, validateWebhookUrl, webhookContext } from "@/lib/webhook-secrets";
import { deliverWebhookAlert } from "@/lib/webhook-alerts";

const reply = (body: Record<string, unknown>, status = 200) =>
  NextResponse.json(body, { status, headers: { "cache-control": "private, no-store" } });

export async function POST(request: NextRequest) {
  const identity = await getServerAuth(request);
  if (!identity) return reply({ error: "Sign in to test a webhook." }, 401);
  if (request.headers.get("origin") !== request.nextUrl.origin)
    return reply({ error: "Request origin is invalid." }, 403);
  const owner = request.nextUrl.searchParams.get("owner") ?? "";
  const repo = request.nextUrl.searchParams.get("repo") ?? "";
  const platform = request.nextUrl.searchParams.get("platform");
  const parsed = parseRepoInput(`${owner}/${repo}`);
  if (
    !parsed ||
    parsed.owner !== owner ||
    parsed.repo !== repo ||
    (platform !== "slack" && platform !== "discord")
  )
    return reply({ error: "Choose a valid repository and destination." }, 400);
  const secret = process.env.WEBHOOK_ENCRYPTION_KEY;
  if (!secret) return reply({ error: "Webhook delivery is not configured." }, 503);
  const db = await getD1();
  if (!db) return reply({ error: "Webhook delivery requires Cloudflare D1." }, 503);

  try {
    const { results: claims } = await db
      .prepare(
        `UPDATE webhook_preferences
         SET last_test_at = datetime('now')
         WHERE owner_login = ? AND repo_owner = ? AND repo_name = ? AND platform = ?
           AND enabled = 1
           AND (last_test_at IS NULL OR last_test_at < datetime('now', '-5 minutes'))
         RETURNING url_ciphertext`
      )
      .bind(identity.userId, owner, repo, platform)
      .all<{ url_ciphertext: string }>();
    if (!claims[0])
      return reply(
        { error: "No webhook is configured, or a test was sent in the last five minutes." },
        429
      );
    const url = await decryptWebhookUrl(
      claims[0].url_ciphertext,
      secret,
      webhookContext(identity.userId, owner, repo, platform)
    );
    if (!validateWebhookUrl(url, platform)) throw new Error("Invalid saved webhook destination");
    await deliverWebhookAlert(url, platform, {
      event: "star_milestone",
      key: "test",
      fullName: `${owner}/${repo}`,
      title: "GitHub Traffic Analytics · Test notification",
      detail: "Your webhook is connected. Real alerts will follow the events you selected.",
      url: process.env.NEXTAUTH_URL ?? "https://github-traffic-analytics.ali-ammari.workers.dev",
    });
    return reply({ delivered: true });
  } catch {
    return reply(
      { error: "The webhook test failed. Check its URL and destination permissions." },
      502
    );
  }
}
