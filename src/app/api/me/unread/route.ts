import { NextResponse } from "next/server";
import { isResponse, requireViewer } from "@/lib/server/access";

/** GET /api/me/unread — unread messages for the navigation badge. */
export async function GET() {
  const viewer = await requireViewer();
  if (isResponse(viewer)) return viewer;
  const { db, profileId, role } = viewer;

  let caseQuery = db.from("youth_cases").select("id");
  caseQuery =
    role === "youth"
      ? caseQuery.eq("youth_profile_id", profileId)
      : caseQuery.or(`officer_profile_id.eq.${profileId},officer_profile_id.is.null`);
  const { data: cases } = await caseQuery;
  const ids = (cases || []).map((c) => c.id);
  if (!ids.length) return NextResponse.json({ unread: 0 });

  const { count } = await db
    .from("messages")
    .select("id", { count: "exact", head: true })
    .in("case_id", ids)
    .eq("is_read", false)
    .neq("sender_id", profileId);

  return NextResponse.json({ unread: count || 0 });
}
