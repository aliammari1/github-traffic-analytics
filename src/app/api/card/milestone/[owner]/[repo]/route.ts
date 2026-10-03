// SPDX-License-Identifier: MIT
import { parseRepoInput } from "@/lib/analytics";
import { GROWTH_CARD_THEMES, type GrowthCardTheme } from "@/lib/growth-card";
import {
  getHighestMilestone,
  isStarMilestone,
  renderMilestoneCard,
  type StarMilestone,
} from "@/lib/milestone-card";
import {
  publicGitHub,
  PublicRepoNotFoundError,
  PublicRepoRateLimitError,
} from "@/lib/github-public";

type Context = {
  params: Promise<{ owner: string; repo: string }>;
};

export async function GET(request: Request, { params }: Context): Promise<Response> {
  const { owner, repo } = await params;
  const url = new URL(request.url);
  const parsed = parseRepoInput(`${owner}/${repo}`);
  const theme = url.searchParams.get("theme") ?? "github-dark";
  const requested = url.searchParams.get("milestone");

  if (!parsed || parsed.owner !== owner || parsed.repo !== repo || !(theme in GROWTH_CARD_THEMES)) {
    return new Response("Invalid repository or theme", {
      status: 400,
      headers: { "Cache-Control": "private, no-store" },
    });
  }

  let requestedMilestone: StarMilestone | null = null;
  if (requested !== null) {
    const value = Number(requested);
    if (!Number.isInteger(value) || !isStarMilestone(value)) {
      return new Response("Invalid star milestone", {
        status: 400,
        headers: { "Cache-Control": "private, no-store" },
      });
    }
    requestedMilestone = value;
  }

  try {
    const analysis = await publicGitHub.analyzePublicRepository(owner, repo);
    const highestMilestone = getHighestMilestone(analysis.repository.starsCount);
    const milestone = requestedMilestone ?? highestMilestone;

    if (!milestone || analysis.repository.starsCount < milestone) {
      return new Response("Repository has not reached this milestone", {
        status: 409,
        headers: { "Cache-Control": "private, no-store" },
      });
    }

    const svg = renderMilestoneCard(
      {
        fullName: analysis.repository.fullName,
        starsCount: analysis.repository.starsCount,
        milestone,
        growth30d: analysis.starVelocity.growth30d,
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
      return new Response("Repository not found or private", {
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
    return new Response("Milestone card temporarily unavailable", {
      status: 503,
      headers: { "Cache-Control": "private, no-store" },
    });
  }
}
