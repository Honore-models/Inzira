// ============================================================
// POST /api/ai/generate-roadmap
// Drafts a personalised roadmap (Groq) grounded in the verified library and
// the human-maintained pathway rules. The result is saved as a DRAFT; the
// officer reviews, edits and approves it before the youth can see it.
// ============================================================

import { NextResponse } from "next/server";
import {
  generateEmbedding,
  hybridSearch,
  formatContextForPrompt,
  chatCompletion,
  describeAIError,
  AIServiceError,
  extractJsonFromModelText,
  ROADMAP_SYSTEM_PROMPT,
  AI_CONFIG,
  buildRoadmapUserPrompt,
  type RetrievedChunk,
  type RoadmapResponse,
  type RoadmapStep,
} from "@/lib/ai";
import { getPathway, matchGoalToPathway, type PathwayRule } from "@/lib/ai/pathways";
import {
  getPrimaryCase,
  isResponse,
  jsonError,
  requireViewer,
} from "@/lib/server/access";
import { takeToken } from "@/lib/server/rate-limit";

function str(value: unknown, max = 2000): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function formatPathwayRules(pathway: PathwayRule): string {
  return pathway.steps
    .map(
      (step) =>
        `Step ${step.order}: ${step.title} (${step.institution})\n` +
        `  ${step.description}\n` +
        `  Required documents: ${step.requiredDocuments.join(", ") || "none listed"}` +
        (step.notes ? `\n  Notes: ${step.notes}` : ""),
    )
    .join("\n");
}

/**
 * Normalise the model's JSON. Sources are only kept when they reference a
 * document that was actually retrieved, so the AI cannot cite phantom files.
 */
