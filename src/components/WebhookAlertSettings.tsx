// SPDX-License-Identifier: MIT
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ALERT_EVENTS, type AlertEvent } from "@/lib/webhook-alerts";
import type { WebhookPlatform } from "@/lib/webhook-secrets";

const labels: Record<AlertEvent, string> = {
  star_milestone: "Star milestones",
  growth_acceleration: "Growth acceleration",
  growth_drop: "Growth slowdown",
  referrer_spike: "Referrer spike",
  release_impact: "Release impact ready",
};

interface SavedWebhook {
  platform: WebhookPlatform;
  configured: boolean;
  events: AlertEvent[];
}

const defaultEvents: AlertEvent[] = ["star_milestone", "growth_acceleration"];

export default function WebhookAlertSettings({
  owner,
  repo,
}: Readonly<{ owner: string; repo: string }>) {
  const query = `owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`;
  const endpoint = `/api/alerts/webhooks?${query}`;
  const [available, setAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState<SavedWebhook[]>([]);
  const [events, setEvents] = useState<Record<WebhookPlatform, AlertEvent[]>>({
    slack: defaultEvents,
    discord: defaultEvents,
  });
  const [urls, setUrls] = useState<Record<WebhookPlatform, string>>({ slack: "", discord: "" });
  const [busy, setBusy] = useState<WebhookPlatform | null>(null);
  const [message, setMessage] = useState<Record<WebhookPlatform, string>>({
    slack: "",
    discord: "",
  });
  const [error, setError] = useState<Record<WebhookPlatform, string>>({ slack: "", discord: "" });

  useEffect(() => {
    let active = true;
    fetch(endpoint)
      .then(async (response) => {
        const value = await response.json();
        if (!response.ok) throw new Error(value.error || "Could not load alert settings.");
        if (!active) return;
        setAvailable(value.available);
        setSaved(value.webhooks);
        setEvents((current) => {
          const next = { ...current };
          for (const item of value.webhooks as SavedWebhook[]) next[item.platform] = item.events;
          return next;
        });
      })
      .catch((cause) => {
        if (active) {
          const text = cause instanceof Error ? cause.message : "Could not load alert settings.";
          setError({ slack: text, discord: text });
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [endpoint]);

  function toggle(platform: WebhookPlatform, event: AlertEvent) {
    setEvents((current) => ({
      ...current,
      [platform]: current[platform].includes(event)
        ? current[platform].filter((item) => item !== event)
        : [...current[platform], event],
    }));
  }

  async function update(platform: WebhookPlatform, action: "save" | "remove" | "test") {
    setBusy(platform);
    setMessage((current) => ({ ...current, [platform]: "" }));
    setError((current) => ({ ...current, [platform]: "" }));
    try {
      const response = await fetch(
        action === "test"
          ? `/api/alerts/webhooks/test?${query}&platform=${platform}`
          : action === "remove"
            ? `${endpoint}&platform=${platform}`
            : endpoint,
        {
          method: action === "save" ? "PUT" : action === "remove" ? "DELETE" : "POST",
          ...(action === "save"
            ? {
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                  platform,
                  ...(urls[platform] ? { url: urls[platform] } : {}),
                  events: events[platform],
                }),
              }
            : {}),
        }
      );
      const value = await response.json();
      if (!response.ok) throw new Error(value.error || "Could not update this webhook.");
      if (action === "save") {
        setSaved((current) => [
          ...current.filter((item) => item.platform !== platform),
          value as SavedWebhook,
        ]);
        setUrls((current) => ({ ...current, [platform]: "" }));
      } else if (action === "remove") {
        setSaved((current) => current.filter((item) => item.platform !== platform));
      }
      setMessage((current) => ({
        ...current,
        [platform]:
          action === "test"
            ? "Test notification sent."
            : action === "remove"
              ? "Webhook removed."
              : "Alert settings saved.",
      }));
    } catch (cause) {
      setError((current) => ({
        ...current,
        [platform]: cause instanceof Error ? cause.message : "Could not update this webhook.",
      }));
    } finally {
      setBusy(null);
    }
  }

  return (
    <section aria-labelledby="webhook-alerts-title" className="border-t border-border pt-7">
      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Growth signals
      </p>
      <h2 id="webhook-alerts-title" className="text-xl font-semibold tracking-tight">
        Slack and Discord alerts
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Choose which observed milestones and changes should reach your team. Alerts use daily
        captures, so new subscriptions need enough history before comparisons are available.
      </p>
      {!available && !loading && (
        <p className="mt-4 text-sm text-muted-foreground">
          Webhook alerts are awaiting encryption setup on this deployment.
        </p>
      )}
      {loading ? (
        <p className="mt-5 text-sm text-muted-foreground">Loading alert settings…</p>
      ) : (
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {(["slack", "discord"] as const).map((platform) => {
            const configured = saved.some((item) => item.platform === platform);
            return (
              <div key={platform} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold capitalize">{platform}</h3>
                  <span className="text-xs text-muted-foreground">
                    {configured ? "Connected" : "Not connected"}
                  </span>
                </div>
                <label
                  className="mt-4 flex flex-col gap-2 text-sm font-medium"
                  htmlFor={`${platform}-webhook-url`}
                >
                  Incoming webhook URL
                  <input
                    id={`${platform}-webhook-url`}
                    type="password"
                    value={urls[platform]}
                    onChange={(event) =>
                      setUrls((current) => ({ ...current, [platform]: event.target.value }))
                    }
                    placeholder={
                      configured ? "Leave blank to keep current URL" : "Paste webhook URL"
                    }
                    autoComplete="off"
                    spellCheck={false}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  />
                </label>
                <fieldset className="mt-5">
                  <legend className="text-sm font-medium">Send alerts for</legend>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {ALERT_EVENTS.map((event) => (
                      <label
                        key={event}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <input
                          type="checkbox"
                          checked={events[platform].includes(event)}
                          onChange={() => toggle(platform, event)}
                          className="mt-1"
                        />
                        {labels[event]}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    disabled={
                      !available ||
                      busy === platform ||
                      events[platform].length === 0 ||
                      (!configured && !urls[platform])
                    }
                    onClick={() => update(platform, "save")}
                  >
                    {busy === platform
                      ? "Working…"
                      : configured
                        ? "Save changes"
                        : "Connect webhook"}
                  </Button>
                  {configured && (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={busy === platform}
                        onClick={() => update(platform, "test")}
                      >
                        Send test
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={busy === platform}
                        onClick={() => update(platform, "remove")}
                      >
                        Remove
                      </Button>
                    </>
                  )}
                </div>
                {error[platform] && (
                  <p role="alert" className="mt-3 text-sm text-destructive">
                    {error[platform]}
                  </p>
                )}
                {message[platform] && (
                  <p role="status" className="mt-3 text-sm text-muted-foreground">
                    {message[platform]}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
