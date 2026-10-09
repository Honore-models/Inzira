import { NextResponse } from "next/server";
import { canAccessCase, isResponse, jsonError, requireViewer } from "@/lib/server/access";

type Params = { params: Promise<{ caseId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const viewer = await requireViewer();
  if (isResponse(viewer)) return viewer;

  const { caseId } = await params;
  if (!(await canAccessCase(viewer, caseId))) return jsonError("Roadmap not found.", 404);

  const { data, error } = await viewer.db
    .from("roadmap_steps")
    .select("*")
    .eq("case_id", caseId)
    .order("step_number", { ascending: true });

  if (error) return jsonError("Could not load the roadmap.", 500);
  return NextResponse.json(data);
}

/**
 * Mark the current step as done. Youth may only complete their own current
 * step; officers may complete it on a youth's behalf. Completing the final
 * step completes the case.
 */
export async function PATCH(request: Request, { params }: Params) {
  const viewer = await requireViewer();
  if (isResponse(viewer)) return viewer;

  const { caseId } = await params;
  const youthCase = await canAccessCase(viewer, caseId);
  if (!youthCase) return jsonError("Roadmap not found.", 404);

  const body = await request.json().catch(() => null);
  const stepId = typeof body?.stepId === "string" ? body.stepId : "";
  if (!stepId) return jsonError("stepId is required.", 400);

  const { db } = viewer;
  const { data: step } = await db
    .from("roadmap_steps")
    .select("id, step_number, state")
    .eq("id", stepId)
    .eq("case_id", caseId)
    .single();

  if (!step) return jsonError("Step not found.", 404);
  if (step.state === "done") return jsonError("This step is already complete.", 409);
  if (step.step_number !== youthCase.current_step) {
    return jsonError("Steps must be completed in order. Finish your current step first.", 409);
  }

  const { error } = await db
    .from("roadmap_steps")
    .update({ status: "done", state: "done" })
    .eq("id", stepId);
  if (error) return jsonError("Could not update the step. Please try again.", 500);

  const nextStep = youthCase.current_step + 1;
  const finished = nextStep > youthCase.total_steps;

  if (!finished) {
    await db
      .from("roadmap_steps")
      .update({ status: "current", state: "current" })
      .eq("case_id", caseId)
      .eq("step_number", nextStep);
  }

  await db
    .from("youth_cases")
    .update(
      finished
        ? { current_step: youthCase.total_steps, status: "completed" }
        : { current_step: nextStep },
    )
    .eq("id", caseId);

  return NextResponse.json({ ok: true, completed: finished, currentStep: finished ? null : nextStep });
}
