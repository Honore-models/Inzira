// ============================================================
// INZIRA AI - Hybrid Retrieval
//
// Keyword relevance: BM25 computed in-app over every chunk of every verified
// document. The verified library is small (a handful of documents), so this
// is fast and — unlike Postgres `plainto_tsquery`, which requires every word
// to match — it ranks natural-language questions well.
//
// Vector similarity (pgvector) is blended in when embeddings are available.
// ============================================================

import { createClient } from "@/lib/supabase/server";
import { AI_CONFIG } from "./config";
import type { RetrievedChunk, Source } from "./types";

type CorpusChunk = Omit<RetrievedChunk, "similarity"> & {
  terms: Map<string, number>;
  length: number;
};

interface Corpus {
  chunks: CorpusChunk[];
  docFreq: Map<string, number>;
  avgLength: number;
  loadedAt: number;
}

const CORPUS_TTL_MS = 5 * 60 * 1000;
let corpusCache: Corpus | null = null;

const STOP_WORDS = new Set(
  (
    "a an and are as at be but by can could do does for from get got has have how i if in into is it its " +
    "me my of on or our should so that the their them then there these they this to us was we what when " +
    "where which who why will with would you your about need want please tell know also any"
  ).split(" "),
);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t))
    .map(stem);
}

const SUFFIXES = ["ations", "ation", "ments", "ings", "ment", "ing", "ies", "ers", "es", "ed", "er", "s"];

/**
 * Light stemming: strip one common suffix, then keep a 6-character prefix so
 * "register", "registering" and "registration" all land on "regist".
 */
function stem(token: string): string {
  let word = token;
  if (!word.endsWith("ss")) {
    for (const suffix of SUFFIXES) {
      if (word.endsWith(suffix) && word.length - suffix.length >= 3) {
        word = word.slice(0, -suffix.length);
        break;
      }
    }
  }
  return word.slice(0, 6);
}

/** Drop the cached corpus, e.g. after ingesting a new document. */
export function invalidateRetrievalCache(): void {
  corpusCache = null;
}

async function loadCorpus(): Promise<Corpus> {
  if (corpusCache && Date.now() - corpusCache.loadedAt < CORPUS_TTL_MS) {
    return corpusCache;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("document_chunks")
    .select(
      "id, content, page_number, chunk_index, document_id, institution, metadata, documents!inner(title, description, verified)",
    )
    .eq("documents.verified", true)
    .limit(5000);

  if (error) {
    throw new Error(`Failed to load the verified library: ${error.message}`);
  }

  const docFreq = new Map<string, number>();
  let totalLength = 0;

  const chunks: CorpusChunk[] = (data || []).map((row) => {
    const doc = (Array.isArray(row.documents) ? row.documents[0] : row.documents) as
      | { title: string; description: string | null }
      | undefined;
    const tokens = tokenize(`${doc?.title || ""} ${row.institution} ${row.content}`);
    const terms = new Map<string, number>();
    for (const t of tokens) terms.set(t, (terms.get(t) || 0) + 1);
    for (const t of terms.keys()) docFreq.set(t, (docFreq.get(t) || 0) + 1);
    totalLength += tokens.length;

    return {
      id: row.id,
      content: row.content,
      page_number: row.page_number,
      chunk_index: row.chunk_index,
      document_id: row.document_id,
      institution: row.institution,
      document_title: doc?.title || "Untitled document",
      document_description: doc?.description || null,
      metadata: (row.metadata as Record<string, unknown>) || {},
      terms,
      length: tokens.length,
    };
  });

  corpusCache = {
    chunks,
    docFreq,
    avgLength: chunks.length ? totalLength / chunks.length : 1,
    loadedAt: Date.now(),
  };
  return corpusCache;
}

function bm25Scores(corpus: Corpus, query: string): Map<string, number> {
  const k1 = 1.4;
  const b = 0.75;
  const n = corpus.chunks.length;
  const queryTerms = Array.from(new Set(tokenize(query)));
  const scores = new Map<string, number>();

  for (const chunk of corpus.chunks) {
    let score = 0;
    for (const term of queryTerms) {
      const tf = chunk.terms.get(term);
      if (!tf) continue;
      const df = corpus.docFreq.get(term) || 0;
      const idf = Math.log(1 + (n - df + 0.5) / (df + 0.5));
      score +=
        idf *
        ((tf * (k1 + 1)) /
          (tf + k1 * (1 - b + (b * chunk.length) / corpus.avgLength)));
    }
    if (score > 0) scores.set(chunk.id, score);
  }
  return scores;
}

async function vectorScores(
  embedding: number[],
  limit: number,
): Promise<Map<string, number>> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("match_documents", {
    query_embedding: JSON.stringify(embedding),
    match_count: limit,
    similarity_threshold: AI_CONFIG.similarityThreshold,
  });
  if (error) {
    console.warn("[Inzira AI] Vector search unavailable:", error.message);
    return new Map();
  }
  return new Map(
    (data || []).map((row: { id: string; similarity: number }) => [
      row.id,
      row.similarity,
    ]),
  );
}

