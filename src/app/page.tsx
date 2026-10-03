// SPDX-License-Identifier: MIT
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { Repository } from "@/lib/github";
import { parseRepoInput } from "@/lib/analytics";
import RepositorySelector from "@/components/RepositorySelector";
import TrafficDashboard from "@/components/TrafficDashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, ArrowRight, BarChart3, Search, Star, Clock, Sparkles } from "lucide-react";
import { Github } from "lucide-brands";

const EXAMPLE_REPOS = ["facebook/react", "vercel/next.js", "astral-sh/ruff"];

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [inputVal, setInputVal] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [selectedRepository, setSelectedRepository] = useState<Repository | null>(null);

  const handleAnalyze = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setInputError(null);

    const parsed = parseRepoInput(inputVal);
    if (!parsed) {
      setInputError(
        "Please enter a valid repository format (e.g. vercel/next.js or https://github.com/vercel/next.js)."
      );
      return;
    }

    router.push(`/repo/${encodeURIComponent(parsed.owner)}/${encodeURIComponent(parsed.repo)}`);
  };

  const handleSelectExample = (repoStr: string) => {
    setInputVal(repoStr);
    setInputError(null);
    const parsed = parseRepoInput(repoStr);
    if (parsed) {
      router.push(`/repo/${encodeURIComponent(parsed.owner)}/${encodeURIComponent(parsed.repo)}`);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  // Authenticated State
  if (session) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2 font-semibold">
                <BarChart3 className="h-5 w-5 text-cyan-400" />
                <span>GitHub Traffic Analytics</span>
              </Link>
              <nav className="hidden md:flex items-center gap-4 text-sm">
                <Link
                  href="/traffic"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Overview
                </Link>
                <Link
                  href="/repositories"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Repositories
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {session.user?.name || session.user?.email}
              </span>
              <div className="w-8 h-8 rounded-full bg-secondary overflow-hidden">
                {session.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "User avatar"}
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs">
                    {session.user?.name?.[0] || "U"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
          {/* Quick Public Analyzer Bar for Signed-in Users */}
          <Card className="border-border/60 bg-card/40">
            <CardContent className="pt-6">
              <form onSubmit={handleAnalyze} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    value={inputVal}
                    onChange={(e) => {
                      setInputVal(e.target.value);
                      if (inputError) setInputError(null);
                    }}
                    placeholder="Analyze any public repo (e.g. vercel/next.js or URL)…"
                    className="pl-10 h-10"
                    aria-label="Repository input"
                  />
                </div>
                <Button type="submit" size="default" className="gap-2 shrink-0">
                  <BarChart3 className="h-4 w-4" />
                  Analyze
                </Button>
              </form>
              {inputError && (
                <p className="text-xs text-destructive mt-2" role="alert">
                  {inputError}
                </p>
              )}
            </CardContent>
          </Card>

          {/* 14-day limit retention onboarding banner */}
          <div className="rounded-lg border border-amber-500/20 bg-amber-950/10 p-4 flex items-start gap-3">
            <Clock className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground">
                GitHub only keeps traffic data for 14 days.
              </p>
              <p className="text-muted-foreground text-xs mt-0.5">
                Enable historical tracking on your repositories below so daily snapshots accumulate
                permanently in Cloudflare D1.
              </p>
            </div>
          </div>

          {selectedRepository ? (
            <TrafficDashboard
              repository={selectedRepository}
              onBack={() => setSelectedRepository(null)}
            />
          ) : (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight mb-1">Your Repositories</h1>
                <p className="text-sm text-muted-foreground">
                  Select a repository to view its 14-day traffic dashboard or click Analyze on any
                  repo.
                </p>
              </div>

              <RepositorySelector onRepositorySelect={setSelectedRepository} />
            </div>
          )}
        </main>
      </div>
    );
  }

  // Unauthenticated / Public Product State
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <BarChart3 className="h-5 w-5 text-cyan-400" />
            <span>GitHub Traffic Analytics</span>
          </div>
          <Button onClick={() => signIn("github")} variant="outline" size="sm" className="gap-2">
            <Github className="h-4 w-4" />
            Sign in
          </Button>
        </div>
      </header>

      {/* Hero Section: Analyze Any Repository */}
      <main className="flex-1">
        <section className="pt-24 pb-16 px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/60 bg-secondary/50 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>Public growth intelligence · No authentication required</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Understand why a GitHub repository is growing.
            </h1>

            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Track long-term repository growth, preserve traffic GitHub deletes after 14 days, and
              understand what changed.
            </p>

            {/* Analysis Input Box */}
            <div className="pt-4 max-w-xl mx-auto">
              <form onSubmit={handleAnalyze} className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    value={inputVal}
                    onChange={(e) => {
                      setInputVal(e.target.value);
                      if (inputError) setInputError(null);
                    }}
                    placeholder="Analyze a repository (e.g. vercel/next.js)…"
                    className="pl-10 h-11 text-sm bg-card border-border"
                    aria-label="GitHub repository name or URL"
                  />
                </div>
                <Button type="submit" size="default" className="h-11 px-6 gap-2 shrink-0">
                  <BarChart3 className="h-4 w-4" />
                  Analyze
                </Button>
              </form>

              {inputError && (
                <p className="text-xs text-destructive text-left mt-2" role="alert">
                  {inputError}
                </p>
              )}

              {/* Clickable Examples */}
              <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground flex-wrap">
                <span>Examples:</span>
                {EXAMPLE_REPOS.map((ex) => (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => handleSelectExample(ex)}
                    className="underline hover:text-foreground transition-colors font-mono cursor-pointer"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Value Proposition Cards */}
        <section className="py-16 px-6 border-t border-border/50 bg-secondary/10">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-border/60 bg-card/60">
              <CardContent className="pt-6 space-y-2">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4">
                  <Clock className="h-5 w-5" />
                </div>
                <h2 className="font-semibold text-base">Beat the 14-Day Limit</h2>
                <p className="text-sm text-muted-foreground">
                  GitHub deletes your traffic history after 14 days. Our daily automated Cron Worker
                  writes views and clones into Cloudflare D1 so your history lasts indefinitely.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/60">
              <CardContent className="pt-6 space-y-2">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                  <Star className="h-5 w-5" />
                </div>
                <h2 className="font-semibold text-base">Star History & Velocity</h2>
                <p className="text-sm text-muted-foreground">
                  View full community trajectories, calculated weekly run-rates, and release event
                  milestones across any public repository.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/60">
              <CardContent className="pt-6 space-y-2">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <h2 className="font-semibold text-base">Growth Intelligence</h2>
                <p className="text-sm text-muted-foreground">
                  Deterministic analytics calculate percentage changes, moving baselines, and
                  traffic anomalies before AI explains what changed.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Owner CTA Section */}
        <section className="py-16 px-6 border-t border-border/50">
          <div className="max-w-3xl mx-auto rounded-xl border border-border bg-card p-8 md:p-10 text-center space-y-6">
            <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary">
              <Github className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">
                Own this repository? Unlock private traffic analytics
              </h2>
              <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                Connecting your GitHub account unlocks private traffic metrics, referral sources,
                popular content paths, and long-term retention snapshots.
              </p>
            </div>

            <div className="flex justify-center">
              <Button onClick={() => signIn("github")} size="lg" className="gap-2">
                <Github className="h-4 w-4" />
                Continue with GitHub
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 text-center text-xs text-muted-foreground">
        <p>
          GitHub Traffic Analytics · Open source under MIT · Preserving open-source growth history
        </p>
      </footer>
    </div>
  );
}
