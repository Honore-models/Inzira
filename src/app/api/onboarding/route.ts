import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "youth") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { goal, skillsBackground, district, sector } = await request.json();

    if (!goal) {
      return NextResponse.json(
        { error: "Goal is required" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // 1. Update the youth's profile with onboarding data
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        goal,
        skills_background: skillsBackground || "",
        district: district || "",
        sector: sector || "",
        onboarding_completed: true,
        onboarding_submitted_at: new Date().toISOString(),
      })
      .eq("user_id", session.user.id);

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    // 2. Get the youth's profile ID
    const { data: youthProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", session.user.id)
      .single();

    if (!youthProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 500 });
    }

    // 3. Find an available officer to assign (pick the first officer, or you can add logic)
    const { data: officers } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "officer")
      .limit(1);

    const officerId = officers?.[0]?.id || null;

    // 4. Create a case so the officer can see this youth
    const { error: caseError } = await supabase
      .from("youth_cases")
      .insert({
        youth_profile_id: youthProfile.id,
        officer_profile_id: officerId,
        status: "pending",
        current_step: 0,
        total_steps: 0,
      });

    if (caseError) {
      // Case might already exist, that's okay
      console.log("Case creation note:", caseError.message);
    }

    return NextResponse.json({ message: "Onboarding completed" });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
