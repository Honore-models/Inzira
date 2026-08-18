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

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { caseId } = await params;
    const { stepId, status, state } = await request.json();

    if (!stepId) {
      return NextResponse.json(
        { error: "stepId is required" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Build update object
    const updates: Record<string, string> = {};
    if (status) updates.status = status;
    if (state) updates.state = state;

    // Youth can only mark their current step as done
    if (session.user.role === "youth") {
      if (status !== "done" && state !== "done") {
        return NextResponse.json(
          { error: "You can only mark steps as done" },
          { status: 403 },
        );
      }

      const { data: youthProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", session.user.id)
        .single();

      const { data: youthCase } = await supabase
        .from("youth_cases")
        .select("current_step")
        .eq("id", caseId)
        .eq("youth_profile_id", youthProfile?.id || "")
        .single();

      const { data: step } = await supabase
        .from("roadmap_steps")
        .select("step_number")
        .eq("id", stepId)
        .single();

      if (!youthCase || !step || step.step_number !== youthCase.current_step) {
        return NextResponse.json(
          { error: "You can only complete your current step" },
          { status: 403 },
        );
      }

      // Advance the case current_step
      await supabase
        .from("youth_cases")
        .update({ current_step: youthCase.current_step + 1 })
        .eq("id", caseId);
    }

    const { data: updatedStep, error } = await supabase
      .from("roadmap_steps")
      .update(updates)
      .eq("id", stepId)
      .eq("case_id", caseId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(updatedStep);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
