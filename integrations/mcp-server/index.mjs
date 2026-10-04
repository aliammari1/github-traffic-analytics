#!/usr/bin/env node
// SPDX-License-Identifier: MIT
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import * as z from "zod/v4";

const run = promisify(execFile);
const base = (
  process.env.GTA_API_BASE || "https://github-traffic-analytics.ali-ammari.workers.dev/api/v1"
).replace(/\/$/, "");
const repo = z.string().regex(/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/, "Use OWNER/REPO");
const repoInput = z.object({ repository: repo });
const dayMs = 86_400_000;

function pathFor(repository) {
  return repository.split("/").map(encodeURIComponent).join("/");
}

async function publicApi(path) {
  const response = await fetch(`${base}${path}`, {
    headers: { Accept: "application/json", "User-Agent": "github-traffic-analytics-mcp" },
    signal: AbortSignal.timeout(20_000),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(body.error || `Public analytics API returned ${response.status}`);
  return body;
}

async function ghApi(path) {
  try {
    const { stdout } = await run("gh", ["api", path, "-H", "Accept: application/vnd.github+json"], {
      encoding: "utf8",
      timeout: 20_000,
      maxBuffer: 2_000_000,
    });
    return JSON.parse(stdout);
  } catch (cause) {
    const stderr = String(cause?.stderr || "");
    if (/HTTP 404|Not Found/i.test(stderr)) {
      const error = new Error("GitHub resource not found or inaccessible");
      error.code = "NOT_FOUND";
      throw error;
    }
    throw new Error(
      "GitHub CLI could not access repository traffic. Check gh auth status and repository Insights access."
    );
  }
}

async function currentTraffic(repository) {
  const path = `repos/${pathFor(repository)}/traffic`;
  const [views, clones] = await Promise.all([
    ghApi(`${path}/views?per=day`),
    ghApi(`${path}/clones?per=day`),
  ]);
  const daily = new Map();
  for (const [metric, items] of [
    ["views", views.views],
    ["clones", clones.clones],
  ]) {
    if (!Array.isArray(items)) throw new Error(`GitHub omitted the ${metric} series`);
    for (const item of items) {
      const day = item.timestamp?.slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(day || "")) continue;
      daily.set(day, {
        ...(daily.get(day) || { day }),
        [metric]: { count: item.count, uniques: item.uniques },
      });
    }
  }
  return [...daily.values()].sort((a, b) => a.day.localeCompare(b.day));
}

async function trafficHistory(repository, source) {
  if (source !== "live") {
    try {
      const file = await ghApi(
        `repos/${pathFor(repository)}/contents/data/daily.json?ref=traffic-history`
      );
      const archive = JSON.parse(
        Buffer.from(file.content.replace(/\s/g, ""), "base64").toString("utf8")
      );
      if (
        archive.version !== 1 ||
        archive.repository !== repository ||
        !Array.isArray(archive.daily)
      )
        throw new Error("Traffic archive does not match the requested repository");
      return { source: "archive", daily: archive.daily };
    } catch (cause) {
      if (source === "archive" || cause.code !== "NOT_FOUND") throw cause;
    }
  }
  return { source: "live", daily: await currentTraffic(repository) };
}

function sumWindow(daily, metric, endDay) {
  const byDay = new Map(daily.map((row) => [row.day, row]));
  const end = Date.parse(`${endDay}T00:00:00Z`);
  let total = 0;
  for (let offset = 0; offset < 7; offset++) {
    const day = new Date(end - offset * dayMs).toISOString().slice(0, 10);
    const count = byDay.get(day)?.[metric]?.count;
    if (!Number.isInteger(count)) return null;
    total += count;
  }
  return total;
}

function result(value) {
  return { content: [{ type: "text", text: JSON.stringify(value) }], structuredContent: value };
}

function register(server, name, description, inputSchema, handler) {
  server.registerTool(name, { description, inputSchema }, async (args) => {
    try {
      return result(await handler(args));
    } catch (cause) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: cause instanceof Error ? cause.message : "Unexpected analytics error",
          },
        ],
      };
    }
  });
}

