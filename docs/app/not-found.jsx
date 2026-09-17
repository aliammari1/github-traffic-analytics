// SPDX-License-Identifier: MIT
import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ padding: "4rem 1.5rem", textAlign: "center" }}>
      <h1>404 — Page not found</h1>
      <p>
        <Link href="/">Back to the docs home</Link>
      </p>
    </div>
  );
}
