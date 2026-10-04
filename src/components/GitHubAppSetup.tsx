// SPDX-License-Identifier: MIT
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

interface InstallationState {
  available: boolean;
  installUrl: string | null;
  repositories: Array<{ fullName: string; installationId: number }>;
}

export default function GitHubAppSetup({ installationId }: { installationId: string | null }) {
  const { status } = useSession();
  const [state, setState] = useState<InstallationState | null>(null);
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (status !== "authenticated") return;
    let active = true;
    setLoading(true);
    fetch(
      `/api/github-app/installations${installationId ? `?installation_id=${encodeURIComponent(installationId)}` : ""}`
    )
      .then(async (response) => {
        const value = await response.json();
        if (!response.ok) throw new Error(value.error || "Could not load App tracking.");
        if (active) setState(value as InstallationState);
      })
      .catch((cause) => {
        if (active)
          setError(cause instanceof Error ? cause.message : "Could not load App tracking.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [installationId, status]);

  async function connect() {
    if (!installationId) return;
    setConnecting(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/github-app/installations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ installationId }),
      });
      const value = await response.json();
      if (!response.ok) throw new Error(value.error || "Could not connect this installation.");
      setMessage(
        `${value.connected} ${value.connected === 1 ? "repository is" : "repositories are"} now tracked.${value.unavailable ? ` ${value.unavailable} selected repositories do not grant your account traffic access.` : ""}`
      );
      const refreshed = await fetch(
        `/api/github-app/installations?installation_id=${encodeURIComponent(installationId)}`
      );
      if (refreshed.ok) setState((await refreshed.json()) as InstallationState);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not connect this installation.");
    } finally {
      setConnecting(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        GitHub integration
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">Automatic traffic tracking</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Install the GitHub App, choose repositories on GitHub, and daily traffic capture starts for
        the installing account. The App uses short-lived, repository-scoped tokens for scheduled
        collection.
      </p>
      {status === "loading" && (
        <p className="mt-8 text-sm text-muted-foreground">Checking sign-in…</p>
      )}
      {status === "unauthenticated" && (
        <div className="mt-8">
          <Button onClick={() => signIn("github", { callbackUrl: window.location.href })}>
            Sign in with GitHub
          </Button>
        </div>
      )}
      {status === "authenticated" && (
        <div className="mt-8 space-y-6">
          {loading && (
            <p className="text-sm text-muted-foreground">Loading selected repositories…</p>
          )}
          {state && !state.available && (
            <p className="text-sm text-muted-foreground">
              GitHub App setup is not configured on this deployment yet.
            </p>
          )}
          {state?.installUrl && (
            <Button asChild>
              <a href={state.installUrl}>Install or update GitHub App</a>
            </Button>
          )}
          {installationId && state?.available && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="font-semibold">Finish linking this installation</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                GitHub sent an installation reference. We will verify both the App selection and
                your own traffic access before adding any repositories to your account.
              </p>
              <Button className="mt-4" disabled={connecting} onClick={connect}>
                {connecting ? "Checking repositories…" : "Connect selected repositories"}
              </Button>
            </div>
          )}
          <section aria-labelledby="tracked-repos-title">
            <h2 id="tracked-repos-title" className="text-lg font-semibold">
              Repositories tracked through the App
            </h2>
            {state?.repositories.length ? (
              <ul className="mt-3 divide-y divide-border rounded-xl border border-border">
                {state.repositories.map((repo) => (
                  <li key={`${repo.installationId}:${repo.fullName}`} className="px-4 py-3">
                    <Link
                      href={`/repo/${repo.fullName.split("/").map(encodeURIComponent).join("/")}`}
                      className="text-sm font-medium underline-offset-4 hover:underline"
                    >
                      {repo.fullName}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              !loading && (
                <p className="mt-3 text-sm text-muted-foreground">
                  No App-tracked repositories yet.
                </p>
              )
            )}
          </section>
        </div>
      )}
      {error && (
        <p role="alert" className="mt-5 text-sm text-destructive">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="mt-5 text-sm text-muted-foreground">
          {message}
        </p>
      )}
    </main>
  );
}
