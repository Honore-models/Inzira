"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

export default function SignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const isNewYouth = searchParams.get("new") === "youth";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password. Please try again.");
      } else {
        // After successful sign-in, check where to go
        if (isNewYouth) {
          // New youth — go to onboarding
          router.push("/onboarding");
        } else {
          // Normal login — go to dashboard
          const res = await fetch("/api/auth/session");
          const session = await res.json();
          const role = session?.user?.role;
          if (role === "officer") {
            router.push("/officer");
          } else {
            router.push("/youth");
          }
        }
        router.refresh();
      }
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

        <h1 className="ob-title" style={{ textAlign: "center" }}>
          Welcome back
        </h1>
        <p className="ob-subtitle" style={{ textAlign: "center" }}>
          Sign in to continue to your dashboard.
        </p>

        {error && (
          <div className="auth-error">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="ob-field" htmlFor="signin-email">
            <span className="ob-field-label">Email</span>
            <div className="ob-input-wrap">
              <input
                id="signin-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
          </label>

          <label className="ob-field" htmlFor="signin-password">
            <span className="ob-field-label">Password</span>
            <div className="ob-input-wrap">
              <input
                id="signin-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </label>

          <button
            className="ob-btn primary full"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign in"}
            {!loading && <ArrowRight aria-hidden size={15} />}
          </button>
        </form>

        <p className="auth-switch">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup">Create one</Link>
        </p>

        <p className="ob-privacy">
          <ShieldCheck aria-hidden size={14} />
          Your information is safe and private
        </p>
      </section>
    </main>
  );
}
