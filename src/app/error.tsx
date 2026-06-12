// SPDX-License-Identifier: MIT
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

/**
 * Route-segment error boundary (App Router). Catches render/runtime errors in
 * the page tree below `app/` and offers a recovery action instead of a blank
 * screen. Logged to the console here; the browser Sentry SDK is a Wave 2 add
 * (only @sentry/cloudflare — the Worker runtime — is wired today).
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error boundary caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h2 className="text-2xl font-semibold">Something went wrong</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        We couldn&apos;t load this view. This is usually transient — try again, and
        if it persists, please open an issue.
      </p>
      {error.digest && (
        <p className="text-xs text-muted-foreground/70">Error ref: {error.digest}</p>
      )}
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
