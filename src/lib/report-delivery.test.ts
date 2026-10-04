// SPDX-License-Identifier: MIT
import { describe, expect, it, vi } from "vitest";
import { EmailReportProvider, formatWeeklyEmail } from "./report-delivery";
import type { WeeklyRepositoryReport } from "./weekly-report";

const report = {
  fullName: "alice/project",
  period: { from: "2026-09-28", to: "2026-10-04" },
  stars: { count: 12, previous: 9, changePercent: 33.3 },
  views: { count: null, previous: 50, changePercent: null },
  clones: { count: 7, previous: 3, changePercent: 133.3 },
  highlights: ["Views unavailable for a complete comparison."],
  strongestAnomaly: { explanation: "Clones increased near v2.0.0." },
} as WeeklyRepositoryReport;

describe("weekly email delivery", () => {
  it("keeps missing data explicit and links back to settings", () => {
    const text = formatWeeklyEmail(report, "https://example.com");
    expect(text).toContain("Views: Unavailable");
    expect(text).toContain("Stars gained: +12");
    expect(text).toContain("https://example.com/repo/alice/project");
    expect(text).not.toContain("Views: 0");
  });

  it("sends with a stable idempotency key and surfaces provider failure", async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: "em_1" }) });
    const provider = new EmailReportProvider("key", "report@example.com", fetcher);
    const destination = { email: "alice@example.com", siteUrl: "https://example.com" };
    const first = await provider.deliver(report, destination, "digest:alice:2026-10-04");
    const second = await provider.deliver(report, destination, "digest:alice:2026-10-04");
    expect(first).toBe("em_1");
    expect(second).toBe("em_1");
    expect(fetcher.mock.calls[0][1].headers["Idempotency-Key"]).toBe(
      fetcher.mock.calls[1][1].headers["Idempotency-Key"]
    );
    expect(fetcher.mock.calls[0][1].headers.Authorization).toBe("Bearer key");
    fetcher.mockResolvedValueOnce({ ok: false, status: 429 });
    await expect(provider.deliver(report, destination, "another")).rejects.toThrow("429");
  });
});
