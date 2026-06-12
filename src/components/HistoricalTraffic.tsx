// SPDX-License-Identifier: MIT
"use client";

import { useState, useEffect, useCallback } from "react";
import { History } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface HistoryPoint {
  day: string;
  views: number;
  viewUniques: number;
  clones: number;
  cloneUniques: number;
}

interface HistoricalTrafficProps {
  owner: string;
  repo: string;
}

/**
 * Surfaces the persisted daily-snapshot history (from D1, beyond GitHub's 14-day
 * window) for a repository, and lets the user opt the repo in to daily tracking.
 *
 * Both endpoints return 503 when the Cloudflare D1 deployment isn't available
 * (e.g. local Node dev); this component shows that state instead of erroring.
 */
export default function HistoricalTraffic({ owner, repo }: HistoricalTrafficProps) {
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [tracking, setTracking] = useState(false);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/snapshots?owner=${owner}&repo=${repo}`);
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Unable to load history");
        setHistory([]);
        return;
      }
      setHistory(data.history ?? []);
    } catch {
      setMessage("Unable to load history");
    } finally {
      setLoading(false);
    }
  }, [owner, repo]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const enableTracking = async () => {
    setTracking(true);
    setMessage(null);
    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner, repo }),
      });
      const data = await res.json();
      setMessage(
        res.ok
          ? "Tracking enabled. Daily snapshots will accumulate from tomorrow."
          : data.error || "Unable to enable tracking"
      );
    } catch {
      setMessage("Unable to enable tracking");
    } finally {
      setTracking(false);
    }
  };

  return (
    <div className="rounded-lg border border-border p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            <History className="h-4 w-4" />
            Historical traffic
          </h3>
          <p className="text-sm text-muted-foreground">
            Daily snapshots beyond GitHub&apos;s 14-day limit.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={enableTracking}
          disabled={tracking}
          className="shrink-0"
        >
          {tracking ? "Enabling…" : "Track this repo"}
        </Button>
      </div>

      {loading ? (
        <div className="h-48 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      ) : history.length > 0 ? (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
            <XAxis dataKey="day" stroke="#737373" fontSize={12} />
            <YAxis stroke="#737373" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0a0a0a",
                border: "1px solid #262626",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#fafafa" }}
            />
            <Line
              type="monotone"
              dataKey="views"
              stroke="#fafafa"
              strokeWidth={2}
              dot={false}
              name="Views"
            />
            <Line
              type="monotone"
              dataKey="clones"
              stroke="#737373"
              strokeWidth={2}
              dot={false}
              name="Clones"
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-24 flex items-center justify-center text-center text-sm text-muted-foreground">
          {message ||
            "No historical data yet. Enable tracking to start collecting daily snapshots."}
        </div>
      )}

      {history.length > 0 && message && (
        <p className="mt-3 text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  );
}
