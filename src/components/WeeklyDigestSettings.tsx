// SPDX-License-Identifier: MIT
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface Preference {
  available: boolean;
  enabled: boolean;
  recipientEmail: string | null;
  timeZone: string | null;
}

export default function WeeklyDigestSettings({ owner, repo }: { owner: string; repo: string }) {
  const [preference, setPreference] = useState<Preference | null>(null);
  const [timeZone, setTimeZone] = useState("UTC");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const endpoint = `/api/digest/preferences?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`;

  useEffect(() => {
    let active = true;
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (detected) setTimeZone(detected);
    fetch(endpoint)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not load weekly email settings.");
        if (active) {
          setPreference(data as Preference);
          if (data.timeZone) setTimeZone(data.timeZone);
        }
      })
      .catch((cause) => {
        if (active)
          setMessage(
            cause instanceof Error ? cause.message : "Could not load weekly email settings."
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [endpoint]);

  async function update(method: "PUT" | "DELETE") {
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch(endpoint, {
        method,
        ...(method === "PUT"
          ? { headers: { "content-type": "application/json" }, body: JSON.stringify({ timeZone }) }
          : {}),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not update weekly email.");
      setPreference(data as Preference);
      setMessage(method === "PUT" ? "Weekly email enabled." : "Weekly email disabled.");
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Could not update weekly email.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section aria-labelledby="weekly-email-title" className="border-t border-border pt-7">
      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Optional delivery
      </p>
      <h2 id="weekly-email-title" className="text-xl font-semibold tracking-tight">
        Weekly email
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Get the report in your verified primary GitHub inbox on Monday morning in your timezone.
        Enabling email also starts daily traffic archiving for this repository. You can turn it off
        here at any time.
      </p>
      {preference && !preference.available && (
        <p className="mt-4 text-sm text-muted-foreground">
          Weekly email is awaiting delivery setup on this deployment. Your report preview is still
          available above.
        </p>
      )}
      {loading ? (
        <p className="mt-5 text-sm text-muted-foreground">Loading email settings…</p>
      ) : (
        <div className="mt-5 flex flex-wrap items-end gap-3">
          <label
            className="flex min-w-56 flex-col gap-2 text-sm font-medium"
            htmlFor="digest-timezone"
          >
            Your timezone
            <input
              id="digest-timezone"
              type="text"
              value={timeZone}
              onChange={(event) => setTimeZone(event.target.value)}
              spellCheck={false}
              autoComplete="off"
              aria-describedby="digest-timezone-help"
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            />
          </label>
          <Button
            type="button"
            disabled={saving || !preference?.available}
            onClick={() => update("PUT")}
          >
            {saving
              ? "Saving…"
              : preference?.enabled
                ? "Update weekly email"
                : "Enable weekly email"}
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
      <p id="digest-timezone-help" className="mt-2 text-xs text-muted-foreground">
        Use an IANA timezone such as Africa/Tunis or America/New_York. Reports use completed UTC
        days, so the ending date can vary by timezone.
      </p>
      {preference?.enabled && preference.recipientEmail && (
        <p className="mt-3 text-sm text-muted-foreground">
          Sending to{" "}
          <span className="font-medium text-foreground">{preference.recipientEmail}</span>
        </p>
      )}
      {message && (
        <p role="status" className="mt-3 text-sm text-muted-foreground">
          {message}
        </p>
      )}
    </section>
  );
}
