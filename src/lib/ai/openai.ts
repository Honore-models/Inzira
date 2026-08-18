// ============================================================
// INZIRA AI - OpenRouter Client
// Uses OpenRouter's OpenAI-compatible API for:
//   - Chat completions (Gemma 4 26B A4B)
//   - Embeddings (BGE-M3)
// ============================================================

import { AI_CONFIG } from "./config";

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionChoice {
  message: { role: string; content: string };
  finish_reason: string;
}

export interface ChatCompletionResponse {
  choices: ChatCompletionChoice[];
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

export interface EmbeddingResponse {
  data: { embedding: number[]; index: number }[];
}

/**
 * Call OpenRouter chat completions (Gemma 4).
 */
export async function chatCompletion(params: {
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
  responseFormat?: { type: "json_object" };
}): Promise<ChatCompletionResponse> {
  if (!AI_CONFIG.openrouterApiKey) {
    throw new Error(
      "OPENROUTER_API_KEY is not set. Add it to your .env.local file.",
    );
  }

  const res = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AI_CONFIG.openrouterApiKey}`,
      "HTTP-Referer": "https://inzira.rw",
      "X-Title": "Inzira",
    },
    body: JSON.stringify({
      model: AI_CONFIG.chatModel,
      messages: params.messages,
      max_tokens: params.maxTokens || AI_CONFIG.maxTokens,
      temperature: params.temperature ?? AI_CONFIG.temperature,
      ...(params.responseFormat ? { response_format: params.responseFormat } : {}),
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "Unknown error");
    throw new Error(
      `OpenRouter chat completion failed (${res.status}): ${errText}`,
    );
  }

  return res.json() as Promise<ChatCompletionResponse>;
}

/**
 * Call OpenRouter embeddings (BGE-M3).
 */
export async function generateEmbeddingsAPI(
  inputs: string | string[],
): Promise<number[][]> {
  if (!AI_CONFIG.openrouterApiKey) {
    throw new Error(
      "OPENROUTER_API_KEY is not set. Add it to your .env.local file.",
    );
  }

  const res = await fetch(`${OPENROUTER_BASE_URL}/embeddings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AI_CONFIG.openrouterApiKey}`,
      "HTTP-Referer": "https://inzira.rw",
      "X-Title": "Inzira",
    },
    body: JSON.stringify({
      model: AI_CONFIG.embeddingModel,
      input: Array.isArray(inputs) ? inputs : [inputs],
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "Unknown error");
    throw new Error(
      `OpenRouter embedding failed (${res.status}): ${errText}`,
    );
  }

  const data: EmbeddingResponse = await res.json();

  // Sort by index to ensure correct ordering
  return data.data
    .sort((a, b) => a.index - b.index)
    .map((item) => item.embedding);
}
