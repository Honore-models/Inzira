"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  Building2,
  CheckCircle2,
  Compass,
  FileText,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  Send,
  Sparkles,
  Trash2,
  UserRound,
} from "lucide-react";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Alert, Avatar, EmptyState, PageHeader, PageSkeleton } from "@/components/ui";
import { INSTITUTIONS, districts, goalOptions, sectorsFor } from "@/data/options";
import { api } from "@/lib/api-client";
import { STATUS_LABELS, type YouthStatus } from "@/lib/case-status";

interface YouthOption {
  id: string;
  full_name: string;
  email: string;
  goal: string | null;
  skills: string | null;
  skills_background: string | null;
  situation: string | null;
  district: string | null;
  sector: string | null;
  status: YouthStatus;
}

interface DraftStep {
  key: string;
  title: string;
  description: string;
  institution: string;
  location: string;
  whatToBring: string[];
  whyThisStep: string;
  sources: { documentId: string; documentTitle: string; institution: string; page: number | null }[];
}

interface Draft {
  roadmapId: string | null;
  title: string;
  summary: string;
  steps: DraftStep[];
  pathway?: string | null;
  sourcesConsulted?: number;
}

type ApiStep = Omit<DraftStep, "key" | "location"> & { location: string | null };

const newKey = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function toDraftSteps(steps: ApiStep[]): DraftStep[] {
  return steps.map((s) => ({
    key: newKey(),
    title: s.title || "",
    description: s.description || "",
    institution: s.institution || "",
    location: s.location || "",
    whatToBring: s.whatToBring || [],
    whyThisStep: s.whyThisStep || "",
    sources: s.sources || [],
  }));
}

function StepEditor({ step, onSave, onCancel }: { step: DraftStep; onSave: (s: DraftStep) => void; onCancel: () => void }) {
  const [value, setValue] = useState({ ...step, bring: step.whatToBring.join("\n") });
  return (
    <div className="draft-step-edit">
      <div className="form-grid">
        <label className="field span-2">
          <span className="field-label">Step title</span>
          <input className="input" value={value.title} maxLength={160} onChange={(e) => setValue({ ...value, title: e.target.value })} autoFocus />
        </label>
        <label className="field span-2">
          <span className="field-label">What the youth should do</span>
          <textarea className="textarea" rows={3} maxLength={1200} value={value.description} onChange={(e) => setValue({ ...value, description: e.target.value })} />
        </label>
        <label className="field">
          <span className="field-label">Institution</span>
          <input className="input" list="institution-options" value={value.institution} maxLength={80} onChange={(e) => setValue({ ...value, institution: e.target.value })} />
        </label>
        <label className="field">
          <span className="field-label">Where to go</span>
          <input className="input" value={value.location} maxLength={160} placeholder="e.g. RDB service desk – Gasabo" onChange={(e) => setValue({ ...value, location: e.target.value })} />
        </label>
        <label className="field span-2">
          <span className="field-label">What to bring</span>
          <textarea className="textarea" rows={3} placeholder="One item per line" value={value.bring} onChange={(e) => setValue({ ...value, bring: e.target.value })} />
        </label>
        <label className="field span-2">
          <span className="field-label">Why this step matters</span>
          <input className="input" maxLength={400} value={value.whyThisStep} onChange={(e) => setValue({ ...value, whyThisStep: e.target.value })} />
        </label>
      </div>
      <div className="form-actions">
        <button className="btn btn-ghost btn-sm" type="button" onClick={onCancel}>
          Cancel
        </button>
        <button
          className="btn btn-primary btn-sm"
          type="button"
          disabled={!value.title.trim()}
          onClick={() => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { bring, ...rest } = value;
            onSave({
              ...rest,
              title: rest.title.trim(),
              whatToBring: bring.split("\n").map((l) => l.trim()).filter(Boolean),
            });
          }}
        >
          Save step
        </button>
      </div>
    </div>
  );
}

