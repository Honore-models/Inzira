# Inzira - Project Documentation

**Kinyarwanda for "the path" or "the way"**

A guided platform connecting unemployed youth in Rwanda to real government and institutional employment programs, sequenced correctly and reviewed by a human before it reaches them.

---

## 1. Purpose

Rwanda has real, funded youth employment infrastructure: RDB handles business registration, RRA issues tax identification, RTB runs vocational (TVET) training, and BRD offers loan guarantees that specifically favor youth-owned businesses. None of this is aspirational - it exists and is actively funded today.

The problem is not a lack of opportunity. It's that these programs are spread across separate institutions that don't communicate with each other, each assuming the applicant already knows what to do and in what order. A youth who wants to start a business often doesn't know they need to register that business *before* they can qualify for a loan guarantee, or that a specific TVET certificate unlocks a specific funding category. As a result, real, funded help goes unused - not from scarcity, but from invisibility and poor sequencing.

**Inzira exists to solve one specific problem: turning scattered institutional knowledge into one guided, correctly-ordered, human-approved path.**

It does not attempt to solve youth unemployment itself, fix underlying credit constraints, or replace the judgment of the people who currently do this work. It removes the navigation and coordination barrier - the "I didn't know what to do next" problem - while keeping every real decision in human hands.

---

## 2. Target Audience

Inzira serves two connected user groups:

**1. Youth (roughly ages 16–30)** in rural and peri-urban Rwanda seeking to start a business, pursue vocational training, or find employment - often navigating this process for the first time, with varying digital literacy and inconsistent access to smartphones or reliable data.

**2. Youth officers** - local government or cooperative staff whose job is to guide these youth through available programs, currently done manually, from memory, case by case, with no shared system to track caseloads or draft plans quickly.

---

## 3. Main Features

### Youth-facing side

| Feature | Description |
|---|---|
| **Onboarding** | A short guided intake: name, goal (start a business / get training / find a job), current skills, and district |
| **Home dashboard** | Shows the single next step, current progress, and quick links |
| **My Steps (roadmap)** | Full step-by-step plan, sequenced by dependency. Each step shows what to do, where to go, and what to bring. Steps unlock one at a time as the previous one is marked done |
| **Ask Inzira (AI companion)** | A chat interface answering questions strictly from a verified document library (RDB, RRA, RTB, BRD, Ministry of Youth), using Retrieval-Augmented Generation with vector search. High-stakes financial or legal questions are handed off to a real officer |
| **Find Help** | A searchable directory of verified institutions, filterable by category |

### Officer-facing side

| Feature | Description |
|---|---|
| **Dashboard** | At-a-glance stats: total youth, need roadmap, active cases, completed |
| **Smart Intake** | Officer enters notes about a youth; AI drafts a step-by-step roadmap grounded in the verified document library using RAG; officer reviews, edits, and explicitly approves before the youth sees it |
| **Youth List** | Table view of the officer's full caseload, with status indicators (needs roadmap / in progress / completed / not onboarded) and search/filter |
| **Youth Detail** | Profile view with submitted information, current roadmap steps, progress tracking, and a button to generate or regenerate the roadmap |

### Core design principle

The AI drafts. The officer decides. The sequencing logic (what step must come before another) is based on fixed, verified pathway rules - not AI inference - because an incorrect order could cost someone real time or a missed opportunity. Every roadmap a youth sees has been reviewed and approved by a human first.

---

## 4. Technical Overview

### Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15 (App Router), TypeScript, CSS Modules |
| **Backend / Database** | Supabase (PostgreSQL with pgvector extension) |
| **Authentication** | NextAuth.js v5 (beta) with credentials provider |
| **AI Generation** | OpenRouter API (OpenAI-compatible) - primary model: `openai/gpt-oss-20b:free`, fallback: `z-ai/glm-5.2:free` |
| **AI Embeddings** | BGE-M3 (`BAAI/bge-m3`) via OpenRouter - 1024-dimensional vectors |
| **Vector Search** | Supabase pgvector with HNSW index for fast approximate nearest neighbor search |
| **Deployment** | Vercel, auto-deployed from GitHub on every push to `main` |

### Database Schema

#### Core tables

