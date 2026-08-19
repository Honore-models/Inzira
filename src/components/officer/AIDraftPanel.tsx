"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  MapPin,
} from "lucide-react";

interface DraftStep {
  number: number;
  title: string;
  detail: string;
  badge: string;
  location?: string;
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
            <div className="ai-step-left">
              <span className="ai-step-number">{step.number}</span>
              <div className="ai-step-connector" />
            </div>
            <div className="ai-step-card">
              <div className="ai-step-header">
                <div className="ai-step-icon">
                  <FileText aria-hidden size={14} />
                </div>
                <strong className="ai-step-title">{step.title}</strong>
                <span className="ai-badge">{step.badge}</span>
              </div>
              <p className="ai-step-detail">{step.detail}</p>
              {step.location && (
                <span className="ai-step-location">
                  <MapPin aria-hidden size={12} />
                  {step.location}
                </span>
              )}
            </div>
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
