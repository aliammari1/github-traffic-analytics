// SPDX-License-Identifier: MIT
import {
  StarPoint,
  StarVelocityResult,
  calculateStarVelocity,
  generateChangeHighlights,
} from "./analytics";

/**
 * Public GitHub repository service.
 * Fetches unauthenticated public data (metadata, stargazers, releases) safely,
 * with edge/in-memory caching, rate-limit awareness, and deterministic velocity calculations.
 */

export class PublicRepoError extends Error {
  readonly status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.name = "PublicRepoError";
    this.status = status;
  }
}

export class PublicRepoNotFoundError extends PublicRepoError {
  constructor(owner: string, repo: string) {
    super(`Repository ${owner}/${repo} was not found or is private.`, 404);
    this.name = "PublicRepoNotFoundError";
  }
}

export class PublicRepoRateLimitError extends PublicRepoError {
  readonly resetAt?: Date;
  constructor(resetTimestamp?: number) {
    const resetDate = resetTimestamp ? new Date(resetTimestamp * 1000) : undefined;
    super(
      `GitHub API rate limit reached for unauthenticated requests.${
        resetDate ? ` Resets at ${resetDate.toLocaleTimeString()}.` : ""
      }`,
      429
    );
    this.name = "PublicRepoRateLimitError";
    this.resetAt = resetDate;
  }
}

export interface PublicRepoMetadata {
  id: number;
  name: string;
  fullName: string;
  owner: {
    login: string;
    avatarUrl: string;
  };
  description: string | null;
  language: string | null;
  starsCount: number;
  forksCount: number;
  openIssuesCount: number;
  createdAt: string;
  updatedAt: string;
  htmlUrl: string;
  homepage: string | null;
  topics: string[];
  license: string | null;
}

export interface PublicRelease {
  id: number;
  name: string;
  tagName: string;
  publishedAt: string;
  htmlUrl: string;
  isPrerelease: boolean;
}

export interface PublicRepoAnalysis {
  repository: PublicRepoMetadata;
  starHistory: StarPoint[];
  starVelocity: StarVelocityResult;
  releases: PublicRelease[];
  highlights: string[];
  isRateLimited: boolean;
  rateLimitRemaining?: number;
}

// In-memory cache for edge/server environments with 5-minute TTL and size bounds
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}
const cache = new Map<string, CacheEntry<unknown>>();
const MAX_CACHE_SIZE = 500;

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache<T>(key: string, data: T, ttlMs = 300_000): void {
  const now = Date.now();
  if (cache.size >= MAX_CACHE_SIZE) {
    // Purge expired entries
    for (const [k, v] of cache.entries()) {
      if (now > v.expiresAt) {
        cache.delete(k);
      }
    }
    // If still at capacity, evict oldest entry
    if (cache.size >= MAX_CACHE_SIZE) {
      const oldestKey = cache.keys().next().value;
      if (oldestKey) cache.delete(oldestKey);
    }
  }
  cache.set(key, { data, expiresAt: now + ttlMs });
}

export class PublicGitHubService {
  private baseUrl: string;
  private customFetch: typeof fetch;

  constructor(options?: { baseUrl?: string; fetchFn?: typeof fetch }) {
    this.baseUrl = options?.baseUrl || "https://api.github.com";
    this.customFetch = options?.fetchFn || fetch;
  }

