// SPDX-License-Identifier: MIT
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TrafficDashboard from "./TrafficDashboard";
import { server, http, HttpResponse, sampleTraffic, sampleRepos } from "@/test/msw";
import type { Repository } from "@/lib/github";

const repo = sampleRepos[0] as unknown as Repository;

// HistoricalTraffic fetches /api/snapshots on mount; default it to the 503
// (no-D1) path so the dashboard tests focus on the live-traffic view.
function withSnapshots503() {
  server.use(
    http.get("/api/snapshots", () =>
      HttpResponse.json(
        { error: "Historical snapshots require the Cloudflare D1 deployment." },
        { status: 503 }
      )
    )
  );
}

describe("TrafficDashboard", () => {
  it("renders aggregate stats and charts from /api/traffic", async () => {
    server.use(http.get("/api/traffic", () => HttpResponse.json(sampleTraffic)));
    withSnapshots503();

    render(<TrafficDashboard repository={repo} onBack={() => {}} />);

    // Total views formatted with locale separators.
    expect(await screen.findByText("1,200")).toBeInTheDocument();
    expect(screen.getByText("Views over time")).toBeInTheDocument();
    expect(screen.getByText("github.com")).toBeInTheDocument();
    expect(screen.getByText("/owner/repo")).toBeInTheDocument();
  });

  it("shows the historical-traffic surface", async () => {
    server.use(http.get("/api/traffic", () => HttpResponse.json(sampleTraffic)));
    withSnapshots503();

    render(<TrafficDashboard repository={repo} onBack={() => {}} />);

    expect(await screen.findByText("Historical traffic")).toBeInTheDocument();
  });

  it("calls onBack when the Back button is clicked", async () => {
    server.use(http.get("/api/traffic", () => HttpResponse.json(sampleTraffic)));
    withSnapshots503();
    const onBack = vi.fn();
    const user = userEvent.setup();

    render(<TrafficDashboard repository={repo} onBack={onBack} />);
    await screen.findByText("1,200");
    await user.click(screen.getAllByText("Back")[0]);

    expect(onBack).toHaveBeenCalled();
  });

  it("renders an error state and retries when traffic fails", async () => {
    server.use(
      http.get("/api/traffic", () =>
        HttpResponse.json({ error: "Access denied: ..." }, { status: 403 })
      )
    );
    withSnapshots503();

    render(<TrafficDashboard repository={repo} onBack={() => {}} />);

    await waitFor(() => expect(screen.getByText(/Access denied/)).toBeInTheDocument());
    expect(screen.getByText("Try Again")).toBeInTheDocument();
  });
});
