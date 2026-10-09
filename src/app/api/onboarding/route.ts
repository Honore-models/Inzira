import { NextResponse } from "next/server";
import {
  getPrimaryCase,
  isResponse,
  jsonError,
  pickOfficerFor,
  requireViewer,
} from "@/lib/server/access";

function str(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/**
 * POST /api/onboarding
 * Saves the youth's intake answers and opens a case with an officer
 * (preferring one assigned to the youth's district).
 */
export async function POST(request: Request) {
  const viewer = await requireViewer("youth");
  if (isResponse(viewer)) return viewer;
  const { db, profileId } = viewer;

  const body = await request.json().catch(() => null);
  const goal = str(body?.goal, 200);
  const district = str(body?.district, 100);
  if (!goal) return jsonError("Please choose a goal.", 400);
  if (!district) return jsonError("Please choose your district.", 400);

  const { error } = await db
    .from("profiles")
    .update({
      goal,
      skills_background: str(body?.skillsBackground, 1000),
      district,
      sector: str(body?.sector, 100),
      onboarding_completed: true,
      onboarding_submitted_at: new Date().toISOString(),
    })
    .eq("id", profileId);
  if (error) return jsonError("We couldn't save your answers. Please try again.", 500);

  const existing = await getPrimaryCase(db, profileId);
  if (!existing) {
    await db.from("youth_cases").insert({
      youth_profile_id: profileId,
      officer_profile_id: await pickOfficerFor(db, district),
      status: "pending",
      current_step: 0,
      total_steps: 0,
    });
  } else if (!existing.officer_profile_id) {
    await db
      .from("youth_cases")
      .update({ officer_profile_id: await pickOfficerFor(db, district) })
      .eq("id", existing.id);
  }

  return NextResponse.json({ ok: true });
}
