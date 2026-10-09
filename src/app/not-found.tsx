import Link from "next/link";

export default function NotFound() {
  return (
    <main className="status-page">
      <div className="card">
        <img src="/inzira_logo.png" alt="Inzira" />
        <h1>Page not found</h1>
        <p>The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
        <div className="page-actions">
          <Link className="btn btn-primary" href="/">
            Go to the home page
          </Link>
        </div>
      </div>
    </main>
  );
}
