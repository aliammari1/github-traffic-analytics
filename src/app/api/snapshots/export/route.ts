// SPDX-License-Identifier: MIT
import { NextRequest, NextResponse } from "next/server";
import { getServerAuth } from "@/lib/server-auth";
import { getD1 } from "@/lib/d1";
import { getHistory } from "@/lib/snapshots";
import { serializeHistory } from "@/lib/history-export";
import { GitHubService } from "@/lib/github";
import { parseRepoInput } from "@/lib/analytics";

const dayPattern = /^\d{4}-\d{2}-\d{2}$/;
const namePattern = /^[A-Za-z0-9_.-]{1,100}$/;
const error = (message: string, status: number) =>
  NextResponse.json(
    { error: message },
    { status, headers: { "cache-control": "private, no-store" } }
  );
function validDay(value: string): boolean {
  if (!dayPattern.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export async function GET(request: NextRequest) {
  const identity = await getServerAuth(request);
  if (!identity) return error("Sign in to export your traffic history.", 401);

  const query = request.nextUrl.searchParams;
  const owner = query.get("owner") ?? "";
  const repo = query.get("repo") ?? "";
  const format = query.get("format") ?? "csv";
  const from = query.get("from") ?? "0000-01-01";
  const to = query.get("to") ?? "9999-12-31";
  const parsed = parseRepoInput(`${owner}/${repo}`);
  if (
    !parsed ||
    parsed.owner !== owner ||
    parsed.repo !== repo ||
    !namePattern.test(owner) ||
    !namePattern.test(repo) ||
    !["csv", "json"].includes(format) ||
    (from !== "0000-01-01" && !validDay(from)) ||
    (to !== "9999-12-31" && !validDay(to)) ||
    from > to
  ) {
    return error("Choose a valid repository, format, and date range.", 400);
  }

  try {
    await new GitHubService(identity.accessToken).getTrafficViews(owner, repo);
  } catch (cause) {
    const status =
      cause && typeof cause === "object" && "status" in cause ? Number(cause.status) : 0;
    return status === 403 || status === 404
      ? error("GitHub no longer grants you traffic access to this repository.", 403)
      : error("GitHub could not verify repository access. Try again shortly.", 502);
  }

  const db = await getD1();
  if (!db) return error("Historical snapshots require Cloudflare D1.", 503);
  const rows = await getHistory(db, {
    ownerLogin: identity.userId,
    repoOwner: owner,
    repoName: repo,
    fromDay: from,
    toDay: to,
  });
  if (rows.length > 20_000)
    return error("This export is too large. Choose a shorter date range.", 413);
  return new Response(serializeHistory(rows, format as "csv" | "json"), {
    headers: {
      "content-type":
        format === "csv" ? "text/csv; charset=utf-8" : "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="${owner}-${repo}-traffic.${format}"`,
      "cache-control": "private, no-store",
      "x-content-type-options": "nosniff",
      "x-export-rows": String(rows.length),
    },
  });
}
