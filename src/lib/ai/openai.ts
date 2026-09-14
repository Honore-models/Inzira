// ============================================================
// INZIRA AI - LLM clients
//   - Chat completions: NVIDIA NIM (Llama 3.2 Vision Instruct)
//   - Embeddings: OpenRouter
// ============================================================

import { AI_CONFIG } from "./config";

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
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface EmbeddingResponse {
  data: { embedding: number[]; index: number }[];
}

const JSON_ONLY_INSTRUCTION =
  "Respond with a single valid JSON object only. Do not wrap it in markdown or code fences. Do not add commentary before or after the JSON.";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableStatus(statusCode?: number): boolean {
  return statusCode === 429 || statusCode === 503;
}

function withStatus(message: string, statusCode: number): Error {
  const error = new Error(message);
  (error as Error & { statusCode?: number }).statusCode = statusCode;
  return error;
}

function isVisionModel(model: string): boolean {
  return /vision/i.test(model);
}

/**
 * Vision NIM models expect OpenAI multimodal content parts.
 * Text-only models (Llama 3.1/3.3 fallbacks) expect a string.
 */
function toNvidiaMessages(model: string, messages: ChatMessage[]) {
  if (!isVisionModel(model)) {
    return messages;
  }

  return messages.map((message) => {
    if (message.role === "system") {
      return { role: message.role, content: message.content };
    }

    return {
      role: message.role,
      content: [{ type: "text" as const, text: message.content }],
    };
  });
}

function applyJsonInstruction(messages: ChatMessage[]): ChatMessage[] {
  const lastSystemIndex = messages.findIndex((m) => m.role === "system");
  if (lastSystemIndex >= 0) {
    return messages.map((message, index) =>
      index === lastSystemIndex
        ? {
            ...message,
            content: `${message.content}\n\n${JSON_ONLY_INSTRUCTION}`,
          }
        : message,
    );
  }

  return [{ role: "system", content: JSON_ONLY_INSTRUCTION }, ...messages];
}

function extractMessageText(data: ChatCompletionResponse): string {
  const content = data.choices?.[0]?.message?.content as unknown;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        if (part && typeof part === "object" && "text" in part) {
          return String((part as { text?: unknown }).text ?? "");
        }
        return "";
      })
      .join("");
  }
  return "";
}

/**
 * Pull a JSON object out of model text that may include fences or prose.
 */
export function extractJsonFromModelText(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start !== -1 && end > start) {
    return trimmed.slice(start, end + 1);
  }

  return trimmed;
}

async function callChatModel(
  model: string,
  params: {
    messages: ChatMessage[];
    maxTokens?: number;
    temperature?: number;
    responseFormat?: { type: "json_object" };
  },
): Promise<ChatCompletionResponse> {
  if (!AI_CONFIG.nvidiaApiKey) {
    throw new Error(
      "NVIDIA_API_KEY is not set. Add it to your .env.local file.",
    );
  }

  const messages = params.responseFormat
    ? applyJsonInstruction(params.messages)
    : params.messages;

  const res = await fetch(`${AI_CONFIG.nvidiaBaseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${AI_CONFIG.nvidiaApiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: toNvidiaMessages(model, messages),
      max_tokens: params.maxTokens || AI_CONFIG.maxTokens,
      temperature: params.temperature ?? AI_CONFIG.temperature,
      top_p: AI_CONFIG.topP,
      frequency_penalty: 0,
      presence_penalty: 0,
      stream: false,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "Unknown error");
    throw withStatus(
      `NVIDIA chat completion failed (${res.status}): ${errText}`,
      res.status,
    );
  }

  const data = (await res.json()) as ChatCompletionResponse;
  const text = extractMessageText(data);
  if (!data.choices?.length) {
    throw new Error("NVIDIA chat completion returned no choices");
  }

  // Normalize so callers always read choices[0].message.content as a string
  data.choices[0].message = {
    role: data.choices[0].message?.role || "assistant",
    content: text,
  };

  return data;
}

/**
 * NVIDIA chat completions with retry and model fallback.
 *
 * Retry strategy:
 * - On 429 / 503: exponential backoff, up to maxRetries attempts
 * - On other errors: try the next fallback model
 */
export async function chatCompletion(params: {
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
  responseFormat?: { type: "json_object" };
}): Promise<ChatCompletionResponse> {
  const models = AI_CONFIG.chatModels;
  let lastError: Error | null = null;

  for (let i = 0; i < models.length; i++) {
    const model = models[i];

    for (let attempt = 0; attempt <= AI_CONFIG.maxRetries; attempt++) {
      try {
        return await callChatModel(model, params);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        const statusCode = (lastError as Error & { statusCode?: number })
          .statusCode;

        if (isRetryableStatus(statusCode) && attempt < AI_CONFIG.maxRetries) {
          const delay = AI_CONFIG.retryBaseDelayMs * Math.pow(2, attempt);
          console.warn(
            `[Inzira AI] NVIDIA model ${model} rate-limited (attempt ${attempt + 1}/${AI_CONFIG.maxRetries}). Retrying in ${delay}ms...`,
          );
          await sleep(delay);
          continue;
        }

        break;
      }
    }

    if (i + 1 < models.length) {
      console.warn(
        `[Inzira AI] NVIDIA model ${model} failed. Trying fallback: ${models[i + 1]}`,
      );
    }
  }

  throw lastError || new Error("All NVIDIA chat completion attempts failed");
}

/**
 * Call OpenRouter embeddings with retry and fallback across multiple models.
 */
export async function generateEmbeddingsAPI(
  inputs: string | string[],
): Promise<number[][]> {
  if (!AI_CONFIG.openrouterApiKey) {
    throw new Error(
      "OPENROUTER_API_KEY is not set. Add it to your .env.local file.",
    );
  }

  const inputArray = Array.isArray(inputs) ? inputs : [inputs];
  const models = AI_CONFIG.embeddingModels;
  let lastError: Error | null = null;

  for (let i = 0; i < models.length; i++) {
    const model = models[i];

    for (let attempt = 0; attempt <= AI_CONFIG.maxRetries; attempt++) {
      try {
        const res = await fetch(`${AI_CONFIG.openrouterBaseUrl}/embeddings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${AI_CONFIG.openrouterApiKey}`,
            "HTTP-Referer": "https://inzira.rw",
            "X-Title": "Inzira",
          },
          body: JSON.stringify({
            model,
            input: inputArray,
          }),
        });

        if (!res.ok) {
          const errText = await res.text().catch(() => "Unknown error");
          throw withStatus(
            `OpenRouter embedding failed (${res.status}): ${errText}`,
            res.status,
          );
        }

        const data: EmbeddingResponse = await res.json();

        return data.data
          .sort((a, b) => a.index - b.index)
          .map((item) => item.embedding);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        const statusCode = (lastError as Error & { statusCode?: number })
          .statusCode;

        if (isRetryableStatus(statusCode) && attempt < AI_CONFIG.maxRetries) {
          const delay = AI_CONFIG.retryBaseDelayMs * Math.pow(2, attempt);
          console.warn(
            `[Inzira AI] Embedding model ${model} rate-limited (attempt ${attempt + 1}/${AI_CONFIG.maxRetries}). Retrying in ${delay}ms...`,
          );
          await sleep(delay);
          continue;
        }

        break;
      }
    }

    if (i + 1 < models.length) {
      console.warn(
        `[Inzira AI] Embedding model ${model} failed. Trying fallback: ${models[i + 1]}`,
      );
    }
  }

  throw lastError || new Error("All embedding attempts failed");
}