function normaliseRoadmap(data: unknown, chunks: RetrievedChunk[]): RoadmapResponse {
  if (!data || typeof data !== "object") throw new Error("not an object");
  const obj = data as Record<string, unknown>;
  if (!Array.isArray(obj.steps) || obj.steps.length < 2) {
    throw new Error("too few steps");
  }

  const docs = new Map(chunks.map((c) => [c.document_id, c]));

  const steps: RoadmapStep[] = obj.steps.slice(0, 8).map((raw, index) => {
    const s = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
    const sources = Array.isArray(s.sources) ? s.sources : [];
    const seen = new Set<string>();
    return {
      order: index + 1,
      title: str(s.title, 160) || `Step ${index + 1}`,
      description: str(s.description, 1200),
      institution: str(s.institution, 80),
      location: str(s.location, 160) || null,
      whatToBring: Array.isArray(s.whatToBring)
        ? s.whatToBring.map((x) => str(x, 160)).filter(Boolean).slice(0, 10)
        : [],
      whyThisStep: str(s.whyThisStep, 400),
      sources: sources
        .map((src) => {
          const id = str((src as Record<string, unknown>)?.documentId, 80);
          const chunk = docs.get(id);
          if (!chunk || seen.has(id)) return null;
          seen.add(id);
          return {
            documentId: id,
            documentTitle: chunk.document_title,
            institution: chunk.institution,
            page: chunk.page_number,
          };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null),
    };
  });

  return {
    title: str(obj.title, 160) || "Personalised roadmap",
    summary: str(obj.summary, 800),
    steps,
  };
}

export async function POST(request: Request) {
  const viewer = await requireViewer("officer");
  if (isResponse(viewer)) return viewer;

  if (!takeToken(`roadmap:${viewer.profileId}`, 6, 60_000)) {
    return jsonError("Please wait a moment before generating another roadmap.", 429);
  }

  const body = await request.json().catch(() => null);
  const youthProfileId = str(body?.youthProfileId, 64);
  if (!youthProfileId) return jsonError("Choose a youth before generating a roadmap.", 400);

  const { db } = viewer;
  const { data: profile } = await db
    .from("profiles")
    .select("id, full_name, goal, skills, skills_background, district, sector, role")
    .eq("id", youthProfileId)
    .single();
  if (!profile || profile.role !== "youth") return jsonError("Youth not found.", 404);

  // The officer may correct intake details before generating.
  const input = (body?.youth || {}) as Record<string, unknown>;
  const youth = {
    name: profile.full_name,
    goal: str(input.goal, 200) || profile.goal || "",
    skillsBackground:
      str(input.skillsBackground, 1000) || profile.skills_background || profile.skills || "",
    district: str(input.district, 100) || profile.district || "",
    sector: str(input.sector, 100) || profile.sector || "",
  };
  const officerNotes = str(body?.officerNotes, 2000);

  if (!youth.goal) return jsonError("Set the youth's goal before generating.", 400);

  const pathwayId = matchGoalToPathway(`${youth.goal} ${officerNotes}`);
  const pathway = pathwayId ? getPathway(pathwayId) : null;

  const query = [youth.goal, youth.skillsBackground, officerNotes, pathway?.name]
    .filter(Boolean)
    .join(" ");

  let chunks: RetrievedChunk[];
  try {
    chunks = await hybridSearch({
      queryText: query,
      queryEmbedding: await generateEmbedding(query),
    });
  } catch (error) {
    console.error("[generate-roadmap] retrieval failed:", error);
    return jsonError("We couldn't search the verified library. Please try again.", 503);
  }

  const userPrompt = buildRoadmapUserPrompt(
    youth,
    officerNotes,
    formatContextForPrompt(chunks),
    pathway
      ? formatPathwayRules(pathway)
      : "No fixed pathway matches this goal. Order steps only as the sources explicitly state.",
  );

  let roadmap: RoadmapResponse | null = null;
  // One retry if the model returns malformed JSON.
  for (let attempt = 0; attempt < 2 && !roadmap; attempt++) {
    try {
      const { content } = await chatCompletion({
        messages: [
          { role: "system", content: ROADMAP_SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        json: true,
        maxTokens: AI_CONFIG.roadmapMaxTokens,
      });
      roadmap = normaliseRoadmap(JSON.parse(extractJsonFromModelText(content)), chunks);
    } catch (error) {
      if (error instanceof AIServiceError) {
        console.error("[generate-roadmap] generation failed:", error.message);
        const { message, status } = describeAIError(error);
        return jsonError(message, status);
      }
      // Malformed JSON or an unusable structure: try once more.
      console.warn("[generate-roadmap] invalid model output:", error);
    }
  }

  if (!roadmap) {
    return jsonError("The AI returned an unusable draft. Please try again.", 502);
  }

  // Save as a draft against the youth's case (created if needed).
  let youthCase = await getPrimaryCase(db, youthProfileId);
  if (!youthCase) {
    const { data: created, error: caseError } = await db
      .from("youth_cases")
      .insert({
        youth_profile_id: youthProfileId,
        officer_profile_id: viewer.profileId,
        status: "active", // total_steps 0 = awaiting a roadmap
        current_step: 0,
        total_steps: 0,
      })
      .select()
      .single();
    if (caseError) console.error("[generate-roadmap] case creation failed:", caseError);
    youthCase = created;
  }

  let roadmapId: string | null = null;
  if (youthCase) {
    const { data: saved, error } = await db
      .from("ai_roadmaps")
      .insert({
        case_id: youthCase.id,
        youth_profile_id: youthProfileId,
        title: roadmap.title,
        summary: roadmap.summary,
        steps_data: roadmap.steps,
        sources: roadmap.steps.flatMap((s) => s.sources),
        officer_notes: officerNotes || null,
        status: "draft",
      })
      .select("id")
      .single();
    if (error) console.error("[generate-roadmap] could not save draft:", error.message);
    roadmapId = saved?.id ?? null;
  }

  return NextResponse.json({
    ...roadmap,
    roadmapId,
    pathway: pathway?.name ?? null,
    sourcesConsulted: chunks.length,
  });
}
