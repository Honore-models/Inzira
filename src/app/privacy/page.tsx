import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Privacy" };

export default function Privacy() {
  return (
    <main className="doc-page">
      <Link className="back-link" href="/">← Back to Inzira</Link>
      <h1>Privacy</h1>
      <p className="muted">How Inzira handles your information.</p>

      <h2>What we collect</h2>
      <ul>
        <li>Account details: your name, email address and a securely hashed password.</li>
        <li>Intake information you choose to share: your goal, skills and background, district and sector.</li>
        <li>Your roadmap progress and the messages you exchange with youth officers.</li>
        <li>Questions you ask Inzira, which are processed to produce an answer.</li>
      </ul>

      <h2>How it is used</h2>
      <p>
        Your information is used only to prepare and follow your roadmap. Youth officers working on Inzira can see your
        intake information, progress and messages so they can support you. We do not sell your data or use it for
        advertising.
      </p>

      <h2>AI processing</h2>
      <p>
        When you ask a question or an officer drafts a roadmap, the relevant text is sent to an AI service (Groq) to
        generate a response. Avoid sharing sensitive personal details such as ID numbers or bank information in questions.
        AI answers come only from the verified document library, and every roadmap is approved by a human officer.
      </p>

      <h2>Your choices</h2>
      <p>
        You can view and update your profile at any time from <strong>My profile</strong>. To have your account deleted,
        message your youth officer.
      </p>
    </main>
  );
}
