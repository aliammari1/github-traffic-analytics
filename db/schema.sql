-- SPDX-License-Identifier: MIT
-- Cloudflare D1 schema for daily traffic snapshots.
--
-- GitHub's traffic API only exposes the last 14 days. The daily-snapshot Worker
-- (see worker/snapshot.ts) writes one row per (user, repo, metric, day) every day,
-- so the dashboard can show history well beyond the 14-day window.
--
-- Apply locally:  wrangler d1 execute traffic_analytics --local  --file db/schema.sql
-- Apply remote:   wrangler d1 execute traffic_analytics --remote --file db/schema.sql

CREATE TABLE IF NOT EXISTS traffic_snapshots (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  -- GitHub login (or numeric user id) the snapshot belongs to; scopes reads per-user.
  owner_login   TEXT    NOT NULL,
  repo_owner    TEXT    NOT NULL,
  repo_name     TEXT    NOT NULL,
  -- 'views' or 'clones'.
  metric        TEXT    NOT NULL CHECK (metric IN ('views', 'clones')),
  -- ISO date (YYYY-MM-DD) the counts apply to.
  day           TEXT    NOT NULL,
  count         INTEGER NOT NULL DEFAULT 0,
  uniques       INTEGER NOT NULL DEFAULT 0,
  -- When this row was written/updated (ISO 8601).
  captured_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  -- One canonical row per user/repo/metric/day; re-runs upsert instead of duplicating.
  UNIQUE (owner_login, repo_owner, repo_name, metric, day)
);

CREATE INDEX IF NOT EXISTS idx_snapshots_lookup
  ON traffic_snapshots (owner_login, repo_owner, repo_name, metric, day);

-- Stores the encrypted/opaque token + repo list the cron uses to call GitHub on
-- behalf of a user. Populated when a user opts in to historical tracking.
CREATE TABLE IF NOT EXISTS tracked_repos (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_login   TEXT    NOT NULL,
  repo_owner    TEXT    NOT NULL,
  repo_name     TEXT    NOT NULL,
  access_token  TEXT    NOT NULL,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  UNIQUE (owner_login, repo_owner, repo_name)
);
