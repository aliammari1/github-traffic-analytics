// SPDX-License-Identifier: MIT
import type { Metadata } from "next";
import { publicGitHub } from "@/lib/github-public";

type Props = { params: Promise<{ owner: string; repo: string }>; children: React.ReactNode };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { owner, repo } = await params;
  try {
    const metadata = await publicGitHub.getRepositoryMetadata(owner, repo);
    const title = `${metadata.fullName} Star Growth & GitHub Analytics`;
    const description =
      `${metadata.fullName} has ${metadata.starsCount.toLocaleString("en-US")} stars. Explore public star growth, release history, and repository momentum. ${metadata.description ?? ""}`.trim();
    const canonical = `/repo/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
    return {
      title,
      description,
      alternates: { canonical },
      openGraph: { title, description, type: "website", url: canonical },
      twitter: { card: "summary_large_image", title, description },
      robots: { index: true, follow: true },
    };
  } catch {
    return { title: "Repository report unavailable", robots: { index: false, follow: false } };
  }
}

export default function RepositoryLayout({ children }: Props) {
  return children;
}
