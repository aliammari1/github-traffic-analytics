// SPDX-License-Identifier: MIT
"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AggregatedTrafficPayload } from "@/lib/insights";

interface InsightsPanelProps {
  /** The aggregated traffic summary to send to the AI insights endpoint. */
  payload: AggregatedTrafficPayload;
}

/**
 * "Summarize my traffic" panel. On demand, POSTs the aggregated traffic payload
 * to /api/insights and renders the AI-generated briefing. Handles loading and
 * error states, including the "not configured" (503) case.
 */
export default function InsightsPanel({ payload }: InsightsPanelProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    setSummary(null);
    try {
      const response = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate insights");
      }
      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-border p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Insights
          </h2>
          <p className="text-sm text-muted-foreground">
            Get an AI-generated summary of your traffic trends and growth tips.
          </p>
        </div>
        <Button onClick={generate} disabled={loading} size="sm" className="gap-2 shrink-0">
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              Analyzing…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Summarize my traffic
            </>
          )}
        </Button>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-md border border-border bg-secondary/30 p-4 text-sm text-muted-foreground"
        >
          {error}
        </div>
      )}

      {summary && (
        <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{summary}</div>
      )}

      {!summary && !error && !loading && (
        <p className="text-sm text-muted-foreground">
          Click &ldquo;Summarize my traffic&rdquo; to generate insights from the last 14 days.
        </p>
      )}
    </div>
  );
}
