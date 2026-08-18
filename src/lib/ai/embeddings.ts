// ============================================================
// INZIRA AI - Embedding Generation (BGE-M3)
// All embeddings go through OpenRouter's API
// ============================================================

import { generateEmbeddingsAPI } from "./openai";

/**
 * Generate an embedding for a single text string.
 * Uses BGE-M3 (1024 dimensions) via OpenRouter.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const results = await generateEmbeddingsAPI(text);
  return results[0];
}

/**
 * Generate embeddings for multiple text strings.
 * Batches them in a single request for efficiency.
 */
export async function generateEmbeddings(
  texts: string[],
): Promise<number[][]> {
  if (texts.length === 0) return [];

  // OpenRouter handles batching internally
  return generateEmbeddingsAPI(texts);
}
