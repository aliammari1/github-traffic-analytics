// SPDX-License-Identifier: MIT
import { NextRequest, NextResponse } from "next/server";
import { parseRepoInput } from "@/lib/analytics";
import { getServerAuth } from "@/lib/server-auth";
import { getD1 } from "@/lib/d1";
import { GitHubService, TrafficAccessError } from "@/lib/github";
import { isValidTimeZone } from "@/lib/digest-schedule";

const reply = (body: Record<string, unknown>, status = 200) =>
  NextResponse.json(body, { status, headers: { "cache-control": "private, no-store" } });

function repository(request: NextRequest) {
  const owner = request.nextUrl.searchParams.get("owner") ?? "";
  const repo = request.nextUrl.searchParams.get("repo") ?? "";
  const parsed = parseRepoInput(`${owner}/${repo}`);
  return parsed?.owner === owner && parsed.repo === repo ? { owner, repo } : null;
}

async function context(request: NextRequest) {
  const identity = await getServerAuth(request);
  if (!identity) return { response: reply({ error: "Sign in to manage weekly email." }, 401) };
  const target = repository(request);
  if (!target) return { response: reply({ error: "Choose a valid repository." }, 400) };
  const db = await getD1();
  if (!db) return { response: reply({ error: "Weekly email requires Cloudflare D1." }, 503) };
  return { identity, target, db };
}

export async function GET(request: NextRequest) {
  const result = await context(request);
  if (result.response) return result.response;
  const { identity, target, db } = result;
  try {
    const { results } = await db
      .prepare(
        `SELECT recipient_email, time_zone, enabled FROM weekly_digest_preferences
       WHERE owner_login = ? AND repo_owner = ? AND repo_name = ?`
      )
      .bind(identity.userId, target.owner, target.repo)
      .all<{ recipient_email: string; time_zone: string; enabled: number }>();
    const value = results[0];
    return reply({
      available: process.env.DIGEST_EMAIL_ENABLED === "true",
      enabled: value?.enabled === 1,
      recipientEmail: value?.recipient_email ?? null,
      timeZone: value?.time_zone ?? null,
    });
  } catch {
    return reply({ error: "Could not load weekly email settings. Try again shortly." }, 503);
  }
}

function sameOrigin(request: NextRequest) {
  return request.headers.get("origin") === request.nextUrl.origin;
}

export async function PUT(request: NextRequest) {
  const result = await context(request);
  if (result.response) return result.response;
  if (!sameOrigin(request)) return reply({ error: "Request origin is invalid." }, 403);
  if (process.env.DIGEST_EMAIL_ENABLED !== "true")
    return reply({ error: "Weekly email is not configured on this deployment yet." }, 503);
  const { identity, target, db } = result;
  let timeZone: string;
  try {
    const input = await request.json();
    timeZone = typeof input?.timeZone === "string" ? input.timeZone : "";
  } catch {
    return reply({ error: "Choose a valid timezone." }, 400);
  }
  if (!isValidTimeZone(timeZone)) return reply({ error: "Choose a valid timezone." }, 400);

  try {
    await new GitHubService(identity.accessToken).getTrafficViews(target.owner, target.repo);
  } catch (cause) {
    const status =
      cause && typeof cause === "object" && "status" in cause ? Number(cause.status) : 0;
    return cause instanceof TrafficAccessError || status === 404
      ? reply({ error: "GitHub no longer grants you traffic access to this repository." }, 403)
      : reply({ error: "Could not verify GitHub traffic access. Try again shortly." }, 502);
  }

  let recipientEmail: string;
  try {
    const response = await fetch("https://api.github.com/user/emails?per_page=100", {
      headers: {
        Authorization: `Bearer ${identity.accessToken}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "github-traffic-analytics",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) throw new Error("GitHub email lookup failed");
    const emails = (await response.json()) as Array<{
      email: string;
      verified: boolean;
      primary: boolean;
    }>;
    const verified = emails.find((email) => email.primary && email.verified);
    if (!verified?.email) return reply({ error: "Verify your primary GitHub email first." }, 409);
    recipientEmail = verified.email;
  } catch {
    return reply({ error: "Could not verify your GitHub email. Try again shortly." }, 502);
  }

  try {
    const tracking = db
      .prepare(
        `INSERT INTO tracked_repos (owner_login, repo_owner, repo_name, access_token)
         VALUES (?, ?, ?, ?)
         ON CONFLICT (owner_login, repo_owner, repo_name)
         DO UPDATE SET access_token = excluded.access_token`
      )
      .bind(identity.userId, target.owner, target.repo, identity.accessToken);
    const preference = db
      .prepare(
        `INSERT INTO weekly_digest_preferences
           (owner_login, repo_owner, repo_name, recipient_email, time_zone, enabled)
         VALUES (?, ?, ?, ?, ?, 1)
         ON CONFLICT (owner_login, repo_owner, repo_name)
         DO UPDATE SET recipient_email = excluded.recipient_email,
                       time_zone = excluded.time_zone, enabled = 1,
                       updated_at = datetime('now')`
      )
      .bind(identity.userId, target.owner, target.repo, recipientEmail, timeZone);
    await db.batch([tracking, preference]);
    return reply({ available: true, enabled: true, recipientEmail, timeZone });
  } catch {
    return reply({ error: "Could not save weekly email. Try again shortly." }, 503);
  }
}

export async function DELETE(request: NextRequest) {
  const result = await context(request);
  if (result.response) return result.response;
  if (!sameOrigin(request)) return reply({ error: "Request origin is invalid." }, 403);
  const { identity, target, db } = result;
  try {
    await db
      .prepare(
        `DELETE FROM weekly_digest_preferences
         WHERE owner_login = ? AND repo_owner = ? AND repo_name = ?`
      )
      .bind(identity.userId, target.owner, target.repo)
      .run();
    return reply({
      available: process.env.DIGEST_EMAIL_ENABLED === "true",
      enabled: false,
      recipientEmail: null,
      timeZone: null,
    });
  } catch {
    return reply({ error: "Could not disable weekly email. Try again shortly." }, 503);
  }
}
