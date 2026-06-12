// SPDX-License-Identifier: MIT
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * @opennextjs/cloudflare adapter config. Defaults are sufficient for this app;
 * caching is left to Cloudflare's edge. Build with `pnpm cf:build`.
 */
export default defineCloudflareConfig();
