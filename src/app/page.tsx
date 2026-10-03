// SPDX-License-Identifier: MIT
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { parseRepoInput } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, ArrowRight, BarChart3, Search, Star, Clock, Sparkles } from "lucide-react";
import { Github } from "lucide-brands";

const EXAMPLE_REPOS = ["facebook/react", "vercel/next.js", "astral-sh/ruff"];

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [inputVal, setInputVal] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);

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

  // Public analysis is the first interaction for every visitor.
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <BarChart3 className="h-5 w-5 text-cyan-400" />
              <span>GitHub Traffic Analytics</span>
            </Link>
            <nav className="hidden md:flex items-center gap-4 text-sm">
              <Link href="/" className="text-foreground font-medium transition-colors">
                Explore
              </Link>
              <Link
                href="/compare"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Compare
              </Link>
              {session && (
                <Link
                  href="/repositories"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Repositories
                </Link>
              )}
            </nav>
          </div>
          {session ? (
            <Button asChild variant="outline" size="sm">
              <Link href="/repositories">My repositories</Link>
            </Button>
          ) : (
            <Button onClick={() => signIn("github")} variant="outline" size="sm" className="gap-2">
              <Github className="h-4 w-4" /> Sign in
            </Button>
          )}
        </div>
      </header>

      {/* Hero Section: Analyze Any Repository */}
      <main className="flex-1">
        <section className="pt-20 pb-12 px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/60 bg-secondary/50 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>Public growth intelligence · No authentication required</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Understand why GitHub repositories grow.
            </h1>

            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Explore star growth, releases, momentum and public repository trends. Repository
              owners can also preserve private traffic beyond GitHub&apos;s 14-day limit.
            </p>

            {/* Analysis Input Box */}
            <div className="pt-2 max-w-xl mx-auto">
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
                <span>Popular examples:</span>
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

        {/* Live Product Demonstration Preview */}
        <section className="pb-16 px-6">
          <div className="max-w-4xl mx-auto">
            <Card className="border-cyan-500/20 bg-gradient-to-b from-card/80 via-card/50 to-background shadow-xl">
              <CardContent className="p-6 md:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        Interactive Sample Preview
                      </span>
                      <span className="text-xs text-muted-foreground">vercel/next.js</span>
                    </div>
                    <h2 className="text-lg font-bold mt-1 text-foreground">
                      What Changed & Growth Highlights
                    </h2>
                  </div>
                  <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs shrink-0">
                    <Link href="/repo/vercel/next.js">
                      <span>View Live vercel/next.js Report</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>

                {/* Metric Summary Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg border border-border bg-secondary/30">
                    <span className="text-xs text-muted-foreground">Total Stars</span>
                    <div className="text-xl font-bold flex items-center gap-1 mt-0.5">
                      <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                      <span>125,000</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg border border-border bg-secondary/30">
                    <span className="text-xs text-muted-foreground">30-Day Growth</span>
                    <div className="text-xl font-bold text-foreground mt-0.5">+500</div>
                  </div>
                  <div className="p-3 rounded-lg border border-border bg-secondary/30">
                    <span className="text-xs text-muted-foreground">Weekly Velocity</span>
                    <div className="text-xl font-bold text-cyan-400 mt-0.5">~120 / wk</div>
                  </div>
                  <div className="p-3 rounded-lg border border-border bg-secondary/30">
                    <span className="text-xs text-muted-foreground">Latest Release</span>
                    <div className="text-sm font-semibold font-mono text-foreground mt-1 truncate">
                      v16.0.0
                    </div>
                  </div>
                </div>

                {/* Deterministic Insights Preview */}
                <div className="rounded-lg border border-border/80 bg-background/60 p-4 space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Deterministic Findings
                  </span>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-400 font-bold">•</span>
                      <span>
                        Added 500 stars over the last 30 days (~120 stars/week), reaching 125,000
                        total stars.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-400 font-bold">•</span>
                      <span>
                        Recent release v16.0.0 published on 2026-09-15; growth activity tracked
                        around this release.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-400 font-bold">•</span>
                      <span>
                        Historical persistence is not enabled yet for this repository; GitHub will
                        delete traffic data older than 14 days.
                      </span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
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
                  View recent community trajectories, calculated weekly run-rates, and release event
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
              {session ? (
                <Button asChild size="lg">
                  <Link href="/repositories">
                    Open my repositories <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button onClick={() => signIn("github")} size="lg" className="gap-2">
                  <Github className="h-4 w-4" /> Continue with GitHub{" "}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
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
