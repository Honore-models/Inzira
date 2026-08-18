// ============================================================
// INZIRA AI - Configuration
// All models configurable via environment variables
// ============================================================

export const AI_CONFIG = {
  // OpenRouter API (single key for both embeddings and generation)
  openrouterApiKey: process.env.OPENROUTER_API_KEY || "",

  // Generation model (Gemma 4 26B A4B via OpenRouter)
  chatModel: process.env.AI_MODEL || "google/gemma-4-26b-a4b-it:free",

  // Embedding model (BGE-M3 via OpenRouter)
  embeddingModel: process.env.EMBEDDING_MODEL || "BAAI/bge-m3",

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
