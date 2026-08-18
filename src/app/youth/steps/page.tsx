"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown, Clock, Lock, MapPin } from "lucide-react";
import { ProgressMeter, YouthShell } from "@/components/youth/YouthShell";

interface Step {
  id: string;
  step_number: number;
  title: string;
  detail: string;
  institution: string;
  status: string;
  state: string;
  location: string | null;
  source: string | null;
}

interface CaseData {
  id: string;
  current_step: number;
  total_steps: number;
  status: string;
  youth: { goal: string } | null;
  officer: { full_name: string } | null;
}

export default function YouthSteps() {
  const [steps, setSteps] = useState<Step[]>([]);
  const [youthCase, setYouthCase] = useState<CaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);
  const [justCompleted, setJustCompleted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadSteps();
  }, []);

  async function loadSteps() {
    try {
      const casesRes = await fetch("/api/cases");
      if (casesRes.ok) {
        const cases = await casesRes.json();
        if (cases.length > 0) {
          const c = cases[0];
          setYouthCase(c);
          const stepsRes = await fetch(`/api/cases/${c.id}/steps`);
          if (stepsRes.ok) {
            setSteps(await stepsRes.json());
          }
        }
      }
    } catch {
      // Silently handle errors
    } finally {
      setLoading(false);
    }
  }

  const completedCount = steps.filter((s) => s.state === "done").length;
  const percent =
    steps.length > 0
      ? Math.round((completedCount / steps.length) * 100)
      : 0;

  async function markDone(step: Step) {
    if (!youthCase || completing) return;
    setCompleting(step.id);
    setError("");

    try {
      const res = await fetch(`/api/cases/${youthCase.id}/steps`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stepId: step.id,
          status: "done",
          state: "done",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Could not complete step");
        return;
      }

      // Reload all steps to get updated states
      await loadSteps();
      setJustCompleted(true);
      window.setTimeout(() => setJustCompleted(false), 3000);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setCompleting(null);
    }
  }

  if (loading) {
    return (
      <YouthShell active="My Steps">
        <div className="youth-page-wrap">
          <div className="yd-loading">
            <div className="yd-loading-spinner" />
            <p>Loading your roadmap…</p>
          </div>
        </div>
      </YouthShell>
    );
  }

  if (steps.length === 0) {
    return (
      <YouthShell active="My Steps">
        <div className="youth-page-wrap">
          <header className="page-heading">
            <h1>My Steps</h1>
            <p>Your personalized roadmap</p>
          </header>
          <div className="content-card" style={{ padding: 40, textAlign: "center" }}>
            <p style={{ color: "#545d65" }}>
              No roadmap assigned yet. Your officer will create one for you soon.
            </p>
          </div>
        </div>
      </YouthShell>
    );
  }

  return (
    <YouthShell active="My Steps">
      <div className="youth-page-wrap steps-page">
        <header className="page-heading two-column-heading">
          <div>
            <h1>My Steps</h1>
            <p>Your personalized roadmap</p>
          </div>
          <ProgressMeter
            showHeader
            value={percent}
            label={`Overall progress: ${completedCount} of ${steps.length} steps done`}
          />
        </header>

        {youthCase && (
          <section className="roadmap-summary">
            <div>
              <span>Goal</span>
              <strong>{youthCase.youth?.goal || "Not set"}</strong>
            </div>
            <div>
              <span>Officer approval</span>
              <strong>
                {youthCase.officer
                  ? `Reviewed by ${youthCase.officer.full_name}`
                  : "Pending assignment"}
              </strong>
            </div>
            <div>
              <span>Status</span>
              <strong>{youthCase.status === "active" ? "In progress" : youthCase.status}</strong>
            </div>
          </section>
        )}

        {error && (
          <div style={{ color: "#c0392b", fontSize: 13, padding: "8px 12px", background: "#fdf0ef", borderRadius: 8, marginBottom: 12 }}>
            {error}
          </div>
        )}

        <section className="roadmap-list" aria-label="Roadmap steps">
          {steps.map((step) => (
            <article
              className={`roadmap-item ${step.state}`}
              key={step.id}
            >
              <div className="roadmap-number">
                {step.state === "done" ? (
                  <Check aria-hidden size={18} />
                ) : (
                  step.step_number
                )}
              </div>
              <div className="roadmap-body">
                <div className="roadmap-title-row">
                  <h2>{step.title}</h2>
                  <span className={`status-pill ${step.state}`}>
                    {step.state === "locked" && <Lock aria-hidden size={12} />}
                    {step.state === "done"
                      ? "Completed"
                      : step.state === "current"
                        ? "Current step"
                        : "Locked"}
                  </span>
                </div>
                <p>{step.detail}</p>
                {step.location && (
                  <span className="meta-line">
                    <MapPin aria-hidden size={15} />
                    {step.location}
                  </span>
                )}
                {step.source && (
                  <span className="source-line">{step.source}</span>
                )}
                {step.state === "current" && (
                  <button
                    className="outline-action"
                    type="button"
                    onClick={() => markDone(step)}
                    disabled={completing === step.id}
                  >
                    <Clock aria-hidden size={15} />
                    {completing === step.id ? "Completing…" : "Mark as done"}
                  </button>
                )}
              </div>
              <ChevronDown aria-hidden size={18} />
            </article>
          ))}
        </section>
        {justCompleted ? (
          <p className="roadmap-note done-note">
            ✓ Step completed — the next step is now unlocked. Your officer will
            be notified.
          </p>
        ) : (
          <p className="roadmap-note">
            Steps unlock in order. Complete the current step to move forward.
          </p>
        )}
      </div>
    </YouthShell>
  );
}
