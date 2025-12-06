"use client";

import { useState, useEffect, useCallback } from "react";
import { Repository } from "@/lib/github";
import { Button } from "@/components/ui/button";
import { Eye, Download, ExternalLink, ArrowLeft, Star } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { format } from "date-fns";

interface TrafficData {
  views: {
    count: number;
    uniques: number;
    views: Array<{
      timestamp: string;
      count: number;
      uniques: number;
    }>;
  };
  clones: {
    count: number;
    uniques: number;
    clones: Array<{
      timestamp: string;
      count: number;
      uniques: number;
    }>;
  };
  referrers: Array<{
    referrer: string;
    count: number;
    uniques: number;
  }>;
  paths: Array<{
    path: string;
    title: string;
    count: number;
    uniques: number;
  }>;
}

interface TrafficDashboardProps {
  repository: Repository;
  onBack: () => void;
}

export default function TrafficDashboard({ repository, onBack }: TrafficDashboardProps) {
  const [trafficData, setTrafficData] = useState<TrafficData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrafficData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `/api/traffic?owner=${repository.owner.login}&repo=${repository.name}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch traffic data");
      }
      const data = await response.json();
      setTrafficData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [repository.owner.login, repository.name]);

  useEffect(() => {
    fetchTrafficData();
  }, [fetchTrafficData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !trafficData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        <div className="rounded-lg border border-border p-8 text-center">
          <p className="text-muted-foreground mb-4">{error || "Unable to load traffic data"}</p>
          {error?.includes("denied") || error?.includes("403") ? (
            <p className="text-sm text-muted-foreground mb-4">
              Traffic data is only available for repositories you own or have push access to.
            </p>
          ) : null}
          <Button variant="outline" onClick={fetchTrafficData}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const chartData = trafficData.views.views.map((view) => ({
    date: format(new Date(view.timestamp), "MMM d"),
    views: view.count,
    visitors: view.uniques,
  }));

  const cloneChartData = trafficData.clones.clones.map((clone) => ({
    date: format(new Date(clone.timestamp), "MMM d"),
    clones: clone.count,
    unique: clone.uniques,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{repository.name}</h1>
            <p className="text-sm text-muted-foreground">{repository.owner.login}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" asChild>
          <a
            href={`https://github.com/${repository.full_name}`}
            target="_blank"
            rel="noopener noreferrer"
            className="gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            View on GitHub
          </a>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="p-4 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Views</span>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{trafficData.views.count.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {trafficData.views.uniques} unique visitors
          </p>
        </div>

        <div className="p-4 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Clones</span>
            <Download className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{trafficData.clones.count.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {trafficData.clones.uniques} unique cloners
          </p>
        </div>

        <div className="p-4 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Stars</span>
            <Star className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{repository.stargazers_count.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">{repository.forks_count} forks</p>
        </div>

        <div className="p-4 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Referrers</span>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{trafficData.referrers.length}</div>
          <p className="text-xs text-muted-foreground mt-1">Traffic sources</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="p-6 rounded-lg border border-border">
          <div className="mb-4">
            <h3 className="font-semibold">Views over time</h3>
            <p className="text-sm text-muted-foreground">Last 14 days</p>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
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
                dataKey="visitors"
                stroke="#737373"
                strokeWidth={2}
                dot={false}
                name="Unique visitors"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="p-6 rounded-lg border border-border">
          <div className="mb-4">
            <h3 className="font-semibold">Clones over time</h3>
            <p className="text-sm text-muted-foreground">Last 14 days</p>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={cloneChartData}>
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
              <Bar dataKey="clones" fill="#fafafa" radius={[4, 4, 0, 0]} name="Clones" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold">Top Referrers</h3>
            <p className="text-sm text-muted-foreground">Traffic sources</p>
          </div>
          <div className="divide-y divide-border">
            {trafficData.referrers.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                No referrer data available
              </div>
            ) : (
              trafficData.referrers.slice(0, 5).map((referrer, index) => (
                <div key={index} className="p-4 flex items-center justify-between">
                  <span className="font-medium text-sm">{referrer.referrer || "Direct"}</span>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{referrer.count} views</span>
                    <span>{referrer.uniques} unique</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-lg border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold">Popular Pages</h3>
            <p className="text-sm text-muted-foreground">Most visited content</p>
          </div>
          <div className="divide-y divide-border">
            {trafficData.paths.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                No page data available
              </div>
            ) : (
              trafficData.paths.slice(0, 5).map((path, index) => (
                <div key={index} className="p-4 flex items-center justify-between">
                  <span className="font-medium text-sm truncate max-w-[200px]" title={path.path}>
                    {path.path}
                  </span>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{path.count} views</span>
                    <span>{path.uniques} unique</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