```sql
-- Profiles (linked to auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('youth', 'officer')),
  goal TEXT,
  skills TEXT,
  skills_background TEXT,
  situation TEXT,
  district TEXT,
  sector TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Youth cases (managed by officers)
CREATE TABLE youth_cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  youth_profile_id UUID NOT NULL REFERENCES profiles(id),
  officer_profile_id UUID REFERENCES profiles(id),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('pending','active','completed','archived')),
  current_step INTEGER DEFAULT 0,
  total_steps INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Roadmap steps (visible to youth after officer approval)
CREATE TABLE roadmap_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES youth_cases(id),
  step_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  detail TEXT,
  institution TEXT,
  status TEXT DEFAULT 'locked'
    CHECK (status IN ('locked','active','completed')),
  state TEXT DEFAULT 'locked',
  location TEXT,
  source TEXT,
  what_to_bring TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### RAG (Retrieval-Augmented Generation) tables

```sql
-- Verified documents from government institutions
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  institution TEXT NOT NULL,
  description TEXT,
  version TEXT DEFAULT '1.0',
  source_url TEXT,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  chunk_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Document chunks with vector embeddings (BGE-M3, 1024 dimensions)
CREATE TABLE document_chunks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  page_number INTEGER,
  chunk_index INTEGER NOT NULL,
  institution TEXT NOT NULL,
  embedding vector(1024),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI-generated roadmaps (draft → approved workflow)
CREATE TABLE ai_roadmaps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES youth_cases(id),
  youth_profile_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'draft'
    CHECK (status IN ('draft','approved','rejected')),
  title TEXT,
  summary TEXT,
  steps_data JSONB,
  sources JSONB,
  officer_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### Indexes for performance

```sql
-- HNSW index for fast vector similarity search (cosine distance)
CREATE INDEX idx_document_chunks_embedding
  ON document_chunks USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- GIN index for full-text keyword search (hybrid retrieval)
CREATE INDEX idx_document_chunks_content_gin
  ON document_chunks USING gin (to_tsvector('english', content));

-- Standard lookup indexes
CREATE INDEX idx_documents_institution ON documents(institution);
CREATE INDEX idx_documents_verified ON documents(verified);
CREATE INDEX idx_document_chunks_doc_id ON document_chunks(document_id);
CREATE INDEX idx_ai_roadmaps_status ON ai_roadmaps(status);
```

### RAG Pipeline Architecture

Inzira uses a full **Retrieval-Augmented Generation (RAG)** pipeline to ensure the AI only answers from verified government sources:

```
Verified documents (RDB, RRA, RTB, BRD, Ministry of Youth)
        ↓
Document ingestion (text extraction + chunking)
        ↓
BGE-M3 embedding generation (1024-dimensional vectors)
        ↓
Storage in Supabase pgvector
        ↓
User/officer query
        ↓
Query embedding via BGE-M3
        ↓
Hybrid retrieval (vector similarity + keyword search + metadata filtering)
        ↓
Retrieve top-K verified chunks (configurable, default: 8)
        ↓
Construct grounded context with source metadata
        ↓
Send context + query to LLM via OpenRouter
        ↓
Structured response with citations
        ↓
Officer review → Approval → Youth sees roadmap
```

### Hybrid Retrieval

The retrieval system combines three signals for ranking:

| Signal | Weight | How it works |
|---|---|---|
| **Vector similarity** | 0.60 | Cosine similarity between query embedding and chunk embeddings via pgvector |
| **Keyword relevance** | 0.25 | Full-text search using PostgreSQL GIN index |
| **Metadata relevance** | 0.15 | Institution and document metadata matching |

Only **verified documents** (`verified = true`) are used for AI answers. Unverified content is never retrieved.

### Verified Pathway Rules

The application maintains hard-coded dependency rules that the LLM cannot override:

```
Business registration:
  RDB (Enterprise/Company) → TIN (automatic) → Bank account → BRD loan guarantee

Youth fund:
  RDB registration → Bank account → BRD Youth Fund (9% interest, 90% collateral guaranteed)

Vocational training:
  RTB choose programme → Check eligibility → Enroll → Complete training → Certification
```

The LLM personalizes and explains these steps but does not invent new dependencies.

---

## 5. Installation Guide

### Prerequisites

