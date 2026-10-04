// SPDX-License-Identifier: MIT
import type { ComparisonWindow, NamedCount } from "./anomalies";
import type { D1Database } from "./snapshots";

const DAY_MS = 86_400_000;
type SourceKind = "referrer" | "path";

interface SourceRow {
  kind: SourceKind;
  captured_day: string;
  name: string;
  count: number;
}

/** Replace one observed rolling top-ten list without retaining stale names on rerun. */
export async function replaceSourceSnapshot(
  db: D1Database,
  args: {
    ownerLogin: string;
    repoOwner: string;
    repoName: string;
    kind: SourceKind;
    capturedDay: string;
    sources: Array<{ name: string; count: number; uniques: number }>;
  }
) {
  const key = [args.ownerLogin, args.repoOwner, args.repoName, args.kind, args.capturedDay];
  const statements = [
    db
      .prepare(
        `DELETE FROM traffic_source_snapshots
       WHERE owner_login = ? AND repo_owner = ? AND repo_name = ? AND kind = ? AND captured_day = ?`
      )
      .bind(...key),
    ...args.sources.map((source) =>
      db
        .prepare(
          `INSERT INTO traffic_source_snapshots
          (owner_login, repo_owner, repo_name, kind, captured_day, name, count, uniques)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(...key, source.name, source.count, source.uniques)
    ),
  ];
  await db.batch(statements);
}

/** Compare two observed 14-day rolling lists roughly seven days apart. */
export async function getSourceWindows(
  db: D1Database,
  args: { ownerLogin: string; repoOwner: string; repoName: string; endingOn: string }
): Promise<{
  topReferrer: NamedCount | null;
  referrers?: ComparisonWindow;
  paths?: ComparisonWindow;
}> {
  const end = Date.parse(`${args.endingOn}T00:00:00Z`);
  const from = new Date(end - 10 * DAY_MS).toISOString().slice(0, 10);
  const through = new Date(end + DAY_MS).toISOString().slice(0, 10);
  const { results } = await db
    .prepare(
      `SELECT kind, captured_day, name, count FROM traffic_source_snapshots
       WHERE owner_login = ? AND repo_owner = ? AND repo_name = ?
         AND captured_day >= ? AND captured_day <= ?`
    )
    .bind(args.ownerLogin, args.repoOwner, args.repoName, from, through)
    .all<SourceRow>();

  function window(kind: SourceKind) {
    const rows = results.filter((row) => row.kind === kind);
    const days = [...new Set(rows.map((row) => row.captured_day))].sort();
    const earliestCurrent = new Date(end - DAY_MS).toISOString().slice(0, 10);
    const currentDay = days.filter((day) => day >= earliestCurrent).at(-1);
    if (!currentDay) return { current: [] as NamedCount[], comparison: undefined };
    const current = rows
      .filter((row) => row.captured_day === currentDay)
      .map((row) => ({ name: row.name, count: row.count }));
    const priorEnd = new Date(Date.parse(`${currentDay}T00:00:00Z`) - 7 * DAY_MS)
      .toISOString()
      .slice(0, 10);
    const priorStart = new Date(Date.parse(`${currentDay}T00:00:00Z`) - 9 * DAY_MS)
      .toISOString()
      .slice(0, 10);
    const previousDay = days.findLast((day) => day >= priorStart && day <= priorEnd);
    const previous = previousDay
      ? rows
          .filter((row) => row.captured_day === previousDay)
          .map((row) => ({ name: row.name, count: row.count }))
      : [];
    return {
      current,
      comparison: previous.length && current.length ? { previous, current } : undefined,
    };
  }

  const referrers = window("referrer");
  const paths = window("path");
  return {
    topReferrer: referrers.current.toSorted((a, b) => b.count - a.count)[0] ?? null,
    referrers: referrers.comparison,
    paths: paths.comparison,
  };
}
