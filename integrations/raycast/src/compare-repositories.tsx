// SPDX-License-Identifier: MIT
import { Action, ActionPanel, Detail } from "@raycast/api";
import { useEffect, useState } from "react";
import { compare, Comparison, display, remember } from "./api";

export default function Command({
  arguments: args,
}: Readonly<{
  arguments: { first: string; second: string };
}>) {
  const [data, setData] = useState<Comparison>();
  const [error, setError] = useState<string>();
  useEffect(() => {
    let active = true;
    compare(args.first, args.second)
      .then(async (value) => {
        if (!active) return;
        setData(value);
        await Promise.all(value.repositories.map((item) => remember(item.repository.fullName)));
      })
      .catch((cause) => {
        if (active)
          setError(cause instanceof Error ? cause.message : "Unable to compare repositories");
      });
    return () => {
      active = false;
    };
  }, [args.first, args.second]);
  if (error) return <Detail markdown={`# Comparison unavailable\n\n${error}`} />;
  if (!data) return <Detail isLoading markdown="Comparing repositories…" />;

  const rows = data.repositories
    .map(
      (item) =>
        `| ${item.repository.fullName} | ${display(item.repository.stars)} | ${display(item.growth.stars7d)} | ${display(item.growth.stars30d)} | ${display(item.growth.momentum?.score)} |`
    )
    .join("\n");
  const markdown = [
    "# Repository growth comparison",
    "",
    "| Repository | Stars | 7 days | 30 days | Momentum |",
    "| --- | ---: | ---: | ---: | ---: |",
    rows,
    "",
    "_Incomplete observation windows are unavailable._",
  ].join("\n");

  return (
    <Detail
      markdown={markdown}
      actions={
        <ActionPanel>
          {data.repositories.map((item) => (
            <Action.OpenInBrowser
              key={item.repository.fullName}
              title={`Open ${item.repository.fullName}`}
              url={item.repository.url}
            />
          ))}
        </ActionPanel>
      }
    />
  );
}
