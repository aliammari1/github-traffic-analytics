// SPDX-License-Identifier: MIT
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  publicGitHub,
  PublicRepoError,
  PublicRepoNotFoundError,
  PublicRepoRateLimitError,
} from "@/lib/github-public";

const querySchema = z.object({
  owner: z.string().min(1).max(100),
  repo: z.string().min(1).max(100),
});

// In-memory sliding-window IP rate limiter (60 requests per minute per IP)
const ipRateLimit = new Map<string, { count: number; expiresAt: number }>();

function checkIpRateLimit(ip: string, maxRequests = 60, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = ipRateLimit.get(ip);
  if (!entry || entry.expiresAt <= now) {
    ipRateLimit.set(ip, { count: 1, expiresAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxRequests) {
    return false;
  }
  entry.count++;
  return true;
}

/**
 * Public repository analysis endpoint.
 * Zero-auth: anyone can query public repository growth telemetry and star history.
 */
export async function GET(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("cf-connecting-ip") ||
      "anonymous";

    if (!checkIpRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many requests from your IP. Please try again in a minute." },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      owner: searchParams.get("owner"),
      repo: searchParams.get("repo"),
    });

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid owner or repo parameters" }, { status: 400 });
    }

    const { owner, repo } = parsed.data;
    const analysis = await publicGitHub.analyzePublicRepository(owner, repo);

    return NextResponse.json(analysis, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    if (error instanceof PublicRepoNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof PublicRepoRateLimitError) {
      return NextResponse.json(
        {
          error: error.message,
          resetAt: error.resetAt?.toISOString(),
        },
        { status: 429 }
      );
    }
    if (error instanceof PublicRepoError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("Public repo analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze repository. Please try again later." },
      { status: 500 }
    );
  }
}
