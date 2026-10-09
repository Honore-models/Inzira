"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Building2, Check, CheckCircle2, Compass, FileText, Lock, MapPin, MessageCircle, RefreshCw } from "lucide-react";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Alert, Avatar, EmptyState, PageSkeleton, ProgressBar } from "@/components/ui";
import { api } from "@/lib/api-client";
import { STATUS_LABELS, completedSteps, progressPercent, type YouthStatus } from "@/lib/case-status";
import { formatDate } from "@/lib/format";

interface Step {
  id: string;
  step_number: number;
  title: string;
  detail: string | null;
  institution: string | null;
  location: string | null;
  source: string | null;
  state: "done" | "current" | "locked";
}

interface Roadmap {
  id: string;
  title: string;
  summary: string | null;
  status: string;
  steps_data: { order: number; whatToBring?: string[] }[] | null;
  officer_notes: string | null;
  created_at: string;
  approved_at: string | null;
}

interface Detail {
  profile: {
    id: string;
    full_name: string;
    email: string;
    goal: string | null;
    skills: string | null;
    skills_background: string | null;
    situation: string | null;
    district: string | null;
    sector: string | null;
    onboarding_completed: boolean;
    onboarding_submitted_at: string | null;
    created_at: string;
  };
  case: { id: string; status: string; current_step: number; total_steps: number } | null;
  status: YouthStatus;
  steps: Step[];
  roadmaps: Roadmap[];
  officer: { id: string; full_name: string } | null;
}

const ROADMAP_STATUS: Record<string, string> = { draft: "Draft", approved: "Approved", reviewed: "Superseded", sent: "Approved" };

