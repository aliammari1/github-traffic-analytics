// SPDX-License-Identifier: MIT
"use client";

import { useState } from "react";
import { Sparkles, TrendingUp, Tag, Activity, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AggregatedTrafficPayload } from "@/lib/insights";

interface InsightsPanelProps {
  /** The aggregated traffic summary to send to the AI insights endpoint. */
  payload: AggregatedTrafficPayload;
}

type InsightAction = "growth" | "release" | "change" | "traffic";

/**
 * Contextual AI Intelligence panel.
 *
 * Supports deterministic contextual actions ("Explain this growth", "Explain this release period",
 * "What changed?", "Summarize my traffic") based on structured precomputed telemetry.
 */
export default function InsightsPanel({ payload }: Readonly<InsightsPanelProps>) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<InsightAction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = async (action: InsightAction = "traffic") => {
    setLoading(true);
    setActiveAction(action);
    setError(null);
    setSummary(null);
    try {
      const response = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, promptType: action }),
      });

      // Errors are returned as JSON `{ error }`; success is a text/plain stream.
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate insights");
      }

      if (!response.body) {
        // No streamable body (e.g. test/JSON fallback) — read it whole.
        const text = await response.text();
        setSummary(text);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      setSummary("");
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setSummary(accumulated);
      }
      accumulated += decoder.decode();
      setSummary(accumulated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
      setActiveAction(null);
    }
  };

  const hasReleaseContext = Boolean(payload.context?.release);

  return (
    <div className="rounded-lg border border-border p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-400" />
            Contextual AI Intelligence
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Interprets precomputed growth telemetry without hallucinating data.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => generate("growth")}
            disabled={loading}
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs"
          >
            {loading && activeAction === "growth" ? (
              <span className="w-3.5 h-3.5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            ) : (
              <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
            )}
            Explain this growth
          </Button>

          {hasReleaseContext && (
            <Button
              onClick={() => generate("release")}
              disabled={loading}
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs"
            >
              {loading && activeAction === "release" ? (
                <span className="w-3.5 h-3.5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
              ) : (
                <Tag className="h-3.5 w-3.5 text-cyan-400" />
              )}
              Explain this release period
            </Button>
          )}

          <Button
            onClick={() => generate("change")}
            disabled={loading}
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs"
          >
            {loading && activeAction === "change" ? (
              <span className="w-3.5 h-3.5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            ) : (
              <Activity className="h-3.5 w-3.5 text-emerald-400" />
            )}
            What changed?
          </Button>

          <Button
            onClick={() => generate("traffic")}
            disabled={loading}
            size="sm"
            className="gap-1.5 text-xs"
          >
            {loading && activeAction === "traffic" ? (
              <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <BarChart2 className="h-3.5 w-3.5" />
            )}
            Summarize my traffic
          </Button>
        </div>
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
        <div className="rounded-lg border border-border/60 bg-muted/20 p-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
          {summary}
        </div>
      )}

      {!summary && !error && !loading && (
        <p className="text-xs text-muted-foreground">
          Select an action above to generate deterministic AI insights from observed telemetry.
        </p>
      )}
    </div>
  );
}
