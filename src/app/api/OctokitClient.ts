import { Octokit } from "octokit";

class OctokitClient {
  private static instance: Octokit | null = null;

  public static getInstance(): Octokit {
if (!process.env.NEXT_PUBLIC_GITHUB_TOKEN) {
  return new Response(JSON.stringify({ error: "Missing GitHub token" }), { status: 500 });
}
    if (!OctokitClient.instance) {
      OctokitClient.instance = new Octokit({
        auth: `${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
      });
    }

    return OctokitClient.instance;
  }
}

export default OctokitClient;
