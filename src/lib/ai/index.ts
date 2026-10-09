// ============================================================
// INZIRA AI - Main entry point
// ============================================================

export { AI_CONFIG, validateConfig, embeddingsEnabled } from "./config";
export {
  chatCompletion,
  chatCompletionStream,
  describeAIError,
  extractJsonFromModelText,
  AIServiceError,
  type ChatMessage,
} from "./groq";
export { generateEmbedding, generateEmbeddings } from "./embeddings";
export { chunkText } from "./chunking";
export {
  hybridSearch,
  formatContextForPrompt,
  extractSources,
  invalidateRetrievalCache,
} from "./retrieval";
export {
  ASK_SYSTEM_PROMPT,
  ROADMAP_SYSTEM_PROMPT,
  OFF_TOPIC_RESPONSE,
  NO_INFO_RESPONSE,
  buildAskUserPrompt,
  buildRoadmapUserPrompt,
} from "./prompts";
export { ingestDocument } from "./ingestion";
export type {
  DocumentRecord,
  DocumentChunk,
  RetrievedChunk,
  Source,
  AskResponse,
  RoadmapResponse,
  RoadmapStep,
  RoadmapYouth,
  GenerateRoadmapRequest,
  ChunkedText,
} from "./types";
