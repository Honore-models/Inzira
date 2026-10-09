"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, Check, CheckCircle2, FileText, Lock, MapPin, MessageCircle, Route } from "lucide-react";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Alert, EmptyState, PageHeader, PageSkeleton, ProgressBar } from "@/components/ui";
import { api } from "@/lib/api-client";
import { completedSteps, progressPercent } from "@/lib/case-status";
import { formatDate } from "@/lib/format";
import { useJourney, type JourneyStep } from "@/lib/use-journey";

const STATE_LABEL = { done: "Completed", current: "Current step", locked: "Locked" } as const;

export default function YouthRoadmap() {
  const { data, error, loading, reload } = useJourney();
  const [confirming, setConfirming] = useState<JourneyStep | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  if (loading) return <PageSkeleton />;
  if (error || !data) return <Alert tone="error" title="We couldn't load your roadmap">{error}</Alert>;

  const { case: youthCase, steps, roadmap, officer } = data;

  if (!youthCase || steps.length === 0) {
    return (
      <>
        <PageHeader title="My roadmap" description="Your personalised, step-by-step plan." />
        <div className="card">
          <EmptyState
            icon={<Route size={24} />}
            title="Your roadmap is being prepared"
            action={
              <Link className="btn btn-secondary" href="/youth/messages">
                <MessageCircle size={16} aria-hidden /> Message your officer
              </Link>
            }
          >
            Your youth officer reviews your information and prepares a plan built from official programs. It will
            appear here as soon as it&apos;s approved.
          </EmptyState>
        </div>
      </>
    );
  }

  const done = completedSteps(youthCase);
  const pct = progressPercent(youthCase);
  const finished = youthCase.status === "completed";

  async function markDone(step: JourneyStep) {
    setConfirming(null);
    setSaving(true);
    setNotice(null);
    try {
      const result = await api<{ completed: boolean }>(`/api/cases/${youthCase!.id}/steps`, {
        method: "PATCH",
        json: { stepId: step.id },
      });
      await reload();
      setNotice({
        tone: "success",
        text: result.completed
          ? "You've completed your whole roadmap. Well done!"
          : "Step completed. Your next step is now unlocked.",
      });
    } catch (e) {
      setNotice({ tone: "error", text: e instanceof Error ? e.message : "Could not update the step." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        title={roadmap?.title || "My roadmap"}
        description={
          officer
            ? `Reviewed and approved by ${officer.full_name}${roadmap?.approvedAt ? ` on ${formatDate(roadmap.approvedAt)}` : ""}.`
            : "Your personalised, step-by-step plan."
        }
      />

      <div className="grid-main">
        <div>
          {notice ? <Alert tone={notice.tone}>{notice.text}</Alert> : null}
          {finished ? (
            <Alert tone="success" title="Roadmap complete">
              You&apos;ve finished every step. Let your officer know how it went — they can help with what comes next.
            </Alert>
          ) : null}

          <ol className="timeline" style={{ marginTop: notice || finished ? 16 : 0 }}>
            {steps.map((step) => (
              <li className={`timeline-item ${step.state}`} key={step.id}>
                <span className="timeline-node" aria-hidden>
                  {step.state === "done" ? <Check size={18} /> : step.state === "locked" ? <Lock size={14} /> : step.step_number}
                </span>
                <article className="timeline-card">
                  <div className="timeline-head">
                    <h3>
                      <span className="visually-hidden">Step {step.step_number}: </span>
                      {step.title}
                    </h3>
                    <span className={`badge badge-${step.state}`}>{STATE_LABEL[step.state]}</span>
                  </div>
                  {step.detail ? <p>{step.detail}</p> : null}

                  {(step.institution || step.location) && (
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
                  )}

                  {step.state !== "locked" && step.why_this_step ? <p className="why-note">{step.why_this_step}</p> : null}

                  {step.state !== "locked" && step.what_to_bring.length > 0 ? (
                    <div className="bring-list">
                      <strong>What to bring</strong>
                      <ul>
                        {step.what_to_bring.map((item) => (
                          <li key={item}>
                            <CheckCircle2 size={14} aria-hidden /> {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {step.source ? (
                    <p className="source-note">
                      <FileText size={13} aria-hidden /> Source: {step.source}
                    </p>
                  ) : null}

                  {step.state === "current" ? (
                    <div style={{ marginTop: 14 }}>
                      <button className="btn btn-primary" type="button" disabled={saving} onClick={() => setConfirming(step)}>
                        {saving ? <span className="spinner" aria-hidden /> : <Check size={16} aria-hidden />}
                        {saving ? "Saving…" : "Mark as done"}
                      </button>
                    </div>
                  ) : null}
                </article>
              </li>
            ))}
          </ol>
        </div>

        <aside className="stack">
          <div className="card card-body">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <strong>Progress</strong>
              <strong>{pct}%</strong>
            </div>
            <ProgressBar value={pct} label="Roadmap progress" />
            <p className="muted" style={{ marginTop: 10, fontSize: 13 }}>
              {done} of {youthCase.total_steps} steps complete. Steps unlock in order.
            </p>
          </div>

          {roadmap?.summary ? (
            <div className="card card-body">
              <strong style={{ display: "block", marginBottom: 6 }}>About this plan</strong>
              <p style={{ fontSize: 13 }}>{roadmap.summary}</p>
            </div>
          ) : null}

          <div className="card card-body">
            <strong style={{ display: "block", marginBottom: 6 }}>Stuck on a step?</strong>
            <p style={{ fontSize: 13, marginBottom: 12 }}>
              Ask Inzira about requirements, or message your officer for help with your situation.
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Link className="btn btn-secondary btn-sm" href="/youth/ask">Ask Inzira</Link>
              <Link className="btn btn-secondary btn-sm" href="/youth/messages">Message officer</Link>
            </div>
          </div>
        </aside>
      </div>

      <ConfirmModal
        open={!!confirming}
        title="Mark this step as done?"
        message={`"${confirming?.title}" will be marked complete and your next step will unlock. Your officer can see your progress.`}
        confirmText="Yes, mark as done"
        cancelText="Not yet"
        variant="info"
        onConfirm={() => confirming && markDone(confirming)}
        onCancel={() => setConfirming(null)}
      />
    </>
  );
}
