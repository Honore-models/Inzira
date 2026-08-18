import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

interface StepInput {
  number: number;
  title: string;
  detail: string;
  badge: string;
  location?: string;
  source?: string;
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "officer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { youthProfileId, steps } = (await request.json()) as {
      youthProfileId: string;
      steps: StepInput[];
    };

    if (!youthProfileId || !steps?.length) {
      return NextResponse.json(
        { error: "youthProfileId and steps are required" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Get the officer's profile ID
    const { data: officerProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", session.user.id)
      .single();

    // Create the case
    const { data: youthCase, error: caseError } = await supabase
      .from("youth_cases")
      .insert({
        youth_profile_id: youthProfileId,
        officer_profile_id: officerProfile?.id,
        total_steps: steps.length,
        current_step: 1,
        status: "active",
      })
      .select()
      .single();

    if (caseError || !youthCase) {
      return NextResponse.json(
        { error: caseError?.message || "Failed to create case" },
        { status: 500 },
      );
    }

    // Create roadmap steps
    const roadmapSteps = steps.map((s) => ({
      case_id: youthCase.id,
      step_number: s.number,
      title: s.title,
      detail: s.detail,
      institution: s.badge,
      status: s.number === 1 ? "current" : "locked",
      state: s.number === 1 ? "current" : "locked",
      location: s.location || null,
      source: s.source || "Generated from verified sources",
    }));

    const { error: stepsError } = await supabase
      .from("roadmap_steps")
      .insert(roadmapSteps);

    if (stepsError) {
      return NextResponse.json(
        { error: stepsError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      case: youthCase,
      stepsCreated: roadmapSteps.length,
    }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
