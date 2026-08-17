"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

export function ReviewActions() {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "saved" | "approved">("idle");

  function saveAsDraft() {
    setState("saved");
    window.setTimeout(() => setState("idle"), 3000);
  }

  function approve() {
    setState("approved");
    window.setTimeout(() => router.push("/officer"), 2200);
  }

  if (state === "approved") {
    return (
      <div className="review-success">
        <CheckCircle2 aria-hidden size={28} />
        <div>
          <strong>Roadmap approved and sent to the youth.</strong>
          <p>The roadmap now appears on the youth&apos;s dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <footer className="review-actions">
      <button className="officer-button outline" type="button" onClick={saveAsDraft}>
        {state === "saved" ? "Draft saved ✓" : "Save as draft"}
      </button>
      <button className="officer-button primary" type="button" onClick={approve}>
        ✓ Approve and send to youth
      </button>
    </footer>
  );
}
