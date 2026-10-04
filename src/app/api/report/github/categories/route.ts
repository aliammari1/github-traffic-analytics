// SPDX-License-Identifier: MIT
import { NextRequest, NextResponse } from "next/server";
import { getServerAuth } from "@/lib/server-auth";
import { parseRepoInput } from "@/lib/analytics";
import { GitHubService } from "@/lib/github";
import { discussionCategories } from "@/lib/github-report-delivery";

export async function GET(request: NextRequest) {
  const headers = { "cache-control": "private, no-store" };
  const identity = await getServerAuth(request);
  if (!identity)
    return NextResponse.json(
      { error: "Sign in to choose a Discussion category." },
      { status: 401, headers }
    );
  const owner = request.nextUrl.searchParams.get("owner") ?? "";
  const repo = request.nextUrl.searchParams.get("repo") ?? "";
  const parsed = parseRepoInput(`${owner}/${repo}`);
  if (!parsed || parsed.owner !== owner || parsed.repo !== repo)
    return NextResponse.json({ error: "Choose a valid repository." }, { status: 400, headers });
  try {
    await new GitHubService(identity.accessToken).getTrafficViews(owner, repo);
    return NextResponse.json(
      { categories: await discussionCategories(owner, repo, identity.accessToken) },
      { headers }
    );
  } catch {
    return NextResponse.json(
      {
        error:
          "Could not load Discussion categories. Confirm this repository supports Discussions.",
      },
      { status: 502, headers }
    );
  }
}
