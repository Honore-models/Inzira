// ============================================================
// INZIRA AI - Configuration
// Chat (assistant + roadmaps) → NVIDIA NIM
// Embeddings (RAG) → OpenRouter
// ============================================================

export const AI_CONFIG = {
  nvidiaApiKey: process.env.NVIDIA_API_KEY || "",
  openrouterApiKey: process.env.OPENROUTER_API_KEY || "",

  nvidiaBaseUrl:
    process.env.NVIDIA_API_BASE_URL || "https://integrate.api.nvidia.com/v1",
  openrouterBaseUrl:
    process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",

  // Generation models (tried in order). NVIDIA NIM ids.
  chatModels: [
    process.env.AI_MODEL || "meta/llama-3.2-90b-vision-instruct",
    process.env.AI_MODEL_FALLBACK_1 || "meta/llama-3.1-70b-instruct",
    process.env.AI_MODEL_FALLBACK_2 || "meta/llama-3.3-70b-instruct",
  ],

  // Embedding models stay on OpenRouter (1024-d vectors)
  embeddingModels: [
    process.env.EMBEDDING_MODEL || "liquid/lfm-2.5-embedding-350m:free",
    process.env.EMBEDDING_MODEL_FALLBACK_1 || "nvidia/nemotron-3-embed-1b:free",
    process.env.EMBEDDING_MODEL_FALLBACK_2 ||
      "nvidia/llama-nemotron-embed-vl-1b-v2:free",
  ],

  embeddingDimensions: 1024,

  chunkSize: 1000,
  chunkOverlap: 200,

  topK: parseInt(process.env.RAG_TOP_K || "8", 10),
  similarityThreshold: 0.4,

  hybridWeights: {
    vector: 0.6,
    keyword: 0.25,
    metadata: 0.15,
  },

  // Roadmaps need room for JSON; keep temperature low for structured output
  maxTokens: 2048,
  temperature: 0.3,
  topP: 1,

  maxRetries: 3,
  retryBaseDelayMs: 2000,
} as const;

/**
 * Validate that required environment variables are set.
 * Returns a list of missing variables.
 */
export function validateConfig(): string[] {
  const missing: string[] = [];
  if (!process.env.NVIDIA_API_KEY) {
    missing.push("NVIDIA_API_KEY");
  }
  if (!process.env.OPENROUTER_API_KEY) {
    missing.push("OPENROUTER_API_KEY");
  }
  return missing;
}
