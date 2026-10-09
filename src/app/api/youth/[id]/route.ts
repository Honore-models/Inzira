import { NextResponse } from "next/server";
import { deriveYouthStatus } from "@/lib/case-status";
import { YOUTH_FIELDS, getPrimaryCase, isResponse, jsonError, requireViewer } from "@/lib/server/access";

/** GET /api/youth/:id — a youth's profile, case, roadmap and drafts. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const viewer = await requireViewer("officer");
  if (isResponse(viewer)) return viewer;
  const { db } = viewer;
  const { id } = await params;

  const { data: profile } = await db
    .from("profiles")
    .select(`${YOUTH_FIELDS}, role`)
    .eq("id", id)
    .single();
  if (!profile || profile.role !== "youth") return jsonError("Youth not found.", 404);

  const youthCase = await getPrimaryCase(db, id);

  const [stepsRes, roadmapsRes, officerRes] = await Promise.all([
    youthCase
      ? db.from("roadmap_steps").select("*").eq("case_id", youthCase.id).order("step_number")
      : Promise.resolve({ data: [] }),
    db
      .from("ai_roadmaps")
      .select("id, title, summary, steps_data, status, officer_notes, created_at, approved_at")
      .eq("youth_profile_id", id)
      .order("created_at", { ascending: false })
      .limit(10),
    youthCase?.officer_profile_id
      ? db.from("profiles").select("id, full_name").eq("id", youthCase.officer_profile_id).single()
      : Promise.resolve({ data: null }),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { role, ...publicProfile } = profile;

  return NextResponse.json({
    profile: publicProfile,
    case: youthCase,
    status: deriveYouthStatus(!!profile.onboarding_completed, youthCase ? [youthCase] : []),
    steps: stepsRes.data || [],
    roadmaps: roadmapsRes.data || [],
    officer: officerRes.data,
  });
}
