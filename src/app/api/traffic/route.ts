import { auth } from "@/lib/auth";
import { GitHubService } from "@/lib/github";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await auth();
  
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");

  if (!owner || !repo) {
    return NextResponse.json({ error: "Owner and repo parameters are required" }, { status: 400 });
  }

  try {
    const githubService = new GitHubService(session.accessToken);
    
    const [views, clones, referrers, paths] = await Promise.all([
      githubService.getTrafficViews(owner, repo),
      githubService.getClones(owner, repo),
      githubService.getReferrers(owner, repo),
      githubService.getPopularPaths(owner, repo)
    ]);

    return NextResponse.json({
      views,
      clones,
      referrers,
      paths
    });
  } catch (error: unknown) {
    console.error("Error fetching traffic data:", error);
    
    // Renvoyer le message d'erreur spécifique si disponible
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch traffic data";
    const statusCode = errorMessage.includes("Accès refusé") ? 403 : 500;
    
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
