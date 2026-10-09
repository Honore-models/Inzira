import { NextResponse } from "next/server";
import { getPrimaryCase, isResponse, requireViewer } from "@/lib/server/access";

/**
 * GET /api/me
 * Everything a youth's screens need in one request: their profile, their
 * case, roadmap steps (enriched with the approved "what to bring" details),
 * their officer and unread message count.
 */
export async function GET() {
  const viewer = await requireViewer("youth");
  if (isResponse(viewer)) return viewer;
  const { db, profileId } = viewer;

  const { data: profile } = await db
    .from("profiles")
    .select("id, full_name, email, goal, skills, skills_background, situation, district, sector, onboarding_completed, created_at")
    .eq("id", profileId)
    .single();

  const youthCase = await getPrimaryCase(db, profileId);
  if (!youthCase) {
    return NextResponse.json({ profile, case: null, steps: [], roadmap: null, officer: null, unreadCount: 0 });
  }

  const [stepsRes, roadmapRes, officerRes, unreadRes] = await Promise.all([
    db.from("roadmap_steps").select("*").eq("case_id", youthCase.id).order("step_number"),
    db
      .from("ai_roadmaps")
      .select("id, title, summary, steps_data, approved_at")
      .eq("case_id", youthCase.id)
      .eq("status", "approved")
      .order("approved_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    youthCase.officer_profile_id
      ? db
          .from("profiles")
          .select("id, full_name, email, department, district_assigned")
          .eq("id", youthCase.officer_profile_id)
          .single()
      : Promise.resolve({ data: null }),
    db
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("case_id", youthCase.id)
      .eq("is_read", false)
      .neq("sender_id", profileId),
  ]);

  const approvedSteps = (roadmapRes.data?.steps_data || []) as {
    order: number;
    whatToBring?: string[];
    whyThisStep?: string;
  }[];
  const extras = new Map(approvedSteps.map((s) => [s.order, s]));

  const steps = (stepsRes.data || []).map((s) => ({
    ...s,
    what_to_bring: extras.get(s.step_number)?.whatToBring || [],
    why_this_step: extras.get(s.step_number)?.whyThisStep || null,
  }));

  return NextResponse.json({
    profile,
    case: youthCase,
    steps,
    roadmap: roadmapRes.data
      ? { id: roadmapRes.data.id, title: roadmapRes.data.title, summary: roadmapRes.data.summary, approvedAt: roadmapRes.data.approved_at }
      : null,
    officer: officerRes.data,
    unreadCount: unreadRes.count || 0,
  });
}