serveStdio(() => {
  const server = new McpServer({ name: "github-traffic-analytics", version: "1.0.0" });

  register(
    server,
    "get_repository_growth",
    "Public star growth, momentum, and latest release for a repository. Missing observation windows are null.",
    repoInput,
    ({ repository }) => publicApi(`/repositories/${pathFor(repository)}`)
  );

  register(
    server,
    "get_star_history",
    "Public observed daily star counts; omitted dates were not observed. Returns at most 180 points.",
    repoInput.extend({ days: z.number().int().min(1).max(180).default(30) }),
    ({ repository, days }) =>
      publicApi(`/repositories/${pathFor(repository)}?view=history&days=${days}`)
  );

  register(
    server,
    "get_release_impact",
    "Public 14-day before/after star comparison for a release. Association is temporal, not causal.",
    repoInput.extend({ tag: z.string().min(1).max(128) }),
    ({ repository, tag }) =>
      publicApi(`/repositories/${pathFor(repository)}?view=release&tag=${encodeURIComponent(tag)}`)
  );

  register(
    server,
    "compare_repositories",
    "Compare compact public growth summaries for two to four repositories.",
    z.object({ repositories: z.array(repo).min(2).max(4) }),
    ({ repositories }) =>
      publicApi(`/compare?repos=${repositories.map(encodeURIComponent).join(",")}`)
  );

  register(
    server,
    "get_growth_anomalies",
    "Up to ten recent public star-growth signals, with evidence and severity.",
    repoInput,
    ({ repository }) => publicApi(`/repositories/${pathFor(repository)}?view=anomalies`)
  );

  register(
    server,
    "get_traffic_history",
    "PRIVATE owner traffic via local gh authentication. Reads Action archive when present, or the current GitHub traffic window. Missing days are omitted.",
    repoInput.extend({
      days: z.number().int().min(1).max(90).default(30),
      source: z.enum(["auto", "archive", "live"]).default("auto"),
    }),
    async ({ repository, days, source }) => {
      const traffic = await trafficHistory(repository, source);
      const threshold = new Date(Date.now() - days * dayMs).toISOString().slice(0, 10);
      return {
        version: 1,
        repository,
        source: traffic.source,
        daily: traffic.daily.filter((row) => row.day >= threshold).slice(-90),
        note: "GitHub traffic data is available only to repository owners or collaborators with Insights access.",
      };
    }
  );

  register(
    server,
    "get_top_referrers",
    "PRIVATE current GitHub traffic-window referrers via local gh authentication; at most ten entries.",
    repoInput,
    async ({ repository }) => ({
      version: 1,
      repository,
      source: "github-live",
      referrers: (await ghApi(`repos/${pathFor(repository)}/traffic/popular/referrers`)).slice(
        0,
        10
      ),
    })
  );

  register(
    server,
    "get_popular_content",
    "PRIVATE current GitHub traffic-window popular paths via local gh authentication; at most ten entries.",
    repoInput,
    async ({ repository }) => ({
      version: 1,
      repository,
      source: "github-live",
      paths: (await ghApi(`repos/${pathFor(repository)}/traffic/popular/paths`)).slice(0, 10),
    })
  );

  register(
    server,
    "get_weekly_report",
    "PRIVATE owner traffic totals for seven complete UTC days plus public star growth. Null means data is incomplete.",
    repoInput.extend({ source: z.enum(["auto", "archive", "live"]).default("auto") }),
    async ({ repository, source }) => {
      const [growth, traffic] = await Promise.all([
        publicApi(`/repositories/${pathFor(repository)}`),
        trafficHistory(repository, source),
      ]);
      const endingOn = new Date(Date.now() - dayMs).toISOString().slice(0, 10);
      return {
        version: 1,
        repository,
        endingOn,
        trafficSource: traffic.source,
        views7d: sumWindow(traffic.daily, "views", endingOn),
        clones7d: sumWindow(traffic.daily, "clones", endingOn),
        stars7d: growth.growth.stars7d,
        latestRelease: growth.latestRelease,
        note: "Traffic covers seven complete UTC days; star growth is the latest public observation window.",
      };
    }
  );

  return server;
});
