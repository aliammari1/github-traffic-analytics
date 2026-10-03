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
import { StarPoint } from "@/lib/analytics";
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

  // Match releases to the closest chart sample by minimum absolute time distance
  const releaseDots = useMemo(() => {
    if (!releases.length || !chartData.length) return [];
    const dots: Array<{ timestamp: number; stars: number; tag: string }> = [];

    releases.forEach((rel) => {
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

      dots.push({
        timestamp: closest.timestamp,
        stars: closest.stars,
        tag: rel.tagName,
      });
    });

    return dots;
  }, [releases, chartData]);

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
              contentStyle={{
                backgroundColor: "#171717",
                borderColor: "#404040",
                borderRadius: "0.5rem",
                color: "#f5f5f5",
                fontSize: "12px",
              }}
              formatter={(value) => [Number(value).toLocaleString(), "Stars"]}
              labelFormatter={(label) => {
                try {
                  return format(new Date(Number(label)), "MMMM d, yyyy");
                } catch {
                  return String(label);
                }
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
    </div>
  );
}
