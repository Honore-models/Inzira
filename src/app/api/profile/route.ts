import { NextResponse } from "next/server";
import { isResponse, jsonError, requireViewer } from "@/lib/server/access";

const PROFILE_FIELDS =
  "id, full_name, email, role, goal, skills, skills_background, situation, district, sector, department, district_assigned, onboarding_completed, created_at";

/** Fields each role may edit on their own profile. Never role or password. */
const EDITABLE: Record<"youth" | "officer", Record<string, number>> = {
  youth: { full_name: 120, goal: 200, skills_background: 1000, district: 100, sector: 100 },
  officer: { full_name: 120, department: 120, district_assigned: 100 },
};

export async function GET() {
  const viewer = await requireViewer();
  if (isResponse(viewer)) return viewer;

  const { data, error } = await viewer.db
    .from("profiles")
    .select(PROFILE_FIELDS)
    .eq("id", viewer.profileId)
    .single();

  if (error || !data) return jsonError("Profile not found.", 404);
  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const viewer = await requireViewer();
  if (isResponse(viewer)) return viewer;

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const updates: Record<string, string> = {};

  for (const [field, max] of Object.entries(EDITABLE[viewer.role])) {
    const value = body?.[field];
    if (typeof value === "string") updates[field] = value.trim().slice(0, max);
  }
  if ("full_name" in updates && !updates.full_name) {
    return jsonError("Your name cannot be empty.", 400);
  }
  if (Object.keys(updates).length === 0) return jsonError("Nothing to update.", 400);

  const { data, error } = await viewer.db
    .from("profiles")
    .update(updates)
    .eq("id", viewer.profileId)
    .select(PROFILE_FIELDS)
    .single();

  if (error) {
    console.error("[profile] update failed:", error);
    return jsonError("Could not save your changes. Please try again.", 500);
  }
  return NextResponse.json(data);
}
