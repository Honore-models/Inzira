import type { NextAuthConfig } from "next-auth";

// This file deliberately stays edge-compatible. Middleware imports it to read
// signed sessions without pulling database clients or password hashing into the
// Edge Runtime.
const authConfig = {
  providers: [],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
} satisfies NextAuthConfig;

export default authConfig;
