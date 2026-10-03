// SPDX-License-Identifier: MIT
"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from "recharts";
import { format, parseISO } from "date-fns";
import { StarPoint, calculateReleaseImpact } from "@/lib/analytics";
import { PublicRelease } from "@/lib/github-public";

interface StarHistoryChartProps {
  data: StarPoint[];
  releases?: PublicRelease[];
}

export default function StarHistoryChart({ data, releases = [] }: Readonly<StarHistoryChartProps>) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.map((d) => {
      const parsedDate = parseISO(d.date);
      return {
        timestamp: parsedDate.getTime(),
        stars: d.stars,
      };
    });
  }, [data]);

  // Match releases to the closest chart sample and calculate deterministic impact
  const releaseDots = useMemo(() => {
    if (!releases.length || !chartData.length) return [];
    return releases.map((rel) => {
      const relTime = parseISO(rel.publishedAt).getTime();
      let closest = chartData[0];
      let minDiff = Math.abs(chartData[0].timestamp - relTime);

      for (let i = 1; i < chartData.length; i++) {
        const diff = Math.abs(chartData[i].timestamp - relTime);
        if (diff < minDiff) {
          minDiff = diff;
          closest = chartData[i];
        }
      }

      const impact = calculateReleaseImpact(data, rel);

      return {
        timestamp: closest.timestamp,
        stars: closest.stars,
        tag: rel.tagName,
        name: rel.name,
        publishedAt: rel.publishedAt,
        impact,
      };
    });
  }, [releases, chartData, data]);

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-border bg-secondary/10">
        <p className="text-sm text-muted-foreground">No star history data available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-medium">Stargazer Trajectory</h3>
          <p className="text-xs text-muted-foreground">
            Cumulative stars over time with major release events
          </p>
        </div>
        {releaseDots.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span>Release event</span>
          </div>
        )}
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" opacity={0.5} />
            <XAxis
              dataKey="timestamp"
              type="number"
              scale="time"
              domain={["dataMin", "dataMax"]}
              stroke="#737373"
              fontSize={11}
              tickLine={false}
              tickFormatter={(ts: number) => {
                try {
                  return format(new Date(ts), "MMM yy");
                } catch {
                  return String(ts);
                }
              }}
            />
            <YAxis
              stroke="#737373"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) =>
                v >= 1000 ? `${(v / 1000).toFixed(1).replace(/\.0$/, "")}k` : String(v)
              }
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                const currentTimestamp = Number(label);
                const stars = payload[0]?.value;

                const nearbyRelease = releaseDots.find(
                  (dot) => Math.abs(dot.timestamp - currentTimestamp) <= 86_400_000 * 3
                );

                let formattedDate = "";
                try {
                  formattedDate = format(new Date(currentTimestamp), "MMMM d, yyyy");
                } catch {
                  formattedDate = String(label);
                }

                return (
                  <div className="rounded-lg border border-border bg-neutral-900/95 p-3 shadow-xl backdrop-blur-sm text-xs space-y-2 max-w-xs">
                    <div className="font-semibold text-neutral-200">{formattedDate}</div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-neutral-400">Total Stars:</span>
                      <span className="font-mono font-bold text-amber-400">
                        {Number(stars).toLocaleString()}
                      </span>
                    </div>

                    {nearbyRelease && (
                      <div className="mt-2 border-t border-border/80 pt-2 space-y-1">
                        <div className="flex items-center gap-1.5 font-medium text-amber-300">
                          <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
                          <span className="font-mono">{nearbyRelease.tag}</span>
                          {nearbyRelease.name && nearbyRelease.name !== nearbyRelease.tag && (
                            <span className="text-neutral-400 truncate text-[11px]">
                              ({nearbyRelease.name})
                            </span>
                          )}
                        </div>
                        {nearbyRelease.impact ? (
                          <div className="space-y-0.5 text-neutral-300">
                            <div className="text-[11px] text-emerald-400 font-medium">
                              +{nearbyRelease.impact.afterStars.toLocaleString()} stars over
                              following 14 days
                            </div>
                            <div className="text-[10px] text-neutral-400 italic">
                              {nearbyRelease.impact.associationLabel}
                            </div>
                          </div>
                        ) : (
                          <div className="text-[10px] text-neutral-400 italic">
                            Release milestone recorded around this date.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              }}
            />
            <Line
              type="monotone"
              dataKey="stars"
              stroke="#eab308"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: "#eab308" }}
            />
            {releaseDots.map((dot) => (
              <ReferenceDot
                key={dot.tag}
                x={dot.timestamp}
                y={dot.stars}
                r={4}
                fill="#fbbf24"
                stroke="#171717"
                strokeWidth={1.5}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {releaseDots.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/40">
          <span className="text-xs text-muted-foreground mr-1">Milestones:</span>
          {releaseDots.slice(0, 4).map((dot) => (
            <div
              key={dot.tag}
              className="flex items-center gap-1.5 rounded-full border border-border bg-secondary/30 px-2.5 py-1 text-xs"
            >
              <span className="inline-block h-2 w-2 rounded-full bg-amber-400 shrink-0" />
              <span className="font-mono font-medium">{dot.tag}</span>
              {dot.impact ? (
                <span className="text-muted-foreground text-[11px]">
                  +{dot.impact.afterStars.toLocaleString()} stars (14d)
                </span>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
