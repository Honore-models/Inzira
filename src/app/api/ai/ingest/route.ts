// ============================================================
// POST /api/ai/ingest
// Document ingestion endpoint for the RAG system
// Accepts JSON with text content (plain text, not PDF binary)
// ============================================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ingestDocument } from "@/lib/ai/ingestion";

export async function POST(request: Request) {
  try {
    // 1. Authenticate - only officers can ingest documents
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "officer") {
      return NextResponse.json(
        { error: "Only officers can ingest documents" },
        { status: 403 },
      );
    }

    // 2. Parse request body
    const body = await request.json();

    if (!body.title || typeof body.title !== "string") {
      return NextResponse.json(
        { error: "A document title is required" },
        { status: 400 },
      );
    }

    if (!body.institution || typeof body.institution !== "string") {
      return NextResponse.json(
        { error: "Institution name is required" },
        { status: 400 },
      );
    }

    if (!body.text || typeof body.text !== "string") {
      return NextResponse.json(
        { error: "Document text content is required" },
        { status: 400 },
      );
    }

    if (body.text.length < 50) {
      return NextResponse.json(
        {
          error:
            "Document text is too short. Please provide at least 50 characters.",
        },
        { status: 400 },
      );
    }

    if (body.text.length > 500000) {
      return NextResponse.json(
        {
          error:
            "Document text is too long. Maximum 500,000 characters.",
        },
        { status: 400 },
      );
    }

    // 3. Ingest the document
    const result = await ingestDocument({
      title: body.title,
      institution: body.institution,
      description: body.description || undefined,
      text: body.text,
      sourceUrl: body.sourceUrl || undefined,
      fileName: body.fileName || undefined,
      metadata: body.metadata || undefined,
    });

    return NextResponse.json({
      message: "Document ingested successfully",
      ...result,
    });
  } catch (error) {
    console.error("Document ingestion error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
