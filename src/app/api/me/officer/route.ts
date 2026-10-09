import { NextResponse } from "next/server";
import { getPrimaryCase, isResponse, jsonError, requireViewer } from "@/lib/server/access";

/**
 * POST /api/me/officer  { officerProfileId }
 * Lets a youth without an assigned officer choose one. Returns the case id
 * used for their conversation.
 */
export async function POST(request: Request) {
  const viewer = await requireViewer("youth");
  if (isResponse(viewer)) return viewer;
  const { db, profileId } = viewer;

  const body = await request.json().catch(() => null);
  const officerId = typeof body?.officerProfileId === "string" ? body.officerProfileId : "";

  const { data: officer } = await db
    .from("profiles")
    .select("id, role")
    .eq("id", officerId)
    .single();
  if (!officer || officer.role !== "officer") return jsonError("Officer not found.", 404);

  const youthCase = await getPrimaryCase(db, profileId);
  if (youthCase) {
    if (youthCase.officer_profile_id && youthCase.officer_profile_id !== officerId) {
      return jsonError("You already have an assigned officer.", 409);
    }
    await db.from("youth_cases").update({ officer_profile_id: officerId }).eq("id", youthCase.id);
    return NextResponse.json({ caseId: youthCase.id });
  }

  const { data: created, error } = await db
    .from("youth_cases")
    .insert({
      youth_profile_id: profileId,
      officer_profile_id: officerId,
      status: "active", // total_steps 0 = awaiting a roadmap
      current_step: 0,
      total_steps: 0,
    })
    .select("id")
    .single();
  if (error || !created) return jsonError("Could not start the conversation.", 500);
  return NextResponse.json({ caseId: created.id }, { status: 201 });
}
