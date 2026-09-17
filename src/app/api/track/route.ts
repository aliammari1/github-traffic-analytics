// SPDX-License-Identifier: MIT
import { auth } from "@/lib/auth";
import { getD1 } from "@/lib/d1";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/track  { owner, repo }
 *
 * Opt a repository in to daily historical snapshotting. Stores the repo + the
 * user's access token in D1 (`tracked_repos`) so the cron Worker can capture its
 * traffic every day, building history beyond GitHub's 14-day window.
 *
 * @returns JSON `{ tracked: true }` on success, or `{ error }` with:
 *   - 401 when unauthenticated, 400 when owner/repo missing,
 *   - 503 when no D1 binding is available.
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.accessToken || !session.user?.name) {
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

  const db = await getD1();
  if (!db) {
    return NextResponse.json(
      { error: "Historical tracking requires the Cloudflare D1 deployment." },
      { status: 503 }
    );
  }

  await db
    .prepare(
      `INSERT INTO tracked_repos (owner_login, repo_owner, repo_name, access_token)
       VALUES (?, ?, ?, ?)
       ON CONFLICT (owner_login, repo_owner, repo_name)
       DO UPDATE SET access_token = excluded.access_token`
    )
    .bind(session.user.name, owner, repo, session.accessToken)
    .run();

  return NextResponse.json({ tracked: true });
}
