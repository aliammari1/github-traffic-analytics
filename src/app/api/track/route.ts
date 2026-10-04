// SPDX-License-Identifier: MIT
import { getServerAuth } from "@/lib/server-auth";
import { getD1 } from "@/lib/d1";
import { parseRepoInput } from "@/lib/analytics";
import { GitHubService, TrafficAccessError } from "@/lib/github";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/track  { owner, repo }
 *
 * Opt a traffic-authorized repository in to daily historical snapshotting.
 * App-installed repositories already use short-lived installation tokens;
 * legacy opt-ins retain a GitHub OAuth grant for the Cron Worker.
 *
 * @returns JSON `{ tracked: true }` on success, or `{ error }` with:
 *   - 401 when unauthenticated, 400 when owner/repo missing,
 *   - 503 when no D1 binding is available.
 */
export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin)
    return NextResponse.json({ error: "Request origin is invalid." }, { status: 403 });
  const serverAuth = await getServerAuth(request);
  if (!serverAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let owner: string | undefined;
  let repo: string | undefined;
  try {
    const body = await request.json();
    owner = typeof body?.owner === "string" ? body.owner : undefined;
    repo = typeof body?.repo === "string" ? body.repo : undefined;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!owner || !repo) {
    return NextResponse.json({ error: "Owner and repo are required" }, { status: 400 });
  }

  const parsed = parseRepoInput(`${owner}/${repo}`);
  if (!parsed || parsed.owner !== owner || parsed.repo !== repo)
    return NextResponse.json({ error: "Choose a valid repository." }, { status: 400 });

  try {
    await new GitHubService(serverAuth.accessToken).getTrafficViews(owner, repo);
  } catch (cause) {
    return cause instanceof TrafficAccessError
      ? NextResponse.json({ error: "GitHub does not grant you traffic access." }, { status: 403 })
      : NextResponse.json(
          { error: "Could not verify traffic access. Try again shortly." },
          { status: 502 }
        );
  }

  const db = await getD1();
  if (!db) {
    return NextResponse.json(
      { error: "Historical tracking requires the Cloudflare D1 deployment." },
      { status: 503 }
    );
  }

  const { results: installed } = await db
    .prepare(
      `SELECT 1 FROM app_tracked_repos WHERE owner_login = ? AND repo_owner = ? AND repo_name = ? LIMIT 1`
    )
    .bind(serverAuth.userId, owner, repo)
    .all<{ "1": number }>();
  if (installed.length)
    return NextResponse.json(
      { tracked: true, source: "app" },
      { headers: { "cache-control": "private, no-store" } }
    );

  await db
    .prepare(
      `INSERT INTO tracked_repos (owner_login, repo_owner, repo_name, access_token)
       VALUES (?, ?, ?, ?)
       ON CONFLICT (owner_login, repo_owner, repo_name)
       DO UPDATE SET access_token = excluded.access_token`
    )
    .bind(serverAuth.userId, owner, repo, serverAuth.accessToken)
    .run();

  return NextResponse.json(
    { tracked: true, source: "oauth" },
    { headers: { "cache-control": "private, no-store" } }
  );
}
