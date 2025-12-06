import { auth } from "@/lib/auth";
import { GitHubService } from "@/lib/github";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const githubService = new GitHubService(session.accessToken);
    const repositories = await githubService.getRepositories();

    return NextResponse.json(repositories);
  } catch (error) {
    console.error("Error fetching repositories:", error);
    return NextResponse.json({ error: "Failed to fetch repositories" }, { status: 500 });
  }
}
