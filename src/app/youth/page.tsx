"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock,
  LifeBuoy,
  MapPin,
  MessageCircle,
  Sparkles,
  Target,
} from "lucide-react";
import { Alert, PageSkeleton, ProgressBar } from "@/components/ui";
import { completedSteps, progressPercent } from "@/lib/case-status";
import { firstName, greeting } from "@/lib/format";
import { useJourney } from "@/lib/use-journey";

export default function YouthHome() {
  const { data, error, loading } = useJourney();

  if (loading) return <PageSkeleton />;
  if (error || !data) return <Alert tone="error" title="We couldn't load your dashboard">{error}</Alert>;

  const { profile, case: youthCase, steps, officer, unreadCount } = data;
  const current = steps.find((s) => s.state === "current");
  const done = completedSteps(youthCase);
  const total = youthCase?.total_steps || 0;
  const pct = progressPercent(youthCase);
  const finished = youthCase?.status === "completed";
  const hasRoadmap = total > 0;

  return (
    <>
      <section className="hero-card">
        <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.04em" }}>{greeting()}</p>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: "4px 0 8px" }}>{firstName(profile?.full_name)}</h1>
        <p>
          {finished
            ? "You've completed every step of your roadmap. Congratulations!"
            : hasRoadmap
              ? "Every step you complete brings your goal closer."
              : "Your youth officer is preparing your personalised roadmap."}
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 20px", marginTop: 16, fontSize: 13, position: "relative" }}>
          {profile?.goal ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Target size={15} aria-hidden /> {profile.goal}
            </span>
          ) : null}
          {profile?.district ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <MapPin size={15} aria-hidden /> {profile.district}
            </span>
          ) : null}
        </div>

        {hasRoadmap ? (
          <div style={{ marginTop: 20, maxWidth: 420, position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
              <strong>{done} of {total} steps complete</strong>
              <strong>{pct}%</strong>
            </div>
            <ProgressBar value={pct} label="Roadmap progress" />
          </div>
        ) : null}
      </section>

      {current ? (
        <>
          <h2 className="section-title">Your next step</h2>
          <article className="card card-body">
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
              <span className="quick-link-icon" aria-hidden>
                <Clock size={20} />
              </span>
              <div style={{ flex: 1, minWidth: 220 }}>
                <span className="badge badge-current">Step {current.step_number} of {total}</span>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: "10px 0 6px" }}>{current.title}</h3>
                {current.detail ? <p>{current.detail}</p> : null}
                <div className="timeline-meta">
                  {current.institution ? <span>{current.institution}</span> : null}
                  {current.location ? (
                    <span>
                      <MapPin size={14} aria-hidden /> {current.location}
                    </span>
                  ) : null}
                </div>
              </div>
              <Link className="btn btn-primary" href="/youth/steps">
                Open roadmap <ArrowRight size={16} aria-hidden />
              </Link>
            </div>
          </article>
        </>
      ) : !hasRoadmap ? (
        <>
          <h2 className="section-title">Where things stand</h2>
          <article className="card card-body">
            <ol className="status-steps">
              <li className="done">
                <CheckCircle2 size={18} aria-hidden /> Information submitted
              </li>
              <li className="current">
                <Circle size={18} aria-hidden /> Officer review
                {officer ? <span className="muted" style={{ fontWeight: 400 }}>— {officer.full_name}</span> : null}
              </li>
              <li>
                <Circle size={18} aria-hidden /> Roadmap ready
              </li>
            </ol>
            <p className="muted" style={{ marginTop: 8 }}>
              While you wait, you can ask Inzira questions about programs or message your officer.
            </p>
          </article>
        </>
      ) : null}

      <h2 className="section-title">Quick access</h2>
      <div className="quick-links">
        <Link className="quick-link" href="/youth/ask">
          <span className="quick-link-icon"><Sparkles size={20} aria-hidden /></span>
          <div>
            <strong>Ask Inzira</strong>
            <span>Answers from official sources</span>
          </div>
          <ArrowRight size={16} aria-hidden className="muted" />
        </Link>
        <Link className="quick-link" href="/youth/messages">
          <span className="quick-link-icon"><MessageCircle size={20} aria-hidden /></span>
          <div>
            <strong>Messages{unreadCount ? ` (${unreadCount} new)` : ""}</strong>
            <span>{officer ? `Talk to ${firstName(officer.full_name)}` : "Talk to a youth officer"}</span>
          </div>
          <ArrowRight size={16} aria-hidden className="muted" />
        </Link>
        <Link className="quick-link" href="/youth/find-help">
          <span className="quick-link-icon"><LifeBuoy size={20} aria-hidden /></span>
          <div>
            <strong>Find help</strong>
            <span>Verified institutions and contacts</span>
          </div>
          <ArrowRight size={16} aria-hidden className="muted" />
        </Link>
      </div>
    </>
  );
}
