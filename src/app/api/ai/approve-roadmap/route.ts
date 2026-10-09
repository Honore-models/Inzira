// ============================================================
// POST /api/ai/approve-roadmap
// The officer approves a (possibly edited) roadmap. Its steps replace the
// youth's current roadmap and become visible to the youth immediately.
// ============================================================

import { NextResponse } from "next/server";
import type { RoadmapStep } from "@/lib/ai";
import {
  getPrimaryCase,
  isResponse,
  jsonError,
  requireViewer,
} from "@/lib/server/access";

function str(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function normaliseSteps(raw: unknown): RoadmapStep[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => (item && typeof item === "object" ? item : {}) as Record<string, unknown>)
    .filter((s) => str(s.title, 160))
    .slice(0, 12)
    .map((s, index) => ({
      order: index + 1,
      title: str(s.title, 160),
      description: str(s.description, 1200),
      institution: str(s.institution, 80),
      location: str(s.location, 160) || null,
      whatToBring: Array.isArray(s.whatToBring)
        ? s.whatToBring.map((x) => str(x, 160)).filter(Boolean).slice(0, 10)
        : [],
      whyThisStep: str(s.whyThisStep, 400),
      sources: Array.isArray(s.sources)
        ? (s.sources as RoadmapStep["sources"]).slice(0, 6)
        : [],
    }));
}

export async function POST(request: Request) {
  const viewer = await requireViewer("officer");
  if (isResponse(viewer)) return viewer;
  const { db } = viewer;

  const body = await request.json().catch(() => null);
  const youthProfileId = str(body?.youthProfileId, 64);
  const roadmapId = str(body?.roadmapId, 64) || null;
  const title = str(body?.roadmap?.title, 160) || "Your roadmap";
  const summary = str(body?.roadmap?.summary, 800);
  const steps = normaliseSteps(body?.roadmap?.steps);
  const noteToYouth = str(body?.noteToYouth, 2000);

  if (!youthProfileId) return jsonError("youthProfileId is required.", 400);
  if (steps.length === 0) return jsonError("The roadmap needs at least one step.", 400);

  const { data: youth } = await db
    .from("profiles")
    .select("id, role")
    .eq("id", youthProfileId)
    .single();
  if (!youth || youth.role !== "youth") return jsonError("Youth not found.", 404);

  // Reuse the youth's case; create one only if they have none.
  let youthCase = await getPrimaryCase(db, youthProfileId);
  if (!youthCase) {
    const { data, error } = await db
      .from("youth_cases")
      .insert({ youth_profile_id: youthProfileId, officer_profile_id: viewer.profileId })
      .select()
      .single();
    if (error || !data) return jsonError("Could not create a case for this youth.", 500);
    youthCase = data;
  }
  const caseId: string = youthCase.id;

  // Replace the roadmap steps.
  const { error: deleteError } = await db.from("roadmap_steps").delete().eq("case_id", caseId);
  if (deleteError) return jsonError("Could not update the roadmap. Please try again.", 500);

  const { error: stepsError } = await db.from("roadmap_steps").insert(
    steps.map((step) => ({
      case_id: caseId,
      step_number: step.order,
      title: step.title,
      detail: step.description,
      institution: step.institution || null,
      location: step.location,
      status: step.order === 1 ? "current" : "locked",
      state: step.order === 1 ? "current" : "locked",
      source: step.sources.length
        ? step.sources
            .map((s) => `${s.institution} – ${s.documentTitle}${s.page ? ` (p. ${s.page})` : ""}`)
            .join("; ")
        : null,
    })),
  );
  if (stepsError) {
    console.error("[approve-roadmap] steps insert failed:", stepsError.message);
    return jsonError("Could not save the roadmap steps. Please try again.", 500);
  }

  await db
    .from("youth_cases")
    .update({
      officer_profile_id: viewer.profileId,
      status: "active",
      current_step: 1,
      total_steps: steps.length,
    })
    .eq("id", caseId);

  // Record the approved version (the steps the youth sees, with sources and
  // "what to bring" details).
  const approved = {
    case_id: caseId,
    youth_profile_id: youthProfileId,
    title,
    summary,
    steps_data: steps,
    sources: steps.flatMap((s) => s.sources),
    status: "approved",
    reviewed_at: new Date().toISOString(),
    approved_at: new Date().toISOString(),
  };

  let finalRoadmapId = roadmapId;
  if (roadmapId) {
    const { error } = await db.from("ai_roadmaps").update(approved).eq("id", roadmapId);
    if (error) finalRoadmapId = null;
  }
  if (!finalRoadmapId) {
    const { data } = await db.from("ai_roadmaps").insert(approved).select("id").single();
    finalRoadmapId = data?.id ?? null;
  }

  // Older approved versions for this case are superseded.
  if (finalRoadmapId) {
    await db
      .from("ai_roadmaps")
      .update({ status: "reviewed" })
      .eq("case_id", caseId)
      .eq("status", "approved")
      .neq("id", finalRoadmapId);
  }

  await db
    .from("profiles")
    .update({ onboarding_completed: true })
    .eq("id", youthProfileId)
    .is("onboarding_completed", false);

  if (noteToYouth) {
    await db.from("messages").insert({
      case_id: caseId,
      sender_id: viewer.profileId,
      sender_role: "officer",
      content: noteToYouth,
    });
  }

  return NextResponse.json({
    caseId,
    youthProfileId,
    roadmapId: finalRoadmapId,
    stepsCreated: steps.length,
  });
}
