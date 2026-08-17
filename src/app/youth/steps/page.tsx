"use client";

import { useState } from "react";
import { Check, ChevronDown, Clock, Lock, MapPin } from "lucide-react";
import { ProgressMeter, YouthShell } from "@/components/youth/YouthShell";
import { roadmapSteps, youthCase } from "@/data/youth";

type StepState = "done" | "current" | "locked";

export default function YouthSteps() {
  const [steps, setSteps] = useState<StepState[]>(
    roadmapSteps.map((s) => s.state as StepState),
  );
  const [justCompleted, setJustCompleted] = useState(false);

  const completedCount = steps.filter((s) => s === "done").length;
  const percent = Math.round((completedCount / steps.length) * 100);

  function markDone(index: number) {
    setSteps((prev) => prev.map((s, i) => (i === index ? "done" : s)));
    setJustCompleted(true);
    window.setTimeout(() => setJustCompleted(false), 2500);
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

        <section className="roadmap-summary">
          <div>
            <span>Goal</span>
            <strong>{youthCase.youth.goal}</strong>
          </div>
          <div>
            <span>Officer approval</span>
            <strong>Reviewed by {youthCase.youth.officer}</strong>
          </div>
          <div>
            <span>Last update</span>
            <strong>{youthCase.progress.updated}</strong>
          </div>
        </section>

        <section className="roadmap-list" aria-label="Business roadmap steps">
          {roadmapSteps.map((step, index) => (
            <article className={`roadmap-item ${steps[index]}`} key={step.number}>
              <div className="roadmap-number">
                {steps[index] === "done" ? <Check aria-hidden size={18} /> : step.number}
              </div>
              <div className="roadmap-body">
                <div className="roadmap-title-row">
                  <h2>{step.title}</h2>
                  <span className={`status-pill ${steps[index]}`}>
                    {steps[index] === "locked" && <Lock aria-hidden size={12} />}
                    {steps[index] === "done"
                      ? `Completed on ${new Date().toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                        })}`
                      : steps[index] === "current"
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
                {step.source && <span className="source-line">{step.source}</span>}
                {steps[index] === "current" && (
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
