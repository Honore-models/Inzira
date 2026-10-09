import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Terms of use" };

export default function Terms() {
  return (
    <main className="doc-page">
      <Link className="back-link" href="/">← Back to Inzira</Link>
      <h1>Terms of use</h1>
      <p className="muted">Please read these before using Inzira.</p>

      <h2>What Inzira is</h2>
      <p>
        Inzira is a guidance tool. It helps young people in Rwanda find and follow official programs offered by
        institutions such as RDB, RRA, BRD, RTB and the Ministry of Youth. It is not operated by those institutions and
        does not make decisions on their behalf.
      </p>

      <h2>Information and advice</h2>
      <p>
        Inzira summarises published program information and your officer&apos;s guidance. Requirements, fees and
        eligibility can change — always confirm important details with the institution before you apply. Inzira does
        not guarantee approval for any registration, loan or training program.
      </p>

      <h2>Your account</h2>
      <ul>
        <li>Provide accurate information so your officer can give you the right guidance.</li>
        <li>Keep your password private. You are responsible for activity on your account.</li>
        <li>Be respectful in messages. Officer accounts are for authorised staff only.</li>
      </ul>

      <h2>Questions</h2>
      <p>If anything here is unclear, message your youth officer from the Messages page.</p>
    </main>
  );
}
