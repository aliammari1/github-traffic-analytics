// SPDX-License-Identifier: MIT
import { releaseWindow, type StarPoint } from "./analytics";
import type { ComparisonWindow } from "./anomalies";
import type { GrowthAlert } from "./webhook-alerts";

const MILESTONES = [100, 500, 1_000, 5_000, 10_000, 50_000, 100_000];
const DAY_MS = 86_400_000;

export interface AlertInputs {
  fullName: string;
  day: string;
  stars: Array<{ day: string; count: number }>;
  referrers?: ComparisonWindow | null;
  releases?: Array<{ tagName: string; publishedAt: string }>;
  starHistory?: StarPoint[];
  siteUrl: string;
}

/** Only complete comparisons can generate an event. Missing observations are never zero. */
export function detectAlerts(input: AlertInputs): GrowthAlert[] {
  const [owner, repo] = input.fullName.split("/");
  const url = `${input.siteUrl.replace(/\/$/, "")}/repo/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
  const at = new Map(input.stars.map((point) => [point.day, point.count]));
  const today = at.get(input.day);
  const end = Date.parse(`${input.day}T00:00:00Z`);
  if (!Number.isFinite(end)) return [];
  const weekday = new Date(end).getUTCDay();
  const weekKey = new Date(end - ((weekday + 6) % 7) * DAY_MS).toISOString().slice(0, 10);
  const previousDay = new Date(end - DAY_MS).toISOString().slice(0, 10);
  const prior = at.get(previousDay);
  const events: GrowthAlert[] = [];
  if (today !== undefined && prior !== undefined) {
    for (const milestone of MILESTONES) {
      if (prior >= milestone || today < milestone) continue;
      events.push({
        event: "star_milestone",
        key: `milestone:${milestone}`,
        fullName: input.fullName,
        title: `Star milestone: ${milestone.toLocaleString("en-US")}`,
        detail: `Crossed ${milestone.toLocaleString("en-US")} stars (${prior.toLocaleString("en-US")} → ${today.toLocaleString("en-US")}) in the latest daily observations.`,
        url,
      });
    }
  }
  const seven = at.get(new Date(end - 7 * DAY_MS).toISOString().slice(0, 10));
  const fourteen = at.get(new Date(end - 14 * DAY_MS).toISOString().slice(0, 10));
  if (today !== undefined && seven !== undefined && fourteen !== undefined) {
    const current = Math.max(0, today - seven);
    const previous = Math.max(0, seven - fourteen);
    if (previous >= 5 && current >= 2 * previous && current - previous >= 10)
      events.push({
        event: "growth_acceleration",
        key: `acceleration:${weekKey}`,
        fullName: input.fullName,
        title: "Star growth accelerated",
        detail: `+${current} stars in seven days versus +${previous} in the preceding seven days.`,
        url,
      });
    if (previous >= 20 && current <= previous / 2 && previous - current >= 10)
      events.push({
        event: "growth_drop",
        key: `drop:${weekKey}`,
        fullName: input.fullName,
        title: "Star growth slowed",
        detail: `+${current} stars in seven days versus +${previous} in the preceding seven days.`,
        url,
      });
  }
  if (input.referrers) {
    const before = new Map(input.referrers.previous.map((item) => [item.name, item.count]));
    for (const item of input.referrers.current) {
      const count = before.get(item.name);
      if (count === undefined || count < 10 || item.count < 50) continue;
      if (item.count < count * 2 || item.count - count < 25) continue;
      events.push({
        event: "referrer_spike",
        key: `referrer:${item.name}:${weekKey}`,
        fullName: input.fullName,
        title: "Captured referrer count rose",
        detail: `${item.name} appears with ${item.count} views versus ${count} in an earlier captured top-referrer list. Both lists cover overlapping rolling 14-day windows; this is not a weekly referral count or proof of cause.`,
        url,
      });
    }
  }
  if (input.starHistory?.length && input.releases?.length) {
    for (const release of input.releases) {
      const age = Math.floor((end - Date.parse(release.publishedAt)) / DAY_MS);
      if (age < 14 || age > 17) continue;
      const impact = releaseWindow(input.starHistory, release.publishedAt, new Date(end + DAY_MS));
      if (!impact) continue;
      events.push({
        event: "release_impact",
        key: `release:${release.tagName}`,
        fullName: input.fullName,
        title: `Release report ready: ${release.tagName}`,
        detail: `The 14-day post-release window gained ${impact.after} stars versus ${impact.before} in the 14 days before. This is a timing association, not proof of cause.`,
        url,
      });
    }
  }
  return events;
}
