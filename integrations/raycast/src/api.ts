// SPDX-License-Identifier: MIT
import { getPreferenceValues, LocalStorage } from "@raycast/api";

export interface Growth {
  version: 1;
  repository: {
    fullName: string;
    description: string | null;
    url: string;
    stars: number;
    forks: number;
    language: string | null;
  };
  observation: { latestStarDay: string | null; starHistoryDays: number };
  growth: {
    stars7d: number | null;
    stars30d: number | null;
    weeklyRunRate: number | null;
    momentum: { score: number; label?: string } | null;
  };
  latestRelease: { tagName: string; publishedAt: string; url: string } | null;
}

export interface History {
  version: 1;
  repository: string;
  points: { day: string; stars: number }[];
  note: string;
}
export interface Comparison {
  version: 1;
  repositories: Growth[];
}

const repositoryPattern = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const recentKey = "recent-repositories";

export function assertRepository(value: string): string {
  const trimmed = value.trim();
  if (!repositoryPattern.test(trimmed)) throw new Error("Enter a repository as owner/repo.");
  return trimmed;
}

export function apiBase(): string {
  const { apiBase } = getPreferenceValues<{ apiBase: string }>();
  return (apiBase || "https://github-traffic-analytics.ali-ammari.workers.dev/api/v1").replace(
    /\/$/,
    ""
  );
}

export function appBase(): string {
  return apiBase().replace(/\/api\/v1$/, "");
}

export async function api<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBase()}${path}`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(15_000),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `Analytics API returned ${response.status}`);
  return body as T;
}

export function summary(repository: string): Promise<Growth> {
  return api<Growth>(
    `/repositories/${assertRepository(repository).split("/").map(encodeURIComponent).join("/")}`
  );
}

export function history(repository: string): Promise<History> {
  return api<History>(
    `/repositories/${assertRepository(repository).split("/").map(encodeURIComponent).join("/")}?view=history&days=30`
  );
}

export function compare(first: string, second: string): Promise<Comparison> {
  const repos = [first, second].map(assertRepository);
  return api<Comparison>(`/compare?repos=${repos.map(encodeURIComponent).join(",")}`);
}

export async function remember(repository: string): Promise<void> {
  const recent = await recentRepositories();
  await LocalStorage.setItem(
    recentKey,
    JSON.stringify([repository, ...recent.filter((item) => item !== repository)].slice(0, 20))
  );
}

export async function recentRepositories(): Promise<string[]> {
  try {
    const value = await LocalStorage.getItem<string>(recentKey);
    const parsed: unknown = JSON.parse(value || "[]");
    return Array.isArray(parsed)
      ? parsed.filter(
          (item): item is string => typeof item === "string" && repositoryPattern.test(item)
        )
      : [];
  } catch {
    return [];
  }
}

export const display = (value: number | null | undefined) =>
  value == null ? "Unavailable" : value.toLocaleString();
