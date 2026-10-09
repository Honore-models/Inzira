// ============================================================
// POST /api/ai/ask
// Grounded question answering over the verified library (Groq + BM25 RAG)
// ============================================================

import { NextResponse } from "next/server";
import {
  generateEmbedding,
  hybridSearch,
  formatContextForPrompt,
  extractSources,
  chatCompletion,
  describeAIError,
  ASK_SYSTEM_PROMPT,
  NO_INFO_RESPONSE,
  OFF_TOPIC_RESPONSE,
  buildAskUserPrompt,
  type AskResponse,
  type ChatMessage,
} from "@/lib/ai";
import { isResponse, jsonError, requireViewer } from "@/lib/server/access";
import { takeToken } from "@/lib/server/rate-limit";

const MAX_QUESTION = 1000;
const MAX_HISTORY_TURNS = 4;

interface HistoryTurn {
  question: string;
  answer: string;
}

function sanitiseHistory(raw: unknown): HistoryTurn[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (t): t is HistoryTurn =>
        !!t && typeof t.question === "string" && typeof t.answer === "string",
    )
    .slice(-MAX_HISTORY_TURNS)
    .map((t) => ({
      question: t.question.slice(0, MAX_QUESTION),
      answer: t.answer.slice(0, 1500),
    }));
}

export async function POST(request: Request) {
  const viewer = await requireViewer();
  if (isResponse(viewer)) return viewer;

  if (!takeToken(`ask:${viewer.profileId}`, 15, 60_000)) {
    return jsonError(
      "You're asking questions very quickly. Please wait a moment and try again.",
      429,
    );
  }

  const body = await request.json().catch(() => null);
  const question = typeof body?.question === "string" ? body.question.trim() : "";
  if (question.length < 2) return jsonError("Please type a question.", 400);
  if (question.length > MAX_QUESTION) {
    return jsonError(`Please keep your question under ${MAX_QUESTION} characters.`, 400);
  }
  const history = sanitiseHistory(body?.history);

  // Follow-ups like "what documents do I need for that?" retrieve better with
  // the previous question attached.
  const retrievalQuery = [history.at(-1)?.question, question]
    .filter(Boolean)
    .join(" ");

  let chunks;
  try {
    const embedding = await generateEmbedding(retrievalQuery);
    chunks = await hybridSearch({ queryText: retrievalQuery, queryEmbedding: embedding });
  } catch (error) {
    console.error("[ask] retrieval failed:", error);
    return jsonError("We couldn't search the verified library. Please try again.", 503);
  }

  const messages: ChatMessage[] = [{ role: "system", content: ASK_SYSTEM_PROMPT }];
  for (const turn of history) {
    messages.push({ role: "user", content: turn.question });
    messages.push({ role: "assistant", content: turn.answer });
  }
  messages.push({
    role: "user",
    content: buildAskUserPrompt(question, formatContextForPrompt(chunks)),
  });

  try {
    const { content } = await chatCompletion({ messages });
    const answer = content.trim();

    const kind: AskResponse["kind"] = answer.startsWith(OFF_TOPIC_RESPONSE.slice(0, 40))
      ? "off_topic"
      : answer.startsWith(NO_INFO_RESPONSE.slice(0, 40))
        ? "no_info"
        : "answer";

    const response: AskResponse = {
      answer,
      kind,
      // One entry per numbered source, so citation [n] maps to sources[n - 1].
      sources: kind === "answer" ? chunks.map((c) => extractSources([c])[0]) : [],
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error("[ask] generation failed:", error);
    const { message, status } = describeAIError(error);
    return jsonError(message, status);
  }
}