- Node.js 18+ (recommended: 20+)
- npm or yarn
- A Supabase account and project (free tier works)
- An OpenRouter account and API key (free tier works)
- A GitHub account (for Vercel deployment)

### Local setup

```bash
# Clone the repository
git clone https://github.com/Honore-models/Inzira.git
cd Inzira

# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local
```

### Environment variables

Add the following to `.env.local`:

```env
# ============================================
# Authentication
# ============================================
NEXTAUTH_SECRET=your-random-secret-string
NEXTAUTH_URL=http://localhost:3000

# ============================================
# Supabase
# ============================================
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# ============================================
# AI - OpenRouter
# ============================================
OPENROUTER_API_KEY=sk-or-your-openrouter-key
AI_MODEL=openai/gpt-oss-20b:free
AI_MODEL_FALLBACK=z-ai/glm-5.2:free

# ============================================
# AI - Embeddings
# ============================================
EMBEDDING_MODEL=BAAI/bge-m3
EMBEDDING_API_KEY=your-openrouter-key

# ============================================
# RAG Configuration
# ============================================
RAG_TOP_K=8
```

> **Security:** `OPENROUTER_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` must **never** be prefixed with `NEXT_PUBLIC_`. They are used only in server-side API routes and should never be exposed to the browser.

### Database setup

1. In your Supabase project, go to the SQL Editor
2. **Enable pgvector**:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
3. Run `supabase/schema.sql` to create the base tables (profiles, youth_cases, roadmap_steps, ai_roadmaps, chat_messages)
4. Run `supabase/migrations/002_rag_documents.sql` to create the RAG tables (documents, document_chunks) and vector search functions
5. Run `supabase/migrations/003_enhance_ai_roadmaps.sql` to add structured roadmap fields to ai_roadmaps
6. Run `supabase/migrations/005_update_institutions.sql` to update institution names (BDF → BRD)

### Seed verified documents

After the database is set up, seed the verified document library:

```bash
# Start the dev server
npm run dev

# Seed verified documents (in another terminal)
curl -X POST http://localhost:3000/api/ai/seed
```

This ingests 6 verified documents from RDB, RRA, BRD, RTB, and the Ministry of Youth and Arts.

### Run locally

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

The live production version is deployed at **https://inzira-red.vercel.app/**

### Default accounts

After running the seed, you can sign up as either a youth or officer through the UI. Officers can then manage youth and generate roadmaps.

---

## 6. Deployment Guide (Vercel)

