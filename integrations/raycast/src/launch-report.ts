// SPDX-License-Identifier: MIT
import { open } from "@raycast/api";
import { appBase, assertRepository, remember } from "./api";

export default async function Command({ arguments: args }: { arguments: { repository: string } }) {
  const repository = assertRepository(args.repository);
  await remember(repository);
  await open(`${appBase()}/repo/${repository}`);
}
