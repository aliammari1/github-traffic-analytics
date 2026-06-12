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
 * Accepts an aggregated traffic summary and STREAMS an AI-generated "Summarize my
 * traffic" briefing produced by the Anthropic Messages API (model claude-haiku-4-5).
 *
 * On success it returns a `text/plain` stream of the briefing token-by-token so
 * the UI can render it as it arrives. Error cases still return JSON `{ error }`:
 *   - 401 when the session lacks an access token,
 *   - 400 when the body is not a usable traffic summary,
 *   - 503 when ANTHROPIC_API_KEY is not configured,
 *   - 502 when the upstream model call fails before any token is emitted.
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

  let stream;
  try {
    const client = new Anthropic({ apiKey });
    stream = client.messages.stream({
      model: INSIGHTS_MODEL,
      max_tokens: 1024,
      system: INSIGHTS_SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildInsightsPrompt(payload) }],
    });
  } catch (error: unknown) {
    console.error("Error generating traffic insights:", error);
    return NextResponse.json(
      { error: "Failed to generate insights. Please try again." },
      { status: 502 }
    );
  }

  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const text of stream.on("error", () => {}).textStream) {
          controller.enqueue(encoder.encode(text));
        }
        controller.close();
      } catch (error: unknown) {
        // The model failed mid-stream; the client renders whatever already arrived.
        console.error("Error streaming traffic insights:", error);
        controller.close();
      }
    },
  });

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
