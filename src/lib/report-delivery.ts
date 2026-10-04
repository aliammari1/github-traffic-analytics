// SPDX-License-Identifier: MIT
import type { WeeklyRepositoryReport } from "./weekly-report";

export interface ReportDeliveryProvider<Destination> {
  deliver(
    report: WeeklyRepositoryReport,
    destination: Destination,
    deliveryKey: string
  ): Promise<string>;
}

export interface EmailDestination {
  email: string;
  siteUrl: string;
}

const metric = (value: number | null) =>
  value === null ? "Unavailable" : value.toLocaleString("en-US");

export function formatWeeklyEmail(report: WeeklyRepositoryReport, siteUrl: string): string {
  const repositoryUrl = `${siteUrl.replace(/\/$/, "")}/repo/${encodeURIComponent(report.fullName.split("/")[0])}/${encodeURIComponent(report.fullName.split("/")[1])}`;
  return [
    `GitHub Traffic Analytics — ${report.fullName}`,
    `${report.period.from} to ${report.period.to} (complete UTC days)`,
    "",
    `Stars gained: ${report.stars.count === null ? "Unavailable" : `+${metric(report.stars.count)}`}`,
    `Views: ${metric(report.views.count)}`,
    `Clones: ${metric(report.clones.count)}`,
    "",
    ...report.highlights,
    ...(report.strongestAnomaly
      ? ["", `Strongest signal: ${report.strongestAnomaly.explanation}`]
      : []),
    "",
    `View your report and manage weekly email: ${repositoryUrl}`,
    "Growth around a release is a timing association, not proof of cause.",
  ].join("\n");
}

async function hashedKey(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

/** Thin REST adapter: no email SDK in the Worker bundle. */
export class EmailReportProvider implements ReportDeliveryProvider<EmailDestination> {
  constructor(
    private readonly apiKey: string,
    private readonly from: string,
    private readonly fetcher: typeof fetch = fetch
  ) {}

  async deliver(
    report: WeeklyRepositoryReport,
    destination: EmailDestination,
    deliveryKey: string
  ): Promise<string> {
    const response = await this.fetcher("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": await hashedKey(deliveryKey),
      },
      body: JSON.stringify({
        from: this.from,
        to: [destination.email],
        subject: `${report.fullName} weekly growth report · ${report.period.to}`,
        text: formatWeeklyEmail(report, destination.siteUrl),
      }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) throw new Error(`Email provider returned ${response.status}`);
    const result = (await response.json()) as { id?: string };
    if (!result.id) throw new Error("Email provider omitted its delivery ID");
    return result.id;
  }
}
