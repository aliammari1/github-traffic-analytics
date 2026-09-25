// SPDX-License-Identifier: MIT
import type { NextConfig } from "next";

// Validate env at build/boot (throws on missing required vars). Importing for the
// side effect is enough; SKIP_ENV_VALIDATION / NODE_ENV=test bypass it.
import "./src/env";

/**
 * Content-Security-Policy. Next.js emits inline bootstrap scripts, so a static
 * header must allow inline scripts unless the app adopts per-request nonces.
 * Development also needs eval for the dev runtime/HMR. Recharts injects inline
 * styles, so `style-src` allows inline styles as well.
 */
const scriptSrc =
  process.env.NODE_ENV === "development"
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'";

const csp = [
  "default-src 'self'",
  scriptSrc,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://*.githubusercontent.com",
  "font-src 'self' data:",
  "connect-src 'self' https://api.github.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(process.env.NODE_ENV === "production" ? ["upgrade-insecure-requests"] : []),
].join("; ");

const baselineSecurityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const appSecurityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  ...baselineSecurityHeaders,
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
      // The badge is embeddable, so omit CSP/frame restrictions only; it still
      // receives transport/content-type/referrer/permissions protections.
      { source: "/api/badge", headers: baselineSecurityHeaders },
      { source: "/((?!api/badge).*)", headers: appSecurityHeaders },
    ];
  },
};

export default nextConfig;
