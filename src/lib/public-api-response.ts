// SPDX-License-Identifier: MIT
import { NextResponse } from "next/server";
import {
  PublicRepoError,
  PublicRepoNotFoundError,
  PublicRepoRateLimitError,
} from "./github-public";

export const publicApiCache = {
  "cache-control": "public, s-maxage=300, stale-while-revalidate=600",
  "x-api-version": "1",
};

export function publicApiError(cause: unknown): NextResponse {
  if (cause instanceof PublicRepoNotFoundError)
    return NextResponse.json(
      { error: "Repository was not found or is not public." },
      { status: 404, headers: { "cache-control": "no-store" } }
    );
  if (cause instanceof PublicRepoRateLimitError)
    return NextResponse.json(
      {
        error: "GitHub's public API is rate-limited. Try again after the reset.",
        resetAt: cause.resetAt?.toISOString(),
      },
      { status: 429, headers: { "cache-control": "no-store" } }
    );
  if (cause instanceof PublicRepoError)
    return NextResponse.json(
      { error: "GitHub could not analyze this repository right now." },
      { status: cause.status, headers: { "cache-control": "no-store" } }
    );
  console.error("Public API analysis failed", {
    reason: cause instanceof Error ? cause.name : "unknown",
  });
  return NextResponse.json(
    { error: "Analysis is temporarily unavailable. Try again shortly." },
    { status: 503, headers: { "cache-control": "no-store" } }
  );
}