  private async request<T>(
    endpoint: string,
    headers: Record<string, string> = {}
  ): Promise<{ data: T; remaining: number; reset: number }> {
    const url = `${this.baseUrl}${endpoint}`;
    const res = await this.customFetch(url, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "github-traffic-analytics/2.0.0",
        ...headers,
      },
    });

    const remaining = Number(res.headers.get("x-ratelimit-remaining") ?? 60);
    const reset = Number(res.headers.get("x-ratelimit-reset") ?? 0);

    if (res.status === 404) {
      throw new PublicRepoError("Not Found", 404);
    }

    if (res.status === 403 || res.status === 429) {
      if (remaining === 0 || res.status === 429) {
        throw new PublicRepoRateLimitError(reset);
      }
      throw new PublicRepoError("Access Forbidden", 403);
    }

    if (!res.ok) {
      throw new PublicRepoError(`GitHub request failed: ${res.statusText}`, res.status);
    }

    const data = (await res.json()) as T;
    return { data, remaining, reset };
  }

  async getRepositoryMetadata(owner: string, repo: string): Promise<PublicRepoMetadata> {
    const cacheKey = `metadata:${owner}/${repo}`;
    const cached = getCached<PublicRepoMetadata | { notFound: true }>(cacheKey);
    if (cached) {
      if ("notFound" in cached) {
        throw new PublicRepoNotFoundError(owner, repo);
      }
      return cached;
    }

    try {
      const { data } = await this.request<any>(
        `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`
      );

      const metadata: PublicRepoMetadata = {
        id: data.id,
        name: data.name,
        fullName: data.full_name,
        owner: {
          login: data.owner?.login || owner,
          avatarUrl: data.owner?.avatar_url || "",
        },
        description: data.description || null,
        language: data.language || null,
        starsCount: data.stargazers_count ?? 0,
        forksCount: data.forks_count ?? 0,
        openIssuesCount: data.open_issues_count ?? 0,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        htmlUrl: data.html_url,
        homepage: data.homepage || null,
        topics: Array.isArray(data.topics) ? data.topics : [],
        license: data.license?.spdx_id || data.license?.name || null,
      };

      setCache(cacheKey, metadata, 300_000);
      return metadata;
    } catch (err) {
      if (err instanceof PublicRepoError && err.status === 404) {
        setCache(cacheKey, { notFound: true }, 60_000);
        throw new PublicRepoNotFoundError(owner, repo);
      }
      throw err;
    }
  }

  async getRecentReleases(owner: string, repo: string, limit = 5): Promise<PublicRelease[]> {
    const cacheKey = `releases:${owner}/${repo}`;
    const cached = getCached<PublicRelease[]>(cacheKey);
    if (cached) return cached;

    try {
      const { data } = await this.request<any[]>(
        `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/releases?per_page=${limit}`
      );

      if (!Array.isArray(data)) return [];

      const releases: PublicRelease[] = data.map((item) => ({
        id: item.id,
        name: item.name || item.tag_name,
        tagName: item.tag_name,
        publishedAt: item.published_at || item.created_at,
        htmlUrl: item.html_url,
        isPrerelease: Boolean(item.prerelease),
      }));

      setCache(cacheKey, releases, 300_000);
      return releases;
    } catch (err) {
      if (err instanceof PublicRepoRateLimitError) {
        throw err;
      }
      if (err instanceof PublicRepoError && (err.status === 404 || err.status === 429)) {
        return [];
      }
      console.warn(`Failed to fetch releases for ${owner}/${repo}:`, err);
      return [];
    }
  }

  async getStarHistory(
    owner: string,
    repo: string,
    totalStars: number,
    createdAt: string
  ): Promise<StarPoint[]> {
    const cacheKey = `stars:${owner}/${repo}`;
    const cached = getCached<StarPoint[]>(cacheKey);
    if (cached) return cached;

    const points: StarPoint[] = [];
    const creationDate = createdAt.slice(0, 10);
    const today = new Date().toISOString().slice(0, 10);

    // Initial creation milestone
    points.push({ date: creationDate, stars: 0 });

    if (totalStars <= 0) {
      return points;
    }

    let historyLoaded = false;

    try {
      // 1. Try privacy-safe star history endpoint first (official GitHub REST API)
      const { data: history } = await this.request<
        Array<{ week: number; total: number; days: number[] }>
      >(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/stargazers/history`);

      if (Array.isArray(history) && history.length > 0) {
        const weeks = [...history].reverse(); // oldest first
        const totalGained = weeks.reduce(
          (sum, w) => sum + (w.total ?? w.days.reduce((a, b) => a + b, 0)),
          0
        );
        let runningStars = Math.max(0, totalStars - totalGained);

        for (const w of weeks) {
          w.days.forEach((gain, d) => {
            runningStars += gain;
            const dayDate = new Date((w.week + d * 86400) * 1000).toISOString().slice(0, 10);
            if (dayDate <= today && dayDate >= creationDate) {
              points.push({ date: dayDate, stars: runningStars });
            }
          });
        }
        historyLoaded = true;
      }
    } catch (err) {
      if (err instanceof PublicRepoRateLimitError) {
        throw err;
      }
      // Non-rate-limit errors fall back to legacy sample below
    }

    if (!historyLoaded) {
      try {
        // Fallback: sample initial stars and last page
        const { data: firstPage } = await this.request<Array<{ starred_at: string }>>(
          `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/stargazers?per_page=30&page=1&direction=asc`,
          { Accept: "application/vnd.github.v3.star+json" }
        );

        if (Array.isArray(firstPage) && firstPage.length > 0) {
          firstPage.forEach((item, index) => {
            if (item.starred_at) {
              points.push({
                date: item.starred_at.slice(0, 10),
                stars: index + 1,
              });
            }
          });
        }

        if (totalStars > 30) {
          const lastPageNum = Math.min(Math.ceil(totalStars / 30), 100);
          try {
            const { data: lastPage } = await this.request<Array<{ starred_at: string }>>(
              `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/stargazers?per_page=30&page=${lastPageNum}&direction=asc`,
              { Accept: "application/vnd.github.v3.star+json" }
            );

            if (Array.isArray(lastPage) && lastPage.length > 0) {
              const baseCount = (lastPageNum - 1) * 30;
              lastPage.forEach((item, index) => {
                if (item.starred_at) {
                  points.push({
                    date: item.starred_at.slice(0, 10),
                    stars: baseCount + index + 1,
                  });
                }
              });
            }
          } catch (innerErr) {
            if (innerErr instanceof PublicRepoRateLimitError) {
              throw innerErr;
            }
          }
        }
      } catch (err) {
        if (err instanceof PublicRepoRateLimitError) {
          throw err;
        }
        console.warn(`Failed to fetch star history for ${owner}/${repo}:`, err);
      }
    }

    // Always ensure current date + total stars is represented
    points.push({ date: today, stars: totalStars });

    // Deduplicate by date keeping maximum stars for that date, then sort
    const dateMap = new Map<string, number>();
    for (const p of points) {
      const existing = dateMap.get(p.date) ?? 0;
      if (p.stars >= existing) {
        dateMap.set(p.date, p.stars);
      }
    }

    const consolidated: StarPoint[] = Array.from(dateMap.entries())
      .map(([date, stars]) => ({ date, stars }))
      .sort((a, b) => a.date.localeCompare(b.date));

    setCache(cacheKey, consolidated, 300_000);
    return consolidated;
  }

  async analyzePublicRepository(owner: string, repo: string): Promise<PublicRepoAnalysis> {
    const metadata = await this.getRepositoryMetadata(owner, repo);
    let isRateLimited = false;

    let releases: PublicRelease[] = [];
    try {
      releases = await this.getRecentReleases(owner, repo);
    } catch (err) {
      if (err instanceof PublicRepoRateLimitError) {
        isRateLimited = true;
      } else {
        throw err;
      }
    }

    let starHistory: StarPoint[] = [];
    try {
      starHistory = await this.getStarHistory(owner, repo, metadata.starsCount, metadata.createdAt);
    } catch (err) {
      if (err instanceof PublicRepoRateLimitError) {
        isRateLimited = true;
        starHistory = [
          { date: metadata.createdAt.slice(0, 10), stars: 0 },
          { date: new Date().toISOString().slice(0, 10), stars: metadata.starsCount },
        ];
      } else {
        throw err;
      }
    }

    const starVelocity = calculateStarVelocity(starHistory, metadata.starsCount);

    const recentRelease = releases.length > 0 ? releases[0] : undefined;

    const highlights = generateChangeHighlights({
      repoName: metadata.name,
      currentStars: metadata.starsCount,
      starVelocity,
      recentRelease,
      isTrackingEnabled: false, // Public viewer baseline
    });

    return {
      repository: metadata,
      starHistory,
      starVelocity,
      releases,
      highlights,
      isRateLimited,
    };
  }
}

export const publicGitHub = new PublicGitHubService();
