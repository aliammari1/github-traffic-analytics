// SPDX-License-Identifier: MIT

/**
 * D1-backed daily traffic snapshot persistence — the feature that lets the app
 * beat GitHub's 14-day traffic window. Kept dependency-free (only the minimal D1
 * interface) so it can run inside a Worker, a Next.js route, and unit tests.
 */

/** Minimal subset of the Cloudflare D1 API used here (avoids a hard dep on workers types). */
export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  run(): Promise<unknown>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
}
export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch(statements: D1PreparedStatement[]): Promise<unknown>;
}

export type Metric = "views" | "clones";

export interface DailyCount {
  /** ISO date YYYY-MM-DD. */
  day: string;
  count: number;
  uniques: number;
}

export interface SnapshotRow {
  day: string;
  metric: Metric;
  count: number;
  uniques: number;
}

const UPSERT_SQL = `
INSERT INTO traffic_snapshots
  (owner_login, repo_owner, repo_name, metric, day, count, uniques, captured_at)
VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
ON CONFLICT (owner_login, repo_owner, repo_name, metric, day)
DO UPDATE SET
  count = excluded.count,
  uniques = excluded.uniques,
  captured_at = datetime('now')
`.trim();

/** Normalize a GitHub traffic timestamp to a YYYY-MM-DD day key (UTC). */
export function toDayKey(timestamp: string): string {
  return new Date(timestamp).toISOString().slice(0, 10);
}

/**
 * Persist a batch of daily counts for one repo/metric, upserting so re-running on
 * the same day overwrites (rather than duplicates) the day's values.
 */
export async function upsertDailyCounts(
  db: D1Database,
  args: {
    ownerLogin: string;
    repoOwner: string;
    repoName: string;
    metric: Metric;
    points: DailyCount[];
  }
): Promise<number> {
  const { ownerLogin, repoOwner, repoName, metric, points } = args;
  if (points.length === 0) return 0;

  const statements = points.map((p) =>
    db.prepare(UPSERT_SQL).bind(ownerLogin, repoOwner, repoName, metric, p.day, p.count, p.uniques)
  );
  await db.batch(statements);
  return statements.length;
}

/**
 * Read historical snapshots for one repo within an inclusive [fromDay, toDay]
 * window, returned sorted by day ascending.
 */
export async function getHistory(
  db: D1Database,
  args: {
    ownerLogin: string;
    repoOwner: string;
    repoName: string;
    fromDay: string;
    toDay: string;
  }
): Promise<SnapshotRow[]> {
  const { ownerLogin, repoOwner, repoName, fromDay, toDay } = args;
  const { results } = await db
    .prepare(
      `SELECT day, metric, count, uniques
         FROM traffic_snapshots
        WHERE owner_login = ? AND repo_owner = ? AND repo_name = ?
          AND day >= ? AND day <= ?
        ORDER BY day ASC`
    )
    .bind(ownerLogin, repoOwner, repoName, fromDay, toDay)
    .all<SnapshotRow>();
  return results;
}

/**
 * Pivot raw snapshot rows into per-day records merging views and clones, which is
 * the shape the historical UI chart consumes.
 */
export function mergeHistory(rows: SnapshotRow[]): Array<{
  day: string;
  views: number;
  viewUniques: number;
  clones: number;
  cloneUniques: number;
}> {
  const byDay = new Map<
    string,
    { day: string; views: number; viewUniques: number; clones: number; cloneUniques: number }
  >();
  for (const row of rows) {
    const entry = byDay.get(row.day) ?? {
      day: row.day,
      views: 0,
      viewUniques: 0,
      clones: 0,
      cloneUniques: 0,
    };
    if (row.metric === "views") {
      entry.views = row.count;
      entry.viewUniques = row.uniques;
    } else {
      entry.clones = row.count;
      entry.cloneUniques = row.uniques;
    }
    byDay.set(row.day, entry);
  }
  return [...byDay.values()].sort((a, b) => a.day.localeCompare(b.day));
}
