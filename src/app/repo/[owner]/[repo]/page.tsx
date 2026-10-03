// SPDX-License-Identifier: MIT
"use client";

import { use, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { format, parseISO } from "date-fns";
import {
  Star,
  GitFork,
  ArrowLeft,
  ExternalLink,
  Tag,
  TrendingUp,
  Eye,
  Lock,
  Sparkles,
  BarChart3,
  Calendar,
  Rocket,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { Github } from "lucide-brands";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StarHistoryChart from "@/components/StarHistoryChart";
import ShareActions from "@/components/ShareActions";
import HistoricalTraffic from "@/components/HistoricalTraffic";
import InsightsPanel from "@/components/InsightsPanel";
import type { PublicRepoAnalysis } from "@/lib/github-public";
import { calculateReleaseImpact } from "@/lib/analytics";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type TabKey =
  "overview" | "traffic" | "acquisition" | "content" | "stars" | "releases" | "insights";

interface PrivateTrafficData {
  views: {
    count: number;
    uniques: number;
    views: Array<{ timestamp: string; count: number; uniques: number }>;
  };
  clones: {
    count: number;
    uniques: number;
    clones: Array<{ timestamp: string; count: number; uniques: number }>;
  };
  referrers: Array<{ referrer: string; count: number; uniques: number }>;
  paths: Array<{ path: string; title: string; count: number; uniques: number }>;
}

export default function RepositoryAnalyticsPage({
  params,
}: {
  params: Promise<{ owner: string; repo: string }>;
}) {
  const { owner, repo } = use(params);
  const { data: session } = useSession();

  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [analysis, setAnalysis] = useState<PublicRepoAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);

  // Private traffic state (unlocked if user has permissions)
  const [privateTraffic, setPrivateTraffic] = useState<PrivateTrafficData | null>(null);
  const [hasPrivateAccess, setHasPrivateAccess] = useState(false);
  const [privateLoading, setPrivateLoading] = useState(false);
  const [mountTime] = useState(() => Date.now());

  const starHistory = useMemo(() => analysis?.starHistory ?? [], [analysis]);
  const releases = useMemo(() => analysis?.releases ?? [], [analysis]);

  const releaseImpacts = useMemo(() => {
    return releases.map((rel) => ({
      release: rel,
      impact: calculateReleaseImpact(starHistory, rel),
    }));
  }, [releases, starHistory]);

  // 1. Fetch public analysis with cancellation flag to prevent race conditions
  useEffect(() => {
    let isCurrent = true;
    setLoading(true);
    setError(null);
    setIsRateLimited(false);

    fetch(`/api/public/repo?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`)
      .then(async (res) => {
        if (!isCurrent) return;
        if (res.status === 404) {
          throw new Error("Repository not found or is private.");
        }
        if (res.status === 429) {
          setIsRateLimited(true);
          throw new Error("GitHub API rate limit exceeded for unauthenticated requests.");
        }
        if (!res.ok) {
          throw new Error("Failed to fetch repository analysis.");
        }

        const data: PublicRepoAnalysis = await res.json();
        if (isCurrent) {
          setAnalysis(data);
        }
      })
      .catch((err) => {
        if (isCurrent) {
          setError(err instanceof Error ? err.message : "An unexpected error occurred.");
        }
      })
      .finally(() => {
        if (isCurrent) {
          setLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [owner, repo]);

  // 2. Fetch private traffic with cancellation flag
  useEffect(() => {
    let isCurrent = true;
    if (!session) {
      setHasPrivateAccess(false);
      setPrivateTraffic(null);
      setPrivateLoading(false);
      return;
    }

    setPrivateLoading(true);
    fetch(`/api/traffic?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`)
      .then(async (res) => {
        if (!isCurrent) return;
        if (res.ok) {
          const data: PrivateTrafficData = await res.json();
          if (isCurrent) {
            setPrivateTraffic(data);
            setHasPrivateAccess(true);
          }
        } else if (isCurrent) {
          setHasPrivateAccess(false);
          setPrivateTraffic(null);
        }
      })
      .catch(() => {
        if (isCurrent) {
          setHasPrivateAccess(false);
          setPrivateTraffic(null);
        }
      })
      .finally(() => {
        if (isCurrent) {
          setPrivateLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [owner, repo, session]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">
            Analyzing {owner}/{repo}…
          </p>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-background text-foreground py-16 px-6">
        <div className="max-w-2xl mx-auto space-y-6 text-center">
          <div className="inline-flex p-4 rounded-full bg-destructive/10 text-destructive mb-2">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isRateLimited ? "GitHub API Limit Reached" : "Analysis Unavailable"}
          </h1>
          <p className="text-muted-foreground">{error}</p>

          {isRateLimited ? (
            <div className="rounded-lg border border-border bg-card p-6 text-left space-y-4">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Github className="h-4 w-4" /> Why did this happen?
              </h2>
              <p className="text-sm text-muted-foreground">
                This deployment has temporarily reached GitHub&apos;s API quota for repository
                analysis. Please try again shortly or explore another repository.
              </p>
              <Button asChild variant="outline" className="w-full gap-2">
                <Link href="/" className="gap-2">
                  <ArrowLeft className="h-4 w-4" /> Try another repository
                </Link>
              </Button>
            </div>
          ) : (
            <div className="flex justify-center gap-4">
              <Button asChild variant="outline">
                <Link href="/" className="gap-2">
                  <ArrowLeft className="h-4 w-4" /> Try another repository
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const { repository: meta, starVelocity, highlights } = analysis;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Navigation Bar */}
      <header className="border-b border-border/80 sticky top-0 z-30 bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Button asChild variant="ghost" size="icon" className="shrink-0">
              <Link href="/" aria-label="Back to home">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex items-center gap-2 min-w-0">
              <Image
                src={meta.owner.avatarUrl}
                alt={meta.owner.login}
                width={28}
                height={28}
                className="w-7 h-7 rounded-full shrink-0 border border-border"
                unoptimized
              />
              <span className="font-semibold truncate text-base">{meta.fullName}</span>
              <Badge variant="outline" className="text-xs shrink-0 hidden sm:inline-flex">
                Public Repo
              </Badge>
              {hasPrivateAccess && (
                <Badge
                  variant="secondary"
                  className="text-xs shrink-0 text-emerald-400 border-emerald-500/30 gap-1 flex items-center"
                >
                  <ShieldCheck className="h-3 w-3" /> Owner Unlocked
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
              <a href={meta.htmlUrl} target="_blank" rel="noopener noreferrer">
                <span>View on GitHub</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Overview Header */}
      <div className="border-b border-border/60 bg-muted/20 py-8 px-6">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">{meta.name}</h1>
              <p className="text-sm text-muted-foreground max-w-2xl">
                {meta.description || "No description provided."}
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                <div>
                  <div className="text-lg font-bold">{meta.starsCount.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">stars</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <GitFork className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-lg font-bold">{meta.forksCount.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">forks</div>
                </div>
              </div>

              {meta.language && (
                <div className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-lg font-bold">{meta.language}</div>
                    <div className="text-xs text-muted-foreground">language</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="rounded-lg border border-border/60 bg-card p-3">
              <span className="text-xs text-muted-foreground">7-Day Star Velocity</span>
              <div className="text-lg font-bold text-amber-400 flex items-center gap-1.5 mt-0.5">
                <TrendingUp className="h-4 w-4" />+{starVelocity.growth7d} stars
              </div>
              <span className="text-xs text-muted-foreground">
                ~{starVelocity.dailyVelocity}/day run-rate
              </span>
            </div>

            <div className="rounded-lg border border-border/60 bg-card p-3">
              <span className="text-xs text-muted-foreground">30-Day Growth</span>
              <div className="text-lg font-bold text-foreground mt-0.5">
                +{starVelocity.growth30d} stars
              </div>
              <span className="text-xs text-muted-foreground">past month trajectory</span>
            </div>

            <div className="rounded-lg border border-border/60 bg-card p-3">
              <span className="text-xs text-muted-foreground">Weekly Run-Rate</span>
              <div className="text-lg font-bold text-cyan-400 mt-0.5">
                ~{starVelocity.weeklyVelocity} / wk
              </div>
              <span className="text-xs text-muted-foreground">projected velocity</span>
            </div>

            <div className="rounded-lg border border-border/60 bg-card p-3">
              <span className="text-xs text-muted-foreground">Latest Release</span>
              <div className="text-lg font-bold text-foreground truncate mt-0.5">
                {releases[0]?.tagName || "None"}
              </div>
              <span className="text-xs text-muted-foreground">
                {releases[0]
                  ? `on ${format(parseISO(releases[0].publishedAt), "MMM d, yyyy")}`
                  : "No tags published"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border/80 sticky top-16 z-20 bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-6 overflow-x-auto" aria-label="Tabs" role="tablist">
            {[
              { key: "overview", label: "Overview", icon: BarChart3, isPrivate: false },
              { key: "traffic", label: "Traffic", icon: Eye, isPrivate: true },
              { key: "acquisition", label: "Acquisition", icon: TrendingUp, isPrivate: true },
              { key: "content", label: "Content", icon: Tag, isPrivate: true },
              { key: "stars", label: "Star History", icon: Star, isPrivate: false },
              { key: "releases", label: "Releases", icon: Calendar, isPrivate: false },
              { key: "insights", label: "AI Insights", icon: Sparkles, isPrivate: true },
            ].map(({ key, label, icon: Icon, isPrivate }) => {
              const isActive = activeTab === key;
              return (
                <button
                  key={key}
                  id={`tab-${key}`}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`panel-${key}`}
                  onClick={() => setActiveTab(key as TabKey)}
                  className={`flex items-center gap-2 py-4 px-2 border-b-2 text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                  {isPrivate && !hasPrivateAccess && (
                    <Lock className="h-3 w-3 text-muted-foreground/60" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content Area - All panels mounted for WAI-ARIA compliance */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* OVERVIEW TAB */}
        <div
          role="tabpanel"
          id="panel-overview"
          aria-labelledby="tab-overview"
          hidden={activeTab !== "overview"}
          className={activeTab === "overview" ? "space-y-8" : "hidden"}
        >
          {/* What Changed Highlight Card */}
          <Card className="border-cyan-500/20 bg-gradient-to-r from-cyan-950/20 via-background to-background">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-cyan-400">
                <Sparkles className="h-5 w-5" /> What Changed & Growth Highlights
              </CardTitle>
              <CardDescription>
                Deterministic growth signals computed directly from repository telemetry
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span className="text-foreground/90">{h}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <ShareActions owner={owner} repo={repo} currentStars={analysis.repository.starsCount} />

          {/* Public Star Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Community Trajectory</CardTitle>
              <CardDescription>
                Recent star growth timeline with annotated major release milestones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StarHistoryChart data={starHistory} releases={releases} />
            </CardContent>
          </Card>

          {/* If owner has unlocked private access, show quick traffic overview */}
          {hasPrivateAccess && privateTraffic ? (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Eye className="h-5 w-5 text-emerald-400" /> Private Traffic Snapshot (Last 14 Days)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs text-muted-foreground">14-Day Views</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {privateTraffic.views.count.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {privateTraffic.views.uniques.toLocaleString()} unique visitors
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs text-muted-foreground">14-Day Clones</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {privateTraffic.clones.count.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {privateTraffic.clones.uniques.toLocaleString()} unique cloners
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs text-muted-foreground">Top Referrer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-semibold truncate">
                      {privateTraffic.referrers[0]?.referrer || "None"}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(privateTraffic.referrers[0]?.count ?? 0).toLocaleString()} views
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs text-muted-foreground">Top Content</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-semibold truncate">
                      {privateTraffic.paths[0]?.path || "None"}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(privateTraffic.paths[0]?.count ?? 0).toLocaleString()} views
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            /* Owner unlock CTA */
            <Card className="border-border/80 bg-secondary/20">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  Own this repository? Unlock private traffic analytics
                </CardTitle>
                <CardDescription>
                  GitHub only provides traffic data for the last 14 days and requires repository
                  push or admin permissions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                    <span>14-day views & clones</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                    <span>Top referral channels</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                    <span>Daily D1 historical snapshots</span>
                  </div>
                </div>

                {!session ? (
                  <Button asChild className="gap-2">
                    <Link href="/api/auth/signin">
                      <Github className="h-4 w-4" /> Sign in with GitHub to unlock
                    </Link>
                  </Button>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Signed in as <strong>{session.user?.name}</strong>. If you have push permissions
                    for this repo, refresh or verify your OAuth scopes.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* TRAFFIC TAB */}
        <div
          role="tabpanel"
          id="panel-traffic"
          aria-labelledby="tab-traffic"
          hidden={activeTab !== "traffic"}
          className={activeTab === "traffic" ? "space-y-8" : "hidden"}
        >
          {hasPrivateAccess && privateTraffic ? (
            <div className="space-y-8">
              {/* 14-day Views & Clones Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Views Over Time (14 Days)</CardTitle>
                    <CardDescription>Daily page views and unique visitors</CardDescription>
                  </CardHeader>
                  <CardContent className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={privateTraffic.views.views.map((v) => ({
                          date: format(parseISO(v.timestamp), "MMM d"),
                          views: v.count,
                          uniques: v.uniques,
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#262626" opacity={0.5} />
                        <XAxis dataKey="date" stroke="#737373" fontSize={11} tickLine={false} />
                        <YAxis stroke="#737373" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#171717",
                            borderColor: "#404040",
                            borderRadius: "0.5rem",
                            fontSize: "12px",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="views"
                          stroke="#06b6d4"
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="uniques"
                          stroke="#3b82f6"
                          strokeWidth={1.5}
                          strokeDasharray="4 4"
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Clones Over Time (14 Days)</CardTitle>
                    <CardDescription>Git clone volume and unique cloners</CardDescription>
                  </CardHeader>
                  <CardContent className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={privateTraffic.clones.clones.map((c) => ({
                          date: format(parseISO(c.timestamp), "MMM d"),
                          clones: c.count,
                          uniques: c.uniques,
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#262626" opacity={0.5} />
                        <XAxis dataKey="date" stroke="#737373" fontSize={11} tickLine={false} />
                        <YAxis stroke="#737373" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#171717",
                            borderColor: "#404040",
                            borderRadius: "0.5rem",
                            fontSize: "12px",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="clones"
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Long-term D1 Historical Traffic */}
              {activeTab === "traffic" && <HistoricalTraffic owner={owner} repo={repo} />}
            </div>
          ) : (
            <PrivateUnlockCard
              session={session}
              featureName="traffic analytics"
              isLoading={privateLoading}
            />
          )}
        </div>

        {/* ACQUISITION TAB */}
        <div
          role="tabpanel"
          id="panel-acquisition"
          aria-labelledby="tab-acquisition"
          hidden={activeTab !== "acquisition"}
          className={activeTab === "acquisition" ? "space-y-6" : "hidden"}
        >
          {hasPrivateAccess && privateTraffic ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Referral Sources</CardTitle>
                <CardDescription>
                  Domains and platforms directing traffic to your repository
                </CardDescription>
              </CardHeader>
              <CardContent>
                {privateTraffic.referrers.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">
                    No referrer data recorded yet.
                  </p>
                ) : (
                  <div className="divide-y divide-border">
                    {privateTraffic.referrers.map((ref, idx) => (
                      <div key={idx} className="py-3 flex items-center justify-between text-sm">
                        <span className="font-mono text-xs">{ref.referrer}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-muted-foreground text-xs">
                            {ref.uniques} unique visitors
                          </span>
                          <span className="font-semibold">{ref.count} views</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <PrivateUnlockCard
              session={session}
              featureName="referral sources"
              isLoading={privateLoading}
            />
          )}
        </div>

        {/* CONTENT TAB */}
        <div
          role="tabpanel"
          id="panel-content"
          aria-labelledby="tab-content"
          hidden={activeTab !== "content"}
          className={activeTab === "content" ? "space-y-6" : "hidden"}
        >
          {hasPrivateAccess && privateTraffic ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Popular Repository Content</CardTitle>
                <CardDescription>
                  Most viewed paths and files within your repository
                </CardDescription>
              </CardHeader>
              <CardContent>
                {privateTraffic.paths.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">
                    No content path data recorded yet.
                  </p>
                ) : (
                  <div className="divide-y divide-border">
                    {privateTraffic.paths.map((p, idx) => (
                      <div key={idx} className="py-3 flex items-center justify-between text-sm">
                        <div>
                          <p className="font-mono text-xs truncate max-w-md">{p.path}</p>
                          {p.title && p.title !== p.path && (
                            <p className="text-xs text-muted-foreground mt-0.5">{p.title}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <span className="text-muted-foreground text-xs">{p.uniques} unique</span>
                          <span className="font-semibold">{p.count} views</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <PrivateUnlockCard
              session={session}
              featureName="popular content metrics"
              isLoading={privateLoading}
            />
          )}
        </div>

        {/* STARS TAB */}
        <div
          role="tabpanel"
          id="panel-stars"
          aria-labelledby="tab-stars"
          hidden={activeTab !== "stars"}
          className={activeTab === "stars" ? "space-y-8" : "hidden"}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground">Current Stars</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {starVelocity.currentStars.toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground">7-Day Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-400">+{starVelocity.growth7d}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  ~{starVelocity.dailyVelocity} stars/day
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground">30-Day Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-400">+{starVelocity.growth30d}</div>
                <p className="text-xs text-muted-foreground mt-1">Past month trajectory</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground">Weekly Velocity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-cyan-400">
                  {starVelocity.weeklyVelocity} / wk
                </div>
                <p className="text-xs text-muted-foreground mt-1">Calculated run-rate</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Star Growth Trajectory</CardTitle>
              <CardDescription>
                Recent cumulative stargazer history from GitHub&apos;s public history data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StarHistoryChart data={starHistory} releases={releases} />
            </CardContent>
          </Card>
        </div>

        {/* RELEASES TAB */}
        <div
          role="tabpanel"
          id="panel-releases"
          aria-labelledby="tab-releases"
          hidden={activeTab !== "releases"}
          className={activeTab === "releases" ? "space-y-6" : "hidden"}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Release Timeline & Events</CardTitle>
              <CardDescription>
                Recent releases and milestones. Growth metrics reflect activity observed around
                launch windows.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {releases.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-sm">
                  No public releases detected for this repository.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {releaseImpacts.map(({ release: rel, impact }) => (
                    <div key={rel.id} className="py-5 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{rel.name}</span>
                            <Badge variant="outline" className="font-mono text-xs">
                              {rel.tagName}
                            </Badge>
                            {rel.isPrerelease && (
                              <Badge variant="secondary" className="text-xs">
                                Pre-release
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Published on {format(parseISO(rel.publishedAt), "MMMM d, yyyy")}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2 self-start sm:self-auto">
                          {impact && (
                            <Button asChild size="sm" className="gap-1.5 text-xs">
                              <Link
                                href={`/launch/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}?tag=${encodeURIComponent(rel.tagName)}`}
                              >
                                <Rocket className="h-3 w-3" />
                                Launch report
                              </Link>
                            </Button>
                          )}
                          <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
                            <a href={rel.htmlUrl} target="_blank" rel="noopener noreferrer">
                              <span>View on GitHub</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        </div>
                      </div>

                      {impact ? (
                        <div className="rounded-lg border border-border/70 bg-card p-4 space-y-3">
                          <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                            <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
                            14-Day Window Impact Analysis
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                            <div className="rounded border border-border/50 bg-secondary/20 p-2.5">
                              <span className="text-muted-foreground">14 Days Before</span>
                              <div className="text-sm font-semibold text-foreground mt-0.5">
                                +{impact.beforeStars.toLocaleString()} stars
                              </div>
                              <span className="text-[11px] text-muted-foreground">
                                ~{impact.beforeDailyVelocity}/day
                              </span>
                            </div>
                            <div className="rounded border border-border/50 bg-secondary/20 p-2.5">
                              <span className="text-muted-foreground">14 Days After</span>
                              <div className="text-sm font-semibold text-emerald-400 mt-0.5">
                                +{impact.afterStars.toLocaleString()} stars
                              </div>
                              <span className="text-[11px] text-muted-foreground">
                                ~{impact.afterDailyVelocity}/day
                              </span>
                            </div>
                            <div className="col-span-2 sm:col-span-1 rounded border border-border/50 bg-secondary/20 p-2.5">
                              <span className="text-muted-foreground">Star Velocity</span>
                              <div className="text-sm font-semibold text-cyan-400 mt-0.5">
                                {impact.velocityChangePercent !== null
                                  ? `${impact.velocityChangePercent >= 0 ? "+" : ""}${impact.velocityChangePercent}%`
                                  : "N/A"}
                              </div>
                              <span className="text-[11px] text-muted-foreground">
                                velocity delta
                              </span>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground bg-muted/30 rounded p-2 border border-border/40">
                            <span className="font-medium text-foreground">
                              {impact.associationLabel}
                            </span>
                            <span className="block text-[11px] text-muted-foreground/80 mt-0.5">
                              Observed temporal association around release window, not causal
                              attribution.
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground/80 bg-secondary/10 rounded p-2.5 border border-border/40">
                          14-day post-release observation window is either in progress (&lt;14 days
                          elapsed) or outside available continuous stargazer history.
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* INSIGHTS TAB */}
        <div
          role="tabpanel"
          id="panel-insights"
          aria-labelledby="tab-insights"
          hidden={activeTab !== "insights"}
          className={activeTab === "insights" ? "space-y-6" : "hidden"}
        >
          {hasPrivateAccess && privateTraffic ? (
            <InsightsPanel
              payload={{
                repoCount: 1,
                totalViews: privateTraffic.views.count,
                totalUniques: privateTraffic.views.uniques,
                totalClones: privateTraffic.clones.count,
                totalCloneUniques: privateTraffic.clones.uniques,
                totalStars: meta.starsCount,
                topReferrers: privateTraffic.referrers,
                topPaths: privateTraffic.paths,
                daily: privateTraffic.views.views.map((v) => ({
                  date: v.timestamp.slice(0, 10),
                  views: v.count,
                  uniques: v.uniques,
                })),
                context: {
                  repoName: meta.fullName,
                  currentStars: meta.starsCount,
                  stars7d: starVelocity.growth7d,
                  stars30d: starVelocity.growth30d,
                  weeklyVelocityChange:
                    starVelocity.growth30d > 0
                      ? Math.round(
                          ((starVelocity.growth7d - (starVelocity.growth30d * 7) / 30) /
                            Math.max(1, (starVelocity.growth30d * 7) / 30)) *
                            100
                        )
                      : null,
                  release: releases[0]
                    ? {
                        tag: releases[0].tagName,
                        name: releases[0].name,
                        daysAgo: Math.max(
                          0,
                          Math.floor(
                            (mountTime - new Date(releases[0].publishedAt).getTime()) / 86_400_000
                          )
                        ),
                      }
                    : null,
                },
              }}
            />
          ) : (
            <PrivateUnlockCard
              session={session}
              featureName="contextual AI growth insights"
              isLoading={privateLoading}
            />
          )}
        </div>
      </main>
    </div>
  );
}

function PrivateUnlockCard({
  session,
  featureName,
  isLoading,
}: {
  session: { user?: { name?: string | null } } | null;
  featureName: string;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <div
        role="status"
        aria-label="Loading repository telemetry"
        className="flex h-48 items-center justify-center"
      >
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="sr-only">Loading repository telemetry...</span>
      </div>
    );
  }

  return (
    <Card className="border-border bg-card/60 max-w-xl mx-auto text-center p-8 my-12">
      <div className="inline-flex p-3 rounded-full bg-secondary/50 text-muted-foreground mb-4">
        <Lock className="h-6 w-6" />
      </div>
      <CardTitle className="text-lg mb-2">Unlock Private {featureName}</CardTitle>
      <CardDescription className="mb-6 max-w-md mx-auto">
        Detailed traffic, referrer acquisition channels, and long-term retention snapshots require
        owner or collaborator access.
      </CardDescription>

      {!session ? (
        <Button asChild className="gap-2">
          <Link href="/api/auth/signin">
            <Github className="h-4 w-4" /> Sign in with GitHub to unlock
          </Link>
        </Button>
      ) : (
        <p className="text-xs text-muted-foreground">
          You are signed in as <strong>{session.user?.name}</strong>. If you own or maintain this
          repository, ensure your account has write/push permissions.
        </p>
      )}
    </Card>
  );
}
