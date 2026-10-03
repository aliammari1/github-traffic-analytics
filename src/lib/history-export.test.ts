// SPDX-License-Identifier: MIT
import { describe, expect, it } from "vitest";
import { serializeHistory } from "./history-export";

const rows = [
  { day: "2026-06-01", metric: "views" as const, count: 12, uniques: 7 },
  { day: "2026-06-01", metric: "clones" as const, count: 3, uniques: 2 },
];

describe("serializeHistory", () => {
  it("exports raw daily snapshots with a header and stable order", () => {
    expect(serializeHistory(rows, "csv")).toBe(
      'day,metric,count,uniques\r\n"2026-06-01","views",12,7\r\n"2026-06-01","clones",3,2\r\n'
    );
  });

  it("exports the same rows as parseable JSON", () => {
    expect(JSON.parse(serializeHistory(rows, "json"))).toEqual(rows);
  });

  it("sorts records by day and metric for repeatable archives", () => {
    const reversed = [rows[1], rows[0]];
    expect(JSON.parse(serializeHistory(reversed, "json"))).toEqual(rows);
  });
});
