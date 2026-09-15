import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";
import authConfig from "@/lib/auth.config";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string | null;
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
  ...authConfig,
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

        const email = (credentials.email as string).trim().toLowerCase();
        const supabase = getSupabaseAdmin();

        // Look up user in profiles table
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("email", email)
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
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [Google({ clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET })]
      : []),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      // Google users: create profile if it doesn't exist
      if (account?.provider === "google" && user?.email) {
        const supabase = getSupabaseAdmin();
        const { data: existing } = await supabase
          .from("profiles")
          .select("id, user_id")
          .eq("email", user.email)
          .single();

        if (!existing) {
          // NextAuth's OAuth subject is not a Supabase Auth user. Create a
          // matching Supabase identity before inserting the foreign-keyed
          // profile, while keeping its generated password private.
          const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email: user.email,
            password: crypto.randomUUID(),
            email_confirm: true,
          });
          if (authError || !authUser.user) return false;

          const { error } = await supabase.from("profiles").insert({
            user_id: authUser.user.id,
            email: user.email,
            full_name: user.name || "",
            role: "youth",
            password_hash: "google",
            onboarding_completed: false,
          });
          if (error) {
            await supabase.auth.admin.deleteUser(authUser.user.id);
            return false;
          }
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
            .select("id, user_id, role, onboarding_completed")
            .eq("email", user.email)
            .single();
          if (profile) {
            token.id = profile.user_id;
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
  },
});
