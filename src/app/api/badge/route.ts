// SPDX-License-Identifier: MIT
import { getD1, getBadgeRateLimiter } from "@/lib/d1";
import { getTotalViews } from "@/lib/snapshots";
import { renderBadge, renderViewsBadge } from "@/lib/badge";
import { NextRequest } from "next/server";

/**
 * GET /api/badge?owner=<o>&repo=<r>
 *
 * Public, unauthenticated SVG badge of a repo's TOTAL accumulated views since
 * tracking began — the figure GitHub discards after 14 days. This is the viral
 * loop: embed it in any README and it links back to this app.
 *
 * It exposes only a single aggregate number for a repo whose owner explicitly
 * opted into tracking, so no per-user or private data is leaked. Returns a "no
 * data" badge (HTTP 200) when the repo isn't tracked or D1 isn't available, so
 * the image never 404s in someone's README.
 */
export const dynamic = "force-dynamic";

const SVG_HEADERS = {
  "Content-Type": "image/svg+xml; charset=utf-8",
  // Cache at the edge for an hour; snapshots only change once a day. Serve a
  // stale badge for up to a day while revalidating so a cold D1/edge never blocks
  // someone's README from rendering the badge.
  "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
} as const;

/**
 * Build a tiny strong ETag for an SVG body so GitHub's camo image proxy and
 * browsers can revalidate with a cheap 304 instead of re-downloading the badge.
 * djb2 over the body keeps it dependency-free and edge-safe.
 */
function etagFor(body: string): string {
  let hash = 5381;
  for (let i = 0; i < body.length; i++) {
    hash = ((hash << 5) + hash + body.charCodeAt(i)) | 0;
  }
  return `"${(hash >>> 0).toString(36)}"`;
}

function svg(request: NextRequest, body: string, status = 200): Response {
  const etag = etagFor(body);
  const headers: Record<string, string> = { ...SVG_HEADERS, ETag: etag };
  if (status === 200 && request.headers.get("if-none-match") === etag) {
    return new Response(null, { status: 304, headers });
  }
  return new Response(body, { status, headers });
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const owner = params.get("owner");
  const repo = params.get("repo");

  if (!owner || !repo) {
    return svg(request, renderBadge("repo views", "owner & repo required"));
  }

  // Cloudflare-native per-IP rate limit (no-op off Cloudflare). Returns a badge
  // (HTTP 200) rather than a 429 so a throttled README still renders something.
  const limiter = await getBadgeRateLimiter();
  if (limiter) {
    const ip =
      request.headers.get("cf-connecting-ip") ??
      request.headers.get("x-forwarded-for") ??
      "anonymous";
    const { success } = await limiter.limit({ key: ip });
    if (!success) {
      return svg(request, renderBadge("repo views", "rate limited"));
    }
  }

  const db = await getD1();
  if (!db) {
    return svg(request, renderBadge("repo views", "no data"));
  }

  try {
    const total = await getTotalViews(db, { repoOwner: owner, repoName: repo });
    return svg(request, renderViewsBadge(total));
  } catch {
    return svg(request, renderBadge("repo views", "error"));
  }
}
