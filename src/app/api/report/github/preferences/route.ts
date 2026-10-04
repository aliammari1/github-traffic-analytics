// SPDX-License-Identifier: MIT
import { NextRequest, NextResponse } from "next/server";
import { parseRepoInput } from "@/lib/analytics";
import { getServerAuth } from "@/lib/server-auth";
import { getD1 } from "@/lib/d1";
import { GitHubService, TrafficAccessError } from "@/lib/github";
import { discussionCategories } from "@/lib/github-report-delivery";
import { isValidTimeZone } from "@/lib/digest-schedule";

const reply = (body: Record<string, unknown>, status = 200) =>
  NextResponse.json(body, { status, headers: { "cache-control": "private, no-store" } });

function target(request: NextRequest) {
  const owner = request.nextUrl.searchParams.get("owner") ?? "";
  const repo = request.nextUrl.searchParams.get("repo") ?? "";
  const parsed = parseRepoInput(`${owner}/${repo}`);
  return parsed?.owner === owner && parsed.repo === repo ? { owner, repo } : null;
}

async function context(request: NextRequest) {
  const identity = await getServerAuth(request);
  if (!identity) return { response: reply({ error: "Sign in to manage GitHub reports." }, 401) };
  const repo = target(request);
  if (!repo) return { response: reply({ error: "Choose a valid repository." }, 400) };
  const db = await getD1();
  if (!db) return { response: reply({ error: "GitHub reports require Cloudflare D1." }, 503) };
  return { identity, repo, db };
}

export async function GET(request: NextRequest) {
  const result = await context(request);
  if (result.response) return result.response;
  const { identity, repo, db } = result;
  try {
    const { results } = await db
      .prepare(
        `SELECT cadence, destination, discussion_category_id, time_zone
         FROM github_report_preferences
         WHERE owner_login = ? AND repo_owner = ? AND repo_name = ?`
      )
      .bind(identity.userId, repo.owner, repo.repo)
      .all<{
        cadence: "weekly" | "monthly";
        destination: "issue" | "discussion";
        discussion_category_id: string | null;
        time_zone: string;
      }>();
    return reply({
      enabled: results.length > 0,
      cadence: results[0]?.cadence ?? "weekly",
      destination: results[0]?.destination ?? "issue",
      categoryId: results[0]?.discussion_category_id ?? null,
      timeZone: results[0]?.time_zone ?? null,
    });
  } catch {
    return reply({ error: "Could not load GitHub report settings. Try again shortly." }, 503);
  }
}

export async function PUT(request: NextRequest) {
  const result = await context(request);
  if (result.response) return result.response;
  if (request.headers.get("origin") !== request.nextUrl.origin)
    return reply({ error: "Request origin is invalid." }, 403);
  const { identity, repo, db } = result;
  let input: Record<string, unknown>;
  try {
    input = (await request.json()) as Record<string, unknown>;
  } catch {
    return reply({ error: "Choose report delivery settings." }, 400);
  }
  const { cadence, destination, categoryId, timeZone } = input;
  if (
    (cadence !== "weekly" && cadence !== "monthly") ||
    (destination !== "issue" && destination !== "discussion") ||
    typeof timeZone !== "string" ||
    !isValidTimeZone(timeZone) ||
    (destination === "discussion" && (typeof categoryId !== "string" || !categoryId))
  )
    return reply({ error: "Choose a valid cadence, destination, category and timezone." }, 400);

  try {
    await new GitHubService(identity.accessToken).getTrafficViews(repo.owner, repo.repo);
    if (destination === "issue") {
      const metadata = await fetch(
        `https://api.github.com/repos/${encodeURIComponent(repo.owner)}/${encodeURIComponent(repo.repo)}`,
        {
          headers: {
            Authorization: `Bearer ${identity.accessToken}`,
            Accept: "application/vnd.github+json",
            "User-Agent": "github-traffic-analytics-reports",
            "X-GitHub-Api-Version": "2022-11-28",
          },
          signal: AbortSignal.timeout(8_000),
        }
      );
      if (!metadata.ok) throw new Error(`GitHub repository lookup returned ${metadata.status}`);
      const features = (await metadata.json()) as { has_issues?: boolean };
      if (!features.has_issues)
        return reply(
          {
            error:
              "Issues are disabled in this repository. Choose Discussions or enable Issues first.",
          },
          409
        );
    } else {
      const categories = await discussionCategories(repo.owner, repo.repo, identity.accessToken);
      if (!categories.some((category) => category.id === categoryId))
        return reply({ error: "Choose a current Discussion category." }, 400);
    }
  } catch (cause) {
    return cause instanceof TrafficAccessError
      ? reply({ error: "GitHub does not grant you traffic access to this repository." }, 403)
      : reply(
          { error: "GitHub could not verify access or Discussion categories. Try again shortly." },
          502
        );
  }

  try {
    const { results: installed } = await db
      .prepare(
        `SELECT 1 FROM app_tracked_repos WHERE owner_login = ? AND repo_owner = ? AND repo_name = ? LIMIT 1`
      )
      .bind(identity.userId, repo.owner, repo.repo)
      .all<{ "1": number }>();
    const tracking = db
      .prepare(
        `INSERT INTO tracked_repos (owner_login, repo_owner, repo_name, access_token)
           VALUES (?, ?, ?, ?)
           ON CONFLICT (owner_login, repo_owner, repo_name)
           DO UPDATE SET access_token = excluded.access_token`
      )
      .bind(identity.userId, repo.owner, repo.repo, identity.accessToken);
    const preference = db
      .prepare(
        `INSERT INTO github_report_preferences
             (owner_login, repo_owner, repo_name, cadence, destination, discussion_category_id, time_zone)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT (owner_login, repo_owner, repo_name)
           DO UPDATE SET cadence = excluded.cadence, destination = excluded.destination,
             discussion_category_id = excluded.discussion_category_id,
             time_zone = excluded.time_zone, updated_at = datetime('now')`
      )
      .bind(
        identity.userId,
        repo.owner,
        repo.repo,
        cadence,
        destination,
        destination === "discussion" ? categoryId : null,
        timeZone
      );
    await db.batch(installed.length ? [preference] : [tracking, preference]);
    return reply({ enabled: true, cadence, destination, categoryId, timeZone });
  } catch {
    return reply({ error: "Could not save GitHub report settings. Try again shortly." }, 503);
  }
}

export async function DELETE(request: NextRequest) {
  const result = await context(request);
  if (result.response) return result.response;
  if (request.headers.get("origin") !== request.nextUrl.origin)
    return reply({ error: "Request origin is invalid." }, 403);
  const { identity, repo, db } = result;
  try {
    await db
      .prepare(
        `DELETE FROM github_report_preferences
         WHERE owner_login = ? AND repo_owner = ? AND repo_name = ?`
      )
      .bind(identity.userId, repo.owner, repo.repo)
      .run();
    return reply({ enabled: false });
  } catch {
    return reply({ error: "Could not disable GitHub reports. Try again shortly." }, 503);
  }
}
