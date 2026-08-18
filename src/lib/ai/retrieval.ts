// ============================================================
// INZIRA AI - Hybrid Retrieval System
// Combines: vector similarity + keyword search + metadata filtering
// ============================================================

import { createClient } from "@/lib/supabase/server";
import { AI_CONFIG } from "./config";
import type { RetrievedChunk } from "./types";

/**
 * Hybrid retrieval: combines vector similarity, keyword matching,
 * and metadata filtering into a single ranked result set.
 *
 * Strategy:
 * 1. Run vector similarity search (pgvector)
 * 2. Run keyword/text search (PostgreSQL full-text)
 * 3. Merge results with configurable weights
 * 4. Apply metadata filters
 * 5. Return top-K results
 */
export async function hybridSearch(params: {
  queryEmbedding: number[];
  queryText: string;
  topK?: number;
  metadataFilters?: {
    institution?: string;
    documentId?: string;
    verified?: boolean;
  };
}): Promise<RetrievedChunk[]> {
  const {
    queryEmbedding,
    queryText,
    topK = AI_CONFIG.topK,
    metadataFilters,
  } = params;

  const supabase = await createClient();

  // Run both searches in parallel
  const [vectorResults, keywordResults] = await Promise.all([
    vectorSearch(supabase, queryEmbedding, topK * 2, metadataFilters),
    keywordSearch(supabase, queryText, topK * 2, metadataFilters),
  ]);

  // Merge and rank results
  const merged = mergeResults(vectorResults, keywordResults, topK);

  return merged;
}

/**
 * Pure vector similarity search via pgvector.
 */
async function vectorSearch(
  supabase: Awaited<ReturnType<typeof createClient>>,
  queryEmbedding: number[],
  limit: number,
  filters?: { institution?: string; documentId?: string },
): Promise<(RetrievedChunk & { vectorScore: number })[]> {
  const { data, error } = await supabase.rpc("match_documents", {
    query_embedding: JSON.stringify(queryEmbedding),
    match_count: limit,
    similarity_threshold: AI_CONFIG.similarityThreshold,
  });

  if (error) {
    console.error("Vector search error:", error);
    return [];
  }

  return (data || []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    content: row.content as string,
    page_number: row.page_number as number | null,
    chunk_index: row.chunk_index as number,
    similarity: row.similarity as number,
    document_id: row.document_id as string,
    institution: row.institution as string,
    document_title: row.document_title as string,
    document_description: (row.document_description as string) || null,
    metadata: (row.metadata as Record<string, unknown>) || {},
    vectorScore: row.similarity as number,
  }));
}

/**
 * Full-text keyword search via PostgreSQL ts_vector.
 */
async function keywordSearch(
  supabase: Awaited<ReturnType<typeof createClient>>,
  queryText: string,
  limit: number,
  filters?: { institution?: string; documentId?: string },
): Promise<(RetrievedChunk & { keywordScore: number })[]> {
  const { data, error } = await supabase.rpc("search_documents_by_keyword", {
    search_query: queryText,
    match_count: limit,
  });

  if (error) {
    console.error("Keyword search error:", error);
    return [];
  }

  return (data || []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    content: row.content as string,
    page_number: row.page_number as number | null,
    chunk_index: row.chunk_index as number,
    similarity: 0,
    document_id: row.document_id as string,
    institution: row.institution as string,
    document_title: row.document_title as string,
    document_description: null,
    metadata: (row.metadata as Record<string, unknown>) || {},
    keywordScore: (row.rank as number) || 0,
  }));
}

/**
 * Merge vector and keyword results using weighted scoring.
 * Verified documents are always preferred.
 */
function mergeResults(
  vectorResults: (RetrievedChunk & { vectorScore: number })[],
  keywordResults: (RetrievedChunk & { keywordScore: number })[],
  topK: number,
): RetrievedChunk[] {
  const weights = AI_CONFIG.hybridWeights;
  const scoreMap = new Map<
    string,
    { chunk: RetrievedChunk; totalScore: number; bestSimilarity: number }
  >();

  // Score vector results
  for (const chunk of vectorResults) {
    const existing = scoreMap.get(chunk.id);
    const score = chunk.vectorScore * weights.vector;
    if (existing) {
      existing.totalScore += score;
      existing.bestSimilarity = Math.max(existing.bestSimilarity, chunk.vectorScore);
    } else {
      scoreMap.set(chunk.id, { chunk, totalScore: score, bestSimilarity: chunk.vectorScore });
    }
  }

  // Score keyword results
  for (const chunk of keywordResults) {
    // Normalize keyword score to 0-1 range
    const normalizedKeywordScore = Math.min(chunk.keywordScore * 10, 1);
    const score = normalizedKeywordScore * weights.keyword;
    const existing = scoreMap.get(chunk.id);
    if (existing) {
      existing.totalScore += score;
    } else {
      scoreMap.set(chunk.id, {
        chunk,
        totalScore: score,
        bestSimilarity: 0,
      });
    }
  }

  // Sort by total score and return top-K
  const sorted = Array.from(scoreMap.values())
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, topK);

  return sorted.map(({ chunk, bestSimilarity }) => ({
    ...chunk,
    similarity: bestSimilarity,
  }));
}

/**
 * Format retrieved chunks into a context string for the LLM prompt.
 * Each source is clearly labeled with institution, document, and page.
 */
export function formatContextForPrompt(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) {
    return "No relevant verified information was found in the Inzira source library.";
  }

  return chunks
    .map((chunk, index) => {
      const pageInfo = chunk.page_number ? ` (Page ${chunk.page_number})` : "";
      return `SOURCE ${index + 1}\nInstitution: ${chunk.institution}\nDocument: ${chunk.document_title}${pageInfo}\n\nContent:\n${chunk.content}`;
    })
    .join("\n\n---\n\n");
}

/**
 * Extract unique sources from retrieved chunks for the response.
 */
export function extractSources(
  chunks: RetrievedChunk[],
): {
  documentId: string;
  documentTitle: string;
  institution: string;
  page: number | null;
}[] {
  const seen = new Set<string>();
  const sources: {
    documentId: string;
    documentTitle: string;
    institution: string;
    page: number | null;
  }[] = [];

  for (const chunk of chunks) {
    const key = `${chunk.document_id}-${chunk.page_number || ""}`;
    if (!seen.has(key)) {
      seen.add(key);
      sources.push({
        documentId: chunk.document_id,
        documentTitle: chunk.document_title,
        institution: chunk.institution,
        page: chunk.page_number,
      });
    }
  }

  return sources;
}
