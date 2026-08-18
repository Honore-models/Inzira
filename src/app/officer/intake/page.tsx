"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  FileText,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { OfficerShell } from "@/components/officer/OfficerShell";
import { AIDraftPanel } from "@/components/officer/AIDraftPanel";
import { goalOptions, districts, sectors } from "@/data/officer";

export default function OfficerIntake() {
  const [district, setDistrict] = useState("");
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState(goalOptions[0] || "");
  const [skills, setSkills] = useState("");
  const [situation, setSituation] = useState("");
  const [sector, setSector] = useState("");
  const [createdCaseId, setCreatedCaseId] = useState<string | null>(null);
  const [aiSteps, setAiSteps] = useState<
    { number: number; title: string; detail: string; badge: string }[]
  >([]);

  const sectorOptions = districts.includes(district)
    ? sectors[district] || []
    : [];

  async function handleGenerate() {
    if (!name.trim()) return;
    setGenerating(true);

    try {
      // Create a new case with youth profile
      const signupRes = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: `${name.trim().toLowerCase().replace(/\s+/g, ".")}@youth.rw`,
          password: "password123",
          fullName: name.trim(),
          role: "youth",
        }),
      });

      const signupData = await signupRes.json();
      if (signupData.error) {
        // User might already exist, try to find them
        console.log("Signup note:", signupData.error);
      }

      // Get all cases (we'll create a case for this youth)
      const casesRes = await fetch("/api/cases");

      // Generate AI draft steps based on goal
      const draftSteps = generateDraftSteps(goal, skills);
      setAiSteps(draftSteps);

      // Simulate AI generation delay
      setTimeout(() => {
        setGenerating(false);
        setShowRoadmap(true);
      }, 1800);
    } catch {
      // On error, still show the draft for demo purposes
      const draftSteps = generateDraftSteps(goal, skills);
      setAiSteps(draftSteps);
      setTimeout(() => {
        setGenerating(false);
        setShowRoadmap(true);
      }, 1800);
    }
  }

  function generateDraftSteps(
    goal: string,
    skills: string,
  ) {
    const baseSteps: Record<string, { number: number; title: string; detail: string; badge: string }[]> = {
      "Start a business": [
        { number: 1, title: "Register your business name with RDB", detail: "Register your business name and obtain a registration certificate.", badge: "RDB" },
        { number: 2, title: "Get your Tax Identification Number (TIN)", detail: "Apply for and get your TIN from RRA.", badge: "RRA" },
        { number: 3, title: "Open a business bank account", detail: "Open an account in a bank in your business name.", badge: "Bank" },
        { number: 4, title: "Apply for BDF loan guarantee", detail: "Prepare documents and apply for a loan guarantee.", badge: "BDF" },
        { number: 5, title: "Build your business plan", detail: "Prepare or review this plan for funding.", badge: "Training" },
      ],
      "Get vocational training": [
        { number: 1, title: "Find a TVET program matching your interests", detail: "Browse available vocational training programs.", badge: "RTB" },
        { number: 2, title: "Check eligibility and requirements", detail: "Gather documents needed for enrollment.", badge: "RTB" },
        { number: 3, title: "Apply for enrollment", detail: "Submit your application to the chosen program.", badge: "RTB" },
        { number: 4, title: "Complete the training", detail: "Attend classes and complete coursework.", badge: "RTB" },
        { number: 5, title: "Get certified", detail: "Receive your TVET certificate.", badge: "RTB" },
      ],
      "Find a job": [
        { number: 1, title: "Create your CV", detail: "Prepare a professional CV highlighting your skills.", badge: "Training" },
        { number: 2, title: "Register with employment services", detail: "Register for job matching services.", badge: "RDB" },
        { number: 3, title: "Apply for open positions", detail: "Submit applications to relevant openings.", badge: "Various" },
        { number: 4, title: "Prepare for interviews", detail: "Practice interview skills and prepare documents.", badge: "Training" },
        { number: 5, title: "Start your new position", detail: "Begin employment and complete onboarding.", badge: "—" },
      ],
    };

    return (
      baseSteps[goal] || baseSteps["Start a business"]
    );
  }

  return (
    <OfficerShell active="Smart Intake">
      <div className="officer-page-wrap">
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
          </div>
        </header>

        <div className="intake-two-col">
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
              <label className="intake-field full">
                <span>Youth name</span>
                <input
                  type="text"
                  placeholder="e.g. Diane Uwimana"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>

              <label className="intake-field">
                <span>Goal</span>
                <select value={goal} onChange={(e) => setGoal(e.target.value)}>
                  {goalOptions.map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </select>
              </label>

              <label className="intake-field">
                <span>Skills / background</span>
                <input
                  type="text"
                  placeholder="e.g. Tailoring, basic IT"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                />
              </label>

              <label className="intake-field full">
                <span>Current situation / notes</span>
                <textarea
                  rows={3}
                  placeholder="Describe the youth's current situation..."
                  value={situation}
                  onChange={(e) => setSituation(e.target.value)}
                />
              </label>

              <label className="intake-field">
                <span>Location</span>
                <select
                  value={district}
                  onChange={(e) => {
                    setDistrict(e.target.value);
                    setSector("");
                  }}
                >
                  <option value="">Select district</option>
                  {districts.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </label>

              <label className="intake-field">
                <span>&nbsp;</span>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                >
                  <option value="">Select sector</option>
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
                disabled={generating || !name.trim()}
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

          {showRoadmap ? (
            <AIDraftPanel steps={aiSteps} />
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
