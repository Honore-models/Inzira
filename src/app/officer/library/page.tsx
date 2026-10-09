"use client";

import { useCallback, useEffect, useState } from "react";
import { BookOpen, ExternalLink, Plus, Search, Trash2, X } from "lucide-react";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Alert, EmptyState, PageHeader, PageSkeleton } from "@/components/ui";
import { INSTITUTIONS } from "@/data/options";
import { api } from "@/lib/api-client";
import { formatDate } from "@/lib/format";

interface LibraryDoc {
  id: string;
  title: string;
  institution: string;
  description: string | null;
  source_url: string | null;
  verified: boolean;
  verified_at: string | null;
  chunk_count: number;
  created_at: string;
}

const EMPTY_FORM = { title: "", institution: "", description: "", sourceUrl: "", text: "" };

export default function KnowledgeLibrary() {
  const [docs, setDocs] = useState<LibraryDoc[] | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [removing, setRemoving] = useState<LibraryDoc | null>(null);

  const load = useCallback(() => {
    api<LibraryDoc[]>("/api/ai/documents").then(setDocs).catch((e) => setError(e.message));
  }, []);
  useEffect(load, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      const res = await api<{ chunkCount: number }>("/api/ai/ingest", { method: "POST", json: form });
      setNotice(`"${form.title}" was added and split into ${res.chunkCount} searchable passages.`);
      setForm(EMPTY_FORM);
      setAdding(false);
      load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not add the document.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(doc: LibraryDoc) {
    setRemoving(null);
    try {
      await api(`/api/ai/documents?id=${encodeURIComponent(doc.id)}`, { method: "DELETE" });
      setNotice(`"${doc.title}" was removed from the library.`);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove the document.");
    }
  }

  if (error && !docs) return <Alert tone="error" title="We couldn't load the library">{error}</Alert>;
  if (!docs) return <PageSkeleton />;

  const q = query.trim().toLowerCase();
  const visible = docs.filter((d) => !q || `${d.title} ${d.institution} ${d.description || ""}`.toLowerCase().includes(q));

  return (
    <>
      <PageHeader
        title="Knowledge library"
        description="The verified documents Inzira uses to answer youth questions and draft roadmaps. The AI cannot use anything that isn't here."
        actions={
          !adding ? (
            <button className="btn btn-primary" type="button" onClick={() => setAdding(true)}>
              <Plus size={16} aria-hidden /> Add document
            </button>
          ) : null
        }
      />

      {notice ? <Alert tone="success">{notice}</Alert> : null}
      {error && docs ? <Alert tone="error">{error}</Alert> : null}

      {adding ? (
        <section className="card" style={{ marginTop: notice ? 16 : 0, marginBottom: 16 }}>
          <header className="card-header">
            <div>
              <h2>Add a verified document</h2>
              <p>Paste the official text. Only add content you have checked against the institution&apos;s published source.</p>
            </div>
            <button className="icon-button" type="button" aria-label="Close" onClick={() => setAdding(false)}>
              <X size={18} aria-hidden />
            </button>
          </header>
          <form className="card-body" onSubmit={submit}>
            <div className="form-grid">
              <label className="field">
                <span className="field-label">Title</span>
                <input className="input" required maxLength={200} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Registering a Domestic Company" />
              </label>
              <label className="field">
                <span className="field-label">Institution</span>
                <input className="input" required list="library-institutions" maxLength={80} value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} />
                <datalist id="library-institutions">
                  {INSTITUTIONS.map((i) => (
                    <option key={i} value={i} />
                  ))}
                </datalist>
              </label>
              <label className="field span-2">
                <span className="field-label">Official source link</span>
                <input className="input" type="url" maxLength={500} value={form.sourceUrl} onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })} placeholder="https://…" />
              </label>
              <label className="field span-2">
                <span className="field-label">Short description</span>
                <input className="input" maxLength={500} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </label>
              <label className="field span-2">
                <span className="field-label">Document text</span>
                <textarea className="textarea" required rows={10} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} placeholder="Paste the full text of the document" />
                <span className="field-hint">{form.text.length.toLocaleString()} characters · minimum 50</span>
              </label>
            </div>
            {formError ? <Alert tone="error" className="mt">{formError}</Alert> : null}
            <div className="form-actions">
              <button className="btn btn-ghost" type="button" onClick={() => setAdding(false)} disabled={saving}>
                Cancel
              </button>
              <button className="btn btn-primary" type="submit" disabled={saving || form.text.trim().length < 50}>
                {saving ? <span className="spinner" aria-hidden /> : null}
                {saving ? "Adding…" : "Add to library"}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <section className="card" style={{ marginTop: notice && !adding ? 16 : 0 }}>
        <div className="toolbar">
          <strong>
            {docs.length} document{docs.length === 1 ? "" : "s"}
          </strong>
          <label className="search-input">
            <Search size={16} aria-hidden />
            <input className="input" type="search" placeholder="Search the library" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search the library" />
          </label>
        </div>
        {visible.length === 0 ? (
          <EmptyState icon={<BookOpen size={24} />} title={docs.length ? "No documents match" : "The library is empty"}>
            {docs.length
              ? "Try a different search."
              : "Add verified documents so Inzira can answer questions and draft roadmaps."}
          </EmptyState>
        ) : (
          visible.map((d) => (
            <div className="list-row" key={d.id} style={{ alignItems: "flex-start" }}>
              <span className="tag lib-tag" title={d.institution}>{d.institution}</span>
              <div className="list-row-body">
                <strong style={{ whiteSpace: "normal" }}>{d.title}</strong>
                {d.description ? <span style={{ whiteSpace: "normal" }}>{d.description}</span> : null}
                <span>
                  {d.chunk_count} {d.chunk_count === 1 ? "passage" : "passages"} · verified {formatDate(d.verified_at || d.created_at)}
                </span>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {d.source_url ? (
                  <a className="icon-button" href={d.source_url} target="_blank" rel="noopener noreferrer" aria-label={`Open source for ${d.title}`} title="Open official source">
                    <ExternalLink size={16} aria-hidden />
                  </a>
                ) : null}
                <button className="icon-button" type="button" aria-label={`Remove ${d.title}`} title="Remove" onClick={() => setRemoving(d)}>
                  <Trash2 size={16} aria-hidden />
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      <ConfirmModal
        open={!!removing}
        title="Remove this document?"
        message={`"${removing?.title}" will no longer be used for answers or roadmaps. Existing approved roadmaps are not changed.`}
        confirmText="Remove"
        variant="danger"
        onConfirm={() => removing && remove(removing)}
        onCancel={() => setRemoving(null)}
      />
    </>
  );
}