1. Push the project to the GitHub repository
2. Go to [vercel.com](https://vercel.com), sign in with GitHub, and click **Add New → Project**
3. Import the repository - Vercel auto-detects the Next.js framework and build settings
4. Expand **Environment Variables** and add all variables from Section 5
5. **Important:** Set `NEXTAUTH_URL` to your Vercel deployment URL (e.g., `https://inzira-red.vercel.app`)
6. Click **Deploy** - the first build takes 1–2 minutes
7. Every subsequent `git push` to `main` automatically triggers a new deployment

---

## 7. User Manual

### For a youth using the app

1. Open the app link and **Sign Up** with your email and password
2. Complete **onboarding**: enter your name, select your goal (start a business, get training, or find a job), describe your current skills, and select your district
3. After submitting, your information is sent to your local youth officer for review - your roadmap is not available yet at this point
4. Once your officer approves your roadmap, log back in to see your **Home** screen, showing your first step
5. Go to **My Steps** to see the full roadmap. Complete the top (unlocked) step, then click **Mark as done** - the next step will unlock automatically
6. Use **Ask Inzira** at any time to ask a question in plain language. The AI answers only from verified government sources and shows its sources. If the question involves financial risk or legal judgment, the app will direct you to your youth officer
7. Use **Find Help** to browse verified institutions directly

### For a youth officer using the dashboard

1. Log in to the officer dashboard
2. View the **Dashboard** for an at-a-glance summary of your caseload
3. Go to **Youth List** to see all registered youth. Youth who have completed onboarding but don't have a roadmap show "Generate Roadmap"
4. Click on a youth's name to view their **Youth Detail** page with submitted information
5. Click **Generate Roadmap** to open **Smart Intake** - the form is pre-filled with the youth's information
6. Review and edit the officer notes if needed, then click **Generate roadmap** - the AI drafts a step-by-step plan grounded in the verified document library using RAG
7. Review the draft roadmap. Each step shows the source document, institution, and page number
8. Click **Approve and send to youth** - only after this does the youth see their roadmap
9. After approval, the youth appears as "Active" in your list with step progress tracking

---

## 8. API Reference

### AI Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/ai/ask` | Youth | Ask a question, get a grounded answer with sources |
| `POST` | `/api/ai/generate-roadmap` | Officer | Generate a draft roadmap from youth info + officer notes |
| `POST` | `/api/ai/approve-roadmap` | Officer | Approve a draft roadmap, create case + steps, send to youth |
| `POST` | `/api/ai/ingest` | Officer | Ingest a new verified document into the RAG system |
| `POST` | `/api/ai/seed` | Public | Seed the 6 pre-defined verified documents |
| `GET` | `/api/ai/documents` | Public | List all verified documents and their chunk counts |

### Data Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/youth` | Officer | List all youth profiles with cases |
| `GET` | `/api/youth/[id]` | Officer | Get a single youth's profile, cases, steps, and roadmaps |
| `GET` | `/api/cases` | Both | List cases (officers see all, youth see their own) |
| `POST` | `/api/cases/[caseId]/steps/[stepId]/complete` | Youth | Mark a roadmap step as completed |

### Request/Response Examples

**Ask a question:**
```json
// POST /api/ai/ask
// Request:
{ "question": "What do I need to register my business?" }

// Response:
{
  "answer": "To register your business with RDB, you need to visit the Office of the Registrar General...",
  "sources": [
    { "documentId": "...", "documentTitle": "Registering as an Enterprise", "institution": "RDB", "page": 1 }
  ]
}
```

**Generate a roadmap:**
```json
// POST /api/ai/generate-roadmap
// Request:
{
  "youth": {
    "name": "Uwimana Sandrine",
    "goal": "Start a business",
    "skillsBackground": "Tailoring certificate, basic business knowledge",
    "district": "Gasabo",
    "sector": "Kimihurura"
  },
  "officerNotes": "The youth wants to start a small tailoring business.",
  "youthProfileId": "uuid-of-youth"
}

// Response:
{
  "roadmapId": "uuid",
  "title": "Business Startup Roadmap",
  "summary": "A draft roadmap...",
  "steps": [
    {
      "order": 1,
      "title": "Register your business with RDB",
      "description": "...",
      "institution": "RDB",
      "location": "RDB Office – Your District",
      "whatToBring": ["National ID or Passport"],
      "whyThisStep": "...",
      "sources": [{ "documentId": "...", "documentTitle": "Registering as an Enterprise", "institution": "RDB", "page": 1 }]
    }
  ]
}
```

---

## 9. Project Structure

```
Inzira/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── ai/
│   │   │   │   ├── ask/route.ts          # RAG Q&A endpoint
│   │   │   │   ├── approve-roadmap/      # Officer approves draft
│   │   │   │   ├── documents/            # List verified docs
│   │   │   │   ├── generate-roadmap/     # AI roadmap generation
│   │   │   │   ├── ingest/               # Document ingestion
│   │   │   │   └── seed/                 # Seed verified docs
│   │   │   ├── auth/[...nextauth]/       # NextAuth.js
│   │   │   ├── cases/                    # Youth cases CRUD
│   │   │   ├── onboarding/              # Youth onboarding
│   │   │   ├── profile/                 # User profile
│   │   │   └── youth/[id]/              # Single youth detail API
│   │   ├── auth/
│   │   │   ├── signin/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── officer/
│   │   │   ├── page.tsx                 # Officer dashboard
│   │   │   ├── intake/page.tsx          # Smart Intake form
│   │   │   └── youth/
│   │   │       ├── page.tsx             # Youth list table
│   │   │       └── [id]/page.tsx        # Youth detail view
│   │   └── youth/
│   │       ├── page.tsx                 # Youth home dashboard
│   │       ├── ask/page.tsx             # AI chat interface
│   │       ├── steps/page.tsx           # Roadmap steps view
│   │       ├── roadmap/page.tsx         # Full roadmap view
│   │       └── find-help/page.tsx       # Institution directory
│   ├── components/
│   │   ├── officer/
│   │   │   ├── OfficerShell.tsx         # Officer layout
│   │   │   ├── AIDraftPanel.tsx         # Roadmap draft display
│   │   │   ├── SaveDraftButton.tsx
│   │   │   └── YouthTable.tsx
│   │   ├── youth/
│   │   │   └── YouthShell.tsx           # Youth layout
│   │   ├── ConfirmModal.tsx
│   │   └── LogoutButton.tsx
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── config.ts               # AI model configuration
│   │   │   ├── openai.ts               # OpenRouter client with retry/fallback
│   │   │   ├── embeddings.ts           # BGE-M3 embedding generation
│   │   │   ├── retrieval.ts            # Hybrid vector + keyword search
│   │   │   ├── chunking.ts             # Document text chunking
│   │   │   ├── ingestion.ts            # Document ingestion pipeline
│   │   │   ├── prompts.ts              # System prompts for LLM
│   │   │   ├── pathways.ts             # Verified step dependency rules
│   │   │   ├── relevance.ts            # Question relevance filtering
│   │   │   └── types.ts                # TypeScript types
│   │   ├── auth.ts                     # NextAuth configuration
│   │   ├── photos.ts                   # Avatar/photo helpers
│   │   └── supabase/
│   │       ├── client.ts               # Browser Supabase client
│   │       └── server.ts               # Server Supabase client
│   ├── data/
│   │   ├── officer.ts                  # Officer mock data
│   │   └── youth.ts                    # Youth mock data
│   └── middleware.ts                   # Route protection
├── supabase/
│   ├── schema.sql                      # Base database schema
│   └── migrations/
│       ├── 001_add_onboarding_columns.sql
│       ├── 002_rag_documents.sql       # RAG tables + pgvector
│       ├── 003_enhance_ai_roadmaps.sql # Roadmap JSON fields
│       ├── 004_clear_old_seed.sql      # Clear old documents
│       └── 005_update_institutions.sql # BDF → BRD update
└── inzira-project-documentation.MD     # This file
```

---

## 10. References

All institutional program information used in Inzira's verified document library was sourced directly from official Rwandan government pages:

| Institution | Document | Source | Verified Date |
|---|---|---|---|
| **RDB** | Registering as an Enterprise (Sole Trader) | rdb.rw, businessprocedures.rdb.rw, org.rdb.rw | 2026-08-19 |
| **RDB** | Registering a Domestic Company | org.rdb.rw/business-registration | 2026-08-19 |
| **RRA** | Tax Registration and VAT Threshold | rra.gov.rw, tax-handbook.rra.gov.rw | 2026-08-19 |
| **BRD** | SME and Youth Loan Guarantee Fund | brd.rw, allafrica.com | 2026-08-19 |
| **Ministry of Youth and Arts** | Youth Fund - Single-Digit Interest Loans | allafrica.com (May 2026) | 2026-08-19 |
| **RTB** | Vocational Training Enrollment | rtb.gov.rw, allafrica.com | 2026-08-19 |

Each document in the verified library was manually checked against these sources rather than generated or inferred by AI, and includes the source URL and date verified.

---

## 11. Scope and Limitations

This is a prototype built for a hackathon/competition submission, focused specifically on Rwanda and a small set of representative youth pathways (business registration, vocational training). It intentionally goes deep on one well-researched context rather than broad and shallow coverage across many countries or programs.

The system is designed so it could expand later - to additional Rwandan youth pathways, or to other countries facing similar fragmented public-service challenges - by adding new verified documents to the RAG system, without needing to rebuild the underlying product.

**What Inzira does not claim to solve:** underlying credit constraints, job market availability after training, or systemic barriers beyond information and sequencing. It is a navigation and coordination tool, not a substitute for the officers, institutions, or funding programs it connects people to.

### AI Grounding Guarantees

- The AI **only** answers from verified documents stored in the pgvector database
- If no relevant information is found, the AI says: *"The verified Inzira source library does not contain enough information to answer this question."*
- The AI **never** invents government requirements, fees, deadlines, eligibility criteria, or institutions
- High-stakes financial or legal questions are automatically redirected to the youth officer
- Every answer includes source citations (institution, document title, page number)
- A relevance filter rejects off-topic questions before they reach the LLM
- Roadmap step ordering follows verified pathway rules, not AI inference
- All AI-generated roadmaps start as DRAFT and require human officer approval before the youth can see them
