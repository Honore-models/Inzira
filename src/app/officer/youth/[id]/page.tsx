"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Lock,
  MapPin,
  Sparkles,
  ClipboardList,
  Briefcase,
  Clock,
} from "lucide-react";
import { OfficerAvatar, OfficerShell } from "@/components/officer/OfficerShell";

interface YouthProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  goal: string;
  skills: string;
  skills_background: string;
  situation: string;
  district: string;
  sector: string;
  onboarding_completed: boolean;
}

interface CaseStep {
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
  steps: CaseStep[];
}

interface AiRoadmap {
  id: string;
  title: string;
  summary: string;
  steps_data: unknown;
  status: string;
  created_at: string;
}

interface YouthDetailData {
  profile: YouthProfile;
  cases: YouthCase[];
  aiRoadmaps: AiRoadmap[];
}

export default function OfficerYouthDetail() {
  const params = useParams();
  const router = useRouter();
  const youthId = params.id as string;
  const [detail, setDetail] = useState<YouthDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [aiError, setAiError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/youth/${youthId}`);
        if (res.ok) {
          setDetail(await res.json());
        }
      } catch {
        // Silently handle errors
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [youthId]);

  async function handleGenerateRoadmap() {
    setGenerating(true);
    setAiError("");
    // Redirect to intake with youthId so form is pre-filled
    router.push(`/officer/intake?youthId=${youthId}`);
  }

  if (loading) {
    return (
      <OfficerShell active="Youth List">
        <div className="officer-page-wrap">
          <div className="yd-loading">
            <div className="yd-loading-spinner" />
            <p>Loading youth details…</p>
          </div>
        </div>
      </OfficerShell>
    );
  }

  if (!detail) {
    return (
      <OfficerShell active="Youth List">
        <div className="officer-page-wrap">
          <Link className="officer-back-link" href="/officer/youth">
            <ArrowLeft aria-hidden size={15} />
            Back to list
          </Link>
          <div className="officer-card" style={{ padding: 40, textAlign: "center" }}>
            <p style={{ color: "#545d65" }}>Youth not found.</p>
          </div>
        </div>
      </OfficerShell>
    );
  }

  const { profile, cases, aiRoadmaps } = detail;
  const name = profile.full_name || "Unknown";
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("");
  const activeCase = cases.find((c) => c.status === "active");
  const pendingCase = cases.find((c) => c.status === "pending");
  const hasActiveRoadmap = activeCase && activeCase.total_steps > 0;
  const draftRoadmap = aiRoadmaps.find((r) => r.status === "draft");
  const approvedRoadmap = aiRoadmaps.find((r) => r.status === "approved");

  // CASE 1: No case at all — just submitted onboarding
  if (!cases.length || (pendingCase && !activeCase && !draftRoadmap)) {
    return (
      <OfficerShell active="Youth List">
        <div className="officer-page-wrap">
          <Link className="officer-back-link" href="/officer/youth">
            <ArrowLeft aria-hidden size={15} />
            Back to list
          </Link>

          <header className="officer-profile-card">
            <OfficerAvatar avatar={{ label: initials, bg: "#1f6f4c" }} size="large" />
            <div className="officer-profile-copy">
              <div className="officer-profile-title">
                <h1>{name}</h1>
                <span className="status-pill" style={{ background: "#fef9e7", color: "#8a6d00" }}>
                  Waiting for roadmap
                </span>
              </div>
              <p>{profile.email}</p>
            </div>
          </header>

          {/* Submitted Information Card */}
          <div className="officer-card" style={{ marginBottom: 16 }}>
            <header className="officer-card-header">
              <div>
                <h2 style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <ClipboardList size={18} />
                  Submitted Information
                </h2>
                <p>This youth submitted the following during onboarding</p>
              </div>
            </header>

            <dl className="intake-readonly" style={{ display: "grid", gap: 0 }}>
              <div style={{ padding: "12px 0", borderBottom: "1px solid #eef0ed" }}>
                <dt style={{ color: "#777f87", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>
                  Goal
                </dt>
                <dd style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 500 }}>
                  <Briefcase size={16} style={{ color: "#1f6f4c" }} />
                  {profile.goal || "Not specified"}
                </dd>
              </div>

              <div style={{ padding: "12px 0", borderBottom: "1px solid #eef0ed" }}>
                <dt style={{ color: "#777f87", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>
                  Skills / Background
                </dt>
                <dd style={{ fontSize: 14 }}>
                  {profile.skills_background || profile.skills || "No skills listed"}
                </dd>
              </div>

              <div style={{ padding: "12px 0", borderBottom: "1px solid #eef0ed" }}>
                <dt style={{ color: "#777f87", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>
                  Location
                </dt>
                <dd style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
                  <MapPin size={16} style={{ color: "#1f6f4c" }} />
                  {profile.district || "Not specified"}
                  {profile.sector ? ` • ${profile.sector}` : ""}
                </dd>
              </div>

              {profile.situation && (
                <div style={{ padding: "12px 0" }}>
                  <dt style={{ color: "#777f87", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>
                    Situation
                  </dt>
                  <dd style={{ fontSize: 14 }}>{profile.situation}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Generate Roadmap CTA */}
          <div className="officer-card" style={{ textAlign: "center", padding: 32 }}>
            <Sparkles size={28} style={{ color: "#1f6f4c", marginBottom: 12 }} />
            <h2 style={{ fontSize: 18, marginBottom: 8 }}>Ready to create a roadmap?</h2>
            <p style={{ color: "#5f6860", fontSize: 14, marginBottom: 20, maxWidth: 400, margin: "0 auto 20px" }}>
              Use Smart Intake to generate a personalized roadmap based on this youth&apos;s goals and situation.
            </p>
            {aiError && (
              <p style={{ color: "#c0392b", fontSize: 13, marginBottom: 12 }}>{aiError}</p>
            )}
            <button
              className="officer-button primary"
              type="button"
              onClick={handleGenerateRoadmap}
              disabled={generating}
              style={{ fontSize: 15, padding: "12px 28px" }}
            >
              <Sparkles aria-hidden size={16} />
              {generating ? "Opening Smart Intake…" : "Generate Roadmap"}
            </button>
          </div>
        </div>
      </OfficerShell>
    );
  }

  // CASE 2: Has an active case with roadmap steps
  const pct =
    activeCase && activeCase.total_steps > 0
      ? Math.round((activeCase.current_step / activeCase.total_steps) * 100)
      : 0;

  const currentCase = activeCase || pendingCase || cases[0];
  const steps = currentCase?.steps || [];

  return (
    <OfficerShell active="Youth List">
      <div className="officer-page-wrap">
        <Link className="officer-back-link" href="/officer/youth">
          <ArrowLeft aria-hidden size={15} />
          Back to list
        </Link>

        <header className="officer-profile-card">
          <OfficerAvatar avatar={{ label: initials, bg: "#1f6f4c" }} size="large" />
          <div className="officer-profile-copy">
            <div className="officer-profile-title">
              <h1>{name}</h1>
              <span className={`status-pill ${currentCase?.status === "active" ? "on-track" : ""}`}>
                {currentCase?.status === "active" ? "Active" : currentCase?.status || "Pending"}
              </span>
            </div>
            <p>
              {profile.goal || "No goal"} • {profile.district || "No location"}
              {profile.sector ? ` • ${profile.sector}` : ""}
            </p>
          </div>
        </header>

        {/* Progress */}
        {currentCase && currentCase.total_steps > 0 && (
          <div className="officer-card" style={{ marginBottom: 16, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <strong style={{ fontSize: 14 }}>Progress</strong>
              <span style={{ fontSize: 13, color: "#545d65" }}>
                Step {currentCase.current_step} of {currentCase.total_steps} • {pct}%
              </span>
            </div>
            <div className="progress-bar-wrap" style={{ height: 8, borderRadius: 4, background: "#eef0ed", overflow: "hidden" }}>
              <div
                className="progress-bar-fill"
                style={{
                  width: `${pct}%`,
                  height: "100%",
                  background: "#1f6f4c",
                  borderRadius: 4,
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>
        )}

        {/* Roadmap Timeline */}
        {steps.length > 0 ? (
          <div className="officer-card" style={{ marginBottom: 16 }}>
            <header className="officer-card-header">
              <div>
                <h2>Roadmap</h2>
                <p>{steps.length} steps toward {(profile.goal || "their goal").toLowerCase()}</p>
              </div>
              {approvedRoadmap && (
                <span className="status-badge active" style={{ fontSize: 12 }}>Approved</span>
              )}
            </header>
            <div className="detail-timeline" style={{ padding: "0 16px 16px" }}>
              {steps.map((step) => (
                <article
                  className={`detail-step ${step.state}`}
                  key={step.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    padding: "12px 0",
                    borderBottom: "1px solid #eef0ed",
                    opacity: step.state === "locked" ? 0.5 : 1,
                  }}
                >
                  <div
                    className="detail-step-node"
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      fontWeight: 600,
                      flexShrink: 0,
                      background:
                        step.state === "done"
                          ? "#1f6f4c"
                          : step.state === "current"
                            ? "#e8f5e9"
                            : "#f0f2ef",
                      color:
                        step.state === "done"
                          ? "#fff"
                          : step.state === "current"
                            ? "#1f6f4c"
                            : "#a0a8a5",
                    }}
                  >
                    {step.state === "done" ? (
                      <Check size={16} />
                    ) : step.state === "locked" ? (
                      <Lock size={14} />
                    ) : (
                      step.step_number
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong style={{ fontSize: 14, display: "block", marginBottom: 2 }}>
                      {step.title}
                    </strong>
                    <p style={{ fontSize: 13, color: "#545d65", margin: 0, lineHeight: 1.5 }}>
                      {step.detail}
                    </p>
                    <div style={{ display: "flex", gap: 12, marginTop: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 12, color: "#777f87" }}>
                        <Briefcase size={12} style={{ marginRight: 4, verticalAlign: -2 }} />
                        {step.institution}
                      </span>
                      {step.location && (
                        <span style={{ fontSize: 12, color: "#777f87" }}>
                          <MapPin size={12} style={{ marginRight: 4, verticalAlign: -2 }} />
                          {step.location}
                        </span>
                      )}
                      {step.state === "done" && (
                        <span style={{ fontSize: 12, color: "#1f6f4c", fontWeight: 500 }}>
                          ✓ Completed
                        </span>
                      )}
                      {step.state === "current" && (
                        <span style={{ fontSize: 12, color: "#d4a017", fontWeight: 500 }}>
                          <Clock size={12} style={{ marginRight: 4, verticalAlign: -2 }} />
                          Current step
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`status-badge ${step.state}`} style={{ flexShrink: 0, fontSize: 11 }}>
                    {step.state === "done" ? "Done" : step.state === "current" ? "Current" : "Locked"}
                  </span>
                </article>
              ))}
            </div>
          </div>
        ) : (
          /* No roadmap yet */
          <div className="officer-card" style={{ textAlign: "center", padding: 32, marginBottom: 16 }}>
            <Sparkles size={28} style={{ color: "#1f6f4c", marginBottom: 12 }} />
            <h2 style={{ fontSize: 18, marginBottom: 8 }}>No roadmap yet</h2>
            <p style={{ color: "#5f6860", fontSize: 14, marginBottom: 20 }}>
              Generate a personalized roadmap using Smart Intake and verified sources.
            </p>
            {aiError && (
              <p style={{ color: "#c0392b", fontSize: 13, marginBottom: 12 }}>{aiError}</p>
            )}
            <button
              className="officer-button primary"
              type="button"
              onClick={handleGenerateRoadmap}
              disabled={generating}
            >
              <Sparkles aria-hidden size={16} />
              {generating ? "Opening Smart Intake…" : "Generate Roadmap"}
            </button>
          </div>
        )}

        {/* Intake info */}
        <div className="officer-card" style={{ marginBottom: 16 }}>
          <header className="officer-card-header">
            <div>
              <h2>Intake Notes</h2>
              <p>Recorded during onboarding</p>
            </div>
          </header>
          <dl className="intake-readonly" style={{ padding: "0 16px 16px" }}>
            <div style={{ padding: "12px 0", borderBottom: "1px solid #eef0ed" }}>
              <dt style={{ color: "#777f87", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>Goal</dt>
              <dd style={{ fontSize: 14, fontWeight: 500 }}>{profile.goal || "—"}</dd>
            </div>
            <div style={{ padding: "12px 0", borderBottom: "1px solid #eef0ed" }}>
              <dt style={{ color: "#777f87", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>Skills</dt>
              <dd style={{ fontSize: 14 }}>{profile.skills_background || profile.skills || "—"}</dd>
            </div>
            <div style={{ padding: "12px 0" }}>
              <dt style={{ color: "#777f87", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>Location</dt>
              <dd style={{ fontSize: 14 }}>{profile.district || "—"}{profile.sector ? ` • ${profile.sector}` : ""}</dd>
            </div>
          </dl>
        </div>

        <aside className="officer-banner">
          <span className="officer-banner-icon">
            <Check aria-hidden size={22} />
          </span>
          <div>
            <strong>This is exactly what the youth sees on their dashboard.</strong>
            <p>Any changes you make will be reflected after approval.</p>
          </div>
        </aside>
      </div>
    </OfficerShell>
  );
}
