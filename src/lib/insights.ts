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
  (value) => (typeof value === "number" && Number.isFinite(value) ? value : 0),
  z.number()
);

const dailyPointSchema = z.object({
  date: z.preprocess((value) => String(value ?? ""), z.string()),
  views: safeNumber,
  uniques: safeNumber,
});

const referrerSchema = z.object({
  referrer: z.preprocess((value) => (value == null ? "Direct" : String(value)), z.string()),
  count: safeNumber,
  uniques: safeNumber,
});

const pathSchema = z.object({
  path: z.preprocess((value) => String(value ?? ""), z.string()),
  count: safeNumber,
  uniques: safeNumber,
});

/** Drop non-object array entries before parsing, then cap the list length. */
function objectArray<T extends z.ZodTypeAny>(item: T, cap?: number) {
  return z.preprocess((value) => {
    if (!Array.isArray(value)) return [];
    const objects = value.filter((entry) => {
      return !!entry && typeof entry === "object" && !Array.isArray(entry);
    });
    return cap ? objects.slice(0, cap) : objects;
  }, z.array(item));
}

const structuredContextSchema = z
  .object({
    repoName: z.string().optional(),
    currentStars: safeNumber.optional(),
    stars7d: safeNumber.optional(),
    stars30d: safeNumber.optional(),
    weeklyVelocityChange: z.number().nullable().optional(),
    release: z
      .object({
        tag: z.string(),
        name: z.string().optional(),
        daysAgo: safeNumber,
        beforeStars: safeNumber.optional(),
        afterStars: safeNumber.optional(),
        velocityChangePercent: z.number().nullable().optional(),
      })
      .nullable()
      .optional(),
  })
  .optional();

export type StructuredAnalyticsContext = z.infer<typeof structuredContextSchema>;

const payloadSchema = z.object({
  promptType: z.enum(["traffic", "growth", "release", "change"]).optional(),
  context: structuredContextSchema,
  repoCount: safeNumber,
  totalViews: safeNumber,
  totalUniques: safeNumber,
  totalClones: safeNumber,
  totalCloneUniques: safeNumber,
  totalStars: safeNumber,
  topReferrers: objectArray(referrerSchema, 10),
  topPaths: objectArray(pathSchema, 10),
  daily: objectArray(dailyPointSchema, 14),
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
  const hasNoTraffic =
    payload.totalViews === 0 &&
    payload.totalClones === 0 &&
    payload.daily.length === 0 &&
    !payload.context;

  if (hasNoTraffic) {
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
  if (payload.promptType === "growth" && payload.context) {
    const lines = [
      `Analyze star growth trajectory for repository ${payload.context.repoName || "target"}:`,
      `Current stars: ${payload.context.currentStars ?? payload.totalStars}`,
      `7-day star growth: +${payload.context.stars7d ?? 0}`,
      `30-day star growth: +${payload.context.stars30d ?? 0}`,
      payload.context.weeklyVelocityChange !== undefined &&
      payload.context.weeklyVelocityChange !== null
        ? `Weekly velocity change: ${payload.context.weeklyVelocityChange}%`
        : null,
      "Explain what these star trajectory numbers indicate about repository momentum and growth drivers.",
    ].filter(Boolean) as string[];
    return lines.join("\n");
  }

  if (payload.promptType === "release" && payload.context?.release) {
    const rel = payload.context.release;
    const lines = [
      `Analyze the release period for repository ${payload.context.repoName || "target"}:`,
      `Release tag: ${rel.tag} (${rel.name || rel.tag})`,
      `Published: ~${rel.daysAgo} days ago`,
      rel.beforeStars !== undefined ? `14 days before release: +${rel.beforeStars} stars` : null,
      rel.afterStars !== undefined ? `14 days after release: +${rel.afterStars} stars` : null,
      rel.velocityChangePercent !== undefined && rel.velocityChangePercent !== null
        ? `Velocity change around release: ${rel.velocityChangePercent}%`
        : null,
      "Explain the activity observed around this release window. Treat this strictly as temporal association, not direct causation.",
    ].filter(Boolean) as string[];
    return lines.join("\n");
  }

  if (payload.promptType === "change" && payload.context) {
    const lines = [
      `Summarize key recent growth and trajectory changes for repository ${payload.context.repoName || "target"}:`,
      `Current stars: ${payload.context.currentStars ?? payload.totalStars}`,
      `7-day gain: +${payload.context.stars7d ?? 0}`,
      `30-day gain: +${payload.context.stars30d ?? 0}`,
      payload.context.weeklyVelocityChange !== undefined &&
      payload.context.weeklyVelocityChange !== null
        ? `Velocity change: ${payload.context.weeklyVelocityChange}%`
        : null,
      payload.context.release
        ? `Latest release: ${payload.context.release.tag} (${payload.context.release.daysAgo} days ago)`
        : null,
      "Highlight what changed in terms of velocity, momentum, and traffic patterns.",
    ].filter(Boolean) as string[];
    return lines.join("\n");
  }

  const lines = [
    `Repositories analyzed: ${payload.repoCount}`,
    `Total views (14d): ${payload.totalViews} (${payload.totalUniques} unique visitors)`,
    `Total clones (14d): ${payload.totalClones} (${payload.totalCloneUniques} unique cloners)`,
    `Total stars: ${payload.totalStars}`,
  ];

  if (payload.daily.length > 0) {
    const series = payload.daily
      .map((day) => `${day.date}: ${day.views} views / ${day.uniques} unique`)
      .join("; ");
    lines.push(`Daily views: ${series}`);
  }

  if (payload.topReferrers.length > 0) {
    const refs = payload.topReferrers
      .map((referrer) => `${referrer.referrer} (${referrer.count} views)`)
      .join(", ");
    lines.push(`Top referrers: ${refs}`);
  }

  if (payload.topPaths.length > 0) {
    const paths = payload.topPaths.map((path) => `${path.path} (${path.count} views)`).join(", ");
    lines.push(`Top pages: ${paths}`);
  }

  return lines.join("\n");
}

export const INSIGHTS_SYSTEM_PROMPT = [
  "You are a growth analyst for open-source maintainers.",
  "Given structured precomputed GitHub growth and traffic metrics, write a concise, actionable briefing.",
  "Do not invent or calculate numbers yourself. Explain the precomputed trends and offer concrete suggestions.",
  "If analyzing release events, treat them as temporal associations rather than direct causation.",
  "Structure your answer as 3-5 short bullet points. Keep it under 180 words. Plain text, no markdown headers.",
].join(" ");

export const INSIGHTS_MODEL = "claude-haiku-4-5";
