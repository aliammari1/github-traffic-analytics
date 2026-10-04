// SPDX-License-Identifier: MIT
import { Action, ActionPanel, Detail } from "@raycast/api";
import { useEffect, useState } from "react";
import { appBase, display, Growth, remember, summary } from "./api";

export function GrowthDetail({ repository }: { repository: string }) {
  const [data, setData] = useState<Growth>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    let active = true;
    summary(repository)
      .then(async (value) => {
        if (!active) return;
        setData(value);
        await remember(value.repository.fullName);
      })
      .catch((cause) => {
        if (active) setError(cause instanceof Error ? cause.message : "Unable to load repository");
      });
    return () => {
      active = false;
    };
  }, [repository]);

  if (error) return <Detail markdown={`# Unable to analyze repository\n\n${error}`} />;
  if (!data) return <Detail isLoading markdown={`Loading ${repository}…`} />;
  const { growth, observation } = data;
  return (
    <Detail
      markdown={`# ${data.repository.fullName}\n\n${data.repository.description || "No description provided."}\n\n| Metric | Observed value |\n| --- | ---: |\n| Stars | ${display(data.repository.stars)} |\n| Growth, 7 days | ${display(growth.stars7d)} |\n| Growth, 30 days | ${display(growth.stars30d)} |\n| Momentum score | ${display(growth.momentum?.score)} |\n\n${data.latestRelease ? `**Latest release:** ${data.latestRelease.tagName}` : "No recent release observed."}\n\n_Last star observation: ${observation.latestStarDay || "unavailable"}. Growth windows with incomplete observations are unavailable._`}
      actions={
        <ActionPanel>
          <Action.OpenInBrowser
            title="Open Full Report"
            url={`${appBase()}/repo/${data.repository.fullName}`}
          />
          <Action.OpenInBrowser title="Open on GitHub" url={data.repository.url} />
          <Action.CopyToClipboard
            title="Copy README Growth Card"
            content={`![${data.repository.fullName} growth](${appBase()}/api/card/${data.repository.fullName})`}
          />
        </ActionPanel>
      }
    />
  );
}
