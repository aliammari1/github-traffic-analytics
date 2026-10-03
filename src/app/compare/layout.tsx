// SPDX-License-Identifier: MIT
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare GitHub Repositories | Growth & Star Velocity",
  description:
    "Compare public GitHub star growth, weekly velocity, and release timelines side-by-side without authentication.",
  alternates: {
    canonical: "/compare",
  },
  openGraph: {
    title: "Compare GitHub Repositories | Growth & Star Velocity",
    description:
      "Compare public GitHub star growth, weekly velocity, and release timelines side-by-side without authentication.",
    type: "website",
    url: "/compare",
  },
  twitter: {
    card: "summary_large_image",
    title: "Compare GitHub Repositories | Growth & Star Velocity",
    description:
      "Compare public GitHub star growth, weekly velocity, and release timelines side-by-side without authentication.",
  },
};

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
