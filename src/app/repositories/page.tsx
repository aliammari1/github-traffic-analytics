"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Repository } from "@/lib/github";
import { GitBranch, Star, Eye, ArrowLeft, ExternalLink, Calendar, GitFork } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

/**
 * Render a repositories dashboard showing stats, filters, and a list of GitHub repositories for the authenticated user.
 *
 * The component redirects unauthenticated users to the root route, fetches repository data for the signed-in session,
 * and displays summary statistics, filter controls, and repository cards (including privacy, traffic access, and metadata).
 *
 * @returns A React element containing the repositories dashboard. Returns `null` if there is no active session and shows a loading indicator while repository data is being fetched.
 */
export default function RepositoriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "owned" | "accessible">("all");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchRepositories();
    }
  }, [session]);

  const fetchRepositories = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/repositories");
      if (!response.ok) throw new Error("Failed to fetch repositories");
      const data = await response.json();
      setRepositories(data);
    } catch (error) {
      console.error("Error fetching repositories:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRepos = repositories.filter((repo) => {
    if (filter === "owned") return repo.owner.login === session?.user?.name;
    if (filter === "accessible") return repo.permissions?.admin || repo.permissions?.push;
    return true;
  });

  const totalStars = repositories.reduce((acc, r) => acc + r.stargazers_count, 0);
  const totalForks = repositories.reduce((acc, r) => acc + r.forks_count, 0);
  const accessibleCount = repositories.filter(
    (r) => r.permissions?.admin || r.permissions?.push
  ).length;

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading repositories...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <span className="font-semibold">Repositories</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{session.user?.name}</span>
            {session.user?.image && (
              <img src={session.user.image} alt="" className="w-8 h-8 rounded-full" />
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 opacity-0 animate-fade-in">
          <div className="p-4 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Repositories</span>
              <GitBranch className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{repositories.length}</div>
          </div>
          <div className="p-4 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Stars</span>
              <Star className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{totalStars.toLocaleString()}</div>
          </div>
          <div className="p-4 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Forks</span>
              <GitFork className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{totalForks.toLocaleString()}</div>
          </div>
          <div className="p-4 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Traffic Access</span>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{accessibleCount}</div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 opacity-0 animate-fade-in-up animation-delay-100">
          <span className="text-sm text-muted-foreground mr-2">Filter:</span>
          {(["all", "owned", "accessible"] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
              className="capitalize"
            >
              {f === "accessible" ? "Traffic Available" : f}
            </Button>
          ))}
        </div>

        {/* Repository List */}
        <div className="space-y-2 opacity-0 animate-fade-in-up animation-delay-200">
          {filteredRepos.length === 0 ? (
            <div className="p-8 text-center border border-border rounded-lg">
              <GitBranch className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No repositories found</p>
            </div>
          ) : (
            filteredRepos.map((repo) => (
              <div
                key={repo.id}
                className="p-4 rounded-lg border border-border hover:border-foreground/20 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <a
                        href={`https://github.com/${repo.full_name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium hover:underline flex items-center gap-1"
                      >
                        {repo.name}
                        <ExternalLink className="h-3 w-3 opacity-50" />
                      </a>
                      {repo.private && (
                        <Badge variant="secondary" className="text-xs">
                          Private
                        </Badge>
                      )}
                      {(repo.permissions?.admin || repo.permissions?.push) && (
                        <Badge variant="outline" className="text-xs">
                          Traffic Available
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{repo.owner.login}</p>
                    {repo.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                        {repo.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {repo.language && <span>{repo.language}</span>}
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {repo.stargazers_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitFork className="h-3 w-3" />
                        {repo.forks_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {repo.updated_at
                          ? formatDistanceToNow(new Date(repo.updated_at), {
                              addSuffix: true,
                            })
                          : "Unknown"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}