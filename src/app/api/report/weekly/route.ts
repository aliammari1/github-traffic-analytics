// SPDX-License-Identifier: MIT
import { NextRequest, NextResponse } from "next/server";
import { parseRepoInput } from "@/lib/analytics";
import { getServerAuth } from "@/lib/server-auth";
import { GitHubService } from "@/lib/github";
import { publicGitHub } from "@/lib/github-public";
import { getD1 } from "@/lib/d1";
import { getHistory } from "@/lib/snapshots";
import { buildWeeklyReport } from "@/lib/weekly-report";

const DAY_MS = 86_400_000;
const error = (message: string, status: number) =>
  NextResponse.json(
    { error: message },
    { status, headers: { "cache-control": "private, no-store" } }
  );

/** Owner-only preview of the latest seven complete UTC days. */
export async function GET(request: NextRequest) {
  const identity = await getServerAuth(request);
  if (!identity) return error("Sign in to view your weekly report.", 401);
  const owner = request.nextUrl.searchParams.get("owner") ?? "";
  const repo = request.nextUrl.searchParams.get("repo") ?? "";
  const parsed = parseRepoInput(`${owner}/${repo}`);
  if (!parsed || parsed.owner !== owner || parsed.repo !== repo)
    return error("Choose a valid repository.", 400);

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
  if (!db) return error("Weekly reports require the Cloudflare D1 deployment.", 503);
  const end =
    Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate()) -
    DAY_MS;
  const endingOn = new Date(end).toISOString().slice(0, 10);
  const fromDay = new Date(end - 13 * DAY_MS).toISOString().slice(0, 10);
  try {
    const [snapshots, analysis] = await Promise.all([
      getHistory(db, {
        ownerLogin: identity.userId,
        repoOwner: owner,
        repoName: repo,
        fromDay,
        toDay: endingOn,
      }),
      publicGitHub.analyzePublicRepository(owner, repo).catch(() => null),
    ]);
    const report = buildWeeklyReport({
      fullName: `${owner}/${repo}`,
      endingOn,
      snapshots,
      stars: analysis?.starHistory ?? null,
      releases: analysis?.releases ?? [],
    });
    return NextResponse.json(report, { headers: { "cache-control": "private, no-store" } });
  } catch {
    return error("Report data is temporarily unavailable. Try again shortly.", 503);
  }
}
