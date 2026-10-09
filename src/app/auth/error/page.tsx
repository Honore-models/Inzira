import Link from "next/link";

const MESSAGES: Record<string, string> = {
  AccessDenied: "Sign-in was cancelled or your account could not be created.",
  Configuration: "Sign-in is temporarily unavailable. Please try again later.",
  Verification: "This sign-in link is no longer valid.",
};

export default async function AuthError({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="status-page">
      <div className="card">
        <img src="/inzira_logo.png" alt="Inzira" />
        <h1>We couldn&apos;t sign you in</h1>
        <p>{(error && MESSAGES[error]) || "Something went wrong while signing you in. Please try again."}</p>
        <div className="page-actions">
          <Link className="btn btn-primary" href="/auth/signin">
            Back to sign in
          </Link>
          <Link className="btn btn-secondary" href="/">
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
