// ============================================================
// POST /api/ai/approve-roadmap
// Officer approves a draft roadmap, creates case + steps,
// and makes it visible to the youth.
//
// Accepts EITHER:
//   - roadmapId: fetches existing roadmap from DB
//   - roadmapData: inline roadmap (title, summary, steps) to save + approve in one shot
// ============================================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

interface RoadmapStepData {
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
}

interface ApproveRequest {
  youthProfileId: string;
  roadmapId?: string;
  roadmapData?: {
    title: string;
    summary: string;
    steps: RoadmapStepData[];
  };
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
    const {
      youthProfileId,
      roadmapId,
      roadmapData,
      goal,
      skillsBackground,
      district,
      sector,
      situation,
    } = body;

    if (!youthProfileId) {
      return NextResponse.json(
        { error: "youthProfileId is required" },
        { status: 400 },
      );
    }

    if (!roadmapId && (!roadmapData || !roadmapData.steps || roadmapData.steps.length === 0)) {
      return NextResponse.json(
        { error: "Either roadmapId or roadmapData with steps is required" },
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

    // -------------------------------------------------------
    // Get or create the roadmap record
    // -------------------------------------------------------
    let finalRoadmapId: string | null | undefined = roadmapId;
    let stepsData: RoadmapStepData[];

    if (roadmapId) {
      // Fetch existing roadmap from DB
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

      stepsData = roadmap.steps_data as RoadmapStepData[];
    } else {
      // Use inline roadmapData — save it as approved directly
      stepsData = roadmapData!.steps;

      // We still need a case to link to (created below)
      finalRoadmapId = null; // will be set after creating the roadmap record
    }

    // -------------------------------------------------------
    // Create or reuse a youth_case
    // -------------------------------------------------------
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
          total_steps: stepsData.length,
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
          total_steps: stepsData.length,
          current_step: 1,
          status: "active",
        })
        .select()
        .single();

      if (caseError || !newCase) {
        console.error("Failed to create case:", caseError);
        return NextResponse.json(
          { error: caseError?.message || "Failed to create case" },
          { status: 500 },
        );
      }
      caseId = newCase.id;
    }

    // -------------------------------------------------------
    // Save or update the roadmap record
    // -------------------------------------------------------
    if (finalRoadmapId) {
      // Update existing roadmap → approved
      await supabase
        .from("ai_roadmaps")
        .update({
          case_id: caseId,
          status: "approved",
          approved_at: new Date().toISOString(),
          youth_profile_id: youthProfileId,
        })
        .eq("id", finalRoadmapId);
    } else {
      // Create a new roadmap record from inline data
      const sources = stepsData.flatMap((s) => s.sources || []);
      const { data: savedRoadmap } = await supabase
        .from("ai_roadmaps")
        .insert({
          case_id: caseId,
          title: roadmapData!.title,
          summary: roadmapData!.summary,
          steps_data: stepsData,
          sources,
          status: "approved",
          approved_at: new Date().toISOString(),
          youth_profile_id: youthProfileId,
          officer_notes: situation || null,
        })
        .select()
        .single();

      if (savedRoadmap) {
        finalRoadmapId = savedRoadmap.id;
      }
    }

    // -------------------------------------------------------
    // Delete any existing steps for this case (if re-approving)
    // -------------------------------------------------------
    await supabase.from("roadmap_steps").delete().eq("case_id", caseId);

    // -------------------------------------------------------
    // Create roadmap_steps from the AI-generated data
    // -------------------------------------------------------
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
      console.error("Failed to create steps:", stepsError);
      return NextResponse.json(
        { error: stepsError.message },
        { status: 500 },
      );
    }

    // -------------------------------------------------------
    // Update the youth's profile with intake data
    // -------------------------------------------------------
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
      roadmapId: finalRoadmapId || null,
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
