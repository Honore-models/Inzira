import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ caseId: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { caseId } = await params;
    const supabase = await createClient();

    const { data: steps, error } = await supabase
      .from("roadmap_steps")
      .select("*")
      .eq("case_id", caseId)
      .order("step_number", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(steps);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ caseId: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "officer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { caseId } = await params;
    const { stepNumber, title, detail, institution, location, source } =
      await request.json();

    if (!stepNumber || !title) {
      return NextResponse.json(
        { error: "stepNumber and title are required" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    const { data: step, error } = await supabase
      .from("roadmap_steps")
      .insert({
        case_id: caseId,
        step_number: stepNumber,
        title,
        detail,
        institution,
        location,
        source,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(step, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ caseId: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "officer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { caseId } = await params;
    const { stepId, ...updates } = await request.json();

    if (!stepId) {
      return NextResponse.json(
        { error: "stepId is required" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    const { data: step, error } = await supabase
      .from("roadmap_steps")
      .update(updates)
      .eq("id", stepId)
      .eq("case_id", caseId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(step);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
