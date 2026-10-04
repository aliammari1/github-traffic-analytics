// SPDX-License-Identifier: MIT

const DAY_MS = 86_400_000;

export function isValidTimeZone(zone: string): boolean {
  if (!zone || zone.length > 80) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: zone });
    return true;
  } catch {
    return false;
  }
}

/** An hourly UTC cron first attempts at local 09:00; 10–11 allow retries. */
export function digestWindow(now: Date, timeZone: string) {
  if (!isValidTimeZone(timeZone) || !Number.isFinite(now.getTime()))
    throw new Error("Invalid digest schedule");
  const local = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "long",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const localWeekday = local.find((part) => part.type === "weekday")?.value ?? "";
  const hour = Number(local.find((part) => part.type === "hour")?.value);
  // Anchor every retry to the first local 09:00 tick. In eastern timezones a
  // UTC date boundary can fall between the 09:00 and 11:00 attempts.
  let anchor = now;
  if (localWeekday === "Monday" && hour >= 9 && hour <= 11) {
    for (let offset = 1; offset <= 2; offset++) {
      const candidate = new Date(now.getTime() - offset * 3_600_000);
      const candidateParts = new Intl.DateTimeFormat("en-US", {
        timeZone,
        hour: "2-digit",
        hourCycle: "h23",
      }).formatToParts(candidate);
      if (Number(candidateParts.find((part) => part.type === "hour")?.value) === 9)
        anchor = candidate;
    }
  }
  const utcToday = Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth(), anchor.getUTCDate());
  const endingOn = new Date(utcToday - DAY_MS).toISOString().slice(0, 10);
  return { endingOn, localWeekday, isDue: localWeekday === "Monday" && hour >= 9 && hour <= 11 };
}
