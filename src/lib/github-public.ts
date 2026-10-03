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

// In-memory cache for edge/server environments with 5-minute TTL
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}
const cache = new Map<string, CacheEntry<unknown>>();

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
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
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
      throw new PublicRepoError(`GitHub API error: ${res.statusText}`, res.status);
    }

    const data = (await res.json()) as T;
    return { data, remaining, reset };
  }

  async getRepositoryMetadata(owner: string, repo: string): Promise<PublicRepoMetadata> {
    const cacheKey = `metadata:${owner}/${repo}`;
    const cached = getCached<PublicRepoMetadata>(cacheKey);
    if (cached) return cached;

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
        starsCount: Number(data.stargazers_count ?? 0),
        forksCount: Number(data.forks_count ?? 0),
        openIssuesCount: Number(data.open_issues_count ?? 0),
        createdAt: data.created_at || new Date().toISOString(),
        updatedAt: data.updated_at || new Date().toISOString(),
        htmlUrl: data.html_url || `https://github.com/${owner}/${repo}`,
        homepage: data.homepage || null,
        topics: Array.isArray(data.topics) ? data.topics : [],
        license: data.license?.spdx_id || data.license?.name || null,
      };

      setCache(cacheKey, metadata, 300_000);
      return metadata;
    } catch (err) {
      if (err instanceof PublicRepoError && err.status === 404) {
        throw new PublicRepoNotFoundError(owner, repo);
      }
      throw err;
    }
  }

  async getRecentReleases(owner: string, repo: string): Promise<PublicRelease[]> {
    const cacheKey = `releases:${owner}/${repo}`;
    const cached = getCached<PublicRelease[]>(cacheKey);
    if (cached) return cached;

    try {
      const { data } = await this.request<any[]>(
        `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/releases?per_page=10`
      );

      const releases: PublicRelease[] = (Array.isArray(data) ? data : []).map((r) => ({
        id: r.id,
        name: r.name || r.tag_name,
        tagName: r.tag_name,
        publishedAt: r.published_at || r.created_at,
        htmlUrl: r.html_url,
        isPrerelease: Boolean(r.prerelease),
      }));

      setCache(cacheKey, releases, 300_000);
      return releases;
    } catch (err) {
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

    try {
      // 1. Fetch first batch of stars with timestamps
      const { data: firstPage } = await this.request<Array<{ starred_at: string }>>(
        `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/stargazers?per_page=30&page=1`,
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

      // 2. If repo has more than 30 stars, sample the last page to capture recent velocity
      if (totalStars > 30) {
        const lastPageNum = Math.min(Math.ceil(totalStars / 30), 100);
        try {
          const { data: lastPage } = await this.request<Array<{ starred_at: string }>>(
            `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/stargazers?per_page=30&page=${lastPageNum}`,
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
        } catch {
          // Gracefully fallback if last page query hits boundary
        }
      }
    } catch {
      // Rate limit or fetch error: preserve creation and current total
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
    const releases = await this.getRecentReleases(owner, repo);
    const starHistory = await this.getStarHistory(
      owner,
      repo,
      metadata.starsCount,
      metadata.createdAt
    );

    const starVelocity = calculateStarVelocity(starHistory, metadata.starsCount);

    const recentRelease = releases.length > 0 ? releases[0] : undefined;

    const highlights = generateChangeHighlights({
      repoName: metadata.name,
      currentStars: metadata.starsCount,
      starVelocity,
      recentRelease,
      isTrackingActive: false, // Public viewer baseline
    });

    return {
      repository: metadata,
      starHistory,
      starVelocity,
      releases,
      highlights,
      isRateLimited: false,
    };
  }
}

export const publicGitHub = new PublicGitHubService();
