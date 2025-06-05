"use client";

import { useState, useEffect } from "react";
import { Repository } from "@/lib/github";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, GitFork, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface RepositorySelectorProps {
  onRepositorySelect: (repo: Repository) => void;
}

export default function RepositorySelector({
  onRepositorySelect,
}: RepositorySelectorProps) {
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
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-red-500">Erreur: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">
          ℹ️ Information importante
        </h3>
        <p className="text-sm text-blue-800">
          Les données de trafic GitHub ne sont disponibles que pour les dépôts
          dont vous êtes propriétaire ou pour lesquels vous avez un accès push.
          Les dépôts marqués &ldquo;Données disponibles&rdquo; devraient fonctionner, les
          autres sont en &ldquo;Lecture seule&rdquo;.
        </p>
      </div>
      <h2 className="text-2xl font-bold mb-4">Sélectionnez un dépôt</h2>
      {repositories.map((repo) => (
        <Card
          key={repo.id}
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onRepositorySelect(repo)}
        >
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage
                    src={repo.owner.avatar_url}
                    alt={repo.owner.login}
                  />
                  <AvatarFallback>
                    {repo.owner.login[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{repo.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {repo.owner.login}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {repo.private && <Badge variant="secondary">Privé</Badge>}
                {repo.permissions?.admin || repo.permissions?.push ? (
                  <Badge
                    variant="default"
                    className="bg-green-100 text-green-800"
                  >
                    Données disponibles
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-yellow-600 border-yellow-600"
                  >
                    Lecture seule
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {repo.description && (
              <p className="text-sm text-muted-foreground mb-3">
                {repo.description}
              </p>
            )}
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4" />
                <span>{repo.stargazers_count}</span>
              </div>
              <div className="flex items-center space-x-1">
                <GitFork className="h-4 w-4" />
                <span>{repo.forks_count}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {repo.updated_at
                    ? `Mis à jour ${formatDistanceToNow(
                        new Date(repo.updated_at),
                        { addSuffix: true, locale: fr }
                      )}`
                    : "Date inconnue"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
