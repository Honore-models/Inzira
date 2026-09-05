"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  Briefcase,
  ShieldCheck,
  User,
} from "lucide-react";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetRole = searchParams.get("role");
  const isGoogleReturn = searchParams.get("google") === "1";

  // If role is in the URL or returning from Google, skip step 1
  const [step, setStep] = useState<1 | 2>(presetRole || isGoogleReturn ? 2 : 1);
  const [role, setRole] = useState<"youth" | "officer" | "">(
    presetRole === "youth" || presetRole === "officer" ? presetRole : "",
  );
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleName, setGoogleName] = useState("");
  const [googleEmail, setGoogleEmail] = useState("");

  // For Google return: fetch the user's session to pre-fill name/email
  useEffect(() => {
    if (isGoogleReturn && !googleName) {
      fetch("/api/auth/session")
        .then((r) => r.json())
        .then((data) => {
          if (data?.user) {
            setGoogleName(data.user.name || "");
            setGoogleEmail(data.user.email || "");
            setFullName(data.user.name || "");
            setEmail(data.user.email || "");
          }
        })
        .catch(() => {});
    }
  }, [isGoogleReturn, googleName]);

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

      if (role === "youth") {
        // Auto-login the youth and go directly to onboarding
        const loginResult = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });
        if (loginResult?.ok) {
          router.push("/onboarding");
        } else {
          router.push("/auth/signin");
        }
      } else {
        router.push("/auth/signin?registered=true");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleSignUp() {
    signIn("google", { callbackUrl: "/auth/signup?google=1" });
  }

  async function handleGoogleComplete(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/complete-google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      if (role === "youth") {
        router.push("/onboarding");
      } else {
        router.push("/officer");
      }
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const roleLabel = role === "youth" ? "Youth" : "Youth Officer";

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

            <div className="auth-divider">
              <span>or</span>
            </div>

            <button
              className="auth-google-btn"
              type="button"
              onClick={handleGoogleSignUp}
            >
              <GoogleIcon />
              Continue with Google
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              {!presetRole && !isGoogleReturn && (
                <button
                  className="ob-btn ghost"
                  type="button"
                  onClick={() => setStep(1)}
                  style={{ padding: "6px 8px", minHeight: "auto" }}
                  aria-label="Go back"
                >
                  <ArrowLeft size={16} />
                </button>
              )}
              <h1 className="ob-title" style={{ textAlign: "center", flex: 1 }}>
                {isGoogleReturn
                  ? "Complete your profile"
                  : presetRole
                    ? `Join as a ${roleLabel}`
                    : "Your details"}
              </h1>
            </div>
            <p className="ob-subtitle" style={{ textAlign: "center" }}>
              {isGoogleReturn
                ? "Choose your role and set a password to finish signing up."
                : role === "youth"
                  ? "Tell us a bit about yourself to get started."
                  : "Set up your officer account to manage cases."}
            </p>

            {error && (
              <div className="auth-error">
                <p>{error}</p>
              </div>
            )}

            {isGoogleReturn ? (
              /* Google return: show role + password, name/email are read-only */
              <form onSubmit={handleGoogleComplete} className="auth-form">
                {googleName && (
                  <label className="ob-field">
                    <span className="ob-field-label">Name</span>
                    <div className="ob-input-wrap" style={{ background: "#f5f7f3" }}>
                      <User aria-hidden size={16} className="ob-input-icon" />
                      <input type="text" value={googleName} readOnly disabled style={{ cursor: "default" }} />
                    </div>
                  </label>
                )}

                {googleEmail && (
                  <label className="ob-field">
                    <span className="ob-field-label">Email</span>
                    <div className="ob-input-wrap" style={{ background: "#f5f7f3" }}>
                      <input type="email" value={googleEmail} readOnly disabled style={{ cursor: "default" }} />
                    </div>
                  </label>
                )}

                <label className="ob-field" htmlFor="google-role">
                  <span className="ob-field-label">I am a…</span>
                  <div className="ob-goal-list" style={{ marginTop: 4 }}>
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
                </label>

                <label className="ob-field" htmlFor="google-password">
                  <span className="ob-field-label">Create a password</span>
                  <div className="ob-input-wrap">
                    <input
                      id="google-password"
                      type="password"
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      autoFocus
                    />
                  </div>
                </label>

                <button
                  className="ob-btn primary full"
                  type="submit"
                  disabled={loading || !role || password.length < 8}
                >
                  {loading ? "Setting up…" : `Continue as ${role === "youth" ? "Youth" : "Youth Officer"}`}
                  {!loading && <ArrowRight aria-hidden size={15} />}
                </button>
              </form>
            ) : (
              /* Regular signup: show all fields */
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

                <button
                  className="ob-btn primary full"
                  type="submit"
                  disabled={loading || !fullName || !email || password.length < 8}
                >
                  {loading ? "Creating account…" : `Create ${roleLabel} account`}
                  {!loading && <ArrowRight aria-hidden size={15} />}
                </button>
              </form>
            )}

            {!isGoogleReturn && (
              <>
                <div className="auth-divider">
                  <span>or</span>
                </div>

                <button
                  className="auth-google-btn"
                  type="button"
                  onClick={handleGoogleSignUp}
                >
                  <GoogleIcon />
                  Continue with Google
                </button>
              </>
            )}
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

export default function SignUp() {
  return (
    <Suspense fallback={<main className="ob-screen"><section className="ob-panel"><p>Loading…</p></section></main>}>
      <SignUpForm />
    </Suspense>
  );
}
