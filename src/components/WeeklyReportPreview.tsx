// SPDX-License-Identifier: MIT
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { WeeklyRepositoryReport } from "@/lib/weekly-report";

export default function WeeklyReportPreview({ owner, repo }: { owner: string; repo: string }) {
  const [report, setReport] = useState<WeeklyRepositoryReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function loadReport() {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(
        `/api/report/weekly?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`
      );
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Report unavailable. Try again shortly.");
      setReport(body as WeeklyRepositoryReport);
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Report unavailable. Try again shortly.");
    } finally {
      setLoading(false);
    }
  }

  const metrics = report
    ? [
        { label: "Stars gained", value: report.stars.count },
        { label: "Views", value: report.views.count },
        { label: "Clones", value: report.clones.count },
      ]
    : [];

  return (
    <section aria-labelledby="weekly-report-title" className="border-t border-border pt-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Seven complete UTC days
          </p>
          <h2 id="weekly-report-title" className="text-xl font-semibold tracking-tight">
            Weekly report preview
          </h2>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            A measured summary of stored traffic and available public growth. Missing observations
            stay unavailable.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={loadReport} disabled={loading}>
          {loading
            ? "Preparing report…"
            : report
              ? "Refresh weekly report"
              : "Preview weekly report"}
        </Button>
      </div>
      {message && (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {message}
        </p>
      )}
      {report && (
        <div className="mt-6">
          <p className="mb-4 text-sm text-muted-foreground">
            {report.period.from} to {report.period.to}
          </p>
          <dl className="grid grid-cols-1 gap-5 border-y border-border py-5 sm:grid-cols-3">
            {metrics.map((metric) => (
              <div key={metric.label}>
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                  {metric.label}
                </dt>
                <dd className="mt-2 text-2xl font-semibold tabular-nums">
                  {metric.value === null ? (
                    <span className="text-base font-normal text-muted-foreground">Unavailable</span>
                  ) : (
                    metric.value.toLocaleString("en-US")
                  )}
                </dd>
              </div>
            ))}
          </dl>
          <ul className="mt-5 space-y-2 text-sm text-foreground/90">
            {report.highlights.map((highlight) => (
              <li key={highlight} className="pl-4 border-l border-border">
                {highlight}
              </li>
            ))}
          </ul>
          {report.strongestAnomaly && (
            <p className="mt-5 text-sm text-muted-foreground">
              Strongest signal: {report.strongestAnomaly.explanation}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
