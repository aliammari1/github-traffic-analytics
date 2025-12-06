"use client";
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

/**
 * Wraps its children with the NextAuth session context provider.
 *
 * @param children - React node(s) to be rendered within the session context.
 * @returns A React element that provides NextAuth session context to `children`.
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}