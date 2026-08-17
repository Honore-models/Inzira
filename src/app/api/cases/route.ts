import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();

    if (session.user.role === "officer") {
      // Officers see all cases
      const { data: cases, error } = await supabase
        .from("youth_cases")
        .select(`
          *,
          youth:profiles!youth_cases_youth_profile_id_fkey (full_name, email, goal, district, sector),
          officer:profiles!youth_cases_officer_profile_id_fkey (full_name)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(cases);
    } else {
      // Youth see their own cases
      const { data: cases, error } = await supabase
        .from("youth_cases")
        .select(`
          *,
          officer:profiles!youth_cases_officer_profile_id_fkey (full_name, district_assigned)
        `)
        .eq(
          "youth_profile_id",
          (
            await supabase
              .from("profiles")
              .select("id")
              .eq("user_id", session.user.id)
              .single()
          ).data?.id || "",
        )
        .order("created_at", { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(cases);
    }
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "officer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { youthProfileId, totalSteps } = await request.json();
    const supabase = await createClient();

    const { data: youthCase, error } = await supabase
      .from("youth_cases")
      .insert({
        youth_profile_id: youthProfileId,
        officer_profile_id: (
          await supabase
            .from("profiles")
            .select("id")
            .eq("user_id", session.user.id)
            .single()
        ).data?.id,
        total_steps: totalSteps || 0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(youthCase, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
