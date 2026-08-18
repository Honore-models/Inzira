// ============================================================
// INZIRA AI - Main entry point
// ============================================================

export { AI_CONFIG, validateConfig } from "./config";
export {
  chatCompletion,
  generateEmbeddingsAPI,
  type ChatMessage,
  type ChatCompletionResponse,
} from "./openai";
export { generateEmbedding, generateEmbeddings } from "./embeddings";
export { chunkText } from "./chunking";
export {
  hybridSearch,
  formatContextForPrompt,
  extractSources,
} from "./retrieval";
export {
  ASK_SYSTEM_PROMPT,
  ROADMAP_SYSTEM_PROMPT,
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
  AskRequest,
  ChunkedText,
} from "./types";
