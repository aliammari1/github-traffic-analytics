// SPDX-License-Identifier: MIT
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface Preference {
  enabled: boolean;
  cadence: "weekly" | "monthly";
  destination: "issue" | "discussion";
  categoryId: string | null;
  timeZone: string | null;
}

export default function GitHubReportSettings({
  owner,
  repo,
}: Readonly<{ owner: string; repo: string }>) {
  const query = `owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`;
  const endpoint = `/api/report/github/preferences?${query}`;
  const [preference, setPreference] = useState<Preference | null>(null);
  const [cadence, setCadence] = useState<Preference["cadence"]>("weekly");
  const [destination, setDestination] = useState<Preference["destination"]>("issue");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [timeZone, setTimeZone] = useState("UTC");
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState("");
  const [previewing, setPreviewing] = useState(false);

  useEffect(() => {
    let active = true;
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (detected) setTimeZone(detected);
    fetch(endpoint)
      .then(async (response) => {
        const value = await response.json();
        if (!response.ok) throw new Error(value.error || "Could not load GitHub report settings.");
        if (!active) return;
        const saved = value as Preference;
        setPreference(saved);
        setCadence(saved.cadence);
        setDestination(saved.destination);
        setCategoryId(saved.categoryId ?? "");
        if (saved.timeZone) setTimeZone(saved.timeZone);
      })
      .catch((cause) => {
        if (active) setError(cause instanceof Error ? cause.message : "Could not load settings.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [endpoint]);

  useEffect(() => {
    if (destination !== "discussion") return;
    let active = true;
    setCategoriesLoading(true);
    fetch(`/api/report/github/categories?${query}`)
      .then(async (response) => {
        const value = await response.json();
        if (!response.ok) throw new Error(value.error || "Could not load Discussion categories.");
        if (active) setCategories(value.categories);
      })
      .catch((cause) => {
        if (active) setError(cause instanceof Error ? cause.message : "Could not load categories.");
      })
      .finally(() => {
        if (active) setCategoriesLoading(false);
      });
    return () => {
      active = false;
    };
  }, [destination, query]);

  async function update(method: "PUT" | "DELETE") {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch(endpoint, {
        method,
        ...(method === "PUT"
          ? {
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ cadence, destination, categoryId, timeZone }),
            }
          : {}),
      });
      const value = await response.json();
      if (!response.ok) throw new Error(value.error || "Could not update GitHub reports.");
      setPreference(value as Preference);
      setMessage(method === "PUT" ? "GitHub reports enabled." : "GitHub reports disabled.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update GitHub reports.");
    } finally {
      setSaving(false);
    }
  }

  async function loadPreview() {
    setPreviewing(true);
    setError("");
    try {
      const response = await fetch(`/api/report/github/preview?${query}&cadence=${cadence}`);
      const value = await response.json();
      if (!response.ok) throw new Error(value.error || "Could not preview this report.");
      setPreview(value.markdown);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not preview this report.");
    } finally {
      setPreviewing(false);
    }
  }

  return (
    <section aria-labelledby="github-report-title" className="border-t border-border pt-7">
      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Repository delivery
      </p>
      <h2 id="github-report-title" className="text-xl font-semibold tracking-tight">
        GitHub reports
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Post a report to an Issue or Discussion each Monday or on the first day of the month at 9
        a.m. in your timezone. Monthly reports compare rolling 30-day windows. GitHub reports start
        daily traffic archiving for this repository.
      </p>
      <p className="mt-2 max-w-2xl text-sm font-medium text-foreground">
        Reports include private traffic counts. In a public repository, the Issue or Discussion and
        those counts are visible to everyone.
      </p>
      {loading ? (
        <p className="mt-5 text-sm text-muted-foreground">Loading report settings…</p>
      ) : (
        <div className="mt-5 flex flex-wrap items-end gap-3">
          <label
            className="flex min-w-36 flex-col gap-2 text-sm font-medium"
            htmlFor="github-report-cadence"
          >
            Frequency
            <select
              id="github-report-cadence"
              value={cadence}
              onChange={(event) => {
                setCadence(event.target.value as Preference["cadence"]);
                setPreview("");
              }}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </label>
          <label
            className="flex min-w-36 flex-col gap-2 text-sm font-medium"
            htmlFor="github-report-destination"
          >
            Post to
            <select
              id="github-report-destination"
              value={destination}
              onChange={(event) => setDestination(event.target.value as Preference["destination"])}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="issue">Issue</option>
              <option value="discussion">Discussion</option>
            </select>
          </label>
          {destination === "discussion" && (
            <label
              className="flex min-w-40 flex-col gap-2 text-sm font-medium"
              htmlFor="github-report-category"
            >
              <span>Discussion category</span>
              <select
                id="github-report-category"
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                disabled={categoriesLoading || categories.length === 0}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Choose category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label
            className="flex min-w-48 flex-col gap-2 text-sm font-medium"
            htmlFor="github-report-timezone"
          >
            <span>IANA timezone</span>
            <input
              id="github-report-timezone"
              value={timeZone}
              onChange={(event) => setTimeZone(event.target.value)}
              spellCheck={false}
              autoComplete="off"
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            />
          </label>
          <Button
            type="button"
            disabled={saving || (destination === "discussion" && !categoryId)}
            onClick={() => update("PUT")}
          >
            {saving
              ? "Saving…"
              : preference?.enabled
                ? "Update GitHub reports"
                : "Enable GitHub reports"}
          </Button>
          <Button type="button" variant="outline" disabled={previewing} onClick={loadPreview}>
            {previewing ? "Building preview…" : "Preview post"}
          </Button>
          {preference?.enabled && (
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => update("DELETE")}
            >
              Turn off
            </Button>
          )}
        </div>
      )}
      {error && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      )}
      {message && <output className="mt-3 block text-sm text-muted-foreground">{message}</output>}
      {preview && (
        <div className="mt-5 max-w-3xl">
          <p className="mb-2 text-xs text-muted-foreground">
            Preview from currently captured days. The scheduled post will use newer data.
          </p>
          <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-border bg-muted/40 p-4 text-xs leading-relaxed">
            {preview}
          </pre>
        </div>
      )}
    </section>
  );
}
