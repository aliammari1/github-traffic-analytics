// SPDX-License-Identifier: MIT
import { NextRequest, NextResponse } from "next/server";
import { parseRepoInput } from "@/lib/analytics";
import { publicGitHub } from "@/lib/github-public";
import {
  publicAnomalies,
  publicGrowthSummary,
  publicReleaseImpact,
  publicStarHistory,
} from "@/lib/public-api";
import { publicApiCache, publicApiError } from "@/lib/public-api-response";
import { checkIpRateLimit, requesterIp } from "@/lib/public-rate-limit";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ owner: string; repo: string }> }
) {
  if (!checkIpRateLimit(requesterIp(request.headers)))
    return NextResponse.json(
      { error: "Too many requests. Try again in a minute." },
      { status: 429, headers: { "cache-control": "no-store" } }
    );
  const { owner, repo } = await context.params;
  const parsed = parseRepoInput(`${owner}/${repo}`);
  if (!parsed || parsed.owner !== owner || parsed.repo !== repo)
    return NextResponse.json(
      { error: "Choose a valid owner and repository." },
      { status: 400, headers: { "cache-control": "no-store" } }
    );
  const view = request.nextUrl.searchParams.get("view") ?? "summary";
  if (!["summary", "history", "release", "anomalies"].includes(view))
    return NextResponse.json(
      { error: "View must be summary, history, release, or anomalies." },
      { status: 400, headers: { "cache-control": "no-store" } }
    );
  const days = Number(request.nextUrl.searchParams.get("days") ?? "90");
  const tag = request.nextUrl.searchParams.get("tag") ?? "";
  if (view === "history" && (!Number.isInteger(days) || days < 1 || days > 180))
    return NextResponse.json(
      { error: "History days must be between 1 and 180." },
      { status: 400, headers: { "cache-control": "no-store" } }
    );
  if (view === "release" && (!tag || tag.length > 128))
    return NextResponse.json(
      { error: "Choose a release tag." },
      { status: 400, headers: { "cache-control": "no-store" } }
    );
  try {
    const analysis = await publicGitHub.analyzePublicRepository(owner, repo);
    const body =
      view === "history"
        ? publicStarHistory(analysis, days)
        : view === "anomalies"
          ? publicAnomalies(analysis)
          : view === "release"
            ? publicReleaseImpact(analysis, tag)
            : publicGrowthSummary(analysis);
    if (!body)
      return NextResponse.json(
        { error: "This release was not found in the available recent releases." },
        { status: 404, headers: { "cache-control": "no-store" } }
      );
    return NextResponse.json(body, { headers: publicApiCache });
  } catch (cause) {
    return publicApiError(cause);
  }
}
