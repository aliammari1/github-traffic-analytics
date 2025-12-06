"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { Repository } from "@/lib/github";
import RepositorySelector from "@/components/RepositorySelector";
import TrafficDashboard from "@/components/TrafficDashboard";
import { Button } from "@/components/ui/button";
import { Github, TrendingUp, Eye, GitFork, ArrowRight, BarChart3, Zap, Lock } from "lucide-react";

export default function HomePage() {
  const { data: session, status } = useSession();
  const [selectedRepository, setSelectedRepository] = useState<Repository | null>(null);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              <span className="font-semibold">GitHub Traffic Analytics</span>
            </div>
            <Button onClick={() => signIn("github")} variant="outline" size="sm" className="gap-2">
              <Github className="h-4 w-4" />
              Sign in
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/50 bg-secondary/50 text-sm text-muted-foreground mb-8 opacity-0 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              Now tracking repository analytics
            </div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 opacity-0 animate-fade-in-up animation-delay-100">
              Understand your
              <br />
              <span className="text-muted-foreground">GitHub traffic</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 opacity-0 animate-fade-in-up animation-delay-200">
              Track views, clones, and referrers for your repositories. Get insights into how
              developers discover and interact with your projects.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 animate-fade-in-up animation-delay-300">
              <Button onClick={() => signIn("github")} size="lg" className="gap-2 px-8">
                <Github className="h-5 w-5" />
                Continue with GitHub
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6 border-t border-border/50">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 rounded-lg border border-border/50 bg-card/50 opacity-0 animate-fade-in-up animation-delay-100">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mb-4">
                  <Eye className="h-5 w-5" />
                </div>
                <h3 className="font-semibold mb-2">View Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  Track page views and unique visitors to your repositories over time.
                </p>
              </div>

              <div className="p-6 rounded-lg border border-border/50 bg-card/50 opacity-0 animate-fade-in-up animation-delay-200">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mb-4">
                  <GitFork className="h-5 w-5" />
                </div>
                <h3 className="font-semibold mb-2">Clone Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  Monitor how often your repositories are cloned by developers.
                </p>
              </div>

              <div className="p-6 rounded-lg border border-border/50 bg-card/50 opacity-0 animate-fade-in-up animation-delay-300">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mb-4">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <h3 className="font-semibold mb-2">Traffic Sources</h3>
                <p className="text-sm text-muted-foreground">
                  Discover where your traffic comes from and which pages are most popular.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 px-6 border-t border-border/50">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">Built for developers</h2>
                <p className="text-muted-foreground mb-6">
                  GitHub Traffic Analytics provides a clean, simple interface to understand how your
                  open source projects are being discovered and used.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                      <Zap className="h-4 w-4" />
                    </div>
                    <span className="text-sm">Real-time traffic data</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                      <Lock className="h-4 w-4" />
                    </div>
                    <span className="text-sm">Secure OAuth authentication</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                      <BarChart3 className="h-4 w-4" />
                    </div>
                    <span className="text-sm">Beautiful visualizations</span>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-border/50 bg-card p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Views (14 days)</span>
                    <span className="font-mono font-semibold">12,847</span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Unique visitors</span>
                    <span className="font-mono font-semibold">3,291</span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Clones</span>
                    <span className="font-mono font-semibold">847</span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Top referrer</span>
                    <span className="font-mono text-sm">github.com</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-6 border-t border-border/50">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BarChart3 className="h-4 w-4" />
              <span>GitHub Traffic Analytics</span>
            </div>
            <p className="text-sm text-muted-foreground">Built with Next.js</p>
          </div>
        </footer>
      </div>
    );
  }

  // Logged in state
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            <span className="font-semibold">GitHub Traffic Analytics</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {session.user?.name || session.user?.email}
            </span>
            <div className="w-8 h-8 rounded-full bg-secondary overflow-hidden">
              {session.user?.image ? (
                <img src={session.user.image} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs">
                  {session.user?.name?.[0] || "U"}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {selectedRepository ? (
          <TrafficDashboard
            repository={selectedRepository}
            onBack={() => setSelectedRepository(null)}
          />
        ) : (
          <div className="space-y-8">
            <div className="opacity-0 animate-fade-in">
              <h1 className="text-2xl font-bold mb-2">Your Repositories</h1>
              <p className="text-muted-foreground">
                Select a repository to view its traffic analytics
              </p>
            </div>

            <div className="opacity-0 animate-fade-in-up animation-delay-100">
              <RepositorySelector onRepositorySelect={setSelectedRepository} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
