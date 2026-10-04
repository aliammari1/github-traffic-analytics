// SPDX-License-Identifier: MIT
import type { WebhookPlatform } from "./webhook-secrets";

export const ALERT_EVENTS = [
  "star_milestone",
  "growth_acceleration",
  "growth_drop",
  "referrer_spike",
  "release_impact",
] as const;

export type AlertEvent = (typeof ALERT_EVENTS)[number];

export interface GrowthAlert {
  event: AlertEvent;
  key: string;
  fullName: string;
  title: string;
  detail: string;
  url: string;
}

export function isAlertEvent(value: unknown): value is AlertEvent {
  return typeof value === "string" && ALERT_EVENTS.includes(value as AlertEvent);
}

export function formatWebhookAlert(alert: GrowthAlert): string {
  return `${alert.title}\n${alert.fullName}: ${alert.detail}\n${alert.url}`;
}

export class WebhookDeliveryError extends Error {
  constructor(
    readonly status: number,
    readonly retryable: boolean
  ) {
    super(`Webhook returned ${status}`);
    this.name = "WebhookDeliveryError";
  }
}

/** Incoming webhook POSTs need no Slack or Discord SDK. */
export async function deliverWebhookAlert(
  url: string,
  platform: WebhookPlatform,
  alert: GrowthAlert,
  fetcher: typeof fetch = fetch
): Promise<void> {
  const message = formatWebhookAlert(alert);
  const safeSlackText = message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const response = await fetcher(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(
      platform === "discord"
        ? { content: message.slice(0, 2_000), allowed_mentions: { parse: [] } }
        : { text: safeSlackText }
    ),
    redirect: "error",
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) throw new WebhookDeliveryError(response.status, response.status === 429);
}
