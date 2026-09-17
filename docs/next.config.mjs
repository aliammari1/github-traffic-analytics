// SPDX-License-Identifier: MIT
import nextra from "nextra";

const withNextra = nextra({
  // Nextra 4 reads MDX from the app router `content/` + page files.
  defaultShowCopyCode: true,
});

export default withNextra({
  // Static export so the docs deploy to Cloudflare Pages without a Node runtime.
  output: "export",
  images: { unoptimized: true },
  outputFileTracingRoot: import.meta.dirname,
});
