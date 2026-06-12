// SPDX-License-Identifier: MIT
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@/lib/auth";
import {
  buildInsightsPrompt,
  parseTrafficPayload,
  InvalidInsightsPayloadError,
  INSIGHTS_SYSTEM_PROMPT,
  INSIGHTS_MODEL,
} from "@/lib/insights";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/insights
 *
 * Accepts an aggregated traffic summary and returns an AI-generated "Summarize my
 * traffic" briefing produced by the Anthropic Messages API (model claude-haiku-4-5).
 *
 * @returns JSON `{ summary: string }` on success, or `{ error: string }` with:
 *   - 401 when the session lacks an access token,
 *   - 400 when the body is not a usable traffic summary,
 *   - 503 when ANTHROPIC_API_KEY is not configured,
 *   - 502 when the upstream model call fails.
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI insights are not configured. Set ANTHROPIC_API_KEY to enable this feature." },
      { status: 503 }
    );
  }

  let payload;
  try {
    const body = await request.json();
    payload = parseTrafficPayload(body);
  } catch (error: unknown) {
    if (error instanceof InvalidInsightsPayloadError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: INSIGHTS_MODEL,
      max_tokens: 1024,
      system: INSIGHTS_SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildInsightsPrompt(payload) }],
    });

    const summary = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();

    if (!summary) {
      return NextResponse.json({ error: "The model returned an empty response." }, { status: 502 });
    }

    return NextResponse.json({ summary });
  } catch (error: unknown) {
    console.error("Error generating traffic insights:", error);
    return NextResponse.json(
      { error: "Failed to generate insights. Please try again." },
      { status: 502 }
    );
  }
}
