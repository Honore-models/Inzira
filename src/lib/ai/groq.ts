// ============================================================
// INZIRA AI - Groq chat client (OpenAI-compatible API)
// ============================================================

import { AI_CONFIG } from "./config";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionResult {
  content: string;
  model: string;
}

export class AIServiceError extends Error {
  constructor(
    message: string,
    readonly statusCode?: number,
  ) {
    super(message);
    this.name = "AIServiceError";
  }

  get isRateLimit(): boolean {
    return this.statusCode === 429;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Pull a JSON object out of model text that may include fences or prose.
 */
export function extractJsonFromModelText(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start !== -1 && end > start) return trimmed.slice(start, end + 1);

  return trimmed;
}

/** Reasoning models may emit a <think> block before the answer. */
function stripReasoning(text: string): string {
  return text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
}

async function callModel(
  model: string,
  params: {
    messages: ChatMessage[];
    maxTokens?: number;
    temperature?: number;
    json?: boolean;
  },
): Promise<ChatCompletionResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AI_CONFIG.requestTimeoutMs);

  try {
    const res = await fetch(`${AI_CONFIG.groqBaseUrl}/chat/completions`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AI_CONFIG.groqApiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: params.messages,
        max_tokens: params.maxTokens ?? AI_CONFIG.maxTokens,
        temperature: params.temperature ?? AI_CONFIG.temperature,
        ...(params.json ? { response_format: { type: "json_object" } } : {}),
        // gpt-oss models reason before answering, and that reasoning counts
        // against max_tokens. Keep it short so the answer isn't truncated.
        ...(model.startsWith("openai/gpt-oss") ? { reasoning_effort: "low" } : {}),
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new AIServiceError(
        `Groq ${model} failed (${res.status}): ${detail.slice(0, 300)}`,
        res.status,
      );
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string | null } }[];
    };
    const content = stripReasoning(data.choices?.[0]?.message?.content || "");
    if (!content) {
      throw new AIServiceError(`Groq ${model} returned an empty response`);
    }
    return { content, model };
  } catch (error) {
    if (error instanceof AIServiceError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new AIServiceError(`Groq ${model} timed out`, 504);
    }
    throw new AIServiceError(
      `Groq ${model} request failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Chat completion with model fallback.
 *
 * Every Groq model has an independent rate-limit bucket, so on any failure we
 * move straight to the next model. Only if every model is rate-limited do we
 * wait briefly and make one more pass.
 */
export async function chatCompletion(params: {
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
  json?: boolean;
}): Promise<ChatCompletionResult> {
  if (!AI_CONFIG.groqApiKey) {
    throw new AIServiceError(
      "GROQ_API_KEY is not set. Add it to your environment (see .env.local.example).",
      500,
    );
  }

  let lastError: AIServiceError | null = null;

  for (let pass = 0; pass < 2; pass++) {
    let allRateLimited = true;

    for (const model of AI_CONFIG.chatModels) {
      try {
        return await callModel(model, params);
      } catch (error) {
        lastError =
          error instanceof AIServiceError
            ? error
            : new AIServiceError(String(error));
        if (!lastError.isRateLimit) allRateLimited = false;
        console.warn(`[Inzira AI] ${lastError.message}`);
      }
    }

    if (!allRateLimited) break;
    await sleep(3000);
  }

  throw lastError || new AIServiceError("All Groq models failed");
}

/** A user-safe message and HTTP status for an AI failure. */
export function describeAIError(error: unknown): {
  message: string;
  status: number;
} {
  if (error instanceof AIServiceError && error.isRateLimit) {
    return {
      message:
        "The AI assistant is busy right now. Please wait a minute and try again.",
      status: 429,
    };
  }
  return {
    message: "The AI assistant is unavailable right now. Please try again shortly.",
    status: 503,
  };
}

/**
 * Streaming chat completion, resilient to slow or unstable networks.
 *
 * Resolves only once a model has produced its first words, so a model that
 * hangs is abandoned after FIRST_TOKEN_MS and the next one is tried. If every
 * model fails at the network level, one more pass is made.
 */
const FIRST_TOKEN_MS = 8_000;
const STALL_MS = 12_000;

export async function chatCompletionStream(params: {
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
}): Promise<{ model: string; tokens: AsyncGenerator<string> }> {
  if (!AI_CONFIG.groqApiKey) {
    throw new AIServiceError("GROQ_API_KEY is not set.", 500);
  }

  let lastError: AIServiceError | null = null;

  for (let pass = 0; pass < 2; pass++) {
    for (const model of AI_CONFIG.chatModels) {
      const controller = new AbortController();
      const firstTokenTimer = setTimeout(() => controller.abort(), FIRST_TOKEN_MS);
      try {
        const res = await fetch(`${AI_CONFIG.groqBaseUrl}/chat/completions`, {
          method: "POST",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${AI_CONFIG.groqApiKey}`,
          },
          body: JSON.stringify({
            model,
            stream: true,
            messages: params.messages,
            max_tokens: params.maxTokens ?? AI_CONFIG.maxTokens,
            temperature: params.temperature ?? AI_CONFIG.temperature,
            ...(model.startsWith("openai/gpt-oss") ? { reasoning_effort: "low" } : {}),
          }),
        });

        if (!res.ok || !res.body) {
          const detail = await res.text().catch(() => "");
          throw new AIServiceError(`Groq ${model} failed (${res.status}): ${detail.slice(0, 200)}`, res.status);
        }

        // Wait for the first words before committing to this model.
        const tokens = readTokens(res.body, controller);
        const first = await tokens.next();
        clearTimeout(firstTokenTimer);
        if (first.done) throw new AIServiceError(`Groq ${model} returned an empty answer`);

        return {
          model,
          tokens: (async function* () {
            yield first.value;
            yield* tokens;
          })(),
        };
      } catch (error) {
        clearTimeout(firstTokenTimer);
        lastError =
          error instanceof AIServiceError
            ? error
            : new AIServiceError(
                controller.signal.aborted
                  ? `Groq ${model} did not respond within ${FIRST_TOKEN_MS / 1000}s`
                  : `Groq ${model} request failed: ${error instanceof Error ? error.message : String(error)}`,
                controller.signal.aborted ? 504 : undefined,
              );
        console.warn(`[Inzira AI] ${lastError.message}`);
      }
    }
    if (pass === 0) await sleep(800);
  }

  throw lastError || new AIServiceError("All Groq models failed");
}

/** Parse an OpenAI-style SSE stream into answer text, hiding <think> blocks. */
async function* readTokens(
  body: ReadableStream<Uint8Array>,
  controller: AbortController,
): AsyncGenerator<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let inThink = false;
  let stall: ReturnType<typeof setTimeout> | undefined;
  const armStall = () => {
    clearTimeout(stall);
    stall = setTimeout(() => controller.abort(), STALL_MS);
  };

  try {
    armStall();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      armStall();
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const data = line.slice(5).trim();
        if (!data || data === "[DONE]") continue;
        let text = "";
        try {
          text = JSON.parse(data).choices?.[0]?.delta?.content || "";
        } catch {
          continue;
        }
        if (!text) continue;

        // Some models stream their reasoning inside <think>…</think>.
        if (inThink || text.includes("<think>")) {
          const end = text.indexOf("</think>");
          if (end === -1) {
            inThink = true;
            continue;
          }
          inThink = false;
          text = text.slice(end + "</think>".length);
          if (!text) continue;
        }
        yield text;
      }
    }
  } finally {
    clearTimeout(stall);
    reader.releaseLock();
  }
}
