// SPDX-License-Identifier: MIT
import { parseRepoInput, starsGained } from "@/lib/analytics";
import { isStarMilestone, getHighestMilestone } from "@/lib/milestone-card";
import { renderCertificate } from "@/lib/certificate";
import {
  publicGitHub,
  PublicRepoNotFoundError,
  PublicRepoRateLimitError,
} from "@/lib/github-public";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ owner: string; repo: string }> }
): Promise<Response> {
  const { owner, repo } = await params;
  const parsed = parseRepoInput(`${owner}/${repo}`);
  const value = new URL(request.url).searchParams.get("milestone");
  if (
    !parsed ||
    parsed.owner !== owner ||
    parsed.repo !== repo ||
    (value !== null && !isStarMilestone(Number(value)))
  ) {
    return new Response("Invalid repository or milestone", {
      status: 400,
      headers: { "Cache-Control": "private, no-store" },
    });
  }
  try {
    const analysis = await publicGitHub.analyzePublicRepository(owner, repo);
    const milestone =
      value === null ? getHighestMilestone(analysis.repository.starsCount) : Number(value);
    if (!milestone || analysis.repository.starsCount < milestone || !isStarMilestone(milestone)) {
      return new Response("Repository has not reached this milestone", {
        status: 409,
        headers: { "Cache-Control": "private, no-store" },
      });
    }
    const svg = renderCertificate({
      fullName: analysis.repository.fullName,
      milestone,
      starsCount: analysis.repository.starsCount,
      growth7d: starsGained(analysis.starHistory, 7),
      issuedOn: new Date().toISOString().slice(0, 10),
    });
    return new Response(svg, {
      headers: {
        "content-type": "image/svg+xml; charset=utf-8",
        "content-disposition": `attachment; filename="${owner}-${repo}-${milestone}-stars.svg"`,
        "cache-control": "public, max-age=300",
        "content-security-policy": "default-src 'none'; sandbox",
        "x-content-type-options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof PublicRepoNotFoundError)
      return new Response("Repository not found or private", {
        status: 404,
        headers: { "Cache-Control": "private, no-store" },
      });
    if (error instanceof PublicRepoRateLimitError)
      return new Response("GitHub rate limit reached", {
        status: 503,
        headers: { "Cache-Control": "private, no-store" },
      });
    return new Response("Certificate temporarily unavailable", {
      status: 503,
      headers: { "Cache-Control": "private, no-store" },
    });
  }
}
