// SPDX-License-Identifier: MIT
"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  ExternalLink,
  Rocket,
  Star,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LaunchReportShare from "@/components/LaunchReportShare";
import StarHistoryChart from "@/components/StarHistoryChart";
import { calculateReleaseImpact } from "@/lib/analytics";
import type { PublicRepoAnalysis } from "@/lib/github-public";

type Props = {
  params: Promise<{ owner: string; repo: string }>;
  searchParams: Promise<{ tag?: string }>;
};

export default function LaunchReportPage({ params, searchParams }: Props) {
  const { owner, repo } = use(params);
  const { tag } = use(searchParams);
  const [analysis, setAnalysis] = useState<PublicRepoAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let current = true;
    setLoading(true);
    setError(null);

    fetch(`/api/public/repo?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`)
      .then(async (response) => {
        if (response.status === 404) throw new Error("Repository not found or is private.");
        if (response.status === 429)
          throw new Error("GitHub API rate limit reached. Try again shortly.");
        if (!response.ok) throw new Error("Failed to load repository growth data.");
        return (await response.json()) as PublicRepoAnalysis;
      })
      .then((data) => {
        if (current) setAnalysis(data);
      })
      .catch((cause) => {
        if (current) {
          setError(cause instanceof Error ? cause.message : "Failed to load launch report.");
        }
      })
      .finally(() => {
        if (current) setLoading(false);
      });

    return () => {
      current = false;
    };
  }, [owner, repo]);

  const releasesWithImpact = useMemo(() => {
    if (!analysis) return [];
    return analysis.releases.map((release) => ({
      release,
      impact: calculateReleaseImpact(analysis.starHistory, release),
    }));
  }, [analysis]);

  const selected = useMemo(() => {
    if (releasesWithImpact.length === 0) return null;
    if (tag) {
      return releasesWithImpact.find(({ release }) => release.tagName === tag) ?? null;
    }
    return releasesWithImpact.find(({ impact }) => impact !== null) ?? releasesWithImpact[0];
  }, [releasesWithImpact, tag]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background px-6 py-20 text-foreground">
        <div
          className="mx-auto max-w-5xl space-y-5"
          role="status"
          aria-label="Loading launch report"
        >
          <div className="h-6 w-48 animate-pulse rounded bg-secondary" />
          <div className="h-28 animate-pulse rounded-xl bg-secondary/60" />
          <div className="grid gap-4 md:grid-cols-3">
            <div className="h-32 animate-pulse rounded-xl bg-secondary/50" />
            <div className="h-32 animate-pulse rounded-xl bg-secondary/50" />
            <div className="h-32 animate-pulse rounded-xl bg-secondary/50" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !analysis) {
    return (
      <main className="min-h-screen bg-background px-6 py-20 text-foreground">
        <div className="mx-auto max-w-xl rounded-xl border border-border bg-card p-8 text-center space-y-4">
          <Rocket className="mx-auto h-8 w-8 text-muted-foreground" />
          <h1 className="text-xl font-bold">Launch report unavailable</h1>
          <p className="text-sm text-muted-foreground">
            {error ?? "Repository data is unavailable."}
          </p>
          <Button asChild variant="outline">
            <Link href="/">Analyze another repository</Link>
          </Button>
        </div>
      </main>
    );
  }

  const meta = analysis.repository;

  if (analysis.releases.length === 0) {
    return (
      <main className="min-h-screen bg-background px-6 py-16 text-foreground">
        <div className="mx-auto max-w-3xl space-y-6">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/repo/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`}>
              <ArrowLeft className="h-4 w-4" /> Back to repository report
            </Link>
          </Button>
          <Card>
            <CardContent className="py-12 text-center space-y-3">
              <Rocket className="mx-auto h-9 w-9 text-muted-foreground" />
              <h1 className="text-xl font-bold">No public releases found</h1>
              <p className="text-sm text-muted-foreground">
                {meta.fullName} does not currently expose a recent GitHub release that can be
                analyzed.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  if (!selected) {
    return (
      <main className="min-h-screen bg-background px-6 py-16 text-foreground">
        <div className="mx-auto max-w-3xl space-y-6">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/repo/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`}>
              <ArrowLeft className="h-4 w-4" /> Back to repository report
            </Link>
          </Button>
          <Card>
            <CardContent className="py-12 text-center space-y-3">
              <Rocket className="mx-auto h-9 w-9 text-muted-foreground" />
              <h1 className="text-xl font-bold">Release not available in recent history</h1>
              <p className="text-sm text-muted-foreground">
                The requested release is not among the recent GitHub releases currently loaded for
                this public report.
              </p>
              <Button asChild variant="outline">
                <Link href={`/launch/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`}>
                  Open latest launch report
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  const { release, impact } = selected;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60 bg-background/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/repo/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`}>
              <ArrowLeft className="h-4 w-4" /> Repository report
            </Link>
          </Button>
          <Badge variant="outline" className="gap-1.5">
            <Rocket className="h-3.5 w-3.5" />
            Public launch report
          </Badge>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
        <section className="space-y-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <p className="font-mono text-sm text-muted-foreground">{meta.fullName}</p>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                  {release.tagName}
                </h1>
                {release.isPrerelease && <Badge variant="secondary">Pre-release</Badge>}
              </div>
              <p className="max-w-2xl text-sm text-muted-foreground">
                A deterministic comparison of GitHub star velocity in the 14 days before and after
                this release. The report describes temporal association, not causation.
              </p>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                Published {format(parseISO(release.publishedAt), "MMMM d, yyyy")}
              </p>
            </div>

            <div className="flex flex-col items-start gap-2 lg:items-end">
              <LaunchReportShare owner={owner} repo={repo} tag={release.tagName} />
              <Button asChild variant="outline" size="sm">
                <a href={release.htmlUrl} target="_blank" rel="noopener noreferrer">
                  View release on GitHub <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
            </div>
          </div>
        </section>

        {impact ? (
          <>
            <section className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>14 days before</CardDescription>
                  <CardTitle className="text-3xl">+{impact.beforeStars.toLocaleString()}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  ~{impact.beforeDailyVelocity} stars/day
                </CardContent>
              </Card>

              <Card className="border-emerald-500/30">
                <CardHeader className="pb-2">
                  <CardDescription>14 days after</CardDescription>
                  <CardTitle className="text-3xl text-emerald-400">
                    +{impact.afterStars.toLocaleString()}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  ~{impact.afterDailyVelocity} stars/day
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Velocity change</CardDescription>
                  <CardTitle className="flex items-center gap-2 text-3xl">
                    {impact.velocityChangePercent !== null && impact.velocityChangePercent >= 0 ? (
                      <TrendingUp className="h-6 w-6 text-cyan-400" />
                    ) : (
                      <TrendingDown className="h-6 w-6 text-rose-400" />
                    )}
                    {impact.velocityChangePercent === null
                      ? "N/A"
                      : `${impact.velocityChangePercent >= 0 ? "+" : ""}${impact.velocityChangePercent}%`}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  post-release vs pre-release daily star velocity
                </CardContent>
              </Card>
            </section>

            <Card className="border-cyan-500/20 bg-cyan-500/[0.03]">
              <CardHeader>
                <CardTitle className="text-base">What changed around the launch?</CardTitle>
                <CardDescription>
                  Deterministic interpretation of the comparison window
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-lg font-semibold">{impact.associationLabel}</p>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline">Before: {impact.beforeDailyVelocity}/day</Badge>
                  <ArrowRight className="h-4 w-4 self-center" />
                  <Badge variant="outline">After: {impact.afterDailyVelocity}/day</Badge>
                  <Badge variant="outline">Window: {impact.windowDays} days each side</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Releases and star growth can move together for many reasons. This report does not
                  claim that the release caused the observed change.
                </p>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="py-10 text-center space-y-2">
              <Star className="mx-auto h-8 w-8 text-muted-foreground" />
              <h2 className="font-semibold">The full comparison window is not available yet</h2>
              <p className="text-sm text-muted-foreground">
                A launch report needs continuous star observations for 14 days before and 14 days
                after the release.
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Star trajectory around {release.tagName}</CardTitle>
            <CardDescription>
              Recent public GitHub star history with the selected release marked on the timeline.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StarHistoryChart data={analysis.starHistory} releases={[release]} />
          </CardContent>
        </Card>

        {releasesWithImpact.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Other recent releases</CardTitle>
              <CardDescription>
                Open another public launch window for {meta.fullName}.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {releasesWithImpact
                .filter(
                  ({ release: candidate, impact: candidateImpact }) =>
                    candidate.id !== release.id && candidateImpact !== null
                )
                .map(({ release: candidate }) => (
                  <Button key={candidate.id} asChild variant="outline" size="sm">
                    <Link
                      href={`/launch/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}?tag=${encodeURIComponent(candidate.tagName)}`}
                    >
                      {candidate.tagName}
                    </Link>
                  </Button>
                ))}
            </CardContent>
          </Card>
        )}

        <div className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
          <p>
            Want private traffic context too? Repository owners can sign in to preserve GitHub
            views, clones, referrers, and popular paths beyond GitHub&apos;s 14-day traffic window.
          </p>
        </div>
      </main>
    </div>
  );
}
