"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="status-page">
      <div className="card">
        <img src="/inzira_logo.png" alt="Inzira" />
        <h1>Something went wrong</h1>
        <p>An unexpected error occurred. Please try again — if it keeps happening, contact your youth officer.</p>
        <div className="page-actions">
          <button className="btn btn-primary" type="button" onClick={reset}>
            Try again
          </button>
          <Link className="btn btn-secondary" href="/">
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
