// ============================================================
// INZIRA AI - Text Chunking
// ============================================================

import { AI_CONFIG } from "./config";
import type { ChunkedText } from "./types";

/**
 * Split text into overlapping chunks for embedding.
 *
 * Strategy:
 * - Split first by paragraphs (natural breaks)
 * - Then by sentences within paragraphs
 * - Merge small paragraphs/sentences until chunk size is reached
 * - Add overlap from the end of the previous chunk
 */
export function chunkText(
  text: string,
  metadata: Record<string, unknown> = {},
  pageNumber: number | null = null,
): ChunkedText[] {
  const { chunkSize, chunkOverlap } = AI_CONFIG;

  // Split into paragraphs first
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const chunks: ChunkedText[] = [];
  let currentChunk = "";
  let chunkIndex = 0;

  for (const paragraph of paragraphs) {
    // If a single paragraph exceeds chunk size, split by sentences
    if (paragraph.length > chunkSize) {
      const sentences = splitIntoSentences(paragraph);

      for (const sentence of sentences) {
        if (currentChunk.length + sentence.length + 1 > chunkSize) {
          // Save current chunk if it has content
          if (currentChunk.trim().length > 0) {
            chunks.push({
              content: currentChunk.trim(),
              pageNumber,
              chunkIndex,
              metadata,
            });
            chunkIndex++;

            // Start new chunk with overlap from the end of the previous chunk
            const overlapText = getOverlapText(currentChunk, chunkOverlap);
            currentChunk = overlapText
              ? overlapText + " " + sentence
              : sentence;
          } else {
            currentChunk = sentence;
          }
        } else {
          currentChunk = currentChunk
            ? currentChunk + " " + sentence
            : sentence;
        }
      }
    } else {
      // Check if adding this paragraph would exceed chunk size
      if (
        currentChunk.length + paragraph.length + 2 >
        chunkSize
      ) {
        // Save current chunk
        if (currentChunk.trim().length > 0) {
          chunks.push({
            content: currentChunk.trim(),
            pageNumber,
            chunkIndex,
            metadata,
          });
          chunkIndex++;

          // Start new chunk with overlap
          const overlapText = getOverlapText(currentChunk, chunkOverlap);
          currentChunk = overlapText
            ? overlapText + "\n\n" + paragraph
            : paragraph;
        } else {
          currentChunk = paragraph;
        }
      } else {
        currentChunk = currentChunk
          ? currentChunk + "\n\n" + paragraph
          : paragraph;
      }
    }
  }

  // Don't forget the last chunk
  if (currentChunk.trim().length > 0) {
    chunks.push({
      content: currentChunk.trim(),
      pageNumber,
      chunkIndex,
      metadata,
    });
  }

  return chunks;
}

/**
 * Split text into sentences while preserving the sentence structure.
 */
function splitIntoSentences(text: string): string[] {
  // Split on sentence-ending punctuation followed by space or end of string
  // Handle common abbreviations and edge cases
  const sentences = text
    .replace(/([.!?])\s+/g, "$1|SPLIT|")
    .split("|SPLIT|")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  return sentences;
}

/**
 * Get overlap text from the end of a chunk.
 * Takes the last N characters, trying to break at a word or sentence boundary.
 */
function getOverlapText(text: string, overlapSize: number): string {
  if (text.length <= overlapSize) return text;

  const overlap = text.slice(-overlapSize);

  // Try to start at a sentence boundary
  const sentenceStart = overlap.indexOf(". ");
  if (sentenceStart > 0) {
    return overlap.slice(sentenceStart + 2);
  }

  // Try to start at a word boundary
  const spaceIndex = overlap.indexOf(" ");
  if (spaceIndex > 0) {
    return overlap.slice(spaceIndex + 1);
  }

  return overlap;
}
