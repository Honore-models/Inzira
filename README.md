# Inzira

**Kinyarwanda for "the path."** Inzira connects young people in Rwanda to real government and institutional programs (RDB, RRA, BRD, RTB, Ministry of Youth), in the right order, with every plan reviewed by a human youth officer before the youth sees it.

Live: https://inzira-red.vercel.app

---

## Why

Rwanda already has funded youth programs: free business registration at RDB, automatic TIN from RRA, BRD loan guarantees, the Youth Fund, and RTB vocational training. They are spread across institutions that don't talk to each other, and each assumes you already know what to do and in what order. Help goes unused because nobody shows the path.

Inzira turns that scattered knowledge into **one ordered, human-approved roadmap**. It doesn't replace officers or institutions. It removes the "I didn't know what to do next" problem.

**Core principle: the AI drafts, the officer decides.** Step ordering comes from fixed, human-maintained pathway rules (`src/lib/ai/pathways.ts`), not from the model.

## Features

### For youth
| | |
|---|---|
| **Onboarding** | Goal, skills and district in three short steps. A youth officer in their district is assigned automatically. |
| **Home** | Next step, progress and quick links. |
| **My roadmap** | Ordered steps that unlock one at a time, with where to go, what to bring, why it matters and the source document. |
| **Ask Inzira** | AI assistant that answers **only** from the verified library, with numbered citations and follow-up questions. Any question can be forwarded to the officer in one tap. |
| **Messages** | Conversation with their assigned officer, with unread badges. |
| **Find help** | Directory of verified institutions with contact details. |
| **Read aloud** | Built-in text-to-speech for youth pages. |

### For officers
| | |
|---|---|
| **Dashboard** | Roadmap queue (oldest first), unread messages, active roadmaps by progress. |
| **Youth** | Searchable, filterable caseload with status and progress. |
| **Smart Intake** | Pick a registered youth, adjust intake notes, generate a draft, then **edit, reorder, add or remove steps** before approving. An optional note is sent to the youth on approval. |
| **Youth profile** | Intake details, the live roadmap, roadmap history, and marking a step done on the youth's behalf. |
| **Messages** | Two-pane inbox ("My youth" / "All cases"). |
| **Knowledge library** | The documents the AI is allowed to use. Add new verified text or remove outdated documents. |

## Tech stack

| Layer | Technology |
|---|---|
| App | Next.js 15 (App Router), React 19, TypeScript |
| Data | Supabase Postgres (+ pgvector, optional) |
| Auth | Auth.js v5: email/password, optional Google |
| AI generation | **Groq** free tier: `llama-3.3-70b-versatile` → `openai/gpt-oss-120b` → `llama-3.1-8b-instant` (automatic fallback) |
| Retrieval | In-app **BM25** over verified documents; optional vector search if an embedding provider is configured |
| Hosting | Vercel |

### How the AI is grounded

```
Verified documents (Knowledge library)
      ↓  chunked (~1,000 chars)
Question / youth profile
      ↓  BM25 keyword ranking (+ pgvector similarity if embeddings are configured)
Top-K verified passages, numbered [1]…[n]
      ↓  Groq LLM with strict grounding prompt (+ verified pathway rules for roadmaps)
Answer with citations  /  DRAFT roadmap
      ↓
Officer edits & approves  →  youth sees the roadmap
```

- Groq offers no embedding models, so retrieval works **without embeddings** by default. The library is small, and BM25 ranks natural questions well.
- Roadmap citations are validated server-side. A step can only cite a document that was actually retrieved.
- If the library doesn't cover a question, the assistant says so and points to the officer instead of guessing.
- Each Groq model has its own rate-limit bucket. On a 429 the app moves to the next model immediately. Per-user throttling protects the shared free quota.

## Getting started

**Prerequisites:** Node.js 20+, a Supabase project, and a free Groq API key from https://console.groq.com/keys.

```bash
git clone https://github.com/Honore-models/Inzira.git
cd Inzira
npm install
cp .env.local.example .env.local   # then fill in the values
npm run dev                        # http://localhost:3000
```

### Database

In the Supabase SQL editor, run in order:

1. `CREATE EXTENSION IF NOT EXISTS vector;`
2. `supabase/schema.sql`
3. `supabase/migrations/001` … `006` in numeric order (`004` clears documents; skip it on an existing library)

### Seed the verified library (development)

The seed endpoints only run outside production and require an officer session. Sign in as an officer in the browser, then open the browser console and run:

```js
await fetch("/api/ai/seed", { method: "POST" }).then((r) => r.json());
```

