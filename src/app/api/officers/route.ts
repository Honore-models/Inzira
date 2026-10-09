import { NextResponse } from "next/server";
import { isResponse, jsonError, requireViewer } from "@/lib/server/access";

/** GET /api/officers — the officer directory (no contact details beyond name). */
export async function GET() {
  const viewer = await requireViewer();
  if (isResponse(viewer)) return viewer;

  const { data, error } = await viewer.db
    .from("profiles")
    .select("id, full_name, department, district_assigned")
    .eq("role", "officer")
    .order("full_name");

  if (error) return jsonError("Could not load officers.", 500);
  return NextResponse.json(data);
}