export default function OfficerYouthDetail() {
  const { id } = useParams<{ id: string }>();
  const [detail, setDetail] = useState<Detail | null>(null);
  const [error, setError] = useState("");
  const [confirmStep, setConfirmStep] = useState<Step | null>(null);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  const load = useCallback(() => {
    api<Detail>(`/api/youth/${id}`).then(setDetail).catch((e) => setError(e.message));
  }, [id]);

  useEffect(load, [load]);

  if (error) {
    return (
      <>
        <Link className="back-link" href="/officer/youth">
          <ArrowLeft size={15} aria-hidden /> All youth
        </Link>
        <Alert tone="error" title="We couldn't load this profile">{error}</Alert>
      </>
    );
  }
  if (!detail) return <PageSkeleton />;

  const { profile, case: youthCase, steps, roadmaps, officer, status } = detail;
  const approved = roadmaps.find((r) => r.status === "approved");
  const latestDraft = roadmaps.find((r) => r.status === "draft");
  const bring = new Map((approved?.steps_data || []).map((s) => [s.order, s.whatToBring || []]));
  const pct = progressPercent(youthCase);

  async function completeStep(step: Step) {
    setConfirmStep(null);
    setNotice(null);
    try {
      await api(`/api/cases/${youthCase!.id}/steps`, { method: "PATCH", json: { stepId: step.id } });
      setNotice({ tone: "success", text: `"${step.title}" marked as done.` });
      load();
    } catch (e) {
      setNotice({ tone: "error", text: e instanceof Error ? e.message : "Could not update the step." });
    }
  }

  return (
    <>
      <Link className="back-link" href="/officer/youth">
        <ArrowLeft size={15} aria-hidden /> All youth
      </Link>

      <section className="card card-body" style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", marginBottom: 20 }}>
        <Avatar name={profile.full_name} email={profile.email} size="lg" />
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: 22, fontWeight: 700 }}>{profile.full_name}</h1>
            <span className={`badge badge-${status}`}>{STATUS_LABELS[status]}</span>
          </div>
          <p className="muted">
            {profile.email}
            {officer ? ` · Officer: ${officer.full_name}` : " · No officer assigned"}
          </p>
        </div>
        <div className="page-actions">
          {youthCase ? (
            <Link className="btn btn-secondary" href={`/officer/messages?case=${youthCase.id}`}>
              <MessageCircle size={16} aria-hidden /> Message
            </Link>
          ) : null}
          <Link className="btn btn-primary" href={`/officer/intake?youthId=${profile.id}`}>
            {steps.length ? <RefreshCw size={16} aria-hidden /> : <Compass size={16} aria-hidden />}
            {steps.length ? "Revise roadmap" : "Create roadmap"}
          </Link>
        </div>
      </section>

      {notice ? <Alert tone={notice.tone}>{notice.text}</Alert> : null}
      {!profile.onboarding_completed ? (
        <Alert tone="warning" title="Onboarding not finished">
          This youth hasn&apos;t completed onboarding yet, so some information may be missing. You can still prepare a roadmap with
          them in Smart Intake.
        </Alert>
      ) : null}

      <div className="grid-main" style={{ marginTop: notice || !profile.onboarding_completed ? 16 : 0 }}>
        <section className="card">
          <header className="card-header">
            <div>
              <h2>{approved?.title || "Roadmap"}</h2>
              <p>
                {steps.length
                  ? `${completedSteps(youthCase)} of ${youthCase?.total_steps} steps complete${approved?.approved_at ? ` · approved ${formatDate(approved.approved_at)}` : ""}`
                  : "No approved roadmap yet"}
              </p>
            </div>
            {steps.length ? (
              <div className="progress-row" style={{ width: 160 }}>
                <ProgressBar value={pct} />
                <span>{pct}%</span>
              </div>
            ) : null}
          </header>

          {steps.length === 0 ? (
            <EmptyState
              icon={<Compass size={24} />}
              title={latestDraft ? "A draft is waiting for your review" : "This youth needs a roadmap"}
              action={
                <Link
                  className="btn btn-primary"
                  href={`/officer/intake?youthId=${profile.id}${latestDraft ? `&draft=${latestDraft.id}` : ""}`}
                >
                  {latestDraft ? "Review draft" : "Start Smart Intake"}
                </Link>
              }
            >
              {latestDraft
                ? `"${latestDraft.title}" was drafted on ${formatDate(latestDraft.created_at)} but hasn't been approved.`
                : "Smart Intake drafts a plan from the verified library. You review, edit and approve it."}
            </EmptyState>
          ) : (
            <div className="card-body">
              {approved?.summary ? <p style={{ marginBottom: 16 }}>{approved.summary}</p> : null}
              <ol className="timeline">
                {steps.map((step) => (
                  <li className={`timeline-item ${step.state}`} key={step.id}>
                    <span className="timeline-node" aria-hidden>
                      {step.state === "done" ? <Check size={18} /> : step.state === "locked" ? <Lock size={14} /> : step.step_number}
                    </span>
                    <article className="timeline-card">
                      <div className="timeline-head">
                        <h3>{step.title}</h3>
                        <span className={`badge badge-${step.state}`}>
                          {step.state === "done" ? "Done" : step.state === "current" ? "Current" : "Locked"}
                        </span>
                      </div>
                      {step.detail ? <p>{step.detail}</p> : null}
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
                      {(bring.get(step.step_number) || []).length ? (
                        <div className="bring-list">
                          <strong>What to bring</strong>
                          <ul>
                            {bring.get(step.step_number)!.map((b) => (
                              <li key={b}>
                                <CheckCircle2 size={14} aria-hidden /> {b}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                      {step.source ? (
                        <p className="source-note">
                          <FileText size={13} aria-hidden /> {step.source}
                        </p>
                      ) : null}
                      {step.state === "current" ? (
                        <button className="btn btn-secondary btn-sm" type="button" style={{ marginTop: 12 }} onClick={() => setConfirmStep(step)}>
                          <Check size={14} aria-hidden /> Mark done for youth
                        </button>
                      ) : null}
                    </article>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </section>

        <aside className="stack">
          <section className="card">
            <header className="card-header">
              <h2>Intake information</h2>
            </header>
            <dl className="dl">
              <div>
                <dt>Goal</dt>
                <dd>{profile.goal || <span className="muted">Not set</span>}</dd>
              </div>
              <div>
                <dt>Skills</dt>
                <dd>{profile.skills_background || profile.skills || <span className="muted">Not provided</span>}</dd>
              </div>
              <div>
                <dt>Location</dt>
                <dd>{[profile.district, profile.sector].filter(Boolean).join(", ") || <span className="muted">Not set</span>}</dd>
              </div>
              {profile.situation ? (
                <div>
                  <dt>Situation</dt>
                  <dd>{profile.situation}</dd>
                </div>
              ) : null}
              <div>
                <dt>Submitted</dt>
                <dd>{profile.onboarding_submitted_at ? formatDate(profile.onboarding_submitted_at) : <span className="muted">Not yet</span>}</dd>
              </div>
            </dl>
          </section>

          {roadmaps.length ? (
            <section className="card">
              <header className="card-header">
                <h2>Roadmap history</h2>
              </header>
              {roadmaps.map((r) => (
                <div className="list-row" key={r.id}>
                  <div className="list-row-body">
                    <strong>{r.title || "Roadmap"}</strong>
                    <span>{formatDate(r.approved_at || r.created_at)}</span>
                  </div>
                  <span className={`badge badge-${r.status === "approved" ? "green" : r.status === "draft" ? "draft" : "gray"}`}>
                    {ROADMAP_STATUS[r.status] || r.status}
                  </span>
                </div>
              ))}
            </section>
          ) : null}
        </aside>
      </div>

      <ConfirmModal
        open={!!confirmStep}
        title="Mark this step as done?"
        message={`Use this when ${profile.full_name.split(" ")[0]} has completed "${confirmStep?.title}" but couldn't update it themselves. The next step will unlock.`}
        confirmText="Mark as done"
        variant="info"
        onConfirm={() => confirmStep && completeStep(confirmStep)}
        onCancel={() => setConfirmStep(null)}
      />
    </>
  );
}
