import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { officerProfileId } = await request.json();

    if (!officerProfileId) {
      return NextResponse.json({ error: "officerProfileId is required" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    // Get current youth's profile ID
    const { data: myProfile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", session.user.id)
      .single();

    if (profileError || !myProfile) {
      return NextResponse.json(
        { error: "Profile not found", details: profileError?.message },
        { status: 404 },
      );
    }

    // Check if a case already exists between this youth and officer
    const { data: existingCase } = await supabase
      .from("youth_cases")
      .select("id, status, current_step, total_steps")
      .eq("youth_profile_id", myProfile.id)
      .eq("officer_profile_id", officerProfileId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (existingCase) {
      return NextResponse.json({ case: existingCase, created: false });
    }

    // Create a new case
    const { data: newCase, error } = await supabase
      .from("youth_cases")
      .insert({
        youth_profile_id: myProfile.id,
        officer_profile_id: officerProfileId,
        status: "active",
        current_step: 0,
        total_steps: 0,
      })
      .select("id, status, current_step, total_steps")
      .single();

    if (error) {
      console.error("Failed to create case:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ case: newCase, created: true });
  } catch (error) {
    console.error("find-or-create error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 },
    );
  }
}
