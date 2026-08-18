-- ============================================================
-- INZIRA RAG SYSTEM - DOCUMENTS & VECTOR SEARCH
-- Uses BGE-M3 embeddings (1024 dimensions)
-- Run this in Supabase SQL Editor AFTER enabling pgvector
-- ============================================================

-- Enable pgvector extension (must be done by superuser)
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================
-- DOCUMENTS TABLE
-- Stores metadata about verified documents from institutions
-- ============================================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  institution TEXT NOT NULL,
  description TEXT,
  version TEXT DEFAULT '1.0',
  source_url TEXT,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  file_name TEXT,
  chunk_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- DOCUMENT CHUNKS TABLE
-- Stores text chunks with BGE-M3 vector embeddings (1024 dims)
-- ============================================================
CREATE TABLE IF NOT EXISTS document_chunks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  page_number INTEGER,
  chunk_index INTEGER NOT NULL,
  institution TEXT NOT NULL DEFAULT '',
  embedding vector(1024),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_documents_institution ON documents(institution);
CREATE INDEX idx_documents_verified ON documents(verified);
CREATE INDEX idx_document_chunks_doc_id ON document_chunks(document_id);
CREATE INDEX idx_document_chunks_page ON document_chunks(page_number);
CREATE INDEX idx_document_chunks_institution ON document_chunks(institution);

-- HNSW index for fast approximate nearest neighbor search
-- using cosine distance for BGE-M3 (1024 dims)
CREATE INDEX idx_document_chunks_embedding
  ON document_chunks
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- GIN index for full-text search (hybrid retrieval)
CREATE INDEX idx_document_chunks_content_gin
  ON document_chunks
  USING gin (to_tsvector('english', content));

-- ============================================================
-- VECTOR SIMILARITY SEARCH FUNCTION
-- Returns the most similar chunks from verified documents
-- ============================================================
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1024),
  match_count int DEFAULT 8,
  similarity_threshold float DEFAULT 0.4
)
RETURNS TABLE (
  id uuid,
  content text,
  page_number integer,
  chunk_index integer,
  similarity float,
  document_id uuid,
  institution text,
  document_title text,
  document_description text,
  metadata jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.content,
    dc.page_number,
    dc.chunk_index,
    1 - (dc.embedding <=> query_embedding) AS similarity,
    dc.document_id,
    dc.institution,
    d.title AS document_title,
    d.description AS document_description,
    dc.metadata
  FROM document_chunks dc
  JOIN documents d ON d.id = dc.document_id
  WHERE d.verified = TRUE
    AND 1 - (dc.embedding <=> query_embedding) > similarity_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ============================================================
-- KEYWORD SEARCH FUNCTION (for hybrid retrieval)
-- Full-text search using PostgreSQL ts_vector
-- ============================================================
CREATE OR REPLACE FUNCTION search_documents_by_keyword(
  search_query text,
  match_count int DEFAULT 8
)
RETURNS TABLE (
  id uuid,
  content text,
  page_number integer,
  chunk_index integer,
  rank float,
  document_id uuid,
  institution text,
  document_title text,
  metadata jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.content,
    dc.page_number,
    dc.chunk_index,
    ts_rank_cd(to_tsvector('english', dc.content), plainto_tsquery('english', search_query))::float AS rank,
    dc.document_id,
    dc.institution,
    d.title AS document_title,
    dc.metadata
  FROM document_chunks dc
  JOIN documents d ON d.id = dc.document_id
  WHERE d.verified = TRUE
    AND to_tsvector('english', dc.content) @@ plainto_tsquery('english', search_query)
  ORDER BY rank DESC
  LIMIT match_count;
END;
$$;

-- ============================================================
-- RLS Policies for documents and chunks
-- ============================================================
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

-- Officers can manage documents
CREATE POLICY "Officers can manage documents"
  ON documents FOR ALL
  USING (public.is_officer());

-- Everyone (including youth) can read verified documents
CREATE POLICY "Anyone can read verified documents"
  ON documents FOR SELECT
  USING (verified = TRUE);

-- Officers can manage chunks
CREATE POLICY "Officers can manage chunks"
  ON document_chunks FOR ALL
  USING (public.is_officer());

-- Everyone can read chunks from verified documents
CREATE POLICY "Anyone can read verified chunks"
  ON document_chunks FOR SELECT
  USING (
    document_id IN (
      SELECT id FROM documents WHERE verified = TRUE
    )
  );

-- ============================================================
-- TRIGGER for updated_at on documents
-- ============================================================
CREATE TRIGGER set_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
