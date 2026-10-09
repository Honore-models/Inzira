// ============================================================
// INZIRA AI - Optional embedding generation
//
// Embeddings are optional. When no provider is configured (or the provider
// fails), callers receive null and retrieval falls back to keyword ranking.
// ============================================================

import { AI_CONFIG, embeddingsEnabled } from "./config";

async function requestEmbeddings(
  model: string,
  inputs: string[],
): Promise<number[][]> {
  const res = await fetch(`${AI_CONFIG.embeddingBaseUrl}/embeddings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AI_CONFIG.embeddingApiKey}`,
    },
    body: JSON.stringify({ model, input: inputs }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Embedding ${model} failed (${res.status}): ${detail.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    data: { embedding: number[]; index: number }[];
  };
  const vectors = data.data
    .sort((a, b) => a.index - b.index)
    .map((item) => item.embedding);

  if (vectors.some((v) => v.length !== AI_CONFIG.embeddingDimensions)) {
    throw new Error(
      `Embedding ${model} returned vectors that are not ${AI_CONFIG.embeddingDimensions}-dimensional`,
    );
  }
  return vectors;
}

/**
 * Embed several texts. Returns null when embeddings are disabled or every
 * configured model fails.
 */
export async function generateEmbeddings(
  texts: string[],
): Promise<number[][] | null> {
  if (!embeddingsEnabled() || texts.length === 0) return null;

  for (const model of AI_CONFIG.embeddingModels) {
    try {
      return await requestEmbeddings(model, texts);
    } catch (error) {
      console.warn(
        `[Inzira AI] ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
  return null;
}

export async function generateEmbedding(
  text: string,
): Promise<number[] | null> {
  const result = await generateEmbeddings([text]);
  return result?.[0] ?? null;
}
