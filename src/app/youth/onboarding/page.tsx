"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  GraduationCap,
  MapPin,
  Pencil,
  ShieldCheck,
  Sparkles,
  User,
  CheckCircle2,
  Building2,
} from "lucide-react";

const goalOptions = [
  {
    id: "business",
    title: "Start a business",
    desc: "I want help to start and grow my own business.",
    icon: Briefcase,
  },
  {
    id: "training",
    title: "Get vocational training",
    desc: "I want to learn specific skills and get certified.",
    icon: GraduationCap,
  },
  {
    id: "job",
    title: "Find a job",
    desc: "I want support to find employment.",
    icon: Building2,
  },
];

import { districtNames, getSectorsForDistrict } from "@/data/rwanda-locations";

export default function YouthOnboarding() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [skills, setSkills] = useState("");
  const [district, setDistrict] = useState(districtNames[0]);
  const [sector, setSector] = useState("");

  const sectorOptions = getSectorsForDistrict(district);

  function next() {
    if (step === 4) {
      // Submit profile data to API
      submitProfile();
    } else if (step < 5) {
      setStep(step + 1);
    }
  }

  async function submitProfile() {
    try {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: goal === "business" ? "Start a business" : goal === "training" ? "Get vocational training" : "Find a job",
          skills,
          district,
          sector,
        }),
      });
    } catch {
      // Profile update is best-effort during onboarding
    }
    setStep(5);
  }

  function back() {
    if (step > 1) setStep(step - 1);
  }

  return (
    <main className="ob-screen">
      <section className="ob-panel">
        {/* Logo */}
        <div className="ob-logo-bar">
          <Link className="ob-logo" href="/">
            <img src="/inzira_logo.png" alt="Inzira" />
          </Link>
        </div>

        {/* Step indicator */}
        {step <= 4 && (
          <div className="ob-progress">
            <div className="ob-progress-track">
              <div
                className="ob-progress-fill"
                style={{ width: `${((step - 1) / 3) * 100}%` }}
              />
            </div>
            <div className="ob-progress-dots">
              {[1, 2, 3, 4].map((n) => (
                <span
                  key={n}
                  className={`ob-dot ${n < step ? "done" : ""} ${n === step ? "active" : ""}`}
                >
                  {n < step ? <CheckCircle2 size={14} /> : n}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Step content */}
        <div className="ob-content">
          {/* ---- Step 1: Name ---- */}
          {step === 1 && (
            <>
              <p className="ob-step-label">Step 1 of 4</p>
              <h1 className="ob-title">What&apos;s your name?</h1>
              <p className="ob-subtitle">
                We&apos;ll use this to personalize your experience.
              </p>

              <div className="ob-field-group">
                <label className="ob-field" htmlFor="ob-name">
                  <span className="ob-field-label">Your name</span>
                  <div className="ob-input-wrap">
                    <User aria-hidden size={18} className="ob-input-icon" />
                    <input
                      id="ob-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoFocus
                    />
                  </div>
                </label>
              </div>
            </>
          )}

          {/* ---- Step 2: Goal ---- */}
          {step === 2 && (
            <>
              <p className="ob-step-label">Step 2 of 4</p>
              <h1 className="ob-title">What do you want to do?</h1>
              <p className="ob-subtitle">
                Choose the option that best describes your main goal.
              </p>

              <div className="ob-goal-list">
                {goalOptions.map((g) => {
                  const Icon = g.icon;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      className={`ob-goal-card ${goal === g.id ? "selected" : ""}`}
                      onClick={() => setGoal(g.id)}
                    >
                      <span className="ob-goal-radio">
                        {goal === g.id && <span className="ob-dot-inner" />}
                      </span>
                      <span className="ob-goal-icon">
                        <Icon aria-hidden size={20} />
                      </span>
                      <div className="ob-goal-copy">
                        <strong>{g.title}</strong>
                        <span>{g.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="ob-tip">
                <Sparkles aria-hidden size={16} />
                <div>
                  <strong>This helps us build the right roadmap</strong>
                  <p>Your choice will determine the steps and resources we suggest.</p>
                </div>
              </div>
            </>
          )}

          {/* ---- Step 3: Skills ---- */}
          {step === 3 && (
            <>
              <p className="ob-step-label">Step 3 of 4</p>
              <h1 className="ob-title">Tell us what you already have</h1>
              <p className="ob-subtitle">
                Share your skills, background, or any experience you have.
              </p>

              <div className="ob-textarea-wrap">
                <div className="ob-textarea-top">
                  <Pencil aria-hidden size={14} />
                  <span>Skills &amp; background</span>
                </div>
                <textarea
                  rows={5}
                  maxLength={300}
                  placeholder="E.g. Tailoring certificate, basic business knowledge"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                />
                <div className="ob-textarea-bottom">
                  <span />
                  <span className="ob-char-count">{skills.length}/300</span>
                </div>
              </div>

              <div className="ob-tip">
                <User aria-hidden size={16} />
                <div>
                  <strong>This helps us avoid repeating steps</strong>
                  <p>We&apos;ll build a roadmap that builds on what you already have.</p>
                </div>
              </div>
            </>
          )}

          {/* ---- Step 4: Location ---- */}
          {step === 4 && (
            <>
              <p className="ob-step-label">Step 4 of 4</p>
              <h1 className="ob-title">Where are you located?</h1>
              <p className="ob-subtitle">
                This helps us connect you with the right services and your youth
                officer.
              </p>

              <div className="ob-location-fields">
                <label className="ob-field">
                  <span className="ob-field-label">District</span>
                  <div className="ob-input-wrap">
                    <MapPin aria-hidden size={16} className="ob-input-icon" />
                    <select
                      value={district}
                      onChange={(e) => {
                        setDistrict(e.target.value);
                        setSector("");
                      }}
                    >
                      {districtNames.map((d) => (
                        <option key={d} value={d}>{d} District</option>
                      ))}
                    </select>
                  </div>
                </label>

                <label className="ob-field">
                  <span className="ob-field-label">Sector (optional)</span>
                  <div className="ob-input-wrap">
                    <MapPin aria-hidden size={16} className="ob-input-icon" />
                    <select value={sector} onChange={(e) => setSector(e.target.value)}>
                      <option value="">Select a sector</option>
                      {sectorOptions.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </label>
              </div>

              <div className="ob-info-box">
                <Building2 aria-hidden size={18} />
                <div>
                  <strong>Why we need your location</strong>
                  <p>
                    We use this to recommend nearby offices, training centers, and
                    assign your youth officer.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* ---- Step 5: Thank you ---- */}
          {step === 5 && (
            <div className="ob-complete">
              <div className="ob-check-ring">
                <CheckCircle2 aria-hidden size={56} />
              </div>

              <h1 className="ob-complete-title">
                Thank you, <span className="ob-name-highlight">{name || "there"}</span>!
              </h1>
              <p className="ob-subtitle ob-complete-sub">
                Your information has been received successfully.
              </p>

              <div className="ob-complete-card">
                <p>
                  Your youth officer will review your information and prepare a
                  personalized roadmap for you.
                </p>
                <span>You&apos;ll be notified as soon as it&apos;s ready.</span>
              </div>

              <Link className="ob-btn primary full" href="/youth">
                Go to Home
                <ArrowRight aria-hidden size={16} />
              </Link>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {step <= 4 && (
          <footer className="ob-footer">
            {step > 1 ? (
              <button className="ob-btn ghost" type="button" onClick={back}>
                <ArrowLeft aria-hidden size={15} />
                Back
              </button>
            ) : (
              <span />
            )}

            <button
              className="ob-btn primary"
              type="button"
              onClick={next}
              disabled={step === 1 && !name.trim()}
            >
              Continue
              <ArrowRight aria-hidden size={15} />
            </button>
          </footer>
        )}

        {step === 1 && (
          <p className="ob-privacy">
            <ShieldCheck aria-hidden size={14} />
            Your information is safe and private
          </p>
        )}
      </section>
    </main>
  );
}
