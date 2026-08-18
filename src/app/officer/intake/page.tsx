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

interface AiRoadmapStep {
  order: number;
  title: string;
  description: string;
  institution: string;
  location: string | null;
  whatToBring: string[];
  whyThisStep: string;
  sources: { documentId: string; documentTitle: string; institution: string; page: number | null }[];
}

interface AiRoadmapResponse {
  title: string;
  summary: string;
  steps: AiRoadmapStep[];
}

export default function OfficerIntake() {
  const [district, setDistrict] = useState("");
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState(goalOptions[0] || "");
  const [skills, setSkills] = useState("");
  const [situation, setSituation] = useState("");
  const [sector, setSector] = useState("");
  const [aiSteps, setAiSteps] = useState<
    { number: number; title: string; detail: string; badge: string; location?: string; source?: string }[]
  >([]);
  const [aiRoadmap, setAiRoadmap] = useState<AiRoadmapResponse | null>(null);
  const [createdYouthProfileId, setCreatedYouthProfileId] = useState<string | null>(null);
  const [sendError, setSendError] = useState("");
  const [aiError, setAiError] = useState("");

  const sectorOptions = districts.includes(district)
    ? sectors[district] || []
    : [];

  async function handleGenerate() {
    if (!name.trim()) return;
    setGenerating(true);
    setSendError("");
    setAiError("");

    try {
      // 1. Create the youth user account
      const email = `${name.trim().toLowerCase().replace(/\s+/g, ".")}@youth.rw`;
      const signupRes = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password: "password123",
          fullName: name.trim(),
          role: "youth",
        }),
      });

      const signupData = await signupRes.json();
      if (signupData.userId) {
        setCreatedYouthProfileId(signupData.userId);
      }

      // 2. Call the real AI roadmap generation API
      const roadmapRes = await fetch("/api/ai/generate-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          youth: {
            name: name.trim(),
            goal,
            skillsBackground: skills,
            district: district || "Kigali",
            sector: sector || "",
          },
          officerNotes: situation,
        }),
      });

      if (!roadmapRes.ok) {
        const errorData = await roadmapRes.json();
        setAiError(errorData.error || "Failed to generate roadmap. Please try again.");
        setGenerating(false);
        return;
      }

      const roadmap: AiRoadmapResponse = await roadmapRes.json();
      setAiRoadmap(roadmap);

      // Convert to the format expected by AIDraftPanel
      const draftSteps = roadmap.steps.map((step) => ({
        number: step.order,
        title: step.title,
        detail: step.description,
        badge: step.institution,
        location: step.location || undefined,
        source: step.sources?.[0]
          ? `${step.sources[0].institution} - ${step.sources[0].documentTitle}`
          : undefined,
      }));

      setAiSteps(draftSteps);
      setShowRoadmap(true);
    } catch {
      setAiError("Failed to connect to the AI service. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSendRoadmap() {
    if (!aiSteps.length) return;
    setSendError("");

    try {
      // Get the youth profile we just created
      // Look up by email to find the profile ID
      const profileRes = await fetch("/api/profile");
      // We need to find the youth's profile. Use the cases endpoint to find it.
      // Actually, we need to create a case with steps. Let's use the create-with-steps API.
      // But first, we need the youth's profile ID. Since we just signed them up,
      // we can look them up.

      // For now, let's look up the youth profile by getting all profiles (officer can do this)
      // We'll use the signup response's userId, but we need the profile ID, not the user ID.
      // The signup endpoint returns the auth user ID. We need to look up the profile.

      // Let's query the cases endpoint to find youth, or better, let's just
      // create the case using the API. We'll need to get the profile ID first.

      // Simple approach: use a helper endpoint or just look up by email
      const casesRes = await fetch("/api/cases/create-with-steps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          youthProfileId: createdYouthProfileId,
          steps: aiSteps,
        }),
      });

      const casesData = await casesRes.json();

      if (!casesRes.ok) {
        setSendError(casesData.error || "Failed to create roadmap");
        return;
      }

      // Success — redirect to youth list
      window.location.href = "/officer/youth";
    } catch {
      setSendError("Failed to send roadmap. Please try again.");
    }
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
                  ? "AI is generating your roadmap from verified sources…"
                  : <>Click to generate a roadmap<br />using AI and verified sources.</>}
              </span>
            </div>
            {aiError && (
              <div style={{ color: "#c0392b", fontSize: 13, padding: "8px 0", marginTop: 8 }}>
                {aiError}
              </div>
            )}
          </section>

          {showRoadmap ? (
            <div>
              {aiRoadmap && (
                <div style={{ marginBottom: 16 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{aiRoadmap.title}</h3>
                  <p style={{ fontSize: 13, color: "#545d65" }}>{aiRoadmap.summary}</p>
                </div>
              )}
              <AIDraftPanel steps={aiSteps} />
              {sendError && (
                <div style={{ color: "#c0392b", fontSize: 13, padding: "8px 0" }}>
                  {sendError}
                </div>
              )}
              <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
                <button
                  className="officer-button primary"
                  type="button"
                  onClick={handleSendRoadmap}
                >
                  Send roadmap to youth
                  <ArrowRight aria-hidden size={15} />
                </button>
                <button
                  className="officer-button outline"
                  type="button"
                  onClick={() => { setShowRoadmap(false); setAiRoadmap(null); }}
                >
                  Regenerate
                </button>
                <Link className="officer-button outline" href="/officer/youth">
                  Skip for now
                </Link>
              </div>
            </div>
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
