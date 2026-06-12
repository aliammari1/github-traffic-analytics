<!-- SPDX-License-Identifier: MIT -->

# Security Policy

## Reporting a vulnerability

Please **do not** open a public issue for security problems.

Report privately via [GitHub Security Advisories](https://github.com/aliammari1/github-traffic-analytics/security/advisories/new)
or email **ammari.ali.0001@gmail.com**. We aim to acknowledge reports within 72 hours.

## Scope notes

- The app stores a user's GitHub access token to read repository traffic and (for
  opted-in repos) to capture daily snapshots from the Cron Worker. Tokens are never
  returned to the browser. Treat the D1 `tracked_repos` table as sensitive.
- The Anthropic API key (`ANTHROPIC_API_KEY`) is server-side only and never sent
  to the client.

## Supported versions

The latest `main` is supported. Security fixes are released as patch versions.
