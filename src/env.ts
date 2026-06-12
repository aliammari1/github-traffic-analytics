// SPDX-License-Identifier: MIT
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * Typed, validated environment access (replaces scattered `process.env.X!`).
 *
 * Validation runs at build/boot, so a missing or malformed required variable
 * fails loudly with a clear message instead of surfacing as a runtime `undefined`
 * deep inside NextAuth/Octokit/Anthropic.
 *
 * `ANTHROPIC_API_KEY` is intentionally optional: the AI insights panel degrades
 * gracefully when it is unset (the route returns a 503 the UI handles).
 */
export const env = createEnv({
  server: {
    NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET is required"),
    NEXTAUTH_URL: z.url().optional(),
    GITHUB_CLIENT_ID: z.string().min(1, "GITHUB_CLIENT_ID is required"),
    GITHUB_CLIENT_SECRET: z.string().min(1, "GITHUB_CLIENT_SECRET is required"),
    ANTHROPIC_API_KEY: z.string().min(1).optional(),
  },
  client: {},
  runtimeEnv: {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  },
  // The badge route and unit tests run without the full env; skip there.
  skipValidation:
    process.env.SKIP_ENV_VALIDATION === "true" || process.env.NODE_ENV === "test",
  emptyStringAsUndefined: true,
});
