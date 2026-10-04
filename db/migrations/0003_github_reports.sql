-- SPDX-License-Identifier: MIT
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
