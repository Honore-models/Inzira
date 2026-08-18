// ============================================================
// INZIRA AI - TypeScript Types
// ============================================================

export interface DocumentRecord {
  id: string;
  title: string;
  institution: string;
  description: string | null;
  version: string;
  source_url: string | null;
  verified: boolean;
  verified_at: string | null;
  file_name: string | null;
  chunk_count: number;
  created_at: string;
  updated_at: string;
}

export interface DocumentChunk {
  id: string;
  document_id: string;
  content: string;
  page_number: number | null;
  chunk_index: number;
  institution: string;
  embedding: number[] | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface RetrievedChunk {
  id: string;
  content: string;
  page_number: number | null;
  chunk_index: number;
  similarity: number;
  document_id: string;
  institution: string;
  document_title: string;
  document_description: string | null;
  metadata: Record<string, unknown>;
}

export interface Source {
  documentId: string;
  documentTitle: string;
  institution: string;
  page: number | null;
}

export interface AskResponse {
  answer: string;
  sources: Source[];
}

export interface RoadmapYouth {
  name: string;
  goal: string;
  skillsBackground: string;
  district: string;
  sector: string;
}

export interface RoadmapStep {
  order: number;
  title: string;
  description: string;
  institution: string;
  location: string | null;
  whatToBring: string[];
  whyThisStep: string;
  sources: {
    documentId: string;
    documentTitle: string;
    institution: string;
    page: number | null;
  }[];
}

export interface RoadmapResponse {
  title: string;
  summary: string;
  steps: RoadmapStep[];
}

export interface GenerateRoadmapRequest {
  youth: RoadmapYouth;
  officerNotes: string;
  caseId?: string;
}

export interface AskRequest {
  question: string;
  youthId?: string;
}

export interface ChunkedText {
  content: string;
  pageNumber: number | null;
  chunkIndex: number;
  metadata: Record<string, unknown>;
}
