// SPDX-License-Identifier: MIT
import { getD1 } from "@/lib/d1";
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
  // Cache at the edge for an hour; snapshots only change once a day.
  "Cache-Control": "public, max-age=3600, s-maxage=3600",
};

function svg(body: string, status = 200): Response {
  return new Response(body, { status, headers: SVG_HEADERS });
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const owner = params.get("owner");
  const repo = params.get("repo");

  if (!owner || !repo) {
    return svg(renderBadge("repo views", "owner & repo required"));
  }

  const db = await getD1();
  if (!db) {
    return svg(renderBadge("repo views", "no data"));
  }

  try {
    const total = await getTotalViews(db, { repoOwner: owner, repoName: repo });
    return svg(renderViewsBadge(total));
  } catch {
    return svg(renderBadge("repo views", "error"));
  }
}
