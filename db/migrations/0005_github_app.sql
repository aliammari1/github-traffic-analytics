-- SPDX-License-Identifier: MIT
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
