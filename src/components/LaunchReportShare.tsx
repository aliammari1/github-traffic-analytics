// SPDX-License-Identifier: MIT
"use client";

import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LaunchReportShare({
  owner,
  repo,
  tag,
}: {
  owner: string;
  repo: string;
  tag: string;
}) {
  const [feedback, setFeedback] = useState("");

  function reportUrl() {
    const url = new URL(
      `/launch/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
      window.location.origin
    );
    url.searchParams.set("tag", tag);
    return url.toString();
  }

  async function copy(value: string, message: string) {
    try {
      await navigator.clipboard.writeText(value);
      setFeedback(message);
    } catch {
      setFeedback("Clipboard unavailable. Copy the page URL from your browser.");
    }
  }

  async function share() {
    const url = reportUrl();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${owner}/${repo} ${tag} launch report`,
          text: `See the public GitHub growth window around ${tag}.`,
          url,
        });
        setFeedback("Launch report shared.");
        return;
      } catch {
        setFeedback("Share cancelled.");
        return;
      }
    }
    await copy(url, "Launch report link copied.");
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={share} className="gap-2">
          <Share2 className="h-4 w-4" />
          Share launch report
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => copy(reportUrl(), "Launch report link copied.")}
          className="gap-2"
        >
          <Copy className="h-4 w-4" />
          Copy link
        </Button>
      </div>
      <p role="status" aria-live="polite" className="min-h-5 text-xs text-muted-foreground">
        {feedback && (
          <span className="inline-flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5" />
            {feedback}
          </span>
        )}
      </p>
    </div>
  );
}
