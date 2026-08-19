import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "officer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const supabase = await createClient();

    // Fetch the youth profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Youth not found" }, { status: 404 });
    }

    // Fetch their cases with steps
    const { data: cases } = await supabase
      .from("youth_cases")
      .select("*")
      .eq("youth_profile_id", id)
      .order("created_at", { ascending: false });

    // Fetch steps for all their cases
    const caseIds = (cases || []).map((c) => c.id);
    let allSteps: Record<string, unknown[]> = {};

    if (caseIds.length > 0) {
      const { data: steps } = await supabase
        .from("roadmap_steps")
        .select("*")
        .in("case_id", caseIds)
        .order("step_number", { ascending: true });

      if (steps) {
        for (const step of steps) {
          const caseId = (step as { case_id: string }).case_id;
          if (!allSteps[caseId]) allSteps[caseId] = [];
          allSteps[caseId].push(step);
        }
      }
    }

    // Fetch any AI roadmaps for their cases
    let aiRoadmaps: unknown[] = [];
    if (caseIds.length > 0) {
      const { data: roadmaps } = await supabase
        .from("ai_roadmaps")
        .select("*")
        .in("case_id", caseIds)
        .order("created_at", { ascending: false });

      aiRoadmaps = roadmaps || [];
    }

    // Merge steps into cases
    const casesWithSteps = (cases || []).map((c) => ({
      ...c,
      steps: allSteps[c.id] || [],
    }));

    return NextResponse.json({
      profile,
      cases: casesWithSteps,
      aiRoadmaps,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