function Intake() {
  const router = useRouter();
  const params = useSearchParams();
  const [youth, setYouth] = useState<YouthOption[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [youthId, setYouthId] = useState(params.get("youthId") || "");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ goal: "", skillsBackground: "", district: "", sector: "", notes: "" });
  const [draft, setDraft] = useState<Draft | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [noteToYouth, setNoteToYouth] = useState("");
  const [generating, setGenerating] = useState(false);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState<"approve" | "regenerate" | null>(null);

  useEffect(() => {
    api<YouthOption[]>("/api/youth").then(setYouth).catch((e) => setLoadError(e.message));
  }, []);

  const selected = useMemo(() => youth?.find((y) => y.id === youthId) || null, [youth, youthId]);
  const draftParam = params.get("draft");

  // Prefill from the youth's profile; resume a saved draft when asked to.
  useEffect(() => {
    if (!selected) return;
    setForm({
      goal: selected.goal || "",
      skillsBackground: selected.skills_background || selected.skills || "",
      district: selected.district || "",
      sector: selected.sector || "",
      notes: selected.situation || "",
    });
    setDraft(null);
    setDirty(false);
    setError("");

    const draftId = draftParam;
    if (draftId) {
      api<{ roadmaps: { id: string; title: string; summary: string; steps_data: ApiStep[]; status: string }[] }>(`/api/youth/${selected.id}`)
        .then((d) => {
          const r = d.roadmaps.find((x) => x.id === draftId && x.status === "draft");
          if (r) setDraft({ roadmapId: r.id, title: r.title, summary: r.summary || "", steps: toDraftSteps(r.steps_data || []) });
        })
        .catch(() => undefined);
    }
  }, [selected, draftParam]);

  function chooseYouth(id: string) {
    setYouthId(id);
    router.replace(id ? `/officer/intake?youthId=${id}` : "/officer/intake", { scroll: false });
  }

  async function generate() {
    if (!selected) return;
    setConfirm(null);
    setGenerating(true);
    setError("");
    setEditing(null);
    try {
      const res = await api<{ roadmapId: string | null; title: string; summary: string; steps: ApiStep[]; pathway: string | null; sourcesConsulted: number }>(
        "/api/ai/generate-roadmap",
        {
          method: "POST",
          json: {
            youthProfileId: selected.id,
            youth: { goal: form.goal, skillsBackground: form.skillsBackground, district: form.district, sector: form.sector },
            officerNotes: form.notes,
          },
        },
      );
      setDraft({ ...res, steps: toDraftSteps(res.steps) });
      setDirty(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not generate a roadmap.");
    } finally {
      setGenerating(false);
    }
  }

  function updateSteps(fn: (steps: DraftStep[]) => DraftStep[]) {
    setDraft((d) => (d ? { ...d, steps: fn(d.steps) } : d));
    setDirty(true);
  }

  function move(index: number, delta: number) {
    updateSteps((steps) => {
      const next = [...steps];
      const [item] = next.splice(index, 1);
      next.splice(index + delta, 0, item);
      return next;
    });
  }

  function addStep() {
    const step: DraftStep = { key: newKey(), title: "", description: "", institution: "", location: "", whatToBring: [], whyThisStep: "", sources: [] };
    updateSteps((steps) => [...steps, step]);
    setEditing(step.key);
  }

  async function approve() {
    if (!selected || !draft) return;
    setConfirm(null);
    setApproving(true);
    setError("");
    try {
      await api("/api/ai/approve-roadmap", {
        method: "POST",
        json: {
          youthProfileId: selected.id,
          roadmapId: draft.roadmapId,
          noteToYouth,
          roadmap: {
            title: draft.title,
            summary: draft.summary,
            steps: draft.steps.map((s, i) => ({ ...s, order: i + 1, location: s.location || null })),
          },
        },
      });
      router.push(`/officer/youth/${selected.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not approve the roadmap.");
      setApproving(false);
    }
  }

  if (loadError) return <Alert tone="error" title="We couldn't load Smart Intake">{loadError}</Alert>;
  if (!youth) return <PageSkeleton />;

  const q = search.trim().toLowerCase();
  const candidates = youth
    .filter((y) => !q || `${y.full_name} ${y.email} ${y.district || ""}`.toLowerCase().includes(q))
    .sort((a, b) => Number(b.status === "needs_roadmap") - Number(a.status === "needs_roadmap"))
    .slice(0, 8);

  const incompleteStep = draft?.steps.find((s) => !s.title.trim());
  const goalChoices = Array.from(new Set([...goalOptions, ...(form.goal ? [form.goal] : [])]));
  const districtChoices = Array.from(new Set([...districts, ...(form.district ? [form.district] : [])]));

  return (
    <>
      <PageHeader
        title="Smart Intake"
        description="Draft a roadmap from the verified library, adjust it to the youth's situation, then approve it. Nothing reaches the youth until you approve."
      />

      <datalist id="institution-options">
        {INSTITUTIONS.map((i) => (
          <option key={i} value={i} />
        ))}
      </datalist>

      {/* 1. Choose youth */}
      <section className="card">
        <header className="card-header">
          <div>
            <h2>1. Youth</h2>
            <p>Choose a registered youth. Those waiting for a roadmap are listed first.</p>
          </div>
          {selected ? (
            <button className="btn btn-ghost btn-sm" type="button" onClick={() => chooseYouth("")} disabled={generating || approving}>
              Change
            </button>
          ) : null}
        </header>
        {selected ? (
          <div className="list-row">
            <Avatar name={selected.full_name} email={selected.email} />
            <div className="list-row-body">
              <strong>{selected.full_name}</strong>
              <span>{selected.email}</span>
            </div>
            <span className={`badge badge-${selected.status}`}>{STATUS_LABELS[selected.status]}</span>
          </div>
        ) : youth.length === 0 ? (
          <EmptyState icon={<UserRound size={24} />} title="No youth registered yet">
            Ask the young person to create an account on Inzira first — it takes two minutes on any phone. They will then appear here.
          </EmptyState>
        ) : (
          <>
            <div className="toolbar">
              <label className="search-input" style={{ maxWidth: "none" }}>
                <UserRound size={16} aria-hidden />
                <input className="input" type="search" placeholder="Search by name, email or district" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search youth" />
              </label>
            </div>
            {candidates.length === 0 ? (
              <p className="card-body muted">No youth match your search.</p>
            ) : (
              candidates.map((y) => (
                <button className="list-row" type="button" key={y.id} onClick={() => chooseYouth(y.id)}>
                  <Avatar name={y.full_name} email={y.email} size="sm" />
                  <div className="list-row-body">
                    <strong>{y.full_name}</strong>
                    <span>{[y.goal, y.district].filter(Boolean).join(" · ") || y.email}</span>
                  </div>
                  <span className={`badge badge-${y.status}`}>{STATUS_LABELS[y.status]}</span>
                </button>
              ))
            )}
          </>
        )}
      </section>

      {selected ? (
        <div className="grid-main" style={{ marginTop: 16 }}>
          <div className="stack" style={{ minWidth: 0 }}>
            {/* 2. Intake notes */}
            <section className="card">
              <header className="card-header">
                <div>
                  <h2>2. Intake notes</h2>
                  <p>Pre-filled from the youth&apos;s profile. Correct anything that has changed.</p>
                </div>
              </header>
              <div className="card-body">
                <div className="form-grid">
                  <label className="field">
                    <span className="field-label">Goal</span>
                    <select className="select" value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })}>
                      <option value="">Choose a goal</option>
                      {goalChoices.map((g) => (
                        <option key={g}>{g}</option>
                      ))}
                    </select>
                  </label>
                  <label className="field">
                    <span className="field-label">District</span>
                    <select className="select" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value, sector: "" })}>
                      <option value="">Choose a district</option>
                      {districtChoices.map((d) => (
                        <option key={d}>{d}</option>
                      ))}
                    </select>
                  </label>
                  <label className="field span-2">
                    <span className="field-label">Skills and background</span>
                    <input className="input" maxLength={1000} value={form.skillsBackground} onChange={(e) => setForm({ ...form, skillsBackground: e.target.value })} placeholder="e.g. Tailoring certificate, sells clothes at the market" />
                  </label>
                  <label className="field span-2">
                    <span className="field-label">Officer notes</span>
                    <textarea
                      className="textarea"
                      rows={3}
                      maxLength={2000}
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      placeholder="Context from your conversation: what they've already done, constraints, priorities…"
                    />
                    <span className="field-hint">The AI uses these notes to personalise and skip steps already completed.</span>
                  </label>
                </div>
                <div className="form-actions">
                  <button
                    className="btn btn-primary"
                    type="button"
                    disabled={generating || approving || !form.goal}
                    onClick={() => (draft && dirty ? setConfirm("regenerate") : generate())}
                  >
                    {generating ? <span className="spinner" aria-hidden /> : draft ? <RefreshCw size={16} aria-hidden /> : <Sparkles size={16} aria-hidden />}
                    {generating ? "Drafting from verified sources…" : draft ? "Regenerate draft" : "Generate draft roadmap"}
                  </button>
                </div>
              </div>
            </section>

            {error ? <Alert tone="error">{error}</Alert> : null}

            {/* 3. Draft */}
            {draft ? (
              <section className="card">
                <header className="card-header">
                  <div>
                    <h2>3. Review the draft</h2>
                    <p>
                      {draft.pathway ? `Ordered using the verified "${draft.pathway}" pathway. ` : ""}
                      {draft.sourcesConsulted !== undefined ? `${draft.sourcesConsulted} verified passages consulted.` : ""}
                    </p>
                  </div>
                  <span className="badge badge-draft">Draft · not visible to youth</span>
                </header>
                <div className="card-body">
                  <div className="form-grid" style={{ marginBottom: 20 }}>
                    <label className="field span-2">
                      <span className="field-label">Roadmap title (shown to the youth)</span>
                      <input
                        className="input"
                        maxLength={160}
                        value={draft.title}
                        onChange={(e) => {
                          setDraft({ ...draft, title: e.target.value });
                          setDirty(true);
                        }}
                      />
                    </label>
                    <label className="field span-2">
                      <span className="field-label">Summary</span>
                      <textarea
                        className="textarea"
                        rows={2}
                        maxLength={800}
                        value={draft.summary}
                        onChange={(e) => {
                          setDraft({ ...draft, summary: e.target.value });
                          setDirty(true);
                        }}
                      />
                    </label>
                  </div>

                  {draft.steps.map((step, index) => (
                    <article className="draft-step" key={step.key}>
                      <div className="draft-step-head">
                        <span className="draft-step-num">{index + 1}</span>
                        <h3>{step.title || <span className="muted">Untitled step</span>}</h3>
                        <div className="draft-step-tools">
                          <button className="icon-button" type="button" aria-label="Move up" disabled={index === 0} onClick={() => move(index, -1)}>
                            <ArrowUp size={16} />
                          </button>
                          <button className="icon-button" type="button" aria-label="Move down" disabled={index === draft.steps.length - 1} onClick={() => move(index, 1)}>
                            <ArrowDown size={16} />
                          </button>
                          <button className="icon-button" type="button" aria-label="Edit step" onClick={() => setEditing(step.key)}>
                            <Pencil size={15} />
                          </button>
                          <button
                            className="icon-button"
                            type="button"
                            aria-label="Remove step"
                            disabled={draft.steps.length <= 1}
                            onClick={() => updateSteps((steps) => steps.filter((s) => s.key !== step.key))}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                      <div className="draft-step-body">
                        {editing === step.key ? (
                          <StepEditor
                            step={step}
                            onCancel={() => {
                              setEditing(null);
                              if (!step.title) updateSteps((steps) => steps.filter((s) => s.key !== step.key));
                            }}
                            onSave={(next) => {
                              updateSteps((steps) => steps.map((s) => (s.key === step.key ? next : s)));
                              setEditing(null);
                            }}
                          />
                        ) : (
                          <>
                            {step.description ? <p>{step.description}</p> : null}
                            <div className="timeline-meta">
                              {step.institution ? (
                                <span>
                                  <Building2 size={14} aria-hidden /> {step.institution}
                                </span>
                              ) : null}
                              {step.location ? (
                                <span>
                                  <MapPin size={14} aria-hidden /> {step.location}
                                </span>
                              ) : null}
                            </div>
                            {step.whatToBring.length ? (
                              <div className="bring-list">
                                <strong>What to bring</strong>
                                <ul>
                                  {step.whatToBring.map((b) => (
                                    <li key={b}>
                                      <CheckCircle2 size={14} aria-hidden /> {b}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ) : null}
                            {step.sources.length ? (
                              <p className="source-note">
                                <FileText size={13} aria-hidden />
                                {step.sources.map((s) => `${s.institution} – ${s.documentTitle}`).join("; ")}
                              </p>
                            ) : (
                              <p className="source-note" style={{ color: "var(--ui-amber)" }}>
                                <FileText size={13} aria-hidden /> No library source cited — check this step before approving.
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </article>
                  ))}

                  <button className="btn btn-secondary btn-sm" type="button" style={{ marginTop: 14 }} onClick={addStep} disabled={!!editing}>
                    <Plus size={14} aria-hidden /> Add step
                  </button>
                </div>
              </section>
            ) : !generating ? (
              <section className="card">
                <EmptyState icon={<Compass size={24} />} title="No draft yet">
                  Check the intake notes, then generate a draft. It usually takes 5–15 seconds.
                </EmptyState>
              </section>
            ) : null}
          </div>

          {/* 4. Approve */}
          <aside className="stack">
            <section className="card">
              <header className="card-header">
                <h2>4. Approve and send</h2>
              </header>
              <div className="card-body">
                <label className="field">
                  <span className="field-label">Message to {selected.full_name.split(" ")[0]} (optional)</span>
                  <textarea
                    className="textarea"
                    rows={4}
                    maxLength={2000}
                    value={noteToYouth}
                    onChange={(e) => setNoteToYouth(e.target.value)}
                    placeholder="A few words of encouragement or guidance. Sent as a message when you approve."
                    disabled={!draft}
                  />
                </label>
                {incompleteStep ? (
                  <p className="field-hint" style={{ color: "var(--ui-amber)", marginTop: 10 }}>
                    Give every step a title before approving.
                  </p>
                ) : null}
                <button
                  className="btn btn-primary btn-block"
                  type="button"
                  style={{ marginTop: 14 }}
                  disabled={!draft || !!incompleteStep || !!editing || approving || generating || !draft.steps.length}
                  onClick={() => setConfirm("approve")}
                >
                  {approving ? <span className="spinner" aria-hidden /> : <Send size={16} aria-hidden />}
                  {approving ? "Approving…" : "Approve and send to youth"}
                </button>
                {selected.status === "in_progress" || selected.status === "completed" ? (
                  <p className="field-hint" style={{ marginTop: 10 }}>
                    This youth already has a roadmap. Approving replaces it and restarts their progress at step 1.
                  </p>
                ) : null}
              </div>
            </section>
            <Alert tone="success" title="Human-reviewed by design">
              The AI uses only the verified library and fixed pathway rules. Check every step — you are accountable for what the youth sees.
            </Alert>
            <Link className="btn btn-ghost btn-sm" href={`/officer/youth/${selected.id}`}>
              View {selected.full_name.split(" ")[0]}&apos;s profile
            </Link>
          </aside>
        </div>
      ) : null}

      <ConfirmModal
        open={confirm === "approve"}
        title="Approve this roadmap?"
        message={`${selected?.full_name} will see these ${draft?.steps.length || 0} steps immediately${noteToYouth.trim() ? ", along with your message" : ""}.`}
        confirmText="Approve and send"
        variant="info"
        onConfirm={approve}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmModal
        open={confirm === "regenerate"}
        title="Discard your edits?"
        message="Regenerating replaces the current draft, including the changes you've made."
        confirmText="Regenerate"
        variant="warning"
        onConfirm={generate}
        onCancel={() => setConfirm(null)}
      />
    </>
  );
}

export default function OfficerIntake() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Intake />
    </Suspense>
  );
}
