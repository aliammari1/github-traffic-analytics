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
  -- Stable Auth.js subject / GitHub account id; scopes reads per-user.
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

-- Stores the server-side GitHub OAuth token + repo list the cron uses to call
-- GitHub on behalf of a user. Treat this table as sensitive and restrict D1 access.
-- Populated only when a user opts in to historical tracking.
CREATE TABLE IF NOT EXISTS tracked_repos (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_login   TEXT    NOT NULL,
  repo_owner    TEXT    NOT NULL,
  repo_name     TEXT    NOT NULL,
  access_token  TEXT    NOT NULL,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  UNIQUE (owner_login, repo_owner, repo_name)
);

-- Explicit per-repository email opt-in. Email is selected from the account's
-- verified GitHub addresses; the browser cannot choose an arbitrary recipient.
CREATE TABLE IF NOT EXISTS weekly_digest_preferences (
  owner_login TEXT NOT NULL,
  repo_owner TEXT NOT NULL,
  repo_name TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  time_zone TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0, 1)),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (owner_login, repo_owner, repo_name)
);

CREATE TABLE IF NOT EXISTS report_deliveries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_login TEXT NOT NULL,
  repo_owner TEXT NOT NULL,
  repo_name TEXT NOT NULL,
  period_to TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'github_issue', 'github_discussion')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed')),
  attempted_at TEXT NOT NULL DEFAULT (datetime('now')),
  delivered_at TEXT,
  provider_id TEXT,
  UNIQUE (owner_login, repo_owner, repo_name, period_to, channel)
);

CREATE INDEX IF NOT EXISTS idx_weekly_digest_enabled
  ON weekly_digest_preferences (enabled, owner_login);

-- GitHub's top referrer/path endpoints are rolling 14-day lists, not daily
-- counts. Archive each observed list for honest comparison across captures.
CREATE TABLE IF NOT EXISTS traffic_source_snapshots (
  owner_login TEXT NOT NULL,
  repo_owner TEXT NOT NULL,
  repo_name TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('referrer', 'path')),
  captured_day TEXT NOT NULL,
  name TEXT NOT NULL,
  count INTEGER NOT NULL,
  uniques INTEGER NOT NULL,
  PRIMARY KEY (owner_login, repo_owner, repo_name, kind, captured_day, name)
);

CREATE INDEX IF NOT EXISTS idx_source_snapshots_lookup
  ON traffic_source_snapshots (owner_login, repo_owner, repo_name, captured_day, kind);

CREATE TABLE IF NOT EXISTS github_report_preferences (
  owner_login TEXT NOT NULL,
  repo_owner TEXT NOT NULL,
  repo_name TEXT NOT NULL,
  cadence TEXT NOT NULL CHECK (cadence IN ('weekly', 'monthly')),
  destination TEXT NOT NULL CHECK (destination IN ('issue', 'discussion')),
  discussion_category_id TEXT,
  time_zone TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0, 1)),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (owner_login, repo_owner, repo_name)
);

CREATE INDEX IF NOT EXISTS idx_github_reports_enabled
  ON github_report_preferences (enabled, cadence);

CREATE TABLE IF NOT EXISTS github_report_deliveries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_login TEXT NOT NULL,
  repo_owner TEXT NOT NULL,
  repo_name TEXT NOT NULL,
  period_to TEXT NOT NULL,
  cadence TEXT NOT NULL CHECK (cadence IN ('weekly', 'monthly')),
  destination TEXT NOT NULL CHECK (destination IN ('issue', 'discussion')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed')),
  attempted_at TEXT NOT NULL DEFAULT (datetime('now')),
  delivered_at TEXT,
  provider_id TEXT,
  UNIQUE (owner_login, repo_owner, repo_name, period_to, cadence, destination)
);

CREATE TABLE IF NOT EXISTS webhook_preferences (
  owner_login TEXT NOT NULL,
  repo_owner TEXT NOT NULL,
  repo_name TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('slack', 'discord')),
  url_ciphertext TEXT NOT NULL,
  event_types TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0, 1)),
  last_test_at TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (owner_login, repo_owner, repo_name, platform)
);

CREATE TABLE IF NOT EXISTS repo_star_snapshots (
  owner_login TEXT NOT NULL,
  repo_owner TEXT NOT NULL,
  repo_name TEXT NOT NULL,
  day TEXT NOT NULL,
  stars INTEGER NOT NULL CHECK (stars >= 0),
  PRIMARY KEY (owner_login, repo_owner, repo_name, day)
);

CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_login TEXT NOT NULL,
  repo_owner TEXT NOT NULL,
  repo_name TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('slack', 'discord')),
  event_key TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed', 'permanent_failed', 'uncertain')),
  attempts INTEGER NOT NULL DEFAULT 0,
  attempted_at TEXT NOT NULL DEFAULT (datetime('now')),
  delivered_at TEXT,
  UNIQUE (owner_login, repo_owner, repo_name, platform, event_key)
);

CREATE INDEX IF NOT EXISTS idx_webhook_preferences_enabled
  ON webhook_preferences (enabled, owner_login, repo_owner, repo_name);

CREATE TABLE IF NOT EXISTS github_app_installations (
  installation_id INTEGER PRIMARY KEY,
  account_id INTEGER NOT NULL,
  account_login TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS app_tracked_repos (
  owner_login TEXT NOT NULL,
  repo_owner TEXT NOT NULL,
  repo_name TEXT NOT NULL,
  repository_id INTEGER NOT NULL,
  installation_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (owner_login, repo_owner, repo_name)
);

CREATE INDEX IF NOT EXISTS idx_app_tracked_installation
  ON app_tracked_repos (installation_id, repository_id);

CREATE TABLE IF NOT EXISTS github_app_webhook_events (
  delivery_id TEXT PRIMARY KEY,
  status TEXT NOT NULL CHECK (status IN ('pending', 'done')),
  received_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS app_release_events (
  repository_id INTEGER NOT NULL,
  tag_name TEXT NOT NULL,
  published_at TEXT NOT NULL,
  PRIMARY KEY (repository_id, tag_name)
);
