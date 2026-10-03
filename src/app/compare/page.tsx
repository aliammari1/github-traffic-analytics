// SPDX-License-Identifier: MIT
"use client";

import { Suspense, useState, useEffect, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { format, parseISO } from "date-fns";
import {
  BarChart3,
  Search,
  Plus,
  X,
  Share2,
  ExternalLink,
  Sparkles,
  TrendingUp,
  Star,
  GitFork,
  ArrowLeft,
  Calendar,
  Layers,
  Check,
  Copy,
} from "lucide-react";
import { Github } from "lucide-brands";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  parseRepoInput,
  calculateRepoMomentum,
  compareStarPeriods,
  type RepoMomentum,
} from "@/lib/analytics";
import type { PublicRepoAnalysis } from "@/lib/github-public";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const PALETTE = ["#38bdf8", "#f59e0b", "#10b981", "#a855f7"];

const PRESETS = [
  {
    name: "Frameworks: Next.js vs Nuxt vs Svelte",
    repos: ["vercel/next.js", "nuxt/nuxt", "sveltejs/svelte"],
  },
  {
    name: "UI Libraries: React vs Vue vs Angular",
    repos: ["facebook/react", "vuejs/core", "angular/angular"],
  },
  {
    name: "Tooling: Ruff vs Biome",
    repos: ["astral-sh/ruff", "biomejs/biome"],
  },
];

interface RepoComparisonData {
  repoKey: string;
  owner: string;
  repo: string;
  analysis: PublicRepoAnalysis | null;
  error?: string;
  loading: boolean;
  momentum?: RepoMomentum;
  velocityChangePercent?: number | null;
}

function CompareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const reposParam = searchParams.get("repos") || "";
  const repoList = useMemo(() => {
    return reposParam
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 4);
  }, [reposParam]);

  const [inputVal, setInputVal] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [dataMap, setDataMap] = useState<Record<string, RepoComparisonData>>({});
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [cardCopyFeedback, setCardCopyFeedback] = useState<string | null>(null);
  const fetchedKeysRef = useRef<Set<string>>(new Set());

  const updateUrl = useCallback(
    (newRepos: string[]) => {
      const unique = Array.from(new Set(newRepos.slice(0, 4)));
      if (unique.length > 0) {
        router.push(`/compare?repos=${encodeURIComponent(unique.join(","))}`);
      } else {
        router.push("/compare");
      }
    },
    [router]
  );

  useEffect(() => {
    repoList.forEach((fullRepo) => {
      const parsed = parseRepoInput(fullRepo);
      if (!parsed) return;

      const key = `${parsed.owner}/${parsed.repo}`;
      if (fetchedKeysRef.current.has(key)) return;
      fetchedKeysRef.current.add(key);

      setDataMap((prev) => ({
        ...prev,
        [key]: {
          repoKey: key,
          owner: parsed.owner,
          repo: parsed.repo,
          analysis: prev[key]?.analysis ?? null,
          loading: true,
        },
      }));

      fetch(
        `/api/public/repo?owner=${encodeURIComponent(parsed.owner)}&repo=${encodeURIComponent(parsed.repo)}`
      )
        .then(async (res) => {
          if (!res.ok) {
            const errJson = await res.json().catch(() => ({}));
            throw new Error(errJson.error || `Failed to load ${key}`);
          }
          const analysis: PublicRepoAnalysis = await res.json();
          const momentum = calculateRepoMomentum({
            currentStars: analysis.repository.starsCount,
            growth7d: analysis.starVelocity.growth7d,
            growth30d: analysis.starVelocity.growth30d,
          });
          const velocityChangePercent = compareStarPeriods(analysis.starHistory, 7).changePercent;

          setDataMap((prev) => ({
            ...prev,
            [key]: {
              repoKey: key,
              owner: parsed.owner,
              repo: parsed.repo,
              analysis,
              loading: false,
              momentum,
              velocityChangePercent,
            },
          }));
        })
        .catch((err) => {
          fetchedKeysRef.current.delete(key);
          setDataMap((prev) => ({
            ...prev,
            [key]: {
              repoKey: key,
              owner: parsed.owner,
              repo: parsed.repo,
              analysis: null,
              loading: false,
              error: err instanceof Error ? err.message : "Error loading repository",
            },
          }));
        });
    });
  }, [repoList]);

  const handleAddRepo = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setInputError(null);

    const parsed = parseRepoInput(inputVal);
    if (!parsed) {
      setInputError("Enter a valid repository (e.g. vercel/next.js or GitHub URL)");
      return;
    }

    const key = `${parsed.owner}/${parsed.repo}`;
    if (repoList.includes(key)) {
      setInputError("Repository is already in comparison");
      return;
    }

    if (repoList.length >= 4) {
      setInputError("You can compare up to 4 repositories at once");
      return;
    }

    setInputVal("");
    updateUrl([...repoList, key]);
  };

  const handleRemoveRepo = (key: string) => {
    updateUrl(repoList.filter((r) => r !== key));
  };

  const handleCopyLink = () => {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopyFeedback("Comparison URL copied to clipboard!");
      setTimeout(() => setCopyFeedback(null), 3000);
    });
  };

  const handleCopyComparisonCard = () => {
    if (typeof window === "undefined" || repoList.length !== 2) return;
    const [left, right] = repoList;
    const cardUrl = `${window.location.origin}/api/card/compare?a=${encodeURIComponent(left)}&b=${encodeURIComponent(right)}`;
    const reportUrl = `${window.location.origin}/compare?repos=${encodeURIComponent(repoList.join(","))}`;
    const markdown = `[![${left} vs ${right} growth](${cardUrl})](${reportUrl})`;

    navigator.clipboard.writeText(markdown).then(() => {
      setCardCopyFeedback("README card copied!");
      setTimeout(() => setCardCopyFeedback(null), 3000);
    });
  };

  // Harmonize chart data across all loaded repos
  const chartData = useMemo(() => {
    const loaded = repoList
      .map((k) => dataMap[k])
      .filter((d): d is RepoComparisonData & { analysis: PublicRepoAnalysis } =>
        Boolean(d?.analysis)
      );

    if (loaded.length === 0) return [];

    const dateSet = new Set<string>();
    loaded.forEach((d) => {
      d.analysis.starHistory.forEach((p) => dateSet.add(p.date));
    });

    const sortedDates = Array.from(dateSet).sort();
    return sortedDates.map((date) => {
      const row: Record<string, string | number> = {
        date,
        displayDate: format(parseISO(date), "MMM d, yyyy"),
      };

      loaded.forEach((d) => {
        let stars = 0;
        for (const pt of d.analysis.starHistory) {
          if (pt.date <= date) stars = pt.stars;
          else break;
        }
        row[d.repoKey] = stars;
      });

      return row;
    });
  }, [repoList, dataMap]);

  const loadedRepos = repoList
    .map((k) => dataMap[k])
    .filter((d): d is RepoComparisonData & { analysis: PublicRepoAnalysis } =>
      Boolean(d?.analysis)
    );

  const maxStars = loadedRepos.reduce(
    (max, r) => Math.max(max, r.analysis.repository.starsCount),
    0
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navigation Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <BarChart3 className="h-5 w-5 text-cyan-400" />
              <span>GitHub Traffic Analytics</span>
            </Link>
            <nav className="hidden md:flex items-center gap-4 text-sm">
              <Link
                href="/"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Explore
              </Link>
              <Link href="/compare" className="text-foreground font-medium transition-colors">
                Compare
              </Link>
              {session && (
                <Link
                  href="/repositories"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  My Repositories
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {session ? (
              <Button asChild variant="outline" size="sm">
                <Link href="/repositories">My repositories</Link>
              </Button>
            ) : (
              <Button
                onClick={() => signIn("github")}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Github className="h-4 w-4" /> Sign in
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Title and Controls Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/60 bg-secondary/50 text-xs text-muted-foreground mb-2">
              <Layers className="h-3.5 w-3.5 text-cyan-400" />
              <span>Multi-Repository Intelligence</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Compare Repository Growth
            </h1>
            <p className="text-sm text-muted-foreground">
              Side-by-side public star velocity, release frequency, and momentum run-rates.
            </p>
          </div>

          {repoList.length > 0 && (
            <div className="flex items-center gap-2">
              {repoList.length === 2 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyComparisonCard}
                  className="gap-2 shrink-0"
                >
                  {cardCopyFeedback ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  <span>{cardCopyFeedback ?? "Copy README card"}</span>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="gap-2 shrink-0"
              >
                {copyFeedback ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Share2 className="h-4 w-4" />
                )}
                <span>{copyFeedback ?? "Share Comparison"}</span>
              </Button>
            </div>
          )}
        </div>

        {/* Input & Repo Selector Box */}
        <Card className="border-border bg-card/60">
          <CardContent className="pt-6 space-y-4">
            <form onSubmit={handleAddRepo} className="flex flex-col sm:flex-row gap-2 max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  value={inputVal}
                  onChange={(e) => {
                    setInputVal(e.target.value);
                    if (inputError) setInputError(null);
                  }}
                  placeholder="Add a repository to compare (e.g. sveltejs/svelte)…"
                  className="pl-10 h-10"
                  aria-label="Repository to compare"
                />
              </div>
              <Button
                type="submit"
                size="default"
                className="gap-2 shrink-0"
                disabled={repoList.length >= 4}
              >
                <Plus className="h-4 w-4" /> Add
              </Button>
            </form>

            {inputError && (
              <p className="text-xs text-destructive" role="alert">
                {inputError}
              </p>
            )}

            {/* Currently Active Chips */}
            {repoList.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-xs text-muted-foreground mr-1">Comparing:</span>
                {repoList.map((key, index) => {
                  const color = PALETTE[index % PALETTE.length];
                  return (
                    <div
                      key={key}
                      className="inline-flex items-center gap-2 pl-3 pr-2 py-1 rounded-full border border-border bg-secondary/40 text-xs font-mono"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className="font-semibold text-foreground">{key}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveRepo(key)}
                        aria-label={`Remove ${key}`}
                        className="p-0.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Presets */}
            {repoList.length === 0 && (
              <div className="space-y-2 pt-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Quick Example Comparisons:
                </p>
                <div className="flex flex-wrap gap-2">
                  {PRESETS.map((preset) => (
                    <Button
                      key={preset.name}
                      variant="outline"
                      size="sm"
                      onClick={() => updateUrl(preset.repos)}
                      className="text-xs"
                    >
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Empty State */}
        {repoList.length === 0 && (
          <div className="py-16 text-center border border-dashed border-border rounded-xl p-8 space-y-4">
            <div className="inline-flex p-3 rounded-full bg-secondary text-muted-foreground">
              <Layers className="h-8 w-8" />
            </div>
            <h2 className="text-lg font-semibold">No repositories selected for comparison</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Enter 2 to 4 GitHub repositories above or choose a preset to compare star growth
              trajectories and velocity run-rates side by side.
            </p>
          </div>
        )}

        {/* Comparative Metrics Grid */}
        {loadedRepos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {loadedRepos.map((item, index) => {
              const color = PALETTE[index % PALETTE.length];
              const isLeader =
                item.analysis.repository.starsCount === maxStars && loadedRepos.length > 1;

              return (
                <Card
                  key={item.repoKey}
                  className="border-border bg-card/70 flex flex-col justify-between"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: color }}
                          />
                          <Link
                            href={`/repo/${item.owner}/${item.repo}`}
                            className="font-bold text-sm hover:underline truncate"
                          >
                            {item.repoKey}
                          </Link>
                        </div>
                        {item.analysis.repository.language && (
                          <Badge variant="outline" className="text-xs">
                            {item.analysis.repository.language}
                          </Badge>
                        )}
                      </div>
                      {isLeader && (
                        <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs shrink-0">
                          Leader
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 text-xs">
                    {/* Stars */}
                    <div>
                      <span className="text-muted-foreground">Total Stars</span>
                      <div className="text-2xl font-bold flex items-center gap-1.5 mt-0.5">
                        <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                        <span>{item.analysis.repository.starsCount.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Velocity metrics */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
                      <div>
                        <span className="text-muted-foreground">7-Day Growth</span>
                        <div className="font-semibold text-emerald-400 mt-0.5">
                          +{item.analysis.starVelocity.growth7d.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">30-Day Growth</span>
                        <div className="font-semibold text-foreground mt-0.5">
                          +{item.analysis.starVelocity.growth30d.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
                      <div>
                        <span className="text-muted-foreground">Weekly Run-Rate</span>
                        <div className="font-semibold text-cyan-400 mt-0.5">
                          ~{item.analysis.starVelocity.weeklyVelocity}/wk
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Velocity Change</span>
                        <div className="font-semibold mt-0.5">
                          {item.velocityChangePercent !== null &&
                          item.velocityChangePercent !== undefined
                            ? `${item.velocityChangePercent >= 0 ? "↑" : "↓"} ${Math.abs(item.velocityChangePercent)}%`
                            : "N/A"}
                        </div>
                      </div>
                    </div>

                    {/* Latest Release */}
                    <div className="pt-2 border-t border-border/50">
                      <span className="text-muted-foreground">Latest Release</span>
                      <div className="font-mono text-foreground font-semibold mt-0.5 truncate">
                        {item.analysis.releases[0]?.tagName ?? "None recorded"}
                      </div>
                    </div>

                    {/* Momentum */}
                    {item.momentum && (
                      <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                        <span className="text-muted-foreground">Momentum Score</span>
                        <Badge
                          variant="outline"
                          className={
                            item.momentum.stage === "accelerating"
                              ? "text-emerald-400 border-emerald-500/30"
                              : item.momentum.stage === "cooling"
                                ? "text-rose-400 border-rose-500/30"
                                : "text-muted-foreground"
                          }
                        >
                          {item.momentum.score}/100 · {item.momentum.stage}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Multi-Series Growth Chart */}
        {loadedRepos.length > 0 && chartData.length > 0 && (
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">Cumulative Star Trajectory Comparison</CardTitle>
              <CardDescription>
                Chronological stargazer history plotted across comparison targets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" opacity={0.5} />
                    <XAxis
                      dataKey="date"
                      stroke="#737373"
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(val: string) => {
                        try {
                          return format(parseISO(val), "MMM yy");
                        } catch {
                          return val;
                        }
                      }}
                    />
                    <YAxis
                      stroke="#737373"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v: number) =>
                        v >= 1000 ? `${(v / 1000).toFixed(1).replace(/\.0$/, "")}k` : String(v)
                      }
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#171717",
                        borderColor: "#404040",
                        borderRadius: "0.5rem",
                        fontSize: "12px",
                      }}
                      labelFormatter={(label) => {
                        try {
                          return format(parseISO(String(label)), "MMMM d, yyyy");
                        } catch {
                          return String(label);
                        }
                      }}
                    />
                    <Legend />
                    {loadedRepos.map((item, index) => {
                      const color = PALETTE[index % PALETTE.length];
                      return (
                        <Line
                          key={item.repoKey}
                          type="monotone"
                          dataKey={item.repoKey}
                          name={item.repoKey}
                          stroke={color}
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 4 }}
                        />
                      );
                    })}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <CompareContent />
    </Suspense>
  );
}
