// ============================================================
// INZIRA AI - Document Ingestion Pipeline
// Uses BGE-M3 embeddings via OpenRouter
// ============================================================

import { createClient } from "@/lib/supabase/server";
import { generateEmbeddings } from "./embeddings";
import { chunkText } from "./chunking";
import type { ChunkedText } from "./types";

export interface IngestResult {
  documentId: string;
  chunkCount: number;
  title: string;
  institution: string;
}

/**
 * Ingest a plain text document into the RAG system.
 *
 * Pipeline:
 * 1. Create a document record in Supabase
 * 2. Split text into chunks
 * 3. Generate BGE-M3 embeddings for all chunks
 * 4. Store chunks with embeddings in Supabase
 * 5. Update document record with chunk count
 */
export async function ingestDocument(params: {
  title: string;
  institution: string;
  description?: string;
  text: string;
  sourceUrl?: string;
  fileName?: string;
  metadata?: Record<string, unknown>;
}): Promise<IngestResult> {
  const { title, institution, description, text, sourceUrl, fileName, metadata } = params;

  const supabase = await createClient();

  // 1. Create the document record
  const { data: docRecord, error: docError } = await supabase
    .from("documents")
    .insert({
      title,
      institution,
      description: description || null,
      source_url: sourceUrl || null,
      verified: true,
      verified_at: new Date().toISOString(),
      file_name: fileName || null,
      chunk_count: 0,
    })
    .select("id")
    .single();

  if (docError || !docRecord) {
    throw new Error(`Failed to create document record: ${docError?.message}`);
  }

  const documentId = docRecord.id;

  // 2. Split text into chunks
  const chunkMetadata = {
    institution,
    documentTitle: title,
    ...metadata,
  };

  const pages = splitIntoPages(text);
  const chunks: ChunkedText[] = [];

  for (const page of pages) {
    const pageChunks = chunkText(page.text, chunkMetadata, page.pageNumber);
    chunks.push(...pageChunks);
  }

  if (chunks.length === 0) {
    throw new Error("No chunks generated from document text");
  }

  // 3. Generate BGE-M3 embeddings for all chunks
  const batchSize = 20;
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    const embeddings = await generateEmbeddings(
      batch.map((c) => c.content),
    );
    allEmbeddings.push(...embeddings);
  }

  // 4. Store chunks with embeddings in Supabase
  const chunkInserts = chunks.map((chunk, index) => ({
    document_id: documentId,
    content: chunk.content,
    page_number: chunk.pageNumber,
    chunk_index: chunk.chunkIndex,
    institution,
    embedding: JSON.stringify(allEmbeddings[index]),
    metadata: chunk.metadata,
  }));

  const insertBatchSize = 50;
  for (let i = 0; i < chunkInserts.length; i += insertBatchSize) {
    const batch = chunkInserts.slice(i, i + insertBatchSize);
    const { error: chunkError } = await supabase
      .from("document_chunks")
      .insert(batch);

    if (chunkError) {
      throw new Error(`Failed to insert chunks: ${chunkError.message}`);
    }
  }

  // 5. Update document with chunk count
  await supabase
    .from("documents")
    .update({ chunk_count: chunks.length })
    .eq("id", documentId);

  return {
    documentId,
    chunkCount: chunks.length,
    title,
    institution,
  };
}

/**
 * Simple page splitting for plain text.
 * Splits on form feeds, or every ~3000 characters at paragraph boundaries.
 */
function splitIntoPages(
  text: string,
): { text: string; pageNumber: number | null }[] {
  if (text.includes("\f")) {
    return text.split("\f").map((page, i) => ({
      text: page.trim(),
      pageNumber: i + 1,
    }));
  }

  const pageSize = 3000;
  const pages: { text: string; pageNumber: number | null }[] = [];
  const paragraphs = text.split(/\n\s*\n/);

  let currentText = "";
  let pageNum = 1;

  for (const para of paragraphs) {
    if (currentText.length + para.length + 2 > pageSize && currentText.length > 0) {
      pages.push({ text: currentText.trim(), pageNumber: pageNum });
      pageNum++;
      currentText = para;
    } else {
      currentText = currentText ? currentText + "\n\n" + para : para;
    }
  }

  if (currentText.trim().length > 0) {
    pages.push({ text: currentText.trim(), pageNumber: pageNum });
  }

  return pages;
}
