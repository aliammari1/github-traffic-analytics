// SPDX-License-Identifier: MIT
import GitHubAppSetup from "@/components/GitHubAppSetup";

export default async function GitHubAppSetupPage({
  searchParams,
}: {
  searchParams: Promise<{ installation_id?: string | string[] }>;
}) {
  const values = await searchParams;
  const installationId = typeof values.installation_id === "string" ? values.installation_id : null;
  return <GitHubAppSetup installationId={installationId} />;
}
