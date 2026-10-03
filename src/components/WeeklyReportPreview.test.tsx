// SPDX-License-Identifier: MIT
import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WeeklyReportPreview from "./WeeklyReportPreview";

describe("WeeklyReportPreview", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("renders measured report values after the owner requests a preview", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        period: { from: "2026-09-21", to: "2026-09-27" },
        stars: { count: 18 },
        views: { count: 70 },
        clones: { count: null },
        highlights: ["Star growth: +18 this week."],
        strongestAnomaly: null,
      }),
    });
    vi.stubGlobal("fetch", fetcher);
    render(<WeeklyReportPreview owner="alice" repo="project" />);
    await userEvent.click(screen.getByRole("button", { name: /Preview weekly report/i }));
    expect(await screen.findByText("70")).toBeInTheDocument();
    expect(screen.getByText("Unavailable")).toBeInTheDocument();
    expect(screen.getByText("Star growth: +18 this week.")).toBeInTheDocument();
    expect(fetcher).toHaveBeenCalledWith("/api/report/weekly?owner=alice&repo=project");
  });

  it("shows the route's recovery message on a failed preview", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: "D1 unavailable. Try again later." }),
      })
    );
    render(<WeeklyReportPreview owner="alice" repo="project" />);
    await userEvent.click(screen.getByRole("button", { name: /Preview weekly report/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent("D1 unavailable. Try again later.");
  });
});
