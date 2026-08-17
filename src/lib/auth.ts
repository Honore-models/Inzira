import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: "youth" | "officer";
      profileId: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: "youth" | "officer";
    profileId: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Use service role key to bypass RLS during login
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { auth: { autoRefreshToken: false, persistSession: false } },
        );

        // Look up user in profiles table
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("email", credentials.email)
          .single();

        if (!profile) {
          return null;
        }

        // Verify password
        const isValid = await bcrypt.compare(
          credentials.password as string,
          profile.password_hash,
        );

        if (!isValid) {
          return null;
        }

        return {
          id: profile.user_id,
          email: profile.email,
          name: profile.full_name,
          role: profile.role,
          profileId: profile.id,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role as "youth" | "officer";
        token.profileId = user.profileId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as "youth" | "officer";
        session.user.profileId = token.profileId as string;
      }
      return session;
    },
  },
});
