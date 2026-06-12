// SPDX-License-Identifier: MIT
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // GitHub avatars (users and org owners) are served from these hosts.
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "*.githubusercontent.com" },
      { protocol: "https", hostname: "example.com" },
    ],
  },
};

export default nextConfig;
