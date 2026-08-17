"use client";

import { useState } from "react";
import { Check } from "lucide-react";

export function SaveDraftButton() {
  const [saved, setSaved] = useState(false);

  function save() {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  }

  return (
    <button className="officer-button outline" type="button" onClick={save}>
      {saved ? (
        <>
          <Check aria-hidden size={15} />
          Draft saved
        </>
      ) : (
        "Save draft"
      )}
    </button>
  );
}
