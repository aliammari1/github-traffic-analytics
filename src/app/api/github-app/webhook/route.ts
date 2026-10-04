// SPDX-License-Identifier: MIT
import { NextRequest, NextResponse } from "next/server";
import { getD1 } from "@/lib/d1";
import {
  installationRepositories,
  installationToken,
  verifyWebhookSignature,
  type GitHubAppCredentials,
  type InstallationRepository,
} from "@/lib/github-app";

interface GitHubAppEvent {
  action?: string;
  sender?: { id: number };
  installation?: {
    id: number;
    account: { id: number; login: string };
  };
  repository?: InstallationRepository;
  repositories_added?: InstallationRepository[];
  repositories_removed?: InstallationRepository[];
  release?: { tag_name: string; published_at: string | null };
}

function credentials(): GitHubAppCredentials | null {
  const appId = process.env.GITHUB_APP_ID;
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY;
  return appId && privateKey ? { appId, privateKey } : null;
}

function validRepository(repo: InstallationRepository): boolean {
  return (
    Number.isSafeInteger(repo.id) &&
    repo.id > 0 &&
    typeof repo.owner?.login === "string" &&
    typeof repo.name === "string" &&
    repo.full_name === `${repo.owner.login}/${repo.name}`
  );
}

export async function POST(request: NextRequest) {
  const secret = process.env.GITHUB_APP_WEBHOOK_SECRET;
  if (!secret)
    return NextResponse.json({ error: "GitHub App webhook is not configured." }, { status: 503 });
  if (Number(request.headers.get("content-length") ?? 0) > 1_000_000)
    return NextResponse.json({ error: "Webhook payload is too large." }, { status: 413 });
  const raw = await request.text();
  if (raw.length > 1_000_000)
    return NextResponse.json({ error: "Webhook payload is too large." }, { status: 413 });
  if (!(await verifyWebhookSignature(raw, request.headers.get("x-hub-signature-256"), secret)))
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  const deliveryId = request.headers.get("x-github-delivery");
  const eventName = request.headers.get("x-github-event");
  if (!deliveryId || !/^[0-9a-f-]{36}$/i.test(deliveryId) || !eventName)
    return NextResponse.json({ error: "Invalid webhook headers." }, { status: 400 });
  let event: GitHubAppEvent;
  try {
    event = JSON.parse(raw) as GitHubAppEvent;
  } catch {
    return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
  }
  const db = await getD1();
  if (!db) return NextResponse.json({ error: "Cloudflare D1 is unavailable." }, { status: 503 });
  const { results: claims } = await db
    .prepare(
      `INSERT INTO github_app_webhook_events (delivery_id, status)
       VALUES (?, 'pending')
       ON CONFLICT (delivery_id)
       DO UPDATE SET received_at = datetime('now')
       WHERE status = 'pending' AND received_at < datetime('now', '-5 minutes')
       RETURNING delivery_id`
    )
    .bind(deliveryId)
    .all<{ delivery_id: string }>();
  if (!claims[0]) return NextResponse.json({ accepted: true, duplicate: true });
  try {
    const installation = event.installation;
    if (!installation || !Number.isSafeInteger(installation.id))
      throw new Error("Missing installation in GitHub App event");
    if (eventName === "installation" && event.action === "deleted") {
      await db.batch([
        db.prepare(`DELETE FROM app_tracked_repos WHERE installation_id = ?`).bind(installation.id),
        db
          .prepare(
            `UPDATE github_app_installations SET active = 0, updated_at = datetime('now')
           WHERE installation_id = ?`
          )
          .bind(installation.id),
      ]);
    } else if (eventName === "installation" && event.action === "suspend") {
      await db
        .prepare(
          `UPDATE github_app_installations SET active = 0, updated_at = datetime('now')
         WHERE installation_id = ?`
        )
        .bind(installation.id)
        .run();
    } else if (eventName === "installation" && event.action === "unsuspend") {
      await db
        .prepare(
          `UPDATE github_app_installations SET active = 1, updated_at = datetime('now')
         WHERE installation_id = ?`
        )
        .bind(installation.id)
        .run();
    } else if (eventName === "installation" && event.action === "created") {
      const config = credentials();
      if (!config) throw new Error("GitHub App credentials are not configured");
      const senderId = event.sender?.id;
      if (!Number.isSafeInteger(senderId) || !senderId || senderId <= 0)
        throw new Error("Installation event omitted its actor");
      const token = await installationToken(config, installation.id, {
        permissions: { administration: "read" },
      });
      const repositories = await installationRepositories(token);
      const statements = [
        db
          .prepare(
            `INSERT INTO github_app_installations
             (installation_id, account_id, account_login, active)
           VALUES (?, ?, ?, 1)
           ON CONFLICT (installation_id) DO UPDATE SET
             account_id = excluded.account_id, account_login = excluded.account_login,
             active = 1, updated_at = datetime('now')`
          )
          .bind(installation.id, installation.account.id, installation.account.login),
      ];
      for (const repo of repositories.filter(validRepository)) {
        statements.push(
          db
            .prepare(
              `INSERT INTO app_tracked_repos
               (owner_login, repo_owner, repo_name, repository_id, installation_id)
             VALUES (?, ?, ?, ?, ?)
             ON CONFLICT (owner_login, repo_owner, repo_name) DO UPDATE SET
               repository_id = excluded.repository_id, installation_id = excluded.installation_id`
            )
            .bind(String(senderId), repo.owner.login, repo.name, repo.id, installation.id)
        );
        statements.push(
          db
            .prepare(
              `DELETE FROM tracked_repos WHERE owner_login = ? AND repo_owner = ? AND repo_name = ?`
            )
            .bind(String(senderId), repo.owner.login, repo.name)
        );
      }
      for (let offset = 0; offset < statements.length; offset += 100)
        await db.batch(statements.slice(offset, offset + 100));
    } else if (eventName === "installation_repositories") {
      const senderId = event.sender?.id;
      const statements = [];
      for (const repo of event.repositories_removed ?? []) {
        if (!Number.isSafeInteger(repo.id)) continue;
        statements.push(
          db
            .prepare(
              `DELETE FROM app_tracked_repos WHERE installation_id = ? AND repository_id = ?`
            )
            .bind(installation.id, repo.id)
        );
      }
      if (Number.isSafeInteger(senderId) && senderId && senderId > 0) {
        for (const repo of (event.repositories_added ?? []).filter(validRepository)) {
          statements.push(
            db
              .prepare(
                `INSERT INTO app_tracked_repos
                 (owner_login, repo_owner, repo_name, repository_id, installation_id)
               VALUES (?, ?, ?, ?, ?)
               ON CONFLICT (owner_login, repo_owner, repo_name) DO UPDATE SET
                 repository_id = excluded.repository_id, installation_id = excluded.installation_id`
              )
              .bind(String(senderId), repo.owner.login, repo.name, repo.id, installation.id)
          );
          statements.push(
            db
              .prepare(
                `DELETE FROM tracked_repos WHERE owner_login = ? AND repo_owner = ? AND repo_name = ?`
              )
              .bind(String(senderId), repo.owner.login, repo.name)
          );
        }
      }
      for (let offset = 0; offset < statements.length; offset += 100)
        await db.batch(statements.slice(offset, offset + 100));
    } else if (
      eventName === "repository" &&
      (event.action === "deleted" || event.action === "transferred")
    ) {
      if (event.repository?.id)
        await db
          .prepare(`DELETE FROM app_tracked_repos WHERE installation_id = ? AND repository_id = ?`)
          .bind(installation.id, event.repository.id)
          .run();
    } else if (
      eventName === "repository" &&
      event.action === "renamed" &&
      event.repository &&
      validRepository(event.repository)
    ) {
      const repo = event.repository;
      const { results: links } = await db
        .prepare(
          `SELECT owner_login, repo_owner, repo_name FROM app_tracked_repos
         WHERE installation_id = ? AND repository_id = ?`
        )
        .bind(installation.id, repo.id)
        .all<{
          owner_login: string;
          repo_owner: string;
          repo_name: string;
        }>();
      const tables = [
        "traffic_snapshots",
        "traffic_source_snapshots",
        "weekly_digest_preferences",
        "github_report_preferences",
        "webhook_preferences",
        "report_deliveries",
        "github_report_deliveries",
        "webhook_deliveries",
        "repo_star_snapshots",
        "tracked_repos",
        "app_tracked_repos",
      ];
      for (const link of links) {
        const statements = tables.map((table) =>
          db
            .prepare(
              `UPDATE ${table} SET repo_owner = ?, repo_name = ?
           WHERE owner_login = ? AND repo_owner = ? AND repo_name = ?`
            )
            .bind(repo.owner.login, repo.name, link.owner_login, link.repo_owner, link.repo_name)
        );
        await db.batch(statements);
      }
    } else if (
      eventName === "release" &&
      event.action === "published" &&
      event.repository &&
      event.release
    ) {
      if (event.release.published_at)
        await db
          .prepare(
            `INSERT INTO app_release_events (repository_id, tag_name, published_at)
           VALUES (?, ?, ?)
           ON CONFLICT (repository_id, tag_name) DO UPDATE SET published_at = excluded.published_at`
          )
          .bind(event.repository.id, event.release.tag_name, event.release.published_at)
          .run();
    }
    await db
      .prepare(`UPDATE github_app_webhook_events SET status = 'done' WHERE delivery_id = ?`)
      .bind(deliveryId)
      .run();
    return NextResponse.json({ accepted: true });
  } catch (cause) {
    await db
      .prepare(`DELETE FROM github_app_webhook_events WHERE delivery_id = ? AND status = 'pending'`)
      .bind(deliveryId)
      .run()
      .catch(() => undefined);
    console.error("GitHub App webhook processing failed", {
      event: eventName,
      action: event.action ?? "unknown",
      reason: cause instanceof Error ? cause.name : "unknown",
    });
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 503 });
  }
}
