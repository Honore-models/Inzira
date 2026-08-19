// ============================================================
// POST /api/ai/approve-roadmap
// Officer approves a draft roadmap, creates case + steps,
// and makes it visible to the youth.
// ============================================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

interface ApproveRequest {
  youthProfileId: string;
  roadmapId: string;
  goal?: string;
  skillsBackground?: string;
  district?: string;
  sector?: string;
  situation?: string;
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "officer") {
      return NextResponse.json(
        { error: "Only officers can approve roadmaps" },
        { status: 403 },
      );
    }

    const body: ApproveRequest = await request.json();
    const { youthProfileId, roadmapId, goal, skillsBackground, district, sector, situation } = body;

    if (!youthProfileId || !roadmapId) {
      return NextResponse.json(
        { error: "youthProfileId and roadmapId are required" },
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

    // Fetch the AI roadmap
    const { data: roadmap, error: roadmapError } = await supabase
      .from("ai_roadmaps")
      .select("*")
      .eq("id", roadmapId)
      .single();

    if (roadmapError || !roadmap) {
      return NextResponse.json(
        { error: "Roadmap not found" },
        { status: 404 },
      );
    }

    if (roadmap.status === "approved" || roadmap.status === "sent") {
      return NextResponse.json(
        { error: "Roadmap is already approved" },
        { status: 400 },
      );
    }

    // Check if there's already an active case for this youth
    const { data: existingCase } = await supabase
      .from("youth_cases")
      .select("id, total_steps")
      .eq("youth_profile_id", youthProfileId)
      .in("status", ["active", "pending"])
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    let caseId: string;

    if (existingCase && existingCase.total_steps === 0) {
      // Reuse existing pending case — update it
      caseId = existingCase.id;
      await supabase
        .from("youth_cases")
        .update({
          officer_profile_id: officerProfile?.id || null,
          total_steps: (roadmap.steps_data as unknown[])?.length || 0,
          current_step: 1,
          status: "active",
        })
        .eq("id", caseId);
    } else {
      // Create a new case
      const { data: newCase, error: caseError } = await supabase
        .from("youth_cases")
        .insert({
          youth_profile_id: youthProfileId,
          officer_profile_id: officerProfile?.id || null,
          total_steps: (roadmap.steps_data as unknown[])?.length || 0,
          current_step: 1,
          status: "active",
        })
        .select()
        .single();

      if (caseError || !newCase) {
        return NextResponse.json(
          { error: caseError?.message || "Failed to create case" },
          { status: 500 },
        );
      }
      caseId = newCase.id;
    }

    // Link the roadmap to the case
    await supabase
      .from("ai_roadmaps")
      .update({
        case_id: caseId,
        status: "approved",
        approved_at: new Date().toISOString(),
        youth_profile_id: youthProfileId,
      })
      .eq("id", roadmapId);

    // Delete any existing steps for this case (if re-approving)
    await supabase.from("roadmap_steps").delete().eq("case_id", caseId);

    // Create roadmap steps from the AI-generated data
    const stepsData = roadmap.steps_data as {
      order: number;
      title: string;
      description: string;
      institution: string;
      location: string | null;
      whatToBring: string[];
      whyThisStep: string;
      sources: {
        documentId: string;
        documentTitle: string;
        institution: string;
        page: number | null;
      }[];
    }[];

    if (!stepsData || stepsData.length === 0) {
      return NextResponse.json(
        { error: "Roadmap has no steps to approve" },
        { status: 400 },
      );
    }

    const roadmapSteps = stepsData.map((step) => ({
      case_id: caseId,
      step_number: step.order,
      title: step.title,
      detail: step.description,
      institution: step.institution,
      status: step.order === 1 ? ("current" as const) : ("locked" as const),
      state: step.order === 1 ? ("current" as const) : ("locked" as const),
      location: step.location || null,
      source: step.sources?.length
        ? step.sources
            .map(
              (s) =>
                `${s.institution} - ${s.documentTitle}${s.page ? ` (p.${s.page})` : ""}`,
            )
            .join(", ")
        : "Verified sources",
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

    // Update the youth's profile with intake data
    const profileUpdates: Record<string, unknown> = {
      onboarding_completed: true,
      onboarding_submitted_at: new Date().toISOString(),
    };
    if (goal) profileUpdates.goal = goal;
    if (skillsBackground !== undefined) profileUpdates.skills_background = skillsBackground;
    if (district) profileUpdates.district = district;
    if (sector) profileUpdates.sector = sector;
    if (situation) profileUpdates.situation = situation;

    await supabase
      .from("profiles")
      .update(profileUpdates)
      .eq("id", youthProfileId);

    return NextResponse.json({
      message: "Roadmap approved and sent to youth",
      caseId,
      stepsCreated: roadmapSteps.length,
    });
  } catch (error) {
    console.error("Approve roadmap error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
