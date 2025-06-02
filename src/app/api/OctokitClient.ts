import { Octokit } from "octokit";

class OctokitClient {
  private static instance: Octokit | null = null;

  public static getInstance(): Octokit {
    if (!process.env.GITHUB_TOKEN) {
      throw new Error("Missing GitHub token. Please set GITHUB_TOKEN environment variable.");
    }
    if (!OctokitClient.instance) {
      OctokitClient.instance = new Octokit({
        auth: process.env.GITHUB_TOKEN,
      });
    }

    return OctokitClient.instance;
  }
}

export default OctokitClient;