/**
 * Rank verified chunks for a query. `queryEmbedding` is optional; without it
 * ranking is purely lexical.
 */
export async function hybridSearch(params: {
  queryText: string;
  queryEmbedding?: number[] | null;
  topK?: number;
  institution?: string;
}): Promise<RetrievedChunk[]> {
  const topK = params.topK ?? AI_CONFIG.topK;
  const corpus = await loadCorpus();
  if (corpus.chunks.length === 0) return [];

  const keyword = bm25Scores(corpus, params.queryText);
  const vector = params.queryEmbedding
    ? await vectorScores(params.queryEmbedding, topK * 3)
    : new Map<string, number>();

  const maxKeyword = Math.max(0, ...keyword.values());
  const useVector = vector.size > 0;
  const weights = AI_CONFIG.hybridWeights;

  const ranked = corpus.chunks
    .filter(
      (c) =>
        (!params.institution || c.institution === params.institution) &&
        (keyword.has(c.id) || vector.has(c.id)),
    )
    .map((c) => {
      const kw = maxKeyword > 0 ? (keyword.get(c.id) || 0) / maxKeyword : 0;
      const vec = vector.get(c.id) || 0;
      const score = useVector ? vec * weights.vector + kw * weights.keyword : kw;
      return { chunk: c, score, vec };
    })
    // Discard weak lexical matches (e.g. one common word in a long chunk).
    .filter((r) => r.score >= (useVector ? 0.2 : 0.15))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return ranked.map(({ chunk, score, vec }) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { terms, length, ...rest } = chunk;
    return { ...rest, similarity: useVector ? vec : score };
  });
}

/**
 * Format retrieved chunks into a context string for the LLM prompt.
 * Each source is numbered so the model can cite it as [1], [2], …
 */
export function formatContextForPrompt(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) {
    return "No relevant verified information was found in the Inzira source library.";
  }

  return chunks
    .map((chunk, index) => {
      const pageInfo = chunk.page_number ? ` (page ${chunk.page_number})` : "";
      return `[${index + 1}] ${chunk.institution} — ${chunk.document_title}${pageInfo}\ndocumentId: ${chunk.document_id}\n${chunk.content}`;
    })
    .join("\n\n---\n\n");
}

/**
 * Unique sources (document + page) from retrieved chunks.
 */
export function extractSources(chunks: RetrievedChunk[]): Source[] {
  const seen = new Set<string>();
  const sources: Source[] = [];

  for (const chunk of chunks) {
    const key = `${chunk.document_id}-${chunk.page_number ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    sources.push({
      documentId: chunk.document_id,
      documentTitle: chunk.document_title,
      institution: chunk.institution,
      page: chunk.page_number,
    });
  }
  return sources;
}
