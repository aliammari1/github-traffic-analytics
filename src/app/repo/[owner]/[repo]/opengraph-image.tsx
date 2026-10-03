// SPDX-License-Identifier: MIT
import { ImageResponse } from "next/og";
import { publicGitHub } from "@/lib/github-public";
import { compareStarPeriods, starsGained } from "@/lib/analytics";

export const alt = "Public GitHub repository star growth report";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ owner: string; repo: string }>;
}) {
  const { owner, repo } = await params;
  let name = "GitHub repository growth";
  let stars: number | null = null;
  let growth: number | null = null;
  let velocity: number | null = null;
  try {
    const analysis = await publicGitHub.analyzePublicRepository(owner, repo);
    name = analysis.repository.fullName;
    stars = analysis.repository.starsCount;
    growth = starsGained(analysis.starHistory, 30);
    velocity = compareStarPeriods(analysis.starHistory, 7).changePercent;
  } catch {
    // Private, missing, and rate-limited repositories use a generic image.
  }

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        background: "#0d1117",
        color: "#e6edf3",
        padding: "68px",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ color: "#8b949e", fontSize: 26 }}>REPOSITORY GROWTH REPORT</div>
        <div style={{ fontSize: 68, fontWeight: 700, overflow: "hidden" }}>{name}</div>
        <div style={{ fontSize: 40, color: "#3fb950" }}>
          {stars === null
            ? "Explore public repository growth"
            : `${stars.toLocaleString("en-US")} stars`}
        </div>
        {growth !== null && (
          <div style={{ fontSize: 34 }}>+{growth.toLocaleString("en-US")} stars in 30 days</div>
        )}
        {velocity !== null && (
          <div style={{ fontSize: 28, color: "#8b949e" }}>
            Weekly velocity {velocity >= 0 ? "up" : "down"} {Math.abs(velocity)}%
          </div>
        )}
      </div>
      <div style={{ display: "flex", fontSize: 26, color: "#8b949e" }}>
        GitHub Traffic Analytics · Understand why repositories grow
      </div>
    </div>,
    size
  );
}
