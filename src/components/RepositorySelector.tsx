"use client";

import { useState, useEffect } from "react";
import { Repository } from "@/lib/github";
import { Badge } from "@/components/ui/badge";
import { Star, GitFork, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface RepositorySelectorProps {
  onRepositorySelect: (repo: Repository) => void;
}

/**
 * Renders a repository selector UI that fetches and displays repositories, allowing the user to pick one.
 *
 * Fetches repositories from "/api/repositories" on mount, shows a loading skeleton while fetching,
 * displays an error message on failure, and renders a list of repository items when successful.
 * Each repository row shows basic metadata (owner, name, description, stars, forks, last updated)
 * and badges for privacy and traffic access.
 *
 * @param onRepositorySelect - Called with the selected `Repository` when a repository row is clicked
 * @returns The rendered repository selector UI
 */
export default function RepositorySelector({ onRepositorySelect }: RepositorySelectorProps) {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRepositories();
  }, []);

  const fetchRepositories = async () => {
    try {
      const response = await fetch("/api/repositories");
      if (!response.ok) {
        throw new Error("Failed to fetch repositories");
      }
      const data = await response.json();
      setRepositories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 rounded-lg border border-border animate-pulse">
            <div className="h-4 bg-secondary rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-secondary rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-lg border border-border text-center">
        <p className="text-muted-foreground">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-lg border border-border bg-secondary/30">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Note:</span> Traffic data is only available
          for repositories you own or have push access to.
        </p>
      </div>

      <div className="space-y-2">
        {repositories.map((repo) => (
          <div
            key={repo.id}
            className="group p-4 rounded-lg border border-border hover:border-foreground/20 hover:bg-secondary/50 cursor-pointer transition-all duration-200"
            onClick={() => onRepositorySelect(repo)}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary overflow-hidden flex-shrink-0">
                  <img
                    src={repo.owner.avatar_url}
                    alt={repo.owner.login}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium group-hover:underline">{repo.name}</h3>
                  <p className="text-sm text-muted-foreground">{repo.owner.login}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {repo.private && (
                  <Badge variant="secondary" className="text-xs">
                    Private
                  </Badge>
                )}
                {repo.permissions?.admin || repo.permissions?.push ? (
                  <Badge variant="outline" className="text-xs border-foreground/20">
                    Traffic Available
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    Read Only
                  </Badge>
                )}
              </div>
            </div>

            {repo.description && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{repo.description}</p>
            )}

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5" />
                <span>{repo.stargazers_count}</span>
              </div>
              <div className="flex items-center gap-1">
                <GitFork className="h-3.5 w-3.5" />
                <span>{repo.forks_count}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  {repo.updated_at
                    ? formatDistanceToNow(new Date(repo.updated_at), { addSuffix: true })
                    : "Unknown"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}