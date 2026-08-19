// ============================================================
// POST /api/ai/ask
// RAG-based question answering using Gemma 4 + BGE-M3
// via OpenRouter
// ============================================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  generateEmbedding,
  hybridSearch,
  formatContextForPrompt,
  extractSources,
  chatCompletion,
  ASK_SYSTEM_PROMPT,
  buildAskUserPrompt,
  isQuestionRelevant,
  OFF_TOPIC_MESSAGE,
} from "@/lib/ai";
import type { AskRequest, AskResponse } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    // 1. Authenticate
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Validate request
    const body: AskRequest = await request.json();
    if (!body.question || typeof body.question !== "string") {
      return NextResponse.json(
        { error: "A valid question is required" },
        { status: 400 },
      );
    }

    const question = body.question.trim();
    if (question.length < 3) {
      return NextResponse.json(
        { error: "Question is too short" },
        { status: 400 },
      );
    }

    if (question.length > 2000) {
      return NextResponse.json(
        { error: "Question is too long (max 2000 characters)" },
        { status: 400 },
      );
    }

    // 3. Topic relevance check — catch off-topic before hitting the LLM
    if (!isQuestionRelevant(question)) {
      const offTopicResponse: AskResponse = {
        answer: OFF_TOPIC_MESSAGE,
        sources: [],
      };
      return NextResponse.json(offTopicResponse);
    }

    // 4. Generate BGE-M3 embedding for the question
    let queryEmbedding: number[];
    try {
      queryEmbedding = await generateEmbedding(question);
    } catch (embeddingError) {
      console.error("Embedding generation failed:", embeddingError);
      return NextResponse.json(
        { error: "Failed to process your question. Please try again." },
        { status: 500 },
      );
    }

    // 5. Hybrid retrieval: vector + keyword + metadata
    let retrievedChunks;
    try {
      retrievedChunks = await hybridSearch({
        queryEmbedding,
        queryText: question,
      });
    } catch (searchError) {
      console.error("Hybrid retrieval failed:", searchError);
      return NextResponse.json(
        { error: "Failed to search the knowledge base. Please try again." },
        { status: 500 },
      );
    }

    // 6. Check if we found relevant information
    if (retrievedChunks.length === 0) {
      const noInfoResponse: AskResponse = {
        answer:
          "I couldn't find enough verified information in the Inzira source library to answer this question. " +
          "Please try rephrasing your question, or ask your youth officer for assistance with this specific topic.",
        sources: [],
      };
      return NextResponse.json(noInfoResponse);
    }

    // 7. Build the prompt with retrieved context
    const contextString = formatContextForPrompt(retrievedChunks);
    const userPrompt = buildAskUserPrompt(question, contextString);

    // 8. Call Gemma 4 via OpenRouter for the answer
    let answer: string;
    try {
      const completion = await chatCompletion({
        messages: [
          { role: "system", content: ASK_SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      });
      answer = completion.choices[0]?.message?.content || "";
    } catch (chatError) {
      console.error("Gemma chat completion failed:", chatError);
      return NextResponse.json(
        { error: "Failed to generate an answer. Please try again." },
        { status: 500 },
      );
    }

    if (!answer) {
      return NextResponse.json(
        { error: "Failed to generate an answer. Please try again." },
        { status: 500 },
      );
    }

    // 9. Extract and return sources from the database (not from the LLM)
    const sources = extractSources(retrievedChunks);

    const response: AskResponse = {
      answer: answer.trim(),
      sources,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("AI Ask endpoint error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 },
    );
  }
}
