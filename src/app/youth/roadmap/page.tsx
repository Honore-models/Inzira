"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Check,
  ChevronRight,
  ClipboardList,
  Lock,
  MapPin,
  Briefcase,
  Clock,
  ChevronDown,
} from "lucide-react";
import { YouthShell, ProgressMeter } from "@/components/youth/YouthShell";

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

interface YouthCase {
  id: string;
  status: string;
  current_step: number;
  total_steps: number;
  created_at: string;
  youth?: { goal: string } | null;
  officer?: { full_name: string } | null;
  steps: Step[];
}

export default function YouthRoadmapPage() {
  const [youthCase, setYouthCase] = useState<YouthCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);
  const [justCompleted, setJustCompleted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const casesRes = await fetch("/api/cases");
        if (casesRes.ok) {
          const cases = await casesRes.json();
          const activeCase = cases.find(
            (c: YouthCase) => c.status === "active" || c.status === "completed",
          );
          if (activeCase) {
            const stepsRes = await fetch(`/api/cases/${activeCase.id}/steps`);
            if (stepsRes.ok) {
              activeCase.steps = await stepsRes.json();
            } else {
              activeCase.steps = [];
            }
            setYouthCase(activeCase);
          }
        }
      } catch {
        // silently handle
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const completedCount = youthCase?.steps?.filter((s) => s.state === "done").length || 0;
  const totalSteps = youthCase?.total_steps || youthCase?.steps?.length || 0;
  const percent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

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

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Could not complete step");
        return;
      }

      // Reload
      const stepsRes = await fetch(`/api/cases/${youthCase.id}/steps`);
      if (stepsRes.ok) {
        const steps = await stepsRes.json();
        setYouthCase((prev) => (prev ? { ...prev, steps } : prev));
      }
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

  if (!youthCase || !youthCase.steps || youthCase.steps.length === 0) {
    return (
      <YouthShell active="My Steps">
        <div className="youth-page-wrap">
          <header className="page-heading">
            <h1>My Roadmap</h1>
            <p>Your personalized step-by-step plan</p>
          </header>
          <div className="content-card" style={{ padding: 40, textAlign: "center" }}>
            <ClipboardList size={40} style={{ color: "#a0a8a5", marginBottom: 16 }} />
            <h3 style={{ fontSize: 18, marginBottom: 8 }}>No roadmap yet</h3>
            <p style={{ color: "#545d65", fontSize: 14, marginBottom: 20 }}>
              Your youth officer is preparing a personalized roadmap for you.
              <br />
              Check back soon or ask your officer about your progress.
            </p>
            <Link
              className="officer-button primary"
              href="/youth/ask"
              style={{ display: "inline-flex" }}
            >
              Ask a question
            </Link>
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
            <h1>My Roadmap</h1>
            <p>Your personalized step-by-step plan</p>
          </div>
          <ProgressMeter
            showHeader
            value={percent}
            label={`${completedCount} of ${totalSteps} steps completed`}
          />
        </header>

        {/* Summary bar */}
        <section className="roadmap-summary">
          <div>
            <span>Goal</span>
            <strong>{youthCase.youth?.goal || "Not set"}</strong>
          </div>
          <div>
            <span>Officer</span>
            <strong>
              {youthCase.officer
                ? `Reviewed by ${youthCase.officer.full_name}`
                : "Pending assignment"}
            </strong>
          </div>
          <div>
            <span>Status</span>
            <strong>
              {youthCase.status === "active"
                ? "In progress"
                : youthCase.status === "completed"
                  ? "Completed"
                  : "Pending"}
            </strong>
          </div>
        </section>

        {error && (
          <div
            style={{
              color: "#c0392b",
              fontSize: 13,
              padding: "8px 12px",
              background: "#fdf0ef",
              borderRadius: 8,
              marginBottom: 12,
            }}
          >
            {error}
          </div>
        )}

        {/* Steps timeline */}
        <section className="roadmap-list" aria-label="Roadmap steps">
          {youthCase.steps.map((step) => (
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

                {step.institution && (
                  <span className="meta-line">
                    <Briefcase aria-hidden size={15} />
                    {step.institution}
                  </span>
                )}

                {step.source && (
                  <span className="source-line">
                    📄 {step.source}
                  </span>
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

        {/* Quick links */}
        <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link
            href="/youth/ask"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 16px",
              border: "1px solid #e2e5df",
              borderRadius: 8,
              fontSize: 14,
              color: "#1f6f4c",
              textDecoration: "none",
            }}
          >
            Ask a question about your steps
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </YouthShell>
  );
}
