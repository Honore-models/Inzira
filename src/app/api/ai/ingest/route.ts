// ============================================================
// POST /api/ai/ingest
// Adds a verified document (plain text) to the RAG library. Officers only.
// ============================================================

import { NextResponse } from "next/server";
import { ingestDocument } from "@/lib/ai/ingestion";
import { isResponse, jsonError, requireViewer } from "@/lib/server/access";

function str(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  const viewer = await requireViewer("officer");
  if (isResponse(viewer)) return viewer;

  const body = await request.json().catch(() => null);
  const title = str(body?.title, 200);
  const institution = str(body?.institution, 80);
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  const sourceUrl = str(body?.sourceUrl, 500);

  if (!title) return jsonError("A document title is required.", 400);
  if (!institution) return jsonError("The institution is required.", 400);
  if (text.length < 50) return jsonError("Paste at least 50 characters of document text.", 400);
  if (text.length > 500_000) return jsonError("The document is too long (max 500,000 characters).", 400);
  if (sourceUrl && !/^https?:\/\//i.test(sourceUrl)) {
    return jsonError("The source link must start with http:// or https://", 400);
  }

  try {
    const result = await ingestDocument({
      title,
      institution,
      description: str(body?.description, 500) || undefined,
      text,
      sourceUrl: sourceUrl || undefined,
      metadata: { addedBy: viewer.profileId },
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("[ingest] failed:", error);
    return jsonError("The document could not be added. Please try again.", 500);
  }
}
