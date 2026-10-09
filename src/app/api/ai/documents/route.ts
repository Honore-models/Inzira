// ============================================================
// GET    /api/ai/documents        — list the verified library (officers)
// DELETE /api/ai/documents?id=…   — remove a document and its chunks
// ============================================================

import { NextResponse } from "next/server";
import { invalidateRetrievalCache } from "@/lib/ai";
import { isResponse, jsonError, requireViewer } from "@/lib/server/access";

export async function GET() {
  const viewer = await requireViewer("officer");
  if (isResponse(viewer)) return viewer;

  const { data, error } = await viewer.db
    .from("documents")
    .select("id, title, institution, description, source_url, verified, verified_at, chunk_count, created_at")
    .order("institution")
    .order("title");

  if (error) return jsonError("Could not load the library.", 500);
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const viewer = await requireViewer("officer");
  if (isResponse(viewer)) return viewer;

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return jsonError("Document id is required.", 400);

  const { error } = await viewer.db.from("documents").delete().eq("id", id);
  if (error) return jsonError("Could not remove the document.", 500);

  invalidateRetrievalCache();
  return NextResponse.json({ ok: true });
}
