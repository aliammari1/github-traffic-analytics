import { auth } from "@/lib/auth";
import { GitHubService } from "@/lib/github";
import { NextResponse } from "next/server";

/**
 * Handle a GET request to retrieve the authenticated user's GitHub repositories.
 *
 * @returns A JSON HTTP response containing the user's repository list on success; a JSON error object `{ error: "Unauthorized" }` with status `401` if there is no valid session; or a JSON error object `{ error: "Failed to fetch repositories" }` with status `500` on failure.
 */
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