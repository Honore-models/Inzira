import { NextResponse } from "next/server";
import { canAccessCase, isResponse, jsonError, requireViewer } from "@/lib/server/access";

type Params = { params: Promise<{ caseId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const viewer = await requireViewer();
  if (isResponse(viewer)) return viewer;

  const { caseId } = await params;
  if (!(await canAccessCase(viewer, caseId))) return jsonError("Conversation not found.", 404);

  const { data, error } = await viewer.db
    .from("messages")
    .select("id, content, sender_id, sender_role, is_read, created_at, sender:profiles!messages_sender_id_fkey (full_name, role)")
    .eq("case_id", caseId)
    .order("created_at", { ascending: true })
    .limit(500);

  if (error) {
    console.error("[messages] load failed:", error);
    return jsonError("Could not load messages.", 500);
  }

  // Opening a conversation marks the other side's messages as read.
  const unread = (data || []).filter((m) => !m.is_read && m.sender_id !== viewer.profileId);
  if (unread.length) {
    await viewer.db
      .from("messages")
      .update({ is_read: true })
      .in("id", unread.map((m) => m.id));
  }

  return NextResponse.json(data);
}

export async function POST(request: Request, { params }: Params) {
  const viewer = await requireViewer();
  if (isResponse(viewer)) return viewer;

  const { caseId } = await params;
  const youthCase = await canAccessCase(viewer, caseId);
  if (!youthCase) return jsonError("Conversation not found.", 404);

  const body = await request.json().catch(() => null);
  const content = typeof body?.content === "string" ? body.content.trim() : "";
  if (!content) return jsonError("Message cannot be empty.", 400);
  if (content.length > 4000) return jsonError("Message is too long (max 4,000 characters).", 400);

  // An officer replying to an unassigned youth takes the case.
  if (viewer.role === "officer" && !youthCase.officer_profile_id) {
    await viewer.db
      .from("youth_cases")
      .update({ officer_profile_id: viewer.profileId })
      .eq("id", caseId);
  }

  const { data, error } = await viewer.db
    .from("messages")
    .insert({
      case_id: caseId,
      sender_id: viewer.profileId,
      sender_role: viewer.role,
      content,
    })
    .select("id, content, sender_id, sender_role, is_read, created_at")
    .single();

  if (error) {
    console.error("[messages] insert failed:", error);
    return jsonError("Message could not be sent. Please try again.", 500);
  }
  return NextResponse.json(data, { status: 201 });
}
