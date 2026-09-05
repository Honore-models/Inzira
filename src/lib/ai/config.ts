// ============================================================
// INZIRA AI - Configuration
// All models configurable via environment variables
// ============================================================

export const AI_CONFIG = {
  // OpenRouter API (single key for both embeddings and generation)
  openrouterApiKey: process.env.OPENROUTER_API_KEY || "",

  // Generation models (tried in order, first to last)
  // "openrouter/free" lets OpenRouter pick the best free model automatically
  chatModels: [
    process.env.AI_MODEL || "openrouter/free",
    process.env.AI_MODEL_FALLBACK_1 || "google/gemma-4-26b-a4b-it:free",
    process.env.AI_MODEL_FALLBACK_2 || "google/gemma-4-31b-it:free",
  ],

  // Embedding models (tried in order, first to last) — all free, 1024 dimensions
  embeddingModels: [
    process.env.EMBEDDING_MODEL || "liquid/lfm-2.5-embedding-350m:free",
    process.env.EMBEDDING_MODEL_FALLBACK_1 || "nvidia/nemotron-3-embed-1b:free",
    process.env.EMBEDDING_MODEL_FALLBACK_2 || "nvidia/llama-nemotron-embed-vl-1b-v2:free",
  ],

  // BGE-M3 outputs 1024-dimensional dense vectors
  embeddingDimensions: 1024,

  // Chunking settings
  chunkSize: 1000,
  chunkOverlap: 200,

  // Retrieval settings
  topK: parseInt(process.env.RAG_TOP_K || "8", 10),
  similarityThreshold: 0.4,

  // Hybrid retrieval weights
  hybridWeights: {
    vector: 0.6,
    keyword: 0.25,
    metadata: 0.15,
  },

  // Generation settings
  maxTokens: 2048,
  temperature: 0.3,

  // Retry settings for rate-limited models
  maxRetries: 3,
  retryBaseDelayMs: 2000,
} as const;

/**
 * Validate that required environment variables are set.
 * Returns a list of missing variables.
 */
export function validateConfig(): string[] {
  const missing: string[] = [];
  if (!process.env.OPENROUTER_API_KEY) {
    missing.push("OPENROUTER_API_KEY");
  }
  return missing;
}
