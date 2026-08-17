"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ClipboardList, FileText, Sparkles, ShieldCheck } from "lucide-react";
import { OfficerShell } from "@/components/officer/OfficerShell";
import { AIDraftPanel } from "@/components/officer/AIDraftPanel";
import { SaveDraftButton } from "@/components/officer/SaveDraftButton";
import { aiDraftSteps, intakeForm, goalOptions, districts, sectors } from "@/data/officer";

export default function OfficerIntake() {
  const [district, setDistrict] = useState(intakeForm.district);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [generating, setGenerating] = useState(false);

  const sectorOptions = districts.includes(district) ? sectors[district] || [] : [];

  function handleGenerate() {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setShowRoadmap(true);
    }, 1800);
  }

  return (
    <OfficerShell active="Smart Intake">
      <div className="officer-page-wrap">
        {/* Header */}
        <header className="intake-top-header">
          <div>
            <h1>Smart Intake</h1>
            <p>
              Enter information about the youth. The AI will generate a roadmap
              based on verified programs.
            </p>
          </div>
          <div className="intake-top-actions">
            <span className="intake-status-note">
              <ShieldCheck aria-hidden size={16} />
              All roadmaps are drafts until you approve and send.
            </span>
            <SaveDraftButton />
          </div>
        </header>

        {/* Two-column grid */}
        <div className="intake-two-col">
          {/* Left: Intake Notes */}
          <section className="officer-card intake-notes-card">
            <header className="intake-section-header">
              <div className="intake-section-icon">
                <ClipboardList aria-hidden size={18} />
              </div>
              <div>
                <h2>1. Intake Notes</h2>
                <p>Provide details about the youth.</p>
              </div>
            </header>

            <div className="intake-form-grid">
              {/* Youth name — full width */}
              <label className="intake-field full">
                <span>Youth name</span>
                <input type="text" defaultValue={intakeForm.name} />
              </label>

              {/* Goal + Skills row */}
              <label className="intake-field">
                <span>Goal</span>
                <select defaultValue={intakeForm.goal}>
                  {goalOptions.map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </select>
              </label>

              <label className="intake-field">
                <span>Skills / background</span>
                <input type="text" defaultValue={intakeForm.skills} />
              </label>

              {/* Current situation */}
              <label className="intake-field full">
                <span>Current situation / notes</span>
                <textarea rows={3} defaultValue={intakeForm.situation} />
              </label>

              {/* Location row */}
              <label className="intake-field">
                <span>Location</span>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                >
                  {districts.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </label>

              <label className="intake-field">
                <span>&nbsp;</span>
                <select defaultValue={intakeForm.sector}>
                  {sectorOptions.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="intake-generate-row">
              <button
                className="officer-button primary"
                type="button"
                onClick={handleGenerate}
                disabled={generating}
              >
                <Sparkles aria-hidden size={15} />
                {generating ? "Generating…" : "Generate roadmap"}
              </button>
              <span className="intake-generate-hint">
                {generating
                  ? "AI is generating your roadmap…"
                  : <>Click to generate a roadmap<br />using AI and verified sources.</>}
              </span>
            </div>
          </section>

          {/* Right: AI Generated Roadmap */}
          {showRoadmap ? (
            <AIDraftPanel steps={aiDraftSteps} />
          ) : (
            <section className="officer-card intake-roadmap-empty">
              <header className="intake-section-header">
                <div className="intake-section-icon ai">
                  <Sparkles aria-hidden size={18} />
                </div>
                <div>
                  <h2>2. AI Generated Roadmap</h2>
                  <p>(will appear here)</p>
                </div>
              </header>

              <div className="intake-empty-state">
                <div className="intake-empty-icon">
                  <FileText aria-hidden size={40} />
                </div>
                <h3>No roadmap yet</h3>
                <p>
                  Fill in the intake notes and click &ldquo;Generate roadmap&rdquo;
                  to create a step-by-step plan for this youth.
                </p>
              </div>

              <div className="intake-info-banner">
                <ShieldCheck aria-hidden size={18} />
                <div>
                  <strong>The AI uses only verified program documents.</strong>
                  <p>
                    Every roadmap is a draft until you review and approve it.
                  </p>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </OfficerShell>
  );
}
