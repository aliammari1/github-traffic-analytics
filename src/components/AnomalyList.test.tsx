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
});
