"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Pencil } from "lucide-react";
import { Alert, Avatar, PageHeader, PageSkeleton, ProgressBar } from "@/components/ui";
import { districts, goalOptions, sectorsFor } from "@/data/options";
import { api } from "@/lib/api-client";
import { completedSteps, progressPercent } from "@/lib/case-status";
import { formatDate } from "@/lib/format";
import { useJourney } from "@/lib/use-journey";

export default function YouthProfile() {
  const { update } = useSession();
  const { data, error, loading, reload } = useJourney({ requireOnboarding: false });
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name: "", goal: "", skills_background: "", district: "", sector: "" });
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  if (loading) return <PageSkeleton />;
  if (error || !data?.profile) return <Alert tone="error" title="We couldn't load your profile">{error}</Alert>;

  const { profile, case: youthCase, officer } = data;
  const skills = profile.skills_background || profile.skills || "";

  function startEditing() {
    setForm({
      full_name: profile!.full_name || "",
      goal: profile!.goal || "",
      skills_background: skills,
      district: profile!.district || "",
      sector: profile!.sector || "",
    });
    setNotice(null);
    setEditing(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setNotice(null);
    try {
      await api("/api/profile", { method: "PATCH", json: form });
      await reload();
      if (form.full_name !== profile!.full_name) await update?.();
      setEditing(false);
      setNotice({ tone: "success", text: "Your profile has been updated." });
    } catch (err) {
      setNotice({ tone: "error", text: err instanceof Error ? err.message : "Could not save changes." });
    } finally {
      setSaving(false);
    }
  }

  const goalChoices = Array.from(new Set([...goalOptions, ...(form.goal ? [form.goal] : [])]));
  const districtChoices = Array.from(new Set([...districts, ...(form.district ? [form.district] : [])]));

  return (
    <>
      <PageHeader title="My profile" description="The information your youth officer uses to prepare your roadmap." />

      {notice ? <Alert tone={notice.tone}>{notice.text}</Alert> : null}

      <div className="grid-main" style={{ marginTop: notice ? 16 : 0 }}>
        <section className="card">
          <header className="card-header">
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <Avatar name={profile.full_name} email={profile.email} size="lg" />
              <div>
                <h2 style={{ fontSize: 18 }}>{profile.full_name}</h2>
                <p>{profile.email}</p>
              </div>
            </div>
            {!editing ? (
              <button className="btn btn-secondary btn-sm" type="button" onClick={startEditing}>
                <Pencil size={14} aria-hidden /> Edit
              </button>
            ) : null}
          </header>

          {editing ? (
            <form className="card-body" onSubmit={save}>
              <div className="form-grid">
                <label className="field span-2">
                  <span className="field-label">Full name</span>
                  <input className="input" required maxLength={120} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                </label>
                <label className="field span-2">
                  <span className="field-label">Goal</span>
                  <select className="select" value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })}>
                    <option value="">Choose a goal</option>
                    {goalChoices.map((g) => (
                      <option key={g}>{g}</option>
                    ))}
                  </select>
                </label>
                <label className="field span-2">
                  <span className="field-label">Skills and background</span>
                  <textarea
                    className="textarea"
                    rows={4}
                    maxLength={1000}
                    placeholder="Training, certificates, work experience…"
                    value={form.skills_background}
                    onChange={(e) => setForm({ ...form, skills_background: e.target.value })}
                  />
                  <span className="field-hint">{form.skills_background.length}/1000</span>
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
                <label className="field">
                  <span className="field-label">Sector</span>
                  <select className="select" value={form.sector} disabled={!form.district} onChange={(e) => setForm({ ...form, sector: e.target.value })}>
                    <option value="">Choose a sector</option>
                    {Array.from(new Set([...sectorsFor(form.district), ...(form.sector ? [form.sector] : [])])).map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
              </div>
              <p className="field-hint" style={{ marginTop: 14 }}>
                Changes are shared with your officer. If your goal changes, let them know so they can update your roadmap.
              </p>
              <div className="form-actions">
                <button className="btn btn-ghost" type="button" onClick={() => setEditing(false)} disabled={saving}>
                  Cancel
                </button>
                <button className="btn btn-primary" type="submit" disabled={saving}>
                  {saving ? <span className="spinner" aria-hidden /> : null}
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </div>
            </form>
          ) : (
            <dl className="dl">
              <div>
                <dt>Goal</dt>
                <dd>{profile.goal || <span className="muted">Not set</span>}</dd>
              </div>
              <div>
                <dt>Skills and background</dt>
                <dd>{skills || <span className="muted">Not added yet</span>}</dd>
              </div>
              <div>
                <dt>Location</dt>
                <dd>
                  {profile.district ? [profile.district, profile.sector].filter(Boolean).join(", ") : <span className="muted">Not set</span>}
                </dd>
              </div>
              <div>
                <dt>Member since</dt>
                <dd>{formatDate(profile.created_at, { day: "numeric", month: "long", year: "numeric" })}</dd>
              </div>
            </dl>
          )}
        </section>

        <aside className="card">
          <header className="card-header">
            <h2>My case</h2>
          </header>
          <dl className="dl">
            <div>
              <dt>Officer</dt>
              <dd>{officer?.full_name || <span className="muted">Not assigned yet</span>}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                {youthCase?.status === "completed"
                  ? "Completed"
                  : youthCase && youthCase.total_steps > 0
                    ? "In progress"
                    : "Waiting for roadmap"}
              </dd>
            </div>
          </dl>
          {youthCase && youthCase.total_steps > 0 ? (
            <div className="card-body" style={{ borderTop: "1px solid var(--ui-line)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
                <span className="muted">
                  {completedSteps(youthCase)} of {youthCase.total_steps} steps
                </span>
                <strong>{progressPercent(youthCase)}%</strong>
              </div>
              <ProgressBar value={progressPercent(youthCase)} />
            </div>
          ) : null}
        </aside>
      </div>
    </>
  );
}
