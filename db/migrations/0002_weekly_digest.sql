-- SPDX-License-Identifier: MIT
-- Apply once before deploying weekly digest code:
-- wrangler d1 execute traffic_analytics --remote --file db/migrations/0002_weekly_digest.sql
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
