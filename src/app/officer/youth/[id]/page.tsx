"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
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
  const caseId = params.id as string;
  const [detail, setDetail] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);

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
  const pct = detail.total_steps > 0
    ? Math.round((detail.current_step / detail.total_steps) * 100)
    : 0;

  // Build detail object for YouthDetailTabs
  const tabsDetail = {
    avatar: { label: initials, bg: "#1f6f4c" },
    name,
    goal: detail.youth?.goal || "No goal",
    location: `${detail.youth?.district || ""}${detail.youth?.sector ? " • " + detail.youth.sector : ""}`,
    skills: detail.youth?.skills || "No skills listed",
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
