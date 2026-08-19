// ============================================================
// POST /api/ai/generate-roadmap
// Generates a personalized roadmap draft using Gemma 4 + BGE-M3
// with verified pathway dependency rules
// ============================================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  generateEmbedding,
  hybridSearch,
  formatContextForPrompt,
  chatCompletion,
  ROADMAP_SYSTEM_PROMPT,
  buildRoadmapUserPrompt,
} from "@/lib/ai";
import {
  getPathway,
  matchGoalToPathway,
  type PathwayRule,
} from "@/lib/ai/pathways";
import type {
  GenerateRoadmapRequest,
  RoadmapResponse,
  RoadmapStep,
} from "@/lib/ai";

/**
 * Validate the structure of the AI-generated roadmap JSON.
 */
function validateRoadmapJSON(data: unknown): RoadmapResponse {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid roadmap: not an object");
  }

  const obj = data as Record<string, unknown>;

  if (typeof obj.title !== "string" || obj.title.length === 0) {
    throw new Error("Invalid roadmap: missing or empty title");
  }

  if (typeof obj.summary !== "string" || obj.summary.length === 0) {
    throw new Error("Invalid roadmap: missing or empty summary");
  }

  if (!Array.isArray(obj.steps) || obj.steps.length < 3) {
    throw new Error("Invalid roadmap: must have at least 3 steps");
  }

  const validatedSteps: RoadmapStep[] = obj.steps.map((step, index) => {
    if (!step || typeof step !== "object") {
      throw new Error(`Invalid step at index ${index}`);
    }
    const s = step as Record<string, unknown>;
    return {
      order: typeof s.order === "number" ? s.order : index + 1,
      title: typeof s.title === "string" ? s.title : `Step ${index + 1}`,
      description: typeof s.description === "string" ? s.description : "",
      institution: typeof s.institution === "string" ? s.institution : "",
      location: typeof s.location === "string" ? s.location : null,
      whatToBring: Array.isArray(s.whatToBring)
        ? (s.whatToBring as string[])
        : [],
      whyThisStep: typeof s.whyThisStep === "string" ? s.whyThisStep : "",
      sources: Array.isArray(s.sources)
        ? (s.sources as RoadmapStep["sources"])
        : [],
    };
  });

  return {
    title: obj.title as string,
    summary: obj.summary as string,
    steps: validatedSteps,
  };
}

/**
 * Format pathway rules into a string for the prompt.
 */
function formatPathwayRules(pathway: PathwayRule): string {
  return pathway.steps
    .map(
      (step) =>
        `Step ${step.order}: ${step.title} (${step.institution})\n` +
        `Description: ${step.description}\n` +
        `Required documents: ${step.requiredDocuments.join(", ") || "None specified"}\n` +
        (step.notes ? `Notes: ${step.notes}\n` : ""),
    )
    .join("\n");
}

