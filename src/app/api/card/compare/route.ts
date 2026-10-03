// SPDX-License-Identifier: MIT
import { parseRepoInput } from "@/lib/analytics";
import { renderComparisonCard } from "@/lib/comparison-card";
import { GROWTH_CARD_THEMES, type GrowthCardTheme } from "@/lib/growth-card";
import {
  publicGitHub,
  PublicRepoNotFoundError,
  PublicRepoRateLimitError,
} from "@/lib/github-public";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const leftInput = url.searchParams.get("a") ?? "";
  const rightInput = url.searchParams.get("b") ?? "";
  const theme = url.searchParams.get("theme") ?? "github-dark";
  const left = parseRepoInput(leftInput);
  const right = parseRepoInput(rightInput);

  if (
    !left ||
    !right ||
    `${left.owner}/${left.repo}`.toLowerCase() === `${right.owner}/${right.repo}`.toLowerCase() ||
    !(theme in GROWTH_CARD_THEMES)
  ) {
    return new Response("Provide two distinct public repositories and a valid theme", {
      status: 400,
      headers: { "Cache-Control": "private, no-store" },
    });
  }

  try {
    const [leftAnalysis, rightAnalysis] = await Promise.all([
      publicGitHub.analyzePublicRepository(left.owner, left.repo),
      publicGitHub.analyzePublicRepository(right.owner, right.repo),
    ]);

    const svg = renderComparisonCard(
      {
        fullName: leftAnalysis.repository.fullName,
        starsCount: leftAnalysis.repository.starsCount,
        growth7d: leftAnalysis.starVelocity.growth7d,
        growth30d: leftAnalysis.starVelocity.growth30d,
        weeklyVelocity: leftAnalysis.starVelocity.weeklyVelocity,
      },
      {
        fullName: rightAnalysis.repository.fullName,
        starsCount: rightAnalysis.repository.starsCount,
        growth7d: rightAnalysis.starVelocity.growth7d,
        growth30d: rightAnalysis.starVelocity.growth30d,
        weeklyVelocity: rightAnalysis.starVelocity.weeklyVelocity,
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
      return new Response("One or both repositories were not found or are private", {
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
    return new Response("Comparison card temporarily unavailable", {
      status: 503,
      headers: { "Cache-Control": "private, no-store" },
    });
  }
}
