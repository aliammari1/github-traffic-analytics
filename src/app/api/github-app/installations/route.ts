// SPDX-License-Identifier: MIT
import { NextRequest, NextResponse } from "next/server";
import { getServerAuth } from "@/lib/server-auth";
import { getD1 } from "@/lib/d1";
import { GitHubService } from "@/lib/github";
import { installationInfo, installationRepositories, installationToken } from "@/lib/github-app";

const reply = (body: Record<string, unknown>, status = 200) =>
  NextResponse.json(body, { status, headers: { "cache-control": "private, no-store" } });

function installationId(value: unknown): number | null {
  if (typeof value !== "string" || !/^\d{1,16}$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export async function GET(request: NextRequest) {
  const identity = await getServerAuth(request);
  if (!identity) return reply({ error: "Sign in to view GitHub App tracking." }, 401);
  const db = await getD1();
  if (!db) return reply({ error: "App tracking requires Cloudflare D1." }, 503);
  const id = installationId(request.nextUrl.searchParams.get("installation_id"));
  try {
    const { results } = await db
      .prepare(
        `SELECT repo_owner, repo_name, installation_id FROM app_tracked_repos
       WHERE owner_login = ? ${id ? "AND installation_id = ?" : ""}
       ORDER BY repo_owner, repo_name`
      )
      .bind(...(id ? [identity.userId, id] : [identity.userId]))
      .all<{ repo_owner: string; repo_name: string; installation_id: number }>();
    return reply({
      available: Boolean(process.env.GITHUB_APP_ID && process.env.GITHUB_APP_PRIVATE_KEY),
      installUrl: process.env.GITHUB_APP_SLUG
        ? `https://github.com/apps/${encodeURIComponent(process.env.GITHUB_APP_SLUG)}/installations/new`
        : null,
      repositories: results.map((row) => ({
        fullName: `${row.repo_owner}/${row.repo_name}`,
        installationId: row.installation_id,
      })),
    });
  } catch {
    return reply({ error: "Could not load App installations. Try again shortly." }, 503);
  }
}

export async function POST(request: NextRequest) {
  const identity = await getServerAuth(request);
  if (!identity) return reply({ error: "Sign in to connect the GitHub App." }, 401);
  if (request.headers.get("origin") !== request.nextUrl.origin)
    return reply({ error: "Request origin is invalid." }, 403);
  const config = {
    appId: process.env.GITHUB_APP_ID ?? "",
    privateKey: process.env.GITHUB_APP_PRIVATE_KEY ?? "",
  };
  if (!config.appId || !config.privateKey)
    return reply({ error: "GitHub App is not configured on this deployment." }, 503);
  let id: number | null;
  try {
    const body = (await request.json()) as { installationId?: string };
    id = installationId(body.installationId);
  } catch {
    return reply({ error: "Choose a valid installation." }, 400);
  }
  if (!id) return reply({ error: "Choose a valid installation." }, 400);
  const db = await getD1();
  if (!db) return reply({ error: "App tracking requires Cloudflare D1." }, 503);

  try {
    // The setup URL's installation_id is untrusted. Intersect repositories
    // selected in this installation with repositories whose traffic the signed-in
    // GitHub user can read before creating any user-scoped tracking rows.
    const info = await installationInfo(config, id);
    if (info.suspended_at)
      return reply({ error: "This GitHub App installation is suspended." }, 409);
    const token = await installationToken(config, id, { permissions: { administration: "read" } });
    const repositories = await installationRepositories(token);
    const github = new GitHubService(identity.accessToken);
    const accessible: typeof repositories = [];
    for (let offset = 0; offset < repositories.length; offset += 6) {
      const group = repositories.slice(offset, offset + 6);
      const allowed = await Promise.all(
        group.map(async (repo) => {
          try {
            await github.getTrafficViews(repo.owner.login, repo.name);
            return repo;
          } catch {
            return null;
          }
        })
      );
      accessible.push(...allowed.filter((repo) => repo !== null));
    }
    if (!accessible.length)
      return reply(
        { error: "No selected repository grants your GitHub account traffic access." },
        403
      );
    const statements = [
      db
        .prepare(
          `INSERT INTO github_app_installations (installation_id, account_id, account_login, active)
         VALUES (?, ?, ?, 1)
         ON CONFLICT (installation_id) DO UPDATE SET account_id = excluded.account_id,
           account_login = excluded.account_login, active = 1, updated_at = datetime('now')`
        )
        .bind(id, info.account.id, info.account.login),
    ];
    for (const repo of accessible) {
      statements.push(
        db
          .prepare(
            `INSERT INTO app_tracked_repos
             (owner_login, repo_owner, repo_name, repository_id, installation_id)
           VALUES (?, ?, ?, ?, ?)
           ON CONFLICT (owner_login, repo_owner, repo_name) DO UPDATE SET
             repository_id = excluded.repository_id, installation_id = excluded.installation_id`
          )
          .bind(identity.userId, repo.owner.login, repo.name, repo.id, id)
      );
      statements.push(
        db
          .prepare(
            `DELETE FROM tracked_repos WHERE owner_login = ? AND repo_owner = ? AND repo_name = ?`
          )
          .bind(identity.userId, repo.owner.login, repo.name)
      );
    }
    for (let offset = 0; offset < statements.length; offset += 100)
      await db.batch(statements.slice(offset, offset + 100));
    return reply({
      connected: accessible.length,
      unavailable: repositories.length - accessible.length,
      repositories: accessible.map((repo) => repo.full_name),
    });
  } catch (cause) {
    console.error("GitHub App setup failed", {
      installationId: id,
      reason: cause instanceof Error ? cause.name : "unknown",
    });
    return reply(
      { error: "Could not connect this installation. Check the App setup and retry." },
      502
    );
  }
}
