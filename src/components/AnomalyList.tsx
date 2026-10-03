// SPDX-License-Identifier: MIT
import type { GrowthAnomaly } from "@/lib/anomalies";

const labels: Record<GrowthAnomaly["type"], string> = {
  traffic_spike: "Views spike",
  traffic_drop: "Views drop",
  clone_spike: "Clones spike",
  clone_drop: "Clones drop",
  star_acceleration: "Stars accelerating",
  star_deceleration: "Stars slowing",
  new_top_referrer: "New leading referrer",
  referrer_share_change: "Referrer share changed",
  popular_path_surge: "Popular page surge",
  period_change: "Weekly views changed",
};

export default function AnomalyList({
  anomalies,
  privateTrafficAvailable,
}: {
  anomalies: GrowthAnomaly[];
  privateTrafficAvailable: boolean;
}) {
  return (
    <section aria-labelledby="growth-signals-title" className="border-t border-border pt-8">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Measured changes
          </p>
          <h2 id="growth-signals-title" className="text-xl font-semibold tracking-tight">
            Growth signals
          </h2>
        </div>
        <p className="max-w-md text-xs text-muted-foreground">
          Compared with complete observation windows. Nearby releases show timing only, not cause.
        </p>
      </div>
      {anomalies.length ? (
        <ul className="divide-y divide-border border-y border-border">
          {anomalies.map((anomaly, index) => (
            <li
              key={`${anomaly.type}-${anomaly.startedAt}-${index}`}
              className="grid gap-2 py-4 sm:grid-cols-[minmax(10rem,0.6fr)_minmax(0,1.4fr)] sm:gap-6"
            >
              <div>
                <p className="font-medium">{labels[anomaly.type]}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {anomaly.startedAt} · {anomaly.severity}
                </p>
              </div>
              <div>
                <p className="text-sm text-foreground/90">{anomaly.explanation}</p>
                <p className="mt-2 text-xs tabular-nums text-muted-foreground">
                  {anomaly.observedValue.toLocaleString("en-US")} vs{" "}
                  {anomaly.baselineValue.toLocaleString("en-US")} baseline
                  {anomaly.percentageChange === null
                    ? ""
                    : ` · ${anomaly.percentageChange > 0 ? "+" : ""}${anomaly.percentageChange}%`}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="border-y border-border py-6 text-sm text-muted-foreground">
          <p>No change crossed the signal thresholds in the available observation window.</p>
          <p className="mt-1">
            {privateTrafficAvailable
              ? "Signals will appear when a complete day or week crosses a measured threshold."
              : "Connect a repository to include private views and clones; public star signals remain available."}
          </p>
        </div>
      )}
    </section>
  );
}
