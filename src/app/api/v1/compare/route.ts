// SPDX-License-Identifier: MIT
import { NextRequest, NextResponse } from "next/server";
import { parseRepoInput } from "@/lib/analytics";
import { publicGitHub } from "@/lib/github-public";
import { publicGrowthSummary } from "@/lib/public-api";
import { publicApiCache, publicApiError } from "@/lib/public-api-response";
import { checkIpRateLimit, requesterIp } from "@/lib/public-rate-limit";

export async function GET(request: NextRequest) {
  if (!checkIpRateLimit(requesterIp(request.headers), 30))
    return NextResponse.json(
      { error: "Too many comparison requests. Try again in a minute." },
      { status: 429, headers: { "cache-control": "no-store" } }
    );
  const names = request.nextUrl.searchParams.get("repos")?.split(",") ?? [];
  const parsed = names.map(parseRepoInput);
  if (
    names.length < 2 ||
    names.length > 4 ||
    parsed.some((item, index) => !item || `${item.owner}/${item.repo}` !== names[index]) ||
    new Set(names.map((name) => name.toLowerCase())).size !== names.length
  )
    return NextResponse.json(
      { error: "Choose two to four distinct public repositories." },
      { status: 400, headers: { "cache-control": "no-store" } }
    );
  try {
    const repositories = await Promise.all(
      parsed.map(async (item) => {
        const analysis = await publicGitHub.analyzePublicRepository(item!.owner, item!.repo);
        return publicGrowthSummary(analysis);
      })
    );
    return NextResponse.json({ version: 1, repositories }, { headers: publicApiCache });
  } catch (cause) {
    return publicApiError(cause);
  }
}
