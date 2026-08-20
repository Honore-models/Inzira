"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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

interface YouthProfileData {
  profile: {
    id: string;
    full_name: string;
    goal: string;
    skills: string;
    skills_background: string;
    situation: string;
    district: string;
    sector: string;
  };
  cases: { id: string; status: string }[];
  aiRoadmaps: { id: string; status: string; title: string; steps_data: unknown }[];
}

function IntakeForm() {
  const searchParams = useSearchParams();
  const youthIdParam = searchParams.get("youthId");

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
  const [aiRoadmapId, setAiRoadmapId] = useState<string | null>(null);
  const [resolvedYouthProfileId, setResolvedYouthProfileId] = useState<string | null>(null);
  const [resolvedCaseId, setResolvedCaseId] = useState<string | null>(null);
  const [sendError, setSendError] = useState("");
  const [aiError, setAiError] = useState("");
  const [sending, setSending] = useState(false);
  const [preFilling, setPreFilling] = useState(false);
  const [preFilled, setPreFilled] = useState(false);

  const sectorOptions = districts.includes(district)
    ? sectors[district] || []
    : [];

  // Pre-fill form from youthId param
  useEffect(() => {
    if (!youthIdParam || preFilled) return;

    async function loadYouth() {
      setPreFilling(true);
      try {
        const res = await fetch(`/api/youth/${youthIdParam}`);
        if (res.ok) {
          const data: YouthProfileData = await res.json();
          const p = data.profile;
          setName(p.full_name || "");
          setGoal(p.goal || goalOptions[0] || "");
          setSkills(p.skills_background || p.skills || "");
          setSituation(p.situation || "");
          setDistrict(p.district || "");
          setSector(p.sector || "");
          setResolvedYouthProfileId(p.id);

          // Find the existing case
          const existingCase = data.cases.find(
            (c) => c.status === "pending" || c.status === "active",
          );
          if (existingCase) {
            setResolvedCaseId(existingCase.id);
          }

          setPreFilled(true);
        }
      } catch {
        // silently fail — form stays empty
      } finally {
        setPreFilling(false);
      }
    }
    loadYouth();
  }, [youthIdParam, preFilled]);

  async function handleGenerate() {
    if (!name.trim()) return;
    setGenerating(true);
    setSendError("");
    setAiError("");

    try {
      // If no existing youth profile, create one
      let youthProfileId = resolvedYouthProfileId;

      if (!youthProfileId) {
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
        // signup returns userId (auth user id), we need to look up the profile
        if (signupRes.ok) {
          const profileRes = await fetch("/api/youth");
          if (profileRes.ok) {
            const allYouth = await profileRes.json();
            const found = allYouth.find((y: { user_id: string }) => y.user_id === signupData.userId);
            if (found) youthProfileId = found.id;
          }
        }
      }

      // Call the real AI roadmap generation API
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
          youthProfileId: youthProfileId || undefined,
          caseId: resolvedCaseId || undefined,
        }),
      });

      if (!roadmapRes.ok) {
        const errorData = await roadmapRes.json();
        setAiError(errorData.error || "Failed to generate roadmap. Please try again.");
        setGenerating(false);
        return;
      }

      const roadmap: AiRoadmapResponse & { roadmapId?: string } = await roadmapRes.json();
      setAiRoadmap(roadmap);
      if (roadmap.roadmapId) setAiRoadmapId(roadmap.roadmapId);
      if (youthProfileId) setResolvedYouthProfileId(youthProfileId);

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

  async function handleApproveAndSend() {
    if (!aiSteps.length || !resolvedYouthProfileId) {
      setSendError("Please generate a roadmap and ensure the youth profile is loaded, then approve and send.");
      return;
    }
    setSending(true);
    setSendError("");

    try {
      // Always send the full roadmap data — this ensures the approve endpoint
      // can work even if the roadmap wasn't saved to the DB during generation
      const body: Record<string, unknown> = {
        youthProfileId: resolvedYouthProfileId,
        goal,
        skillsBackground: skills,
        district: district || "",
        sector: sector || "",
        situation,
      };

      if (aiRoadmapId) {
        // Roadmap was saved to DB during generation
        body.roadmapId = aiRoadmapId;
      } else {
        // Roadmap only exists in client state — send it inline
        body.roadmapData = {
          title: aiRoadmap?.title || "Personalized Roadmap",
          summary: aiRoadmap?.summary || "A roadmap generated from verified sources.",
          steps: aiRoadmap?.steps || [],
        };
      }

      const res = await fetch("/api/ai/approve-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setSendError(data.error || "Failed to approve roadmap");
        setSending(false);
        return;
      }

      const data = await res.json();
      // Redirect to the youth detail page (uses youth profile ID, not case ID)
      window.location.href = `/officer/youth/${data.youthProfileId}`;
    } catch {
      setSendError("Failed to approve roadmap. Please try again.");
      setSending(false);
    }
  }

  return (
    <OfficerShell active="Smart Intake">
      <div className="officer-page-wrap">
        <header className="intake-top-header">
          <div>
            <h1>Smart Intake</h1>
            <p>
              {preFilled
                ? `Generating roadmap for ${name}`
                : "Enter information about the youth. The AI will generate a roadmap based on verified programs."}
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
                <p>
                  {preFilled
                    ? "Pre-filled from youth profile. Edit if needed."
                    : "Provide details about the youth."}
                </p>
              </div>
            </header>

            {preFilling && (
              <div style={{ padding: "16px 0", color: "#545d65", fontSize: 13 }}>
                Loading youth information…
              </div>
            )}

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
                {generating ? "Generating…" : preFilled ? "Generate roadmap" : "Generate roadmap"}
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
                  onClick={handleApproveAndSend}
                  disabled={sending || !resolvedYouthProfileId}
                >
                  {sending ? "Approving…" : "Approve and send to youth"}
                  {!sending && <ArrowRight aria-hidden size={15} />}
                </button>
                <button
                  className="officer-button outline"
                  type="button"
                  onClick={() => {
                    setShowRoadmap(false);
                    setAiRoadmap(null);
                    setAiRoadmapId(null);
                  }}
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
                  {preFilled
                    ? "Click &ldquo;Generate roadmap&rdquo; to create a step-by-step plan for this youth."
                    : "Fill in the intake notes and click &ldquo;Generate roadmap&rdquo; to create a step-by-step plan for this youth."}
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

export default function OfficerIntake() {
  return (
    <Suspense fallback={
      <OfficerShell active="Smart Intake">
        <div className="officer-page-wrap">
          <div className="yd-loading">
            <div className="yd-loading-spinner" />
            <p>Loading Smart Intake…</p>
          </div>
        </div>
      </OfficerShell>
    }>
      <IntakeForm />
    </Suspense>
  );
}
