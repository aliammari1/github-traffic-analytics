// SPDX-License-Identifier: MIT
import type { D1Database } from "../src/lib/snapshots";
import { installationToken } from "../src/lib/github-app";

export interface RepositoryAuthorization {
  owner_login: string;
  repo_owner: string;
  repo_name: string;
  access_token: string | null;
  installation_id: number | null;
  repository_id: number | null;
}

export interface AppTokenEnv {
  DB: D1Database;
  GITHUB_APP_ID?: string;
  GITHUB_APP_PRIVATE_KEY?: string;
}

export async function listTrackedRepositories(db: D1Database): Promise<RepositoryAuthorization[]> {
  const [manual, installed] = await Promise.all([
    db
      .prepare(`SELECT owner_login, repo_owner, repo_name, access_token FROM tracked_repos`)
      .all<Omit<RepositoryAuthorization, "installation_id" | "repository_id">>(),
    db
      .prepare(
        `SELECT a.owner_login, a.repo_owner, a.repo_name, a.installation_id, a.repository_id
       FROM app_tracked_repos a
       JOIN github_app_installations i ON i.installation_id = a.installation_id
       WHERE i.active = 1`
      )
      .all<Omit<RepositoryAuthorization, "access_token">>(),
  ]);
  const repos = new Map<string, RepositoryAuthorization>();
  for (const row of manual.results) {
    repos.set([row.owner_login, row.repo_owner, row.repo_name].join("\0"), {
      ...row,
      installation_id: null,
      repository_id: null,
    });
  }
  for (const row of installed.results) {
    const key = [row.owner_login, row.repo_owner, row.repo_name].join("\0");
    repos.set(key, {
      ...row,
      access_token: repos.get(key)?.access_token ?? null,
    });
  }
  return [...repos.values()];
}

/** Scoped, short-lived installation tokens are preferred over saved OAuth grants. */
export class RepositoryTokenProvider {
  private readonly cache = new Map<string, string>();

  constructor(private readonly env: AppTokenEnv) {}

  async get(
    repo: Pick<RepositoryAuthorization, "access_token" | "installation_id" | "repository_id">,
    purpose: "traffic" | "issue" | "discussion" = "traffic"
  ): Promise<string> {
    if (repo.installation_id && repo.repository_id) {
      if (!this.env.GITHUB_APP_ID || !this.env.GITHUB_APP_PRIVATE_KEY)
        throw new Error("GitHub App credentials are unavailable");
      const key = `${repo.installation_id}:${repo.repository_id}:${purpose}`;
      const cached = this.cache.get(key);
      if (cached) return cached;
      const permissions: Record<string, "read" | "write"> = { administration: "read" };
      if (purpose === "issue") permissions.issues = "write";
      if (purpose === "discussion") permissions.discussions = "write";
      const token = await installationToken(
        { appId: this.env.GITHUB_APP_ID, privateKey: this.env.GITHUB_APP_PRIVATE_KEY },
        repo.installation_id,
        { repositoryIds: [repo.repository_id], permissions }
      );
      this.cache.set(key, token);
      return token;
    }
    if (repo.access_token) return repo.access_token;
    throw new Error("No repository authorization is available");
  }
}
