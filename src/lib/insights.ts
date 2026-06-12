// SPDX-License-Identifier: MIT

/**
 * Shapes for the aggregated traffic payload that the "Summarize my traffic"
 * panel sends to the AI insights endpoint, plus helpers to build and validate it.
 *
 * Kept framework-free so it can be unit-tested without Next.js / the Anthropic SDK.
 */

export interface DailyPoint {
  date: string;
  views: number;
  uniques: number;
}

export interface AggregatedTrafficPayload {
  repoCount: number;
  totalViews: number;
  totalUniques: number;
  totalClones: number;
  totalCloneUniques: number;
  totalStars: number;
  topReferrers: Array<{ referrer: string; count: number; uniques: number }>;
  topPaths: Array<{ path: string; count: number; uniques: number }>;
  daily: DailyPoint[];
}

export class InvalidInsightsPayloadError extends Error {
  readonly status = 400 as const;
  constructor(message: string) {
    super(message);
    this.name = "InvalidInsightsPayloadError";
  }
}

const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

/**
 * Validate and normalize an untrusted request body into an AggregatedTrafficPayload.
 * Throws InvalidInsightsPayloadError when the body is not a usable traffic summary.
 */
export function parseTrafficPayload(body: unknown): AggregatedTrafficPayload {
  if (!body || typeof body !== "object") {
    throw new InvalidInsightsPayloadError("Request body must be a traffic summary object.");
  }
  const b = body as Record<string, unknown>;

  const num = (key: string): number => (isNum(b[key]) ? (b[key] as number) : 0);

  const daily: DailyPoint[] = Array.isArray(b.daily)
    ? (b.daily as unknown[])
        .filter((d): d is Record<string, unknown> => !!d && typeof d === "object")
        .map((d) => ({
          date: String((d as Record<string, unknown>).date ?? ""),
          views: isNum((d as Record<string, unknown>).views)
            ? ((d as Record<string, unknown>).views as number)
            : 0,
          uniques: isNum((d as Record<string, unknown>).uniques)
            ? ((d as Record<string, unknown>).uniques as number)
            : 0,
        }))
    : [];

  const referrers = Array.isArray(b.topReferrers)
    ? (b.topReferrers as unknown[])
        .filter((r): r is Record<string, unknown> => !!r && typeof r === "object")
        .slice(0, 10)
        .map((r) => ({
          referrer: String(r.referrer ?? "Direct"),
          count: isNum(r.count) ? (r.count as number) : 0,
          uniques: isNum(r.uniques) ? (r.uniques as number) : 0,
        }))
    : [];

  const paths = Array.isArray(b.topPaths)
    ? (b.topPaths as unknown[])
        .filter((p): p is Record<string, unknown> => !!p && typeof p === "object")
        .slice(0, 10)
        .map((p) => ({
          path: String(p.path ?? ""),
          count: isNum(p.count) ? (p.count as number) : 0,
          uniques: isNum(p.uniques) ? (p.uniques as number) : 0,
        }))
    : [];

  const payload: AggregatedTrafficPayload = {
    repoCount: num("repoCount"),
    totalViews: num("totalViews"),
    totalUniques: num("totalUniques"),
    totalClones: num("totalClones"),
    totalCloneUniques: num("totalCloneUniques"),
    totalStars: num("totalStars"),
    topReferrers: referrers,
    topPaths: paths,
    daily,
  };

  if (payload.totalViews === 0 && payload.totalClones === 0 && payload.daily.length === 0) {
    throw new InvalidInsightsPayloadError(
      "No traffic data to summarize. Open a repository with traffic first."
    );
  }

  return payload;
}

/**
 * Build the compact, deterministic prompt text describing the aggregated traffic.
 * Deterministic ordering keeps it cache-friendly and easy to assert in tests.
 */
export function buildInsightsPrompt(payload: AggregatedTrafficPayload): string {
  const lines: string[] = [];
  lines.push(`Repositories analyzed: ${payload.repoCount}`);
  lines.push(`Total views (14d): ${payload.totalViews} (${payload.totalUniques} unique visitors)`);
  lines.push(
    `Total clones (14d): ${payload.totalClones} (${payload.totalCloneUniques} unique cloners)`
  );
  lines.push(`Total stars: ${payload.totalStars}`);

  if (payload.daily.length > 0) {
    const series = payload.daily
      .map((d) => `${d.date}: ${d.views} views / ${d.uniques} unique`)
      .join("; ");
    lines.push(`Daily views: ${series}`);
  }
  if (payload.topReferrers.length > 0) {
    const refs = payload.topReferrers.map((r) => `${r.referrer} (${r.count} views)`).join(", ");
    lines.push(`Top referrers: ${refs}`);
  }
  if (payload.topPaths.length > 0) {
    const paths = payload.topPaths.map((p) => `${p.path} (${p.count} views)`).join(", ");
    lines.push(`Top pages: ${paths}`);
  }
  return lines.join("\n");
}

export const INSIGHTS_SYSTEM_PROMPT = [
  "You are a growth analyst for open-source maintainers.",
  "Given an aggregated 14-day GitHub traffic summary, write a concise, actionable briefing.",
  "Structure your answer as 3-5 short bullet points covering: notable trends, the strongest",
  "traffic sources, and one or two concrete suggestions to grow reach (docs, referrer outreach,",
  "README badges, sharing on relevant communities). Be specific and reference the numbers.",
  "Do not invent data that is not present. Keep it under 180 words. Plain text, no markdown headers.",
].join(" ");

export const INSIGHTS_MODEL = "claude-haiku-4-5";
