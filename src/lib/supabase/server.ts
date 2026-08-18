import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client.
 *
 * Authentication is handled by NextAuth (see src/lib/auth.ts), so all
 * server-side data access goes through our API routes which check the
 * NextAuth session. We therefore use the service role key here, which
 * bypasses RLS — access control is enforced in the API layer instead.
 *
 * Never import this client into client components.
 */
export async function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
