// SPDX-License-Identifier: MIT
import type { Metadata } from "next";

type Props = {
  params: Promise<{ owner: string; repo: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { owner, repo } = await params;
  const fullName = `${owner}/${repo}`;
  const title = `${fullName} Launch Report | GitHub Growth Analytics`;
  const description = `Compare GitHub star velocity before and after a release for ${fullName}. Public, deterministic, and non-causal.`;
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: true, follow: true },
  };
}

export default function LaunchReportLayout({ children }: Props) {
  return children;
}
