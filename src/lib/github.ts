import { Octokit } from "@octokit/rest";

export interface TrafficData {
  count: number;
  uniques: number;
  views: Array<{
    timestamp: string;
    count: number;
    uniques: number;
  }>;
}

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  owner: {
    login: string;
    avatar_url: string;
  };
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string | null;
  permissions?: {
    admin: boolean;
    push: boolean;
    pull: boolean;
  };
}

export class GitHubService {
  private octokit: Octokit;

  constructor(accessToken: string) {
    this.octokit = new Octokit({
      auth: accessToken,
    });
  }

  async getRepositories(): Promise<Repository[]> {
    try {
      const { data } = await this.octokit.rest.repos.listForAuthenticatedUser({
        visibility: 'all',
        sort: 'updated',
        per_page: 100,
      });
      return data;
    } catch (error) {
      console.error('Error fetching repositories:', error);
      throw error;
    }
  }

  async getTrafficViews(owner: string, repo: string): Promise<TrafficData> {
    try {
      const { data } = await this.octokit.rest.repos.getViews({
        owner,
        repo,
        per: 'day',
      });
      return data;
    } catch (error: unknown) {
      console.error(`Error fetching traffic data for ${owner}/${repo}:`, error);
      if (error instanceof Error && 'status' in error && error.status === 403) {
        throw new Error("Accès refusé : Vous devez être propriétaire du dépôt ou avoir un accès push pour voir les données de trafic.");
      }
      throw error;
    }
  }

  async getClones(owner: string, repo: string) {
    try {
      const { data } = await this.octokit.rest.repos.getClones({
        owner,
        repo,
        per: 'day',
      });
      return data;
    } catch (error: unknown) {
      console.error(`Error fetching clone data for ${owner}/${repo}:`, error);
      if (error instanceof Error && 'status' in error && error.status === 403) {
        throw new Error("Accès refusé : Vous devez être propriétaire du dépôt ou avoir un accès push pour voir les données de trafic.");
      }
      throw error;
    }
  }

  async getReferrers(owner: string, repo: string) {
    try {
      const { data } = await this.octokit.rest.repos.getTopReferrers({
        owner,
        repo,
      });
      return data;
    } catch (error: unknown) {
      console.error(`Error fetching referrer data for ${owner}/${repo}:`, error);
      if (error instanceof Error && 'status' in error && error.status === 403) {
        throw new Error("Accès refusé : Vous devez être propriétaire du dépôt ou avoir un accès push pour voir les données de trafic.");
      }
      throw error;
    }
  }

  async getPopularPaths(owner: string, repo: string) {
    try {
      const { data } = await this.octokit.rest.repos.getTopPaths({
        owner,
        repo,
      });
      return data;
    } catch (error: unknown) {
      console.error(`Error fetching popular paths for ${owner}/${repo}:`, error);
      if (error instanceof Error && 'status' in error && error.status === 403) {
        throw new Error("Accès refusé : Vous devez être propriétaire du dépôt ou avoir un accès push pour voir les données de trafic.");
      }
      throw error;
    }
  }
}
