// SPDX-License-Identifier: MIT
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GitHub Traffic Analytics",
    short_name: "GitHub Traffic",
    description:
      "Understand why GitHub repositories grow. Explore public star history, releases, and momentum, then preserve private traffic beyond 14 days.",
    start_url: "/",
    display: "standalone",
    background_color: "#0d1117",
    theme_color: "#0d1117",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
