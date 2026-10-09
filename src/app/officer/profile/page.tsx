"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Pencil } from "lucide-react";
import { Alert, Avatar, PageHeader, PageSkeleton } from "@/components/ui";
import { districts } from "@/data/options";
import { api } from "@/lib/api-client";
import { formatDate } from "@/lib/format";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  department: string | null;
  district_assigned: string | null;
  created_at: string;
}

interface CaseRow {
  officer_profile_id: string | null;
  status: string;
  total_steps: number;
}

export default function OfficerProfile() {
  const { update } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name: "", department: "", district_assigned: "" });
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    Promise.all([api<Profile>("/api/profile"), api<CaseRow[]>("/api/cases")])
      .then(([p, c]) => {
        setProfile(p);
        setCases(c);
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <Alert tone="error" title="We couldn't load your profile">{error}</Alert>;
  if (!profile) return <PageSkeleton />;

  const mine = cases.filter((c) => c.officer_profile_id === profile.id);
  const stats = [
    { label: "Assigned youth", value: mine.length },
    { label: "Active roadmaps", value: mine.filter((c) => c.status === "active" && c.total_steps > 0).length },
    { label: "Completed", value: mine.filter((c) => c.status === "completed").length },
    { label: "Awaiting roadmap", value: mine.filter((c) => c.total_steps === 0).length },
  ];

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setNotice(null);
    try {
      const updated = await api<Profile>("/api/profile", { method: "PATCH", json: form });
      setProfile(updated);
      if (updated.full_name !== profile!.full_name) await update?.();
      setEditing(false);
      setNotice({ tone: "success", text: "Your profile has been updated." });
    } catch (err) {
      setNotice({ tone: "error", text: err instanceof Error ? err.message : "Could not save changes." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader title="My profile" description="Youth in your assigned district are routed to you when they sign up." />

      {notice ? <Alert tone={notice.tone}>{notice.text}</Alert> : null}

      <section className="stat-grid" style={{ marginTop: notice ? 16 : 0 }}>
        {stats.map((s) => (
          <article className="stat" key={s.label}>
            <div className="stat-top">
              <span>{s.label}</span>
            </div>
            <strong>{s.value}</strong>
          </article>
        ))}
      </section>

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
            <button
              className="btn btn-secondary btn-sm"
              type="button"
              onClick={() => {
                setForm({
                  full_name: profile.full_name,
                  department: profile.department || "",
                  district_assigned: profile.district_assigned || "",
                });
                setNotice(null);
                setEditing(true);
              }}
            >
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
              <label className="field">
                <span className="field-label">Department</span>
                <input className="input" maxLength={120} value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="e.g. Youth Empowerment" />
              </label>
              <label className="field">
                <span className="field-label">Assigned district</span>
                <select className="select" value={form.district_assigned} onChange={(e) => setForm({ ...form, district_assigned: e.target.value })}>
                  <option value="">Not assigned</option>
                  {Array.from(new Set([...districts, ...(form.district_assigned ? [form.district_assigned] : [])])).map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </label>
            </div>
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
              <dt>Role</dt>
              <dd>Youth officer</dd>
            </div>
            <div>
              <dt>Department</dt>
              <dd>{profile.department || <span className="muted">Not set</span>}</dd>
            </div>
            <div>
              <dt>Assigned district</dt>
              <dd>{profile.district_assigned || <span className="muted">Not set — you&apos;ll receive youth from any district</span>}</dd>
            </div>
            <div>
              <dt>Member since</dt>
              <dd>{formatDate(profile.created_at, { day: "numeric", month: "long", year: "numeric" })}</dd>
            </div>
          </dl>
        )}
      </section>
    </>
  );
}
