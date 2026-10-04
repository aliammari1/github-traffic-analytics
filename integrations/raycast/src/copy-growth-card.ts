// SPDX-License-Identifier: MIT
import { Clipboard, showHUD } from "@raycast/api";
import { appBase, assertRepository, remember } from "./api";

export default async function Command({ arguments: args }: { arguments: { repository: string } }) {
  const repository = assertRepository(args.repository);
  await Clipboard.copy(`![${repository} growth](${appBase()}/api/card/${repository})`);
  await remember(repository);
  await showHUD("README growth card copied");
}
