"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  GraduationCap,
  ShieldCheck,
  User,
} from "lucide-react";

export default function SignUp() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<"youth" | "officer" | "">("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      // Redirect to sign in after successful signup
      router.push("/auth/signin?registered=true");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="ob-screen">
      <section className="ob-panel">
        <div className="ob-logo-bar">
          <Link className="ob-logo" href="/">
            <img src="/inzira_logo.png" alt="Inzira" />
          </Link>
        </div>

        {step === 1 && (
          <>
            <h1 className="ob-title" style={{ textAlign: "center" }}>
              Create your account
            </h1>
            <p className="ob-subtitle" style={{ textAlign: "center" }}>
              Choose your role to get started.
            </p>

            <div className="ob-goal-list" style={{ marginBottom: 18 }}>
              <button
                type="button"
                className={`ob-goal-card ${role === "youth" ? "selected" : ""}`}
                onClick={() => setRole("youth")}
              >
                <span className="ob-goal-radio">
                  {role === "youth" && <span className="ob-dot-inner" />}
                </span>
                <span className="ob-goal-icon">
                  <User aria-hidden size={20} />
                </span>
                <div className="ob-goal-copy">
                  <strong>Youth</strong>
                  <span>I&apos;m looking for employment support</span>
                </div>
              </button>

              <button
                type="button"
                className={`ob-goal-card ${role === "officer" ? "selected" : ""}`}
                onClick={() => setRole("officer")}
              >
                <span className="ob-goal-radio">
                  {role === "officer" && <span className="ob-dot-inner" />}
                </span>
                <span className="ob-goal-icon">
                  <Briefcase aria-hidden size={20} />
                </span>
                <div className="ob-goal-copy">
                  <strong>Youth Officer</strong>
                  <span>I manage youth cases and roadmaps</span>
                </div>
              </button>
            </div>

            <button
              className="ob-btn primary full"
              type="button"
              disabled={!role}
              onClick={() => setStep(2)}
            >
              Continue
              <ArrowRight aria-hidden size={15} />
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="ob-title" style={{ textAlign: "center" }}>
              Your details
            </h1>
            <p className="ob-subtitle" style={{ textAlign: "center" }}>
              {role === "youth"
                ? "Tell us a bit about yourself."
                : "Set up your officer account."}
            </p>

            {error && (
              <div className="auth-error">
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <label className="ob-field" htmlFor="signup-name">
                <span className="ob-field-label">Full name</span>
                <div className="ob-input-wrap">
                  <User aria-hidden size={16} className="ob-input-icon" />
                  <input
                    id="signup-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </label>

              <label className="ob-field" htmlFor="signup-email">
                <span className="ob-field-label">Email</span>
                <div className="ob-input-wrap">
                  <input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </label>

              <label className="ob-field" htmlFor="signup-password">
                <span className="ob-field-label">Password</span>
                <div className="ob-input-wrap">
                  <input
                    id="signup-password"
                    type="password"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>
              </label>

              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button
                  className="ob-btn ghost"
                  type="button"
                  onClick={() => setStep(1)}
                >
                  Back
                </button>
                <button
                  className="ob-btn primary"
                  type="submit"
                  disabled={loading || !fullName || !email || password.length < 8}
                  style={{ flex: 1 }}
                >
                  {loading ? "Creating account…" : "Create account"}
                  {!loading && <ArrowRight aria-hidden size={15} />}
                </button>
              </div>
            </form>
          </>
        )}

        <p className="auth-switch" style={{ marginTop: 16 }}>
          Already have an account? <Link href="/auth/signin">Sign in</Link>
        </p>

        <p className="ob-privacy">
          <ShieldCheck aria-hidden size={14} />
          Your information is safe and private
        </p>
      </section>
    </main>
  );
}
