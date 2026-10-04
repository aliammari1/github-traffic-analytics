// SPDX-License-Identifier: MIT
import { Action, ActionPanel, Detail } from "@raycast/api";
import { useEffect, useState } from "react";
import { display, Growth, History, history, remember, summary } from "./api";

export default function Command({ arguments: args }: { arguments: { repository: string } }) {
  const [data, setData] = useState<{ growth: Growth; history: History }>();
  const [error, setError] = useState<string>();
  useEffect(() => {
    let active = true;
    Promise.all([summary(args.repository), history(args.repository)])
      .then(async ([growth, history]) => {
        if (!active) return;
        setData({ growth, history });
        await remember(growth.repository.fullName);
      })
      .catch((cause) => {
        if (active)
          setError(cause instanceof Error ? cause.message : "Unable to load star history");
      });
    return () => {
      active = false;
    };
  }, [args.repository]);
  if (error) return <Detail markdown={`# Star history unavailable\n\n${error}`} />;
  if (!data) return <Detail isLoading markdown="Loading observed stars…" />;
  const points = data.history.points.slice(-14);
  return (
    <Detail
      markdown={`# ${data.history.repository} star velocity\n\n**7-day growth:** ${display(data.growth.growth.stars7d)}  \n**30-day growth:** ${display(data.growth.growth.stars30d)}\n\n| Observed day | Stars |\n| --- | ---: |\n${points.map((point) => `| ${point.day} | ${display(point.stars)} |`).join("\n")}\n\n${data.history.note}`}
      actions={
        <ActionPanel>
          <Action.OpenInBrowser title="Open Repository Report" url={data.growth.repository.url} />
        </ActionPanel>
      }
    />
  );
}
