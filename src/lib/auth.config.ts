import type { NextAuthConfig } from "next-auth";

// This file deliberately stays edge-compatible. Middleware imports it to read
// signed sessions without pulling database clients or password hashing into the
// Edge Runtime.
const authConfig = {
  providers: [],
  session: { strategy: "jwt" },
  // Trust the Host header so sign-in redirects back to whatever URL the app
  // is served from (any local port, Vercel previews, production).
  trustHost: true,
  callbacks: {
    // Middleware creates NextAuth from this edge-safe configuration. Map the
    // custom JWT claims here as well, otherwise `req.auth.user.role` is lost
    // in middleware and protected youth/officer routes redirect each other.
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "youth" | "officer";
        session.user.profileId = token.profileId as string;
        session.user.onboardingCompleted = token.onboardingCompleted as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
} satisfies NextAuthConfig;

export default authConfig;
