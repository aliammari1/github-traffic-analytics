-- SPDX-License-Identifier: MIT
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