export async function POST(request: Request) {
  try {
    // 1. Authenticate
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "officer") {
      return NextResponse.json(
        { error: "Only officers can generate roadmaps" },
        { status: 403 },
      );
    }

    // 2. Validate request
    const body: GenerateRoadmapRequest = await request.json();

    if (!body.youth || typeof body.youth !== "object") {
      return NextResponse.json(
        { error: "Youth information is required" },
        { status: 400 },
      );
    }

    const { youth, officerNotes, caseId, youthProfileId } = body as GenerateRoadmapRequest & { youthProfileId?: string };

    if (!youth.name || !youth.goal) {
      return NextResponse.json(
        { error: "Youth name and goal are required" },
        { status: 400 },
      );
    }

    // 3. Match goal to a verified pathway
    const pathwayId = matchGoalToPathway(youth.goal);
    const pathway = pathwayId ? getPathway(pathwayId) : null;

    // 4. Build a retrieval query from the youth's information
    const retrievalQuery = [
      youth.goal,
      youth.skillsBackground,
      youth.district,
      youth.sector,
      officerNotes,
    ]
      .filter(Boolean)
      .join(" ");

    // 5. Generate BGE-M3 embedding for the retrieval query
    let queryEmbedding: number[];
    try {
      queryEmbedding = await generateEmbedding(retrievalQuery);
    } catch (embeddingError) {
      console.error("Embedding generation failed:", embeddingError);
      return NextResponse.json(
        { error: "Failed to process the request. Please try again." },
        { status: 500 },
      );
    }

    // 6. Hybrid retrieval: vector + keyword + metadata
    let retrievedChunks;
    try {
      retrievedChunks = await hybridSearch({
        queryEmbedding,
        queryText: retrievalQuery,
        metadataFilters: pathway
          ? { institution: undefined } // Don't filter by institution — let hybrid scoring handle it
          : undefined,
      });
    } catch (searchError) {
      console.error("Hybrid retrieval failed:", searchError);
      return NextResponse.json(
        { error: "Failed to search verified sources. Please try again." },
        { status: 500 },
      );
    }

    // 7. Build the prompt with context + pathway rules
    const contextString = formatContextForPrompt(retrievedChunks);
    const pathwayRulesStr = pathway
      ? formatPathwayRules(pathway)
      : "No specific pathway rules found for this goal. Use only the verified context above for ordering.";

    const userPrompt = buildRoadmapUserPrompt(
      youth,
      officerNotes || "",
      contextString,
      pathwayRulesStr,
    );

    // 8. Call Gemma 4 via OpenRouter for roadmap generation
    let rawResponse: string;
    try {
      const completion = await chatCompletion({
        messages: [
          { role: "system", content: ROADMAP_SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        responseFormat: { type: "json_object" },
      });
      rawResponse = completion.choices[0]?.message?.content || "";
    } catch (chatError) {
      console.error("Gemma roadmap generation failed:", chatError);
      return NextResponse.json(
        { error: "Failed to generate roadmap. Please try again." },
        { status: 500 },
      );
    }

    if (!rawResponse) {
      return NextResponse.json(
        { error: "Failed to generate roadmap. Please try again." },
        { status: 500 },
      );
    }

    // 9. Parse and validate the JSON response
    let parsedResponse: unknown;
    try {
      parsedResponse = JSON.parse(rawResponse);
    } catch {
      console.error("Invalid JSON from Gemma:", rawResponse);
      return NextResponse.json(
        { error: "The AI returned an invalid response. Please try again." },
        { status: 500 },
      );
    }

    let roadmap: RoadmapResponse;
    try {
      roadmap = validateRoadmapJSON(parsedResponse);
    } catch (validationError) {
      console.error("Roadmap validation failed:", validationError);
      return NextResponse.json(
        { error: "The AI response did not match the expected format. Please try again." },
        { status: 500 },
      );
    }

    // 10. Save the roadmap to the database as DRAFT
    const supabase = await createClient();

    // If no caseId, find or create one for this youth profile
    let savedCaseId = caseId;
    if (!savedCaseId && youthProfileId) {
      const { data: existingCase } = await supabase
        .from("youth_cases")
        .select("id")
        .eq("youth_profile_id", youthProfileId)
        .in("status", ["pending", "active"])
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (existingCase) {
        savedCaseId = existingCase.id;
      } else {
        const officerProfile = await supabase
          .from("profiles")
          .select("id")
          .eq("user_id", session.user.id)
          .single();

        const { data: newCase } = await supabase
          .from("youth_cases")
          .insert({
            youth_profile_id: youthProfileId,
            officer_profile_id: officerProfile?.data?.id || null,
            status: "pending",
            current_step: 0,
            total_steps: 0,
          })
          .select()
          .single();

        savedCaseId = newCase?.id;
      }
    }

    let savedRoadmapId: string | null = null;
    if (savedCaseId) {
      const { data: savedRoadmap, error: roadmapError } = await supabase
        .from("ai_roadmaps")
        .insert({
          case_id: savedCaseId,
          title: roadmap.title,
          summary: roadmap.summary,
          steps_data: roadmap.steps,
          sources: roadmap.steps.flatMap((s) => s.sources || []),
          officer_notes: officerNotes || null,
          status: "draft",
          youth_profile_id: youthProfileId || null,
        })
        .select()
        .single();

      if (roadmapError) {
        console.error("Failed to save roadmap:", roadmapError);
      } else if (savedRoadmap) {
        savedRoadmapId = savedRoadmap.id;
      }
    }

    // 11. Return the roadmap with the saved ID (status: draft — officer must review)
    return NextResponse.json({
      ...roadmap,
      roadmapId: savedRoadmapId,
    });
  } catch (error) {
    console.error("Generate roadmap endpoint error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 },
    );
  }
}
