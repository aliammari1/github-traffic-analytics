// SPDX-License-Identifier: MIT
import { parseRepoInput, compareStarPeriods, starsGained } from "@/lib/analytics";
import {
  publicGitHub,
  PublicRepoNotFoundError,
  PublicRepoRateLimitError,
} from "@/lib/github-public";
import { GROWTH_CARD_THEMES, GrowthCardTheme, renderGrowthCard } from "@/lib/growth-card";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ owner: string; repo: string }> }
): Promise<Response> {
  const { owner, repo } = await params;
  const theme = new URL(request.url).searchParams.get("theme") ?? "github-dark";
  const parsed = parseRepoInput(`${owner}/${repo}`);
  if (!parsed || parsed.owner !== owner || parsed.repo !== repo || !(theme in GROWTH_CARD_THEMES)) {
    return new Response("Invalid repository or theme", {
      status: 400,
      headers: { "Cache-Control": "private, no-store" },
    });
  }

  try {
    const analysis = await publicGitHub.analyzePublicRepository(owner, repo);
    const growth30d = starsGained(analysis.starHistory, 30);
    const velocityChangePercent = compareStarPeriods(analysis.starHistory, 7).changePercent;
    const svg = renderGrowthCard(
      {
        fullName: analysis.repository.fullName,
        starsCount: analysis.repository.starsCount,
        growth30d,
        velocityChangePercent,
        latestRelease: analysis.releases[0]?.tagName ?? null,
      },
      theme as GrowthCardTheme
    );
    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "public, max-age=600, s-maxage=3600, stale-while-revalidate=3600",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      },
    });
  } catch (error) {
    if (error instanceof PublicRepoNotFoundError) {
      return new Response("Repository not found", {
        status: 404,
        headers: { "Cache-Control": "private, no-store" },
      });
    }
    if (error instanceof PublicRepoRateLimitError) {
      return new Response("GitHub rate limit reached", {
        status: 503,
        headers: { "Cache-Control": "private, no-store", "Retry-After": "60" },
      });
    }
    return new Response("Growth card temporarily unavailable", {
      status: 503,
      headers: { "Cache-Control": "private, no-store" },
    });
  }
}
