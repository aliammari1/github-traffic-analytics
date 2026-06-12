// SPDX-License-Identifier: MIT
import type { D1Database } from "@/lib/snapshots";

/**
 * Resolve the D1 binding (`DB`) at runtime when deployed on Cloudflare via
 * @opennextjs/cloudflare. Returns null in environments without the binding
 * (local `next dev` / `next start` on Node, CI build), so callers can degrade
 * gracefully instead of crashing.
 */
export async function getD1(): Promise<D1Database | null> {
  try {
    // Dynamic import so the Next/Node build doesn't hard-require the CF adapter.
    const mod = await import("@opennextjs/cloudflare");
    const { env } = mod.getCloudflareContext();
    return (env as { DB?: D1Database }).DB ?? null;
  } catch {
    return null;
  }
}

/** Cloudflare-native rate limiter binding (see `ratelimits` in wrangler.jsonc). */
export interface RateLimiter {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

/**
 * Resolve the `BADGE_RATE_LIMITER` binding at runtime on Cloudflare. Returns null
 * off-Cloudflare (local dev, CI, unit tests) so the public badge route simply
 * skips rate limiting there instead of crashing.
 */
export async function getBadgeRateLimiter(): Promise<RateLimiter | null> {
  try {
    const mod = await import("@opennextjs/cloudflare");
    const { env } = mod.getCloudflareContext();
    return (env as { BADGE_RATE_LIMITER?: RateLimiter }).BADGE_RATE_LIMITER ?? null;
  } catch {
    return null;
  }
}
