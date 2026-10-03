// SPDX-License-Identifier: MIT
import type { SnapshotRow } from "./snapshots";

/** Preserve raw metric rows so exports can be re-imported without invented zeros. */
export function serializeHistory(rows: SnapshotRow[], format: "csv" | "json"): string {
  const ordered = [...rows].sort(
    (a, b) =>
      a.day.localeCompare(b.day) || (a.metric === b.metric ? 0 : a.metric === "views" ? -1 : 1)
  );
  if (format === "json") return JSON.stringify(ordered, null, 2);
  const cell = (value: string | number) => {
    const text = String(value);
    return `"${text.replaceAll('"', '""')}"`;
  };
  // The first column is an ISO day from GitHub. Escape all fields for safe CSV import.
  return (
    "day,metric,count,uniques\r\n" +
    ordered
      .map((row) =>
        [row.day, row.metric, row.count, row.uniques]
          .map((v) => (typeof v === "number" ? v : cell(v)))
          .join(",")
      )
      .join("\r\n") +
    (ordered.length ? "\r\n" : "")
  );
}
