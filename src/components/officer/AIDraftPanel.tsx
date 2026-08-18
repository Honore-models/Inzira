"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  MoreVertical,
  Plus,
  Sparkles,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

interface DraftStep {
  number: number;
  title: string;
  detail: string;
  badge: string;
}

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
      <header className="intake-section-header">
        <div className="intake-section-icon ai">
          <Sparkles aria-hidden size={18} />
        </div>
        <div>
          <h2>
            2. AI Generated Roadmap <span className="draft-label">(Draft)</span>
          </h2>
          <p>
            <span className="ai-draft-status">Draft • Not sent to youth</span>
          </p>
        </div>
      </header>

      <div className="ai-generated-source">
        <ShieldCheck aria-hidden size={15} />
        <span>Generated from verified sources</span>
      </div>

      <div className="ai-draft-list">
        {draftSteps.map((step) => (
          <div className="ai-draft-row" key={step.number}>
            <span className="ai-step-number">{step.number}</span>
            <div className="ai-step-icon">
              <FileText aria-hidden size={16} />
            </div>
            <div className="ai-step-body">
              <strong>{step.title}</strong>
              <p>{step.detail}</p>
            </div>
            <span className="ai-badge">{step.badge}</span>
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
          <RefreshCw aria-hidden size={14} />
          Reorder
        </button>
        <div className="ai-draft-actions-spacer" />
        <Link className="officer-button primary" href="/officer/intake/review">
          Review &amp; edit roadmap
          <span aria-hidden>→</span>
        </Link>
      </div>

      <div className="ai-draft-footer-note">
        <ShieldCheck aria-hidden size={15} />
        <span>
          This roadmap is a <strong>DRAFT</strong>. Review it carefully before
          approving and sending to the youth.
        </span>
      </div>
    </section>
  );
}
