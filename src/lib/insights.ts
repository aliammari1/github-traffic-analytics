// SPDX-License-Identifier: MIT
import { z } from "zod";

/**
 * Shapes for the aggregated traffic payload that the "Summarize my traffic"
 * panel sends to the AI insights endpoint, plus helpers to build and validate it.
 *
 * Validation uses Zod v4 (replacing the previous hand-rolled checks) while keeping
 * the same lenient, normalizing contract: unknown/malformed fields are coerced to
 * safe defaults rather than rejected, and the only hard failures are a non-object
 * body or a payload with no traffic at all.
 *
 * Kept framework-free so it can be unit-tested without Next.js / the Anthropic SDK.
 */

export class InvalidInsightsPayloadError extends Error {
  readonly status = 400 as const;
  constructor(message: string) {
    super(message);
    this.name = "InvalidInsightsPayloadError";
  }
}

/** A finite number, or 0 for anything else (strings, null, NaN, Infinity, missing). */
const safeNumber = z.preprocess(
  (v) => (typeof v === "number" && Number.isFinite(v) ? v : 0),
  z.number()
);

const dailyPointSchema = z.object({
  date: z.preprocess((v) => String(v ?? ""), z.string()),
  views: safeNumber,
  uniques: safeNumber,
});

const referrerSchema = z.object({
  referrer: z.preprocess((v) => (v == null ? "Direct" : String(v)), z.string()),
  count: safeNumber,
  uniques: safeNumber,
});

const pathSchema = z.object({
  path: z.preprocess((v) => String(v ?? ""), z.string()),
  count: safeNumber,
  uniques: safeNumber,
});

/** Drop non-object array entries before parsing, then cap the list length. */
const objectArray = <T extends z.ZodTypeAny>(item: T, cap?: number) =>
  z.preprocess(
    (v) => {
      if (!Array.isArray(v)) return [];
      const objects = v.filter((e) => !!e && typeof e === "object");
      return cap ? objects.slice(0, cap) : objects;
    },
    z.array(item)
  );

const payloadSchema = z.object({
  repoCount: safeNumber,
  totalViews: safeNumber,
  totalUniques: safeNumber,
  totalClones: safeNumber,
  totalCloneUniques: safeNumber,
  totalStars: safeNumber,
  topReferrers: objectArray(referrerSchema, 10),
  topPaths: objectArray(pathSchema, 10),
  daily: objectArray(dailyPointSchema),
});

export type DailyPoint = z.infer<typeof dailyPointSchema>;
export type AggregatedTrafficPayload = z.infer<typeof payloadSchema>;

/**
 * Validate and normalize an untrusted request body into an AggregatedTrafficPayload.
 * Throws InvalidInsightsPayloadError when the body is not a usable traffic summary.
 */
export function parseTrafficPayload(body: unknown): AggregatedTrafficPayload {
  if (!body || typeof body !== "object") {
    throw new InvalidInsightsPayloadError("Request body must be a traffic summary object.");
  }

  const payload = payloadSchema.parse(body);

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
