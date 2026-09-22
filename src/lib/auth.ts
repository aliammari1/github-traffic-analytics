import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { env } from "@/env";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "repo user:email",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      // Expose only the stable user id to client sessions. The GitHub OAuth token
      // remains inside the encrypted Auth.js JWT and is read only by server routes.
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
