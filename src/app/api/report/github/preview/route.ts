// SPDX-License-Identifier: MIT
import { NextRequest, NextResponse } from "next/server";
import { parseRepoInput } from "@/lib/analytics";
import { getServerAuth } from "@/lib/server-auth";
import { GitHubService, TrafficAccessError } from "@/lib/github";
import { getD1 } from "@/lib/d1";
import { getHistory } from "@/lib/snapshots";
import { getSourceWindows } from "@/lib/source-snapshots";
import { publicGitHub } from "@/lib/github-public";
import { buildMonthlyReport, buildWeeklyReport } from "@/lib/weekly-report";
import { formatGitHubReport } from "@/lib/github-report-delivery";

const reply = (body: Record<string, unknown>, status = 200) =>
  NextResponse.json(body, { status, headers: { "cache-control": "private, no-store" } });

export async function GET(request: NextRequest) {
  const identity = await getServerAuth(request);
  if (!identity) return reply({ error: "Sign in to preview a GitHub report." }, 401);
  const owner = request.nextUrl.searchParams.get("owner") ?? "";
  const repo = request.nextUrl.searchParams.get("repo") ?? "";
  const cadence = request.nextUrl.searchParams.get("cadence");
  const parsed = parseRepoInput(`${owner}/${repo}`);
  if (
    !parsed ||
    parsed.owner !== owner ||
    parsed.repo !== repo ||
    (cadence !== "weekly" && cadence !== "monthly")
  )
    return reply({ error: "Choose a valid repository and report frequency." }, 400);
  try {
    await new GitHubService(identity.accessToken).getTrafficViews(owner, repo);
  } catch (cause) {
    return cause instanceof TrafficAccessError
      ? reply({ error: "GitHub does not grant you traffic access to this repository." }, 403)
      : reply({ error: "GitHub could not verify your traffic access. Try again shortly." }, 502);
  }
  const db = await getD1();
  if (!db) return reply({ error: "GitHub reports require Cloudflare D1." }, 503);
  const endMs =
    Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate()) -
    86_400_000;
  const endingOn = new Date(endMs).toISOString().slice(0, 10);
  const days = cadence === "monthly" ? 60 : 14;
  const fromDay = new Date(endMs - (days - 1) * 86_400_000).toISOString().slice(0, 10);
  try {
    const [snapshots, sources, analysis] = await Promise.all([
      getHistory(db, {
        ownerLogin: identity.userId,
        repoOwner: owner,
        repoName: repo,
        fromDay,
        toDay: endingOn,
      }),
      getSourceWindows(db, {
        ownerLogin: identity.userId,
        repoOwner: owner,
        repoName: repo,
        endingOn,
      }).catch(() => null),
      publicGitHub.analyzePublicRepository(owner, repo).catch(() => null),
    ]);
    const report = (cadence === "weekly" ? buildWeeklyReport : buildMonthlyReport)({
      fullName: `${owner}/${repo}`,
      endingOn,
      snapshots,
      stars: analysis?.starHistory ?? null,
      releases: analysis?.releases ?? [],
      topReferrer: sources?.topReferrer,
      referrers: sources?.referrers,
      paths: sources?.paths,
    });
    return reply({
      markdown: formatGitHubReport(
        report,
        process.env.NEXT_PUBLIC_APP_URL ?? "https://github-traffic-analytics.ali-ammari.workers.dev"
      ),
      endingOn,
    });
  } catch {
    return reply({ error: "Could not build the report preview. Try again shortly." }, 503);
  }
}
