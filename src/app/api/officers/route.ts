import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use admin client to bypass RLS — access control is handled in API layer
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    // Get current user's profile ID
    const { data: myProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", session.user.id)
      .single();

    if (!myProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Fetch all officers
    const { data: officers, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, department, district_assigned, photo_url")
      .eq("role", "officer")
      .order("full_name");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // For each officer, check if there's an existing case with this youth
    const officersWithCases = await Promise.all(
      (officers || []).map(async (officer) => {
        const { data: existingCase } = await supabase
          .from("youth_cases")
          .select("id, status, current_step, total_steps")
          .eq("youth_profile_id", myProfile.id)
          .eq("officer_profile_id", officer.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        return {
          ...officer,
          case: existingCase || null,
        };
      }),
    );

    return NextResponse.json(officersWithCases);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 },
    );
  }
}