In production, add documents from **Knowledge library → Add document**.

### Environment variables

See `.env.local.example`. Required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `AUTH_SECRET`, `OFFICER_SIGNUP_CODE`, `GROQ_API_KEY`.

> `SUPABASE_SERVICE_ROLE_KEY`, `GROQ_API_KEY` and `AUTH_SECRET` are server-only. Never prefix them with `NEXT_PUBLIC_` and never commit `.env.local`.

### Test officer accounts (staging only)

Set `ENABLE_TEST_OFFICER_SIGNUP=true` and `TEST_OFFICER_INVITATION_CODE=…` to show a "Use test invitation code" button on sign-up. Don't enable this in production.

## Deploying to Vercel

1. Import the GitHub repository in Vercel.
2. Add every variable from `.env.local.example`. Set `NEXT_PUBLIC_SITE_URL` (and `NEXTAUTH_URL` if used) to the production URL.
3. Deploy. Every push to `main` redeploys.

## API

All routes need a signed-in session unless noted. Unauthenticated calls get a JSON `401`.

| Method | Route | Role | Purpose |
|---|---|---|---|
| POST | `/api/ai/ask` | any | Grounded answer `{ question, history? }` → `{ answer, kind, sources }` |
| POST | `/api/ai/generate-roadmap` | officer | Draft a roadmap for `{ youthProfileId, youth?, officerNotes? }` |
| POST | `/api/ai/approve-roadmap` | officer | Approve edited `{ youthProfileId, roadmapId?, roadmap, noteToYouth? }` |
| GET / DELETE | `/api/ai/documents` | officer | List / remove library documents |
| POST | `/api/ai/ingest` | officer | Add a verified document |
| GET | `/api/me` | youth | Profile, case, roadmap steps, officer, unread count |
| POST | `/api/me/officer` | youth | Choose an officer when none is assigned |
| GET | `/api/me/unread` | any | Unread message count |
| GET / PATCH | `/api/profile` | any | Own profile (only whitelisted fields are editable) |
| POST | `/api/onboarding` | youth | Save intake and open a case |
| GET | `/api/youth`, `/api/youth/:id` | officer | Caseload / one youth |
| GET | `/api/cases` | officer | Cases with last message and unread counts |
| GET / PATCH | `/api/cases/:id/steps` | participant | Roadmap steps / complete the current step |
| GET / POST | `/api/cases/:id/messages` | participant | Conversation |
| GET | `/api/institutions` | public | Institution directory |
| GET | `/api/officers` | any | Officer directory |

"Participant" means the youth who owns the case, or any officer.

## Project structure

```
src/
  app/
    (public)       page.tsx, privacy/, terms/, auth/{signin,signup,error}
    onboarding/    youth intake
    youth/         layout (AppShell) + home, steps, ask, messages, find-help, profile
    officer/       layout (AppShell) + dashboard, youth/, intake/, messages/, library/, profile/
    api/           route handlers (see table above)
    ui.css         shared design system for the app workspaces
  components/      AppShell, ChatThread, ConfirmModal, ui.tsx (primitives, RichText), …
  data/            options.ts (goals, districts, prompts), rwanda-locations.ts
  lib/
    ai/            config, groq client, embeddings (optional), retrieval (BM25 + vector),
                   prompts, pathways (verified step order), ingestion, chunking
    server/        access.ts (auth + case access), rate-limit.ts
    case-status.ts shared status/progress logic
supabase/          schema.sql, migrations/
```

## Scope and limitations

Inzira is a focused prototype for Rwanda covering business registration, tax registration, youth finance and vocational training. It's a navigation and coordination tool. It doesn't fix credit constraints or job availability, and it doesn't replace the officers and institutions it connects people to. New pathways can be added by adding verified documents to the library and, where order matters, a rule in `pathways.ts`.

### Verified sources

| Institution | Document | Source | Verified |
|---|---|---|---|
| RDB | Registering as an Enterprise (Sole Trader) | rdb.rw, businessprocedures.rdb.rw | 2026-08-19 |
| RDB | Registering a Domestic Company | org.rdb.rw | 2026-08-19 |
| RRA | Tax Registration and VAT Threshold | rra.gov.rw | 2026-08-19 |
| BRD | SME and Youth Loan Guarantee Fund | brd.rw | 2026-08-19 |
| Ministry of Youth and Arts | Youth Fund: Single-Digit Interest Loans | allafrica.com (May 2026) | 2026-08-19 |
| RTB | Vocational Training Enrollment | rtb.gov.rw | 2026-08-19 |
