// SPDX-License-Identifier: MIT
import { z } from "zod";

/**
 * Typed, validated environment access.
 *
 * Validation runs at build/boot, so a missing or malformed required variable
 * fails loudly instead of surfacing as a runtime `undefined` later.
 *
 * `ANTHROPIC_API_KEY` is intentionally optional: the AI insights panel degrades
 * gracefully when it is unset (the route returns a 503 the UI handles).
 */
const serverEnvSchema = z.object({
  NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET is required"),
  NEXTAUTH_URL: z.url().optional(),
  GITHUB_CLIENT_ID: z.string().min(1, "GITHUB_CLIENT_ID is required"),
  GITHUB_CLIENT_SECRET: z.string().min(1, "GITHUB_CLIENT_SECRET is required"),
  ANTHROPIC_API_KEY: z.string().min(1).optional(),
});

type ServerEnv = z.infer<typeof serverEnvSchema>;

const runtimeEnv = {
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
};

const normalizedEnv = Object.fromEntries(
  Object.entries(runtimeEnv).map(([key, value]) => [key, value === "" ? undefined : value])
);

// The badge route and unit tests run without the full env; skip validation there.
const skipValidation =
  process.env.SKIP_ENV_VALIDATION === "true" || process.env.NODE_ENV === "test";

export const env: ServerEnv = skipValidation
  ? (normalizedEnv as ServerEnv)
  : serverEnvSchema.parse(normalizedEnv);
