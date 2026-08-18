"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown, Clock, Lock, MapPin } from "lucide-react";
import { ProgressMeter, YouthShell } from "@/components/youth/YouthShell";

type StepState = "done" | "current" | "locked";

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
  const [justCompleted, setJustCompleted] = useState(false);

  useEffect(() => {
    async function load() {
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
    load();
  }, []);

  const completedCount = steps.filter((s) => s.state === "done").length;
  const percent =
    steps.length > 0
      ? Math.round((completedCount / steps.length) * 100)
      : 0;

  function markDone(index: number) {
    setSteps((prev) =>
      prev.map((s, i) =>
        i === index ? { ...s, state: "done", status: "done" } : s,
      ),
    );
    setJustCompleted(true);
    window.setTimeout(() => setJustCompleted(false), 2500);
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
              <strong>{youthCase.status}</strong>
            </div>
          </section>
        )}

        <section className="roadmap-list" aria-label="Roadmap steps">
          {steps.map((step, index) => (
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
                    onClick={() => markDone(index)}
                  >
                    <Clock aria-hidden size={15} />
                    Mark as done
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
