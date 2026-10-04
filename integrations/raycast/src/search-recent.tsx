// SPDX-License-Identifier: MIT
import { Action, ActionPanel, List } from "@raycast/api";
import { useEffect, useState } from "react";
import { recentRepositories } from "./api";
import { GrowthDetail } from "./growth-detail";

export default function Command() {
  const [repos, setRepos] = useState<string[]>();
  useEffect(() => {
    recentRepositories().then(setRepos);
  }, []);
  return (
    <List isLoading={!repos} searchBarPlaceholder="Search recent repositories">
      {repos?.length === 0 && (
        <List.EmptyView
          title="No recent repositories"
          description="Analyze a repository to save it here."
        />
      )}
      {repos?.map((repository) => (
        <List.Item
          key={repository}
          title={repository}
          actions={
            <ActionPanel>
              <Action.Push title="View Growth" target={<GrowthDetail repository={repository} />} />
              <Action.OpenInBrowser
                title="Open on GitHub"
                url={`https://github.com/${repository}`}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
