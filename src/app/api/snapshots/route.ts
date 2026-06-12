// SPDX-License-Identifier: MIT
import { auth } from "@/lib/auth";
import { getD1 } from "@/lib/d1";
import { getHistory, mergeHistory } from "@/lib/snapshots";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/snapshots?owner=<o>&repo=<r>&from=<YYYY-MM-DD>&to=<YYYY-MM-DD>
 *
 * Returns persisted daily traffic history (beyond GitHub's 14-day window) for a
 * repo, scoped to the signed-in user. Reads from the D1 `traffic_snapshots` table.
 *
 * @returns JSON `{ history: [...] }` on success, or `{ error }` with:
 *   - 401 when unauthenticated,
 *   - 400 when owner/repo are missing,
 *   - 503 when no D1 binding is available (e.g. running on plain Node).
 */
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.accessToken || !session.user?.name) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = request.nextUrl.searchParams;
  const repoOwner = params.get("owner");
  const repoName = params.get("repo");
  if (!repoOwner || !repoName) {
    return NextResponse.json({ error: "Owner and repo parameters are required" }, { status: 400 });
  }

  const db = await getD1();
  if (!db) {
    return NextResponse.json(
      { error: "Historical snapshots require the Cloudflare D1 deployment." },
      { status: 503 }
    );
  }

  // Default to the trailing 90 days of history.
  const toDay = params.get("to") ?? new Date().toISOString().slice(0, 10);
  const fromDay =
    params.get("from") ??
    new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const rows = await getHistory(db, {
    ownerLogin: session.user.name,
    repoOwner,
    repoName,
    fromDay,
    toDay,
  });

  return NextResponse.json({ history: mergeHistory(rows) });
}
