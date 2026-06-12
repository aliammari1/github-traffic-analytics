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
