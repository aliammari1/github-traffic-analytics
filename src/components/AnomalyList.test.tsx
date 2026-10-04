// SPDX-License-Identifier: MIT
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import AnomalyList from "./AnomalyList";

describe("AnomalyList", () => {
  it("explains when the available observations are insufficient", () => {
    render(<AnomalyList anomalies={[]} privateTrafficAvailable={false} />);
    expect(screen.getByText(/No change crossed the signal thresholds/i)).toBeInTheDocument();
    expect(screen.getByText(/Connect a repository/i)).toBeInTheDocument();
  });

  it("shows the measured values and release association without causal wording", () => {
    render(
      <AnomalyList
        privateTrafficAvailable
        anomalies={[
          {
            type: "traffic_spike",
            metric: "views",
            severity: "high",
            observedValue: 60,
            baselineValue: 20,
            percentageChange: 200,
            zScore: null,
            startedAt: "2026-09-27",
            relatedRelease: { tagName: "v2", publishedAt: "2026-09-26" },
            explanation: "Views rose near release v2; timing alone cannot establish cause.",
          },
        ]}
      />
    );
    expect(screen.getByText(/60 vs 20/)).toBeInTheDocument();
    expect(screen.getByText(/Views rose near release v2/)).toBeInTheDocument();
  });

  it("renders weekend_surge and external verification links", () => {
    render(
      <AnomalyList
        privateTrafficAvailable
        anomalies={[
          {
            type: "weekend_surge",
            metric: "views",
            severity: "notable",
            observedValue: 50,
            baselineValue: 20,
            percentageChange: 150,
            zScore: null,
            startedAt: "2026-09-27",
            explanation:
              "Weekend traffic averaged 50 views/day, observed at 2.5x the weekday baseline (20 views/day).",
          },
          {
            type: "new_top_referrer",
            metric: "referrers",
            severity: "notable",
            observedValue: 45,
            baselineValue: 0,
            percentageChange: null,
            zScore: null,
            startedAt: "2026-09-28",
            attribution: {
              platform: "Hacker News",
              searchUrl: "https://hn.algolia.com/?q=owner%2Frepo",
            },
            explanation:
              "news.ycombinator.com (Hacker News) leads the current captured top-referrer list with 45 views.",
          },
        ]}
      />
    );
    expect(screen.getByText("Weekend views surge")).toBeInTheDocument();
    expect(screen.getByText("New leading referrer")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /Verify on Hacker News/i });
    expect(link).toHaveAttribute("href", "https://hn.algolia.com/?q=owner%2Frepo");
  });
});
