import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

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

    const supabase = await createClient();

    // Get current youth's profile ID
    const { data: myProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", session.user.id)
      .single();

    if (!myProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
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
        status: "pending",
        current_step: 0,
        total_steps: 0,
      })
      .select("id, status, current_step, total_steps")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ case: newCase, created: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
