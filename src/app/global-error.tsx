// SPDX-License-Identifier: MIT
"use client";

import { useEffect } from "react";

/**
 * Root error boundary (App Router). Replaces the whole document when the root
 * layout itself throws, so it must render its own <html>/<body>. Last-resort
 * fallback above the per-route `error.tsx`.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error boundary caught:", error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          fontFamily: "system-ui, sans-serif",
          background: "#0a0a0a",
          color: "#fafafa",
          textAlign: "center",
          padding: "1.5rem",
        }}
      >
        <h2 style={{ fontSize: "1.5rem", fontWeight: 600 }}>Application error</h2>
        <p style={{ maxWidth: "28rem", fontSize: "0.875rem", color: "#a1a1aa" }}>
          A critical error occurred. Reloading usually fixes it.
        </p>
        <button
          onClick={reset}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "0.375rem",
            border: "1px solid #27272a",
            background: "#fafafa",
            color: "#0a0a0a",
            cursor: "pointer",
            fontSize: "0.875rem",
          }}
        >
          Reload
        </button>
      </body>
    </html>
  );
}
