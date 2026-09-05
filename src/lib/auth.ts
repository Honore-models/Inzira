import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
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
      onboardingCompleted: boolean;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: "youth" | "officer";
    profileId: string;
    onboardingCompleted: boolean;
  }
}

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
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

        const supabase = getSupabaseAdmin();

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
          onboardingCompleted: profile.onboarding_completed || false,
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
    async signIn({ user, account }) {
      // Google users: create profile if it doesn't exist
      if (account?.provider === "google" && user?.email) {
        const supabase = getSupabaseAdmin();
        const { data: existing } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", user.email)
          .single();

        if (!existing) {
          // Block credential login for Google-only accounts
          const { data: profile } = await supabase
            .from("profiles")
            .select("password_hash")
            .eq("email", user.email)
            .single();
          if (profile?.password_hash === "google") {
            return false;
          }

          // Create a new profile with a sentinel password hash
          await supabase.from("profiles").insert({
            user_id: user.id,
            email: user.email,
            full_name: user.name || "",
            role: "youth",
            password_hash: "google",
            onboarding_completed: false,
          });
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // For Google users, fetch profile from DB
        if (user.email) {
          const supabase = getSupabaseAdmin();
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, role, onboarding_completed")
            .eq("email", user.email)
            .single();
          if (profile) {
            token.role = profile.role;
            token.profileId = profile.id;
            token.onboardingCompleted = profile.onboarding_completed;
          }
        } else {
          token.role = user.role as "youth" | "officer";
          token.profileId = user.profileId;
          token.onboardingCompleted = (user as unknown as { onboardingCompleted: boolean }).onboardingCompleted;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as "youth" | "officer";
        session.user.profileId = token.profileId as string;
        session.user.onboardingCompleted = token.onboardingCompleted as boolean;
      }
      return session;
    },
  },
});
