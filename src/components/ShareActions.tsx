// SPDX-License-Identifier: MIT
"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  GROWTH_CARD_STYLES,
  GROWTH_CARD_THEMES,
  type GrowthCardStyle,
  type GrowthCardTheme,
} from "@/lib/growth-card";
import { formatMilestone, getHighestMilestone } from "@/lib/milestone-card";

export default function ShareActions({
  owner,
  repo,
  currentStars,
}: {
  owner: string;
  repo: string;
  currentStars: number;
}) {
  const [theme, setTheme] = useState<GrowthCardTheme>("github-dark");
  const [style, setStyle] = useState<GrowthCardStyle>("default");
  const [feedback, setFeedback] = useState("");
  const path = `/repo/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
  const cardPath = `/api/card/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}?theme=${theme}&style=${style}`;
  const milestone = getHighestMilestone(currentStars);
  const milestonePath = milestone
    ? `/api/card/milestone/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}?milestone=${milestone}&theme=${theme}`
    : null;

  async function copy(value: string, message: string) {
    try {
      await navigator.clipboard.writeText(value);
      setFeedback(message);
    } catch {
      setFeedback("Clipboard unavailable. Copy the page URL from your browser.");
    }
  }

  async function share() {
    const url = `${window.location.origin}${path}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${owner}/${repo} star growth`, url });
        setFeedback("Report shared.");
      } catch {
        setFeedback("Share cancelled.");
      }
    } else {
      await copy(url, "Report link copied.");
    }
  }

  return (
    <section
      className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-4"
      aria-labelledby="share-title"
    >
      <div>
        <h2 id="share-title" className="font-semibold text-lg">
          Share this growth report
        </h2>
        <p className="text-sm text-muted-foreground">
          Add a live card to a README so readers can explore the public report.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={share}>
          Share
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => copy(`${window.location.origin}${path}`, "Report link copied.")}
        >
          Copy link
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            copy(
              `[![${owner}/${repo} growth](${window.location.origin}${cardPath})](${window.location.origin}${path})`,
              "Markdown card copied."
            )
          }
        >
          Copy Markdown card
        </Button>
        {milestone && milestonePath && (
          <Button asChild type="button" variant="outline">
            <a
              href={`/api/certificate/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}?milestone=${milestone}`}
              download
            >
              Download milestone certificate
            </a>
          </Button>
        )}
        {milestone && milestonePath && (
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              copy(
                `[![${owner}/${repo} ${formatMilestone(milestone)}+ stars milestone](${window.location.origin}${milestonePath})](${window.location.origin}${path})`,
                `${formatMilestone(milestone)}+ milestone card copied.`
              )
            }
          >
            Copy {formatMilestone(milestone)} milestone card
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-3">
        <label className="flex items-center gap-3 text-sm" htmlFor="card-style">
          Card style
          <select
            id="card-style"
            value={style}
            onChange={(event) => setStyle(event.target.value as GrowthCardStyle)}
            className="rounded-md border border-border bg-background px-3 py-2"
          >
            {GROWTH_CARD_STYLES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-3 text-sm" htmlFor="card-theme">
          Card theme
          <select
            id="card-theme"
            value={theme}
            onChange={(event) => setTheme(event.target.value as GrowthCardTheme)}
            className="rounded-md border border-border bg-background px-3 py-2"
          >
            {Object.keys(GROWTH_CARD_THEMES).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>
      <Image
        src={cardPath}
        alt={`Growth card for ${owner}/${repo}`}
        width={540}
        height={176}
        loading="eager"
        unoptimized
        className="w-full max-w-[540px] h-auto rounded-xl"
      />
      <p role="status" aria-live="polite" className="text-sm text-muted-foreground min-h-5">
        {feedback}
      </p>
    </section>
  );
}
