"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TrendingUp, Eye, GitBranch, Star, ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Repository } from "@/lib/github";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface AggregatedTraffic {
  totalViews: number;
  totalUniques: number;
  totalClones: number;
  totalCloneUniques: number;
  totalStars: number;
  repoCount: number;
  viewsData: Array<{ date: string; views: number; uniques: number }>;
}

export default function TrafficPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [trafficData, setTrafficData] = useState<AggregatedTraffic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch repositories
      const reposResponse = await fetch("/api/repositories");
      if (!reposResponse.ok) throw new Error("Failed to fetch repositories");
      const repos: Repository[] = await reposResponse.json();
      setRepositories(repos);

      // Aggregate traffic from accessible repos (limit to first 5 for performance)
      const accessibleRepos = repos
        .filter((r) => r.permissions?.admin || r.permissions?.push)
        .slice(0, 5);

      let totalViews = 0;
      let totalUniques = 0;
      let totalClones = 0;
      let totalCloneUniques = 0;
      const viewsMap: Record<string, { views: number; uniques: number }> = {};

      for (const repo of accessibleRepos) {
        try {
          const trafficResponse = await fetch(
            `/api/traffic?owner=${repo.owner.login}&repo=${repo.name}`
          );
          if (trafficResponse.ok) {
            const data = await trafficResponse.json();
            totalViews += data.views.count;
            totalUniques += data.views.uniques;
            totalClones += data.clones.count;
            totalCloneUniques += data.clones.uniques;

            // Aggregate daily views
            data.views.views?.forEach(
              (v: { timestamp: string; count: number; uniques: number }) => {
                const date = new Date(v.timestamp).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
                if (!viewsMap[date]) {
                  viewsMap[date] = { views: 0, uniques: 0 };
                }
                viewsMap[date].views += v.count;
                viewsMap[date].uniques += v.uniques;
              }
            );
          }
        } catch (e) {
          console.error(`Failed to fetch traffic for ${repo.name}`, e);
        }
      }

      const totalStars = repos.reduce((acc, r) => acc + r.stargazers_count, 0);

      setTrafficData({
        totalViews,
        totalUniques,
        totalClones,
        totalCloneUniques,
        totalStars,
        repoCount: repos.length,
        viewsData: Object.entries(viewsMap)
          .map(([date, data]) => ({ date, ...data }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading traffic data...</p>
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
            <span className="font-semibold">Traffic Analytics</span>
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
        <div className="opacity-0 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">Traffic Overview</h1>
          <p className="text-muted-foreground">
            Aggregated traffic data across your {repositories.length} repositories.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 opacity-0 animate-fade-in-up animation-delay-100">
          <div className="p-6 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">Total Views</span>
              <Eye className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="text-3xl font-bold mb-1">
              {trafficData?.totalViews.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-muted-foreground">
              {trafficData?.totalUniques.toLocaleString() || "0"} unique visitors
            </p>
          </div>

          <div className="p-6 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">Total Clones</span>
              <Download className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="text-3xl font-bold mb-1">
              {trafficData?.totalClones.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-muted-foreground">
              {trafficData?.totalCloneUniques.toLocaleString() || "0"} unique cloners
            </p>
          </div>

          <div className="p-6 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">Repositories</span>
              <GitBranch className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="text-3xl font-bold mb-1">{trafficData?.repoCount || 0}</div>
            <p className="text-xs text-muted-foreground">Accessible repositories</p>
          </div>

          <div className="p-6 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">Total Stars</span>
              <Star className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="text-3xl font-bold mb-1">
              {trafficData?.totalStars.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-muted-foreground">Across all repositories</p>
          </div>
        </div>

        {/* Traffic Chart */}
        <div className="rounded-lg border border-border p-6 opacity-0 animate-fade-in-up animation-delay-200">
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-1">Traffic Trends</h2>
            <p className="text-sm text-muted-foreground">Views over the last 14 days</p>
          </div>
          {trafficData?.viewsData && trafficData.viewsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trafficData.viewsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="date" stroke="#737373" fontSize={12} />
                <YAxis stroke="#737373" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0a0a0a",
                    border: "1px solid #262626",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#fafafa" }}
                />
                <Line
                  type="monotone"
                  dataKey="views"
                  stroke="#fafafa"
                  strokeWidth={2}
                  dot={false}
                  name="Views"
                />
                <Line
                  type="monotone"
                  dataKey="uniques"
                  stroke="#737373"
                  strokeWidth={2}
                  dot={false}
                  name="Unique visitors"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center border border-dashed border-border rounded-lg">
              <div className="text-center text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No traffic data available</p>
                <p className="text-sm">Traffic data updates within 24 hours</p>
              </div>
            </div>
          )}
        </div>

        {/* Top Repositories */}
        <div className="rounded-lg border border-border overflow-hidden opacity-0 animate-fade-in-up animation-delay-300">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold">Top Repositories by Stars</h2>
          </div>
          <div className="divide-y divide-border">
            {repositories
              .sort((a, b) => b.stargazers_count - a.stargazers_count)
              .slice(0, 5)
              .map((repo) => (
                <div key={repo.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary overflow-hidden">
                      <img src={repo.owner.avatar_url} alt="" className="w-full h-full" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{repo.name}</p>
                      <p className="text-xs text-muted-foreground">{repo.owner.login}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      {repo.stargazers_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitBranch className="h-3 w-3" />
                      {repo.forks_count}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </main>
    </div>
  );
}
