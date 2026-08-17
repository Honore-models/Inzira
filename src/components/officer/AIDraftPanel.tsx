"use client";

import { useState } from "react";
import { GripVertical, MoreVertical, Plus, Sparkles } from "lucide-react";
import type { aiDraftSteps } from "@/data/officer";

type DraftStep = (typeof aiDraftSteps)[number];

const badges = ["RDB", "RRA", "Bank", "BDF", "Training", "RTB", "Ministry"];

export function AIDraftPanel({ steps }: { steps: DraftStep[] }) {
  const [draftSteps, setDraftSteps] = useState<DraftStep[]>(steps);

  function addStep() {
    const nextNumber = draftSteps.length + 1;
    setDraftSteps((prev) => [
      ...prev,
      {
        number: nextNumber,
        title: "New step — edit title and details",
        detail: "Describe what this step requires and which institution is involved.",
        badge: badges[nextNumber % badges.length],
      },
    ]);
  }

  return (
    <section className="officer-card ai-draft">
      <header className="officer-card-header">
        <div>
          <h2>
            <Sparkles aria-hidden size={17} />
            AI Draft Roadmap
          </h2>
          <p>Generated from verified program library</p>
        </div>
        <span className="officer-chip green">Draft</span>
      </header>
      <div className="ai-draft-list">
        {draftSteps.map((step) => (
          <div className="ai-draft-row" key={step.number}>
            <span className="ai-drag">
              <GripVertical aria-hidden size={16} />
            </span>
            <span className="ai-step-number">{step.number}</span>
            <div className="ai-step-body">
              <strong>{step.title}</strong>
              <p>{step.detail}</p>
              <span className="ai-badge">{step.badge}</span>
            </div>
            <button className="ai-more" type="button" aria-label="More options">
              <MoreVertical aria-hidden size={16} />
            </button>
          </div>
        ))}
      </div>
      <div className="ai-draft-actions">
        <button className="officer-button outline" type="button" onClick={addStep}>
          <Plus aria-hidden size={15} />
          Add step
        </button>
        <button className="officer-button ghost" type="button">
          Reorder
        </button>
      </div>
    </section>
  );
}
