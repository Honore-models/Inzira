// ============================================================
// INZIRA AI - OpenRouter Client
// Uses OpenRouter's OpenAI-compatible API for:
//   - Chat completions (Gemma 4 26B A4B with retry + fallback)
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
 * Sleep for a given number of milliseconds.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Call OpenRouter chat completions with a specific model.
 */
async function callChatModel(
  model: string,
  params: {
    messages: ChatMessage[];
    maxTokens?: number;
    temperature?: number;
    responseFormat?: { type: "json_object" };
  },
): Promise<ChatCompletionResponse> {
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
      model,
      messages: params.messages,
      max_tokens: params.maxTokens || AI_CONFIG.maxTokens,
      temperature: params.temperature ?? AI_CONFIG.temperature,
      ...(params.responseFormat ? { response_format: params.responseFormat } : {}),
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "Unknown error");
    const error = new Error(
      `OpenRouter chat completion failed (${res.status}): ${errText}`,
    );
    // Attach status code for retry logic
    (error as Error & { statusCode?: number }).statusCode = res.status;
    throw error;
  }

  return res.json() as Promise<ChatCompletionResponse>;
}

/**
 * Call OpenRouter chat completions (Gemma 4) with retry and fallback.
 *
 * Retry strategy:
 * - On 429 (rate limit): exponential backoff, up to maxRetries attempts
 * - On other errors: throw immediately
 * - After primary model exhausts retries: try fallback model once
 */
export async function chatCompletion(params: {
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
  responseFormat?: { type: "json_object" };
}): Promise<ChatCompletionResponse> {
  const models = [AI_CONFIG.chatModel, AI_CONFIG.chatModelFallback];
  let lastError: Error | null = null;

  for (const model of models) {
    for (let attempt = 0; attempt <= AI_CONFIG.maxRetries; attempt++) {
      try {
        return await callChatModel(model, params);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        const statusCode = (lastError as Error & { statusCode?: number }).statusCode;

        // Only retry on 429 (rate limit) or 503 (service unavailable)
        if (statusCode === 429 || statusCode === 503) {
          if (attempt < AI_CONFIG.maxRetries) {
            const delay = AI_CONFIG.retryBaseDelayMs * Math.pow(2, attempt);
            console.warn(
              `[Inzira AI] Model ${model} rate-limited (attempt ${attempt + 1}/${AI_CONFIG.maxRetries}). Retrying in ${delay}ms...`,
            );
            await sleep(delay);
            continue;
          }
        }

        // Non-retryable error or retries exhausted for this model
        break;
      }
    }

    // If we get here, current model failed — try next fallback
    const nextIndex = models.indexOf(model) + 1;
    if (nextIndex < models.length) {
      console.warn(
        `[Inzira AI] Model ${model} failed. Trying fallback: ${models[nextIndex]}`,
      );
    }
  }

  // Both models failed — throw the last error
  throw lastError || new Error("All chat completion attempts failed");
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
