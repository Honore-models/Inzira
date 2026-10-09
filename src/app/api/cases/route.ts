import { NextResponse } from "next/server";
import { isResponse, jsonError, requireViewer } from "@/lib/server/access";

/**
 * GET /api/cases
 * Officers: every case, with youth details and the latest message, for the
 * dashboard and inbox. Youth: use /api/me instead.
 */
export async function GET() {
  const viewer = await requireViewer("officer");
  if (isResponse(viewer)) return viewer;
  const { db } = viewer;

  const { data: cases, error } = await db
    .from("youth_cases")
    .select(`
      id, status, current_step, total_steps, created_at, updated_at,
      youth_profile_id, officer_profile_id,
      youth:profiles!youth_cases_youth_profile_id_fkey (id, full_name, email, goal, district),
      officer:profiles!youth_cases_officer_profile_id_fkey (id, full_name)
    `)
    .neq("status", "archived")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("[cases] load failed:", error);
    return jsonError("Could not load cases.", 500);
  }

  // Latest message + unread count per case, in one query.
  const ids = (cases || []).map((c) => c.id);
  const latest = new Map<string, { content: string; created_at: string; sender_role: string }>();
  const unread = new Map<string, number>();

  if (ids.length) {
    const { data: messages } = await db
      .from("messages")
      .select("case_id, content, created_at, sender_role, is_read")
      .in("case_id", ids)
      .order("created_at", { ascending: false })
      .limit(2000);

    for (const m of messages || []) {
      if (!latest.has(m.case_id)) latest.set(m.case_id, m);
      if (!m.is_read && m.sender_role === "youth") {
        unread.set(m.case_id, (unread.get(m.case_id) || 0) + 1);
      }
    }
  }

  return NextResponse.json(
    (cases || []).map((c) => ({
      ...c,
      lastMessage: latest.get(c.id) || null,
      unreadCount: unread.get(c.id) || 0,
    })),
  );
}
