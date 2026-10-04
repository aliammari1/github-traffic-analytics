// SPDX-License-Identifier: MIT
import { describe, expect, it } from "vitest";
import { digestWindow, isValidTimeZone } from "./digest-schedule";

describe("digest scheduling", () => {
  it("selects the prior complete Monday–Sunday UTC report at local Monday morning", () => {
    expect(digestWindow(new Date("2026-10-05T09:00:00Z"), "UTC")).toEqual({
      endingOn: "2026-10-04",
      localWeekday: "Monday",
      isDue: true,
    });
  });

  it("respects positive, negative, and half-hour offsets", () => {
    expect(digestWindow(new Date("2026-10-05T03:30:00Z"), "Asia/Kolkata").isDue).toBe(true);
    expect(digestWindow(new Date("2026-10-05T16:00:00Z"), "America/Los_Angeles").isDue).toBe(true);
    expect(digestWindow(new Date("2026-10-05T09:00:00Z"), "America/Los_Angeles").isDue).toBe(false);
  });

  it("uses only complete UTC days when local Monday precedes UTC midnight", () => {
    expect(digestWindow(new Date("2026-10-04T20:00:00Z"), "Pacific/Auckland")).toMatchObject({
      endingOn: "2026-10-03",
      isDue: true,
    });
    expect(digestWindow(new Date("2026-10-06T00:00:00Z"), "Pacific/Honolulu").isDue).toBe(false);
  });

  it("keeps the same reporting period across retry hours at the UTC date boundary", () => {
    expect(digestWindow(new Date("2026-10-04T23:00:00Z"), "Australia/Brisbane").endingOn).toBe(
      "2026-10-03"
    );
    expect(digestWindow(new Date("2026-10-05T00:00:00Z"), "Australia/Brisbane").endingOn).toBe(
      "2026-10-03"
    );
  });

  it("rejects invalid zones", () => {
    expect(isValidTimeZone("Africa/Tunis")).toBe(true);
    expect(isValidTimeZone("Mars/Olympus")).toBe(false);
    expect(isValidTimeZone("")).toBe(false);
  });
});
