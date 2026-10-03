// SPDX-License-Identifier: MIT
"use client";

import { use, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { format } from "date-fns";
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
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { Github } from "lucide-brands";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StarHistoryChart from "@/components/StarHistoryChart";
import HistoricalTraffic from "@/components/HistoricalTraffic";
import InsightsPanel from "@/components/InsightsPanel";
import type { PublicRepoAnalysis } from "@/lib/github-public";
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

  // 1. Fetch public analysis
  const fetchPublicAnalysis = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setIsRateLimited(false);

      const res = await fetch(
        `/api/public/repo?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`
      );
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
      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }, [owner, repo]);

  // 2. Fetch private traffic if user is signed in
  const checkPrivateAccess = useCallback(async () => {
    if (!session) {
      setHasPrivateAccess(false);
      setPrivateTraffic(null);
      return;
    }

    try {
      setPrivateLoading(true);
      const res = await fetch(
        `/api/traffic?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`
      );
      if (res.ok) {
        const data: PrivateTrafficData = await res.json();
        setPrivateTraffic(data);
        setHasPrivateAccess(true);
      } else {
        setHasPrivateAccess(false);
        setPrivateTraffic(null);
      }
    } catch {
      setHasPrivateAccess(false);
    } finally {
      setPrivateLoading(false);
    }
  }, [owner, repo, session]);

  useEffect(() => {
    fetchPublicAnalysis();
  }, [fetchPublicAnalysis]);

  useEffect(() => {
    checkPrivateAccess();
  }, [checkPrivateAccess]);

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
                GitHub permits unauthenticated IP addresses 60 requests per hour. You can bypass
                this limit immediately by connecting your GitHub account.
              </p>
              <Button onClick={() => signIn("github")} className="w-full gap-2">
                <Github className="h-4 w-4" /> Connect GitHub
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

  const { repository: meta, starHistory, starVelocity, releases, highlights } = analysis;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Header */}
      <header className="border-b border-border/60 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Link>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2 font-medium text-sm">
              <span className="text-muted-foreground">{meta.owner.login}</span>
              <span className="text-muted-foreground">/</span>
              <span className="font-semibold text-foreground">{meta.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm" className="gap-1.5 text-xs">
              <a href={meta.htmlUrl} target="_blank" rel="noopener noreferrer">
                <Github className="h-3.5 w-3.5" />
                <span>GitHub</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
            {!session && (
              <Button
                onClick={() => signIn("github")}
                size="sm"
                variant="outline"
                className="gap-2 text-xs"
              >
                <Github className="h-3.5 w-3.5" />
                Sign in
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero / Repo Meta Banner */}
      <div className="border-b border-border bg-card/40 py-8 px-6">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{meta.fullName}</h1>
                {meta.license && (
                  <Badge variant="outline" className="text-xs">
                    {meta.license}
                  </Badge>
                )}
                {meta.language && (
                  <Badge variant="secondary" className="text-xs">
                    {meta.language}
                  </Badge>
                )}
                {hasPrivateAccess ? (
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs gap-1">
                    <ShieldCheck className="h-3 w-3" /> Owner Access Unlocked
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    Public Analysis
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground max-w-3xl">
                {meta.description || "No description provided for this repository."}
              </p>
            </div>

            {/* Quick Metrics Bar */}
            <div className="flex items-center gap-4 shrink-0">
              <div className="rounded-lg border border-border bg-background p-3 min-w-28 text-center">
                <div className="text-xs text-muted-foreground flex items-center justify-center gap-1 mb-1">
                  <Star className="h-3.5 w-3.5 text-amber-400" /> Stars
                </div>
                <div className="text-lg font-bold">{meta.starsCount.toLocaleString()}</div>
              </div>
              <div className="rounded-lg border border-border bg-background p-3 min-w-28 text-center">
                <div className="text-xs text-muted-foreground flex items-center justify-center gap-1 mb-1">
                  <TrendingUp className="h-3.5 w-3.5 text-cyan-400" /> Star Velocity
                </div>
                <div className="text-lg font-bold">+{starVelocity.weeklyVelocity}/wk</div>
              </div>
              <div className="rounded-lg border border-border bg-background p-3 min-w-28 text-center">
                <div className="text-xs text-muted-foreground flex items-center justify-center gap-1 mb-1">
                  <GitFork className="h-3.5 w-3.5" /> Forks
                </div>
                <div className="text-lg font-bold">{meta.forksCount.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <nav
            className="flex space-x-2 md:space-x-8 overflow-x-auto"
            role="tablist"
            aria-label="Repository sections"
          >
            {[
              { key: "overview", label: "Overview", icon: BarChart3 },
              { key: "traffic", label: "Traffic", icon: Eye, private: true },
              { key: "acquisition", label: "Acquisition", icon: TrendingUp, private: true },
              { key: "content", label: "Content", icon: ExternalLink, private: true },
              { key: "stars", label: "Stars", icon: Star },
              { key: "releases", label: "Releases", icon: Tag },
              { key: "insights", label: "Insights", icon: Sparkles, private: true },
            ].map(({ key, label, icon: Icon, private: isPrivate }) => {
              const isActive = activeTab === key;
              return (
                <button
                  key={key}
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

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-8" role="tabpanel" id="panel-overview">
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

            {/* Public Star Growth Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Community Trajectory</CardTitle>
                <CardDescription>
                  All-time star growth timeline with annotated major release milestones
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
                  <Eye className="h-5 w-5 text-emerald-400" /> Private Traffic Snapshot (Last 14
                  Days)
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
                        {privateTraffic.referrers[0]?.count.toLocaleString() ?? 0} views
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
                        {privateTraffic.paths[0]?.count.toLocaleString() ?? 0} views
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
                    <Button onClick={() => signIn("github")} className="gap-2">
                      <Github className="h-4 w-4" /> Sign in with GitHub to unlock
                    </Button>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Signed in as <strong>{session.user?.name}</strong>. If you have push
                      permissions for this repo, refresh or verify your OAuth scopes.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* TRAFFIC TAB */}
        {activeTab === "traffic" && (
          <div className="space-y-8" role="tabpanel" id="panel-traffic">
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
                            date: format(new Date(v.timestamp), "MMM d"),
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
                            date: format(new Date(c.timestamp), "MMM d"),
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
                <HistoricalTraffic owner={owner} repo={repo} />
              </div>
            ) : (
              <PrivateUnlockCard session={session} featureName="traffic analytics" />
            )}
          </div>
        )}

        {/* ACQUISITION TAB */}
        {activeTab === "acquisition" && (
          <div className="space-y-6" role="tabpanel" id="panel-acquisition">
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
              <PrivateUnlockCard session={session} featureName="referral sources" />
            )}
          </div>
        )}

        {/* CONTENT TAB */}
        {activeTab === "content" && (
          <div className="space-y-6" role="tabpanel" id="panel-content">
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
                            <span className="text-muted-foreground text-xs">
                              {p.uniques} unique
                            </span>
                            <span className="font-semibold">{p.count} views</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <PrivateUnlockCard session={session} featureName="popular content metrics" />
            )}
          </div>
        )}

        {/* STARS TAB */}
        {activeTab === "stars" && (
          <div className="space-y-8" role="tabpanel" id="panel-stars">
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
                  Cumulative stargazers mapped over repository lifespan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StarHistoryChart data={starHistory} releases={releases} />
              </CardContent>
            </Card>
          </div>
        )}

        {/* RELEASES TAB */}
        {activeTab === "releases" && (
          <div className="space-y-6" role="tabpanel" id="panel-releases">
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
                    {releases.map((rel) => (
                      <div
                        key={rel.id}
                        className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
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
                            Published on {format(new Date(rel.publishedAt), "MMMM d, yyyy")}
                          </p>
                        </div>
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="gap-1.5 text-xs shrink-0"
                        >
                          <a href={rel.htmlUrl} target="_blank" rel="noopener noreferrer">
                            <span>View Release</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* INSIGHTS TAB */}
        {activeTab === "insights" && (
          <div className="space-y-6" role="tabpanel" id="panel-insights">
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
                }}
              />
            ) : (
              <PrivateUnlockCard session={session} featureName="contextual AI growth insights" />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function PrivateUnlockCard({ session, featureName }: { session: any; featureName: string }) {
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
        <Button onClick={() => signIn("github")} className="gap-2">
          <Github className="h-4 w-4" /> Sign in with GitHub to unlock
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
