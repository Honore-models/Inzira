import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "officer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();

    // Get all youth profiles
    const { data: youth, error: youthError } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "youth")
      .order("created_at", { ascending: false });

    if (youthError) {
      return NextResponse.json({ error: youthError.message }, { status: 500 });
    }

    // Get all cases separately (to avoid ambiguous foreign key join)
    const { data: cases } = await supabase
      .from("youth_cases")
      .select("id, youth_profile_id, status, current_step, total_steps, officer_profile_id");

    // Merge cases into youth profiles
    const youthWithCases = (youth || []).map((y) => ({
      ...y,
      youth_cases: (cases || []).filter((c) => c.youth_profile_id === y.id),
    }));

    return NextResponse.json(youthWithCases);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
