import { NextResponse } from "next/server";
import { deriveYouthStatus, primaryCase } from "@/lib/case-status";
import { YOUTH_FIELDS, isResponse, jsonError, requireViewer } from "@/lib/server/access";

/** GET /api/youth — every registered youth with their case and status. */
export async function GET() {
  const viewer = await requireViewer("officer");
  if (isResponse(viewer)) return viewer;

  const [youthRes, casesRes] = await Promise.all([
    viewer.db
      .from("profiles")
      .select(YOUTH_FIELDS)
      .eq("role", "youth")
      .order("created_at", { ascending: false }),
    viewer.db
      .from("youth_cases")
      .select("id, youth_profile_id, status, current_step, total_steps, officer_profile_id, created_at"),
  ]);

  if (youthRes.error) return jsonError("Could not load youth.", 500);

  const byYouth = new Map<string, NonNullable<typeof casesRes.data>>();
  for (const c of casesRes.data || []) {
    const list = byYouth.get(c.youth_profile_id) || [];
    list.push(c);
    byYouth.set(c.youth_profile_id, list);
  }

  return NextResponse.json(
    (youthRes.data || []).map((y) => {
      const cases = byYouth.get(y.id) || [];
      return {
        ...y,
        case: primaryCase(cases),
        status: deriveYouthStatus(!!y.onboarding_completed, cases),
      };
    }),
  );
}
