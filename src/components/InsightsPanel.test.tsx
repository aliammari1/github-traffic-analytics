// SPDX-License-Identifier: MIT
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import InsightsPanel from "./InsightsPanel";
import { server, http, HttpResponse } from "@/test/msw";
import type { AggregatedTrafficPayload } from "@/lib/insights";

const payload: AggregatedTrafficPayload = {
  repoCount: 2,
  totalViews: 500,
  totalUniques: 100,
  totalClones: 20,
  totalCloneUniques: 10,
  totalStars: 5,
  topReferrers: [{ referrer: "github.com", count: 300, uniques: 80 }],
  topPaths: [{ path: "/o/r", count: 400, uniques: 90 }],
  daily: [{ date: "Jun 1", views: 100, uniques: 30 }],
};

describe("InsightsPanel", () => {
  it("renders the streamed AI summary after clicking the button", async () => {
    server.use(
      http.post("/api/insights", () => {
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          start(controller) {
            for (const chunk of ["Traffic ", "is trending ", "up."]) {
              controller.enqueue(encoder.encode(chunk));
            }
            controller.close();
          },
        });
        return new HttpResponse(stream, {
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      })
    );
    const user = userEvent.setup();

    render(<InsightsPanel payload={payload} />);
    await user.click(screen.getByRole("button", { name: /Summarize my traffic/i }));

    expect(await screen.findByText("Traffic is trending up.")).toBeInTheDocument();
  });

  it("shows the not-configured message when the endpoint returns 503", async () => {
    server.use(
      http.post("/api/insights", () =>
        HttpResponse.json(
          {
            error: "AI insights are not configured. Set ANTHROPIC_API_KEY to enable this feature.",
          },
          { status: 503 }
        )
      )
    );
    const user = userEvent.setup();

    render(<InsightsPanel payload={payload} />);
    await user.click(screen.getByRole("button", { name: /Summarize my traffic/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/not configured/);
  });
});
