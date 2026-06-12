// SPDX-License-Identifier: MIT
import type { NextConfig } from "next";

// Validate env at build/boot (throws on missing required vars). Importing for the
// side effect is enough; SKIP_ENV_VALIDATION / NODE_ENV=test bypass it.
import "./src/env";

/**
 * Content-Security-Policy. Kept reasonably strict for a dashboard that talks only
 * to its own origin (auth, traffic, insights) and loads GitHub avatars. Recharts
 * injects inline styles, so `style-src` allows 'unsafe-inline'; scripts do not.
 */
const csp = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://*.githubusercontent.com",
  "font-src 'self' data:",
  "connect-src 'self' https://api.github.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  images: {
    // GitHub avatars (users and org owners) are served from these hosts.
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "*.githubusercontent.com" },
      { protocol: "https", hostname: "example.com" },
    ],
  },
  async headers() {
    return [
      // App pages get the full security header set. The public /api/badge is an
      // embeddable image and is deliberately excluded from frame-ancestors/CSP.
      { source: "/((?!api/badge).*)", headers: securityHeaders },
    ];
  },
};

export default nextConfig;
