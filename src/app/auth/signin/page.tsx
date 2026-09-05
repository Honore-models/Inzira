"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

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

function SignInForm() {
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

        <div className="auth-divider">
          <span>or</span>
        </div>

        <button
          className="auth-google-btn"
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/youth" })}
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <p className="auth-switch" style={{ marginTop: 16 }}>
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

export default function SignIn() {
  return (
    <Suspense fallback={<main className="ob-screen"><section className="ob-panel"><p>Loading…</p></section></main>}>
      <SignInForm />
    </Suspense>
  );
}
