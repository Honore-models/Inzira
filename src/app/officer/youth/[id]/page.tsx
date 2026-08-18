"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Check, MapPin, Sparkles, ClipboardList, Briefcase } from "lucide-react";
import { OfficerAvatar, OfficerShell } from "@/components/officer/OfficerShell";
import { YouthDetailTabs } from "@/components/officer/YouthDetailTabs";

interface CaseDetail {
  id: string;
  status: string;
  current_step: number;
  total_steps: number;
  created_at: string;
  youth: {
    full_name: string;
    email: string;
    goal: string;
    district: string;
    sector: string;
    skills: string;
    skills_background: string;
    situation: string;
  } | null;
  officer: { full_name: string } | null;
  steps: {
    id: string;
    step_number: number;
    title: string;
    detail: string;
    institution: string;
    status: string;
    state: string;
    location: string | null;
    source: string | null;
  }[];
}

export default function OfficerYouthDetail() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.id as string;
  const [detail, setDetail] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [caseRes, stepsRes] = await Promise.all([
          fetch("/api/cases"),
          fetch(`/api/cases/${caseId}/steps`),
        ]);

        if (caseRes.ok) {
          const cases = await caseRes.json();
          const found = cases.find((c: { id: string }) => c.id === caseId);
          const steps = stepsRes.ok ? await stepsRes.json() : [];
          if (found) {
            setDetail({ ...found, steps });
          }
        }
      } catch {
        // Silently handle errors
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [caseId]);

  async function handleGenerateRoadmap() {
    setGenerating(true);
    // Redirect to intake with the youth's data pre-filled
    router.push(`/officer/intake?youthId=${caseId}`);
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

  const name = detail.youth?.full_name || "Unknown";
  const initials = name.split(" ").map((w) => w[0]).join("");
  const isPending = detail.status === "pending";

  // For pending cases — show submitted onboarding info
  if (isPending) {
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
              <p>{detail.youth?.email}</p>
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
                  {detail.youth?.goal || "Not specified"}
                </dd>
              </div>

              <div style={{ padding: "12px 0", borderBottom: "1px solid #eef0ed" }}>
                <dt style={{ color: "#777f87", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>
                  Skills / Background
                </dt>
                <dd style={{ fontSize: 14 }}>
                  {detail.youth?.skills_background || detail.youth?.skills || "No skills listed"}
                </dd>
              </div>

              <div style={{ padding: "12px 0", borderBottom: "1px solid #eef0ed" }}>
                <dt style={{ color: "#777f87", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>
                  Location
                </dt>
                <dd style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
                  <MapPin size={16} style={{ color: "#1f6f4c" }} />
                  {detail.youth?.district || "Not specified"}
                  {detail.youth?.sector ? ` • ${detail.youth.sector}` : ""}
                </dd>
              </div>

              <div style={{ padding: "12px 0" }}>
                <dt style={{ color: "#777f87", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>
                  Submitted
                </dt>
                <dd style={{ fontSize: 14 }}>
                  {new Date(detail.created_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </dd>
              </div>
            </dl>
          </div>

          {/* Generate Roadmap CTA */}
          <div className="officer-card" style={{ textAlign: "center", padding: 32 }}>
            <Sparkles size={28} style={{ color: "#1f6f4c", marginBottom: 12 }} />
            <h2 style={{ fontSize: 18, marginBottom: 8 }}>Ready to create a roadmap?</h2>
            <p style={{ color: "#5f6860", fontSize: 14, marginBottom: 20, maxWidth: 400, margin: "0 auto 20px" }}>
              Use Smart Intake to generate a personalized roadmap based on this youth&apos;s goals and situation.
            </p>
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

  // For active cases — show the full detail with tabs
  const pct = detail.total_steps > 0
    ? Math.round((detail.current_step / detail.total_steps) * 100)
    : 0;

  const tabsDetail = {
    avatar: { label: initials, bg: "#1f6f4c" },
    name,
    goal: detail.youth?.goal || "No goal",
    location: `${detail.youth?.district || ""}${detail.youth?.sector ? " • " + detail.youth.sector : ""}`,
    skills: detail.youth?.skills || detail.youth?.skills_background || "No skills listed",
    situation: detail.youth?.situation || "No situation notes",
    progress: pct,
    currentStep: detail.current_step,
    totalSteps: detail.total_steps,
    steps: detail.steps.map((s) => ({
      number: s.step_number,
      title: s.title,
      detail: s.detail,
      institution: s.institution,
      status: s.status,
      state: s.state,
      location: s.location || undefined,
      source: s.source || undefined,
    })),
  };

  return (
    <OfficerShell active="Youth List">
      <div className="officer-page-wrap">
        <Link className="officer-back-link" href="/officer/youth">
          <ArrowLeft aria-hidden size={15} />
          Back to list
        </Link>

        <header className="officer-profile-card">
          <OfficerAvatar avatar={tabsDetail.avatar} size="large" />
          <div className="officer-profile-copy">
            <div className="officer-profile-title">
              <h1>{name}</h1>
              <span className={`status-pill ${detail.status === "active" ? "on-track" : ""}`}>
                {detail.status}
              </span>
            </div>
            <p>
              {tabsDetail.goal} • {tabsDetail.location}
            </p>
          </div>
        </header>

        <YouthDetailTabs detail={tabsDetail} />

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
