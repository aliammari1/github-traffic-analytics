// SPDX-License-Identifier: MIT
import { GrowthDetail } from "./growth-detail";

export default function Command({ arguments: args }: { arguments: { repository: string } }) {
  return <GrowthDetail repository={args.repository} />;
}
