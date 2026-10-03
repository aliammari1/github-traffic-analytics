// SPDX-License-Identifier: MIT
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StarHistoryChart from "./StarHistoryChart";

describe("StarHistoryChart", () => {
  it("renders empty state message when data is empty", () => {
    render(<StarHistoryChart data={[]} />);
    expect(screen.getByText("No star history data available yet.")).toBeInTheDocument();
  });

  it("renders chart and release milestones when data and releases are present", () => {
    const data = [
      { date: "2026-09-01", stars: 100 },
      { date: "2026-09-15", stars: 150 },
      { date: "2026-10-01", stars: 220 },
    ];
    const releases = [
      {
        id: 1,
        name: "Version 1.0",
        tagName: "v1.0.0",
        publishedAt: "2026-09-15T12:00:00Z",
        htmlUrl: "https://github.com/test/repo/releases/tag/v1.0.0",
        isPrerelease: false,
      },
    ];

    render(<StarHistoryChart data={data} releases={releases} />);
    expect(screen.getByText("Stargazer Trajectory")).toBeInTheDocument();
    expect(screen.getByText("Release event")).toBeInTheDocument();
    expect(screen.getByText("Milestones:")).toBeInTheDocument();
    expect(screen.getByText("v1.0.0")).toBeInTheDocument();
  });
});
