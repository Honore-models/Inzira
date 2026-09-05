"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  CheckCircle,
  Check,
  Circle,
  Home,
  MapPin,
  Pencil,
  User,
  CircleDot,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { districts, sectors } from "@/data/officer";

type Step = 1 | 2 | 3 | 4;

const goalOptions = [
  {
    value: "Start a business",
    label: "Start a business",
    desc: "Get help registering, funding, and growing a business",
    icon: Briefcase,
  },
  {
    value: "Get vocational training",
    label: "Get vocational training",
    desc: "Find programs to learn practical skills and get certified",
    icon: Pencil,
  },
  {
    value: "Find a job",
    label: "Find a job",
    desc: "Get support finding employment and preparing applications",
    icon: User,
  },
  {
    value: "Other",
    label: "Other",
    desc: "None of these match — tell us what you're looking for",
    icon: CircleDot,
  },
];

export default function Onboarding() {
  const { data: session } = useSession();
  const userName = session?.user?.name || "there";

  const [step, setStep] = useState<Step>(1);
  const [goal, setGoal] = useState("");
  const [otherGoal, setOtherGoal] = useState("");
  const [skills, setSkills] = useState("");
  const [district, setDistrict] = useState("");
  const [sector, setSector] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const sectorOptions = districts.includes(district) ? sectors[district] || [] : [];

  const stepLabels = ["Goal", "Skills", "Location"];

  async function handleSubmit() {
    setSubmitting(true);
    setError("");

    const goalValue = goal === "Other" ? otherGoal.trim() || "Other" : goal;

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: goalValue,
          skillsBackground: skills,
          district,
          sector,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong");
        setSubmitting(false);
        return;
      }

      setStep(4);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const canContinueStep1 =
    goal && (goal !== "Other" || otherGoal.trim());

  return (
    <main className="onboard-screen">
      <div className="onboard-panel">
        {/* Logo */}
        <Link href="/" className="onboard-logo">
          <img src="/inzira_logo.png" alt="Inzira" />
        </Link>

        {/* Professional progress bar — hidden on confirmation */}
        {step <= 3 && (
          <div className="onboard-progress">
            <div className="onboard-progress-track">
              <div
                className="onboard-progress-fill"
                style={{ width: `${((step - 1) / 2) * 100}%` }}
              />
            </div>
            <div className="onboard-progress-steps">
              {stepLabels.map((label, i) => {
                const n = i + 1;
                return (
                  <div
                    key={n}
                    className={`onboard-step-item ${n < step ? "done" : ""} ${n === step ? "active" : ""}`}
                  >
                    <span className="onboard-step-circle">
                      {n < step ? <CheckCircle2 size={14} /> : n}
                    </span>
                    <span className="onboard-step-name">{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 1 — Goal */}
        {step === 1 && (
          <div className="onboard-step">
            <h1>What do you want to achieve?</h1>
            <p>Choose the path that best describes what you want help with.</p>

            <div className="onboard-options">
              {goalOptions.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  className={`onboard-option ${goal === g.value ? "selected" : ""}`}
                  onClick={() => setGoal(g.value)}
                >
                  <span className="onboard-option-radio">
                    {goal === g.value && <span />}
                  </span>
                  <g.icon size={20} aria-hidden />
                  <div>
                    <strong>{g.label}</strong>
                    <span>{g.desc}</span>
                  </div>
                </button>
              ))}
            </div>

            {goal === "Other" && (
              <div className="onboard-other-input">
                <div className="onboard-input-wrap">
                  <Pencil size={16} aria-hidden className="onboard-input-icon" />
                  <input
                    type="text"
                    placeholder="e.g. Get a scholarship, Learn English, Start farming..."
                    value={otherGoal}
                    onChange={(e) => setOtherGoal(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>
            )}

            <button
              className="onboard-btn primary full"
              type="button"
              disabled={!canContinueStep1}
              onClick={() => setStep(2)}
            >
              Continue
              <ArrowRight size={16} aria-hidden />
            </button>
          </div>
        )}

        {/* Step 2 — Skills */}
        {step === 2 && (
          <div className="onboard-step">
            <h1>What do you have right now?</h1>
            <p>
              Tell us about your skills, training, experience, or anything you
              already have.
            </p>

            <textarea
              className="onboard-textarea"
              placeholder="Example: Tailoring certificate, basic business knowledge"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              rows={4}
              autoFocus
            />

            <p className="onboard-hint">
              If you have no prior training yet, that&apos;s okay — just write
              &ldquo;No prior training yet&rdquo;.
            </p>

            <div className="onboard-actions">
              <button
                className="onboard-btn ghost"
                type="button"
                onClick={() => setStep(1)}
              >
                <ArrowLeft size={16} aria-hidden />
                Back
              </button>
              <button
                className="onboard-btn primary"
                type="button"
                onClick={() => setStep(3)}
              >
                Continue
                <ArrowRight size={16} aria-hidden />
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Location */}
        {step === 3 && (
          <div className="onboard-step">
            <h1>Where are you located?</h1>
            <p>
              Your location helps us connect you with the right local services
              and youth officer.
            </p>

            <label className="onboard-field">
              <span>District</span>
              <div className="onboard-select-wrap">
                <MapPin size={16} aria-hidden />
                <select
                  value={district}
                  onChange={(e) => {
                    setDistrict(e.target.value);
                    setSector("");
                  }}
                >
                  <option value="">Select your district</option>
                  {districts.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>
            </label>

            <label className="onboard-field">
              <span>Sector (optional)</span>
              <div className="onboard-select-wrap">
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  disabled={!district}
                >
                  <option value="">Select your sector</option>
                  {sectorOptions.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            </label>

            {error && (
              <div className="onboard-error">{error}</div>
            )}

            <div className="onboard-actions">
              <button
                className="onboard-btn ghost"
                type="button"
                onClick={() => setStep(2)}
              >
                <ArrowLeft size={16} aria-hidden />
                Back
              </button>
              <button
                className="onboard-btn primary"
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting && <span className="btn-spinner" />}
                {submitting ? "Submitting…" : "Submit information"}
                {!submitting && <ArrowRight size={16} aria-hidden />}
              </button>
            </div>
          </div>
        )}

        {/* Step 4 — Confirmation */}
        {step === 4 && (
          <div className="onboard-step onboard-complete">
            <div className="onboard-check">
              <CheckCircle size={52} />
            </div>
            <h1>Thanks, {userName}.</h1>
            <p>Your information has been sent to your youth officer.</p>

            <div className="onboard-status-card">
              <p>
                Your officer will review your information and prepare your
                personalized roadmap. You&apos;ll be notified when your roadmap
                is ready.
              </p>
            </div>

            <div className="onboard-timeline">
              <div className="onboard-timeline-item done">
                <Check size={14} />
                <span>Information submitted</span>
              </div>
              <div className="onboard-timeline-item current">
                <Circle size={14} />
                <span>Officer review</span>
              </div>
              <div className="onboard-timeline-item">
                <Circle size={14} />
                <span>Roadmap ready</span>
              </div>
            </div>

            <div className="onboard-status-badge">
              <span className="onboard-status-dot" />
              Waiting for officer review
            </div>

            <Link className="onboard-btn primary full" href="/youth">
              <Home size={16} aria-hidden />
              Go to Home
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
