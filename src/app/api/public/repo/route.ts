// SPDX-License-Identifier: MIT
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  publicGitHub,
  PublicRepoNotFoundError,
  PublicRepoRateLimitError,
} from "@/lib/github-public";

const querySchema = z.object({
  owner: z.string().min(1).max(100),
  repo: z.string().min(1).max(100),
});

/**
 * Public repository analysis endpoint.
 * Zero-auth: anyone can query public repository growth telemetry and star history.
 */
export async function GET(request: NextRequest) {
  try {
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

    console.error("Public repo analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze repository. Please try again later." },
      { status: 500 }
    );
  }
}
