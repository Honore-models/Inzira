"use client";

import { useState } from "react";
import { ChevronDown, Globe2, Volume2 } from "lucide-react";

export function SidebarControls() {
  const [lang, setLang] = useState("English");

  function readAloud() {
    const text = document.querySelector(".youth-content")?.textContent?.trim();
    if (!text) return;
    const speech = (window as unknown as { speechSynthesis?: SpeechSynthesis }).speechSynthesis;
    if (!speech) {
      window.alert("Read aloud is not supported in this browser.");
      return;
    }
    speech.cancel();
    const utterance = new SpeechSynthesisUtterance(text.slice(0, 4000));
    utterance.lang = "en";
    utterance.rate = 1;
    speech.speak(utterance);
  }

  function cycleLanguage() {
    setLang((prev) => (prev === "English" ? "Kinyarwanda" : "English"));
  }

  return (
    <>
      <button className="read-button sidebar-read-button" type="button" onClick={readAloud}>
        <Volume2 aria-hidden size={16} />
        Read aloud
      </button>
      <button className="language-button" type="button" onClick={cycleLanguage}>
        <Globe2 aria-hidden size={16} />
        {lang}
        <ChevronDown aria-hidden size={14} />
      </button>
    </>
  );
}
