// ============================================================
// INZIRA AI - Configuration
// Chat (assistant + roadmaps) → Groq (free tier, OpenAI-compatible API)
// Embeddings (optional)       → any OpenAI-compatible /embeddings endpoint
//
// Groq does not offer embedding models. Retrieval therefore works without
// embeddings (BM25 keyword ranking over the verified library). If an
// embedding provider is configured, vector similarity is blended in.
// ============================================================

function list(...values: (string | undefined)[]): string[] {
  return Array.from(
    new Set(values.map((v) => v?.trim()).filter((v): v is string => !!v)),
  );
}

export const AI_CONFIG = {
  groqApiKey: process.env.GROQ_API_KEY || "",
  groqBaseUrl: process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1",

  // Generation models, tried in order. Each Groq model has its own rate-limit
  // bucket, so falling through the list is the fastest way past a 429.
  chatModels: list(
    process.env.AI_MODEL || "openai/gpt-oss-120b",
    process.env.AI_MODEL_FALLBACK_1 || "openai/gpt-oss-20b",
    process.env.AI_MODEL_FALLBACK_2 || "qwen/qwen3.8-27b",
  ),

  // Optional embeddings (1024-d to match the pgvector column).
  embeddingApiKey:
    process.env.EMBEDDING_API_KEY || process.env.OPENROUTER_API_KEY || "",
  embeddingBaseUrl:
    process.env.EMBEDDING_BASE_URL || "https://openrouter.ai/api/v1",
  embeddingModels: list(
    process.env.EMBEDDING_MODEL,
    process.env.EMBEDDING_MODEL_FALLBACK_1,
  ),
  embeddingDimensions: 1024,

  chunkSize: 1000,
  chunkOverlap: 200,

  topK: parseInt(process.env.RAG_TOP_K || "8", 10),
  similarityThreshold: 0.4,

  hybridWeights: {
    vector: 0.6,
    keyword: 0.4,
  },

  maxTokens: 1024,
  roadmapMaxTokens: 3000,
  temperature: 0.2,

  requestTimeoutMs: 25_000,
} as const;

export function embeddingsEnabled(): boolean {
  return !!AI_CONFIG.embeddingApiKey && AI_CONFIG.embeddingModels.length > 0;
}

/**
 * Validate that required environment variables are set.
 * Returns a list of missing variables.
 */
export function validateConfig(): string[] {
  const missing: string[] = [];
  if (!process.env.GROQ_API_KEY) missing.push("GROQ_API_KEY");
  return missing;
}
