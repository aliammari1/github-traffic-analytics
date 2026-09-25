// SPDX-License-Identifier: MIT
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { env } from "@/env";

export interface ServerAuth {
  accessToken: string;
  userId: string;
}

/**
 * Read the encrypted Auth.js JWT directly on the server.
 *
 * The browser-visible session deliberately excludes the GitHub OAuth token.
 * Route handlers that need GitHub access use this helper instead. `token.sub`
 * is the provider-backed stable user id and is safe to use as the D1 owner key.
 */
export async function getServerAuth(request: NextRequest): Promise<ServerAuth | null> {
  try {
    const token = await getToken({
      req: request,
      secret: env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === "production",
    });

    if (!token?.accessToken || !token.sub) return null;
    return { accessToken: token.accessToken, userId: token.sub };
  } catch {
    // Invalid/malformed auth input is unauthenticated, never a route-level 500.
    return null;
  }
}
