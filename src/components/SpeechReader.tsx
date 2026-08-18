"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, Square, Volume2, ChevronUp, ChevronDown } from "lucide-react";

export function SpeechReader() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [rate, setRate] = useState(1);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load available voices
  useEffect(() => {
    function loadVoices() {
      const available = window.speechSynthesis.getVoices();
      setVoices(available);
      // Prefer English voices
      const english = available.filter((v) => v.lang.startsWith("en"));
      if (english.length > 0 && !voice) {
        setVoice(english[0]);
      }
    }

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Get visible text from the page
  const getPageText = useCallback(() => {
    const main = document.querySelector("main") || document.body;
    const elements = main.querySelectorAll(
      "h1, h2, h3, h4, p, span, strong, em, li, td, th, label, button, a, div"
    );

    const textParts: string[] = [];
    const seen = new Set<string>();

    elements.forEach((el) => {
      // Skip hidden elements, nav elements, and our own speech component
      if (
        el.closest(".speech-reader") ||
        el.closest("nav") ||
        el.closest("aside") ||
        el.closest("header") ||
        el.closest("footer") ||
        (el as HTMLElement).offsetParent === null
      ) {
        return;
      }

      const text = el.textContent?.trim();
      if (text && text.length > 2 && !seen.has(text)) {
        seen.add(text);
        textParts.push(text);
      }
    });

    return textParts.join(". ");
  }, []);

  const handleSpeak = useCallback(() => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsSpeaking(true);
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsSpeaking(false);
      return;
    }

    // Start speaking
    const text = getPageText();
    if (!text) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = 1;
    if (voice) utterance.voice = voice;

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
    setIsPaused(false);
  }, [isPaused, isSpeaking, getPageText, rate, voice]);

  const handleStop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className="speech-reader" data-expanded={isExpanded}>
      {/* Expand/collapse toggle */}
      <button
        className="speech-toggle"
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-label={isExpanded ? "Collapse speech controls" : "Expand speech controls"}
        title="Text-to-Speech"
      >
        <Volume2 size={20} />
        {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>

      {/* Expanded controls */}
      {isExpanded && (
        <div className="speech-controls">
          {/* Play / Pause */}
          <button
            className={`speech-btn ${isSpeaking && !isPaused ? "active" : ""}`}
            type="button"
            onClick={handleSpeak}
            aria-label={isSpeaking && !isPaused ? "Pause reading" : "Read page aloud"}
          >
            {isSpeaking && !isPaused ? <Pause size={18} /> : <Play size={18} />}
          </button>

          {/* Stop */}
          <button
            className="speech-btn stop"
            type="button"
            onClick={handleStop}
            disabled={!isSpeaking && !isPaused}
            aria-label="Stop reading"
          >
            <Square size={16} />
          </button>

          {/* Speed control */}
          <div className="speech-speed">
            <button
              className="speech-speed-btn"
              type="button"
              onClick={() => setRate(Math.max(0.5, rate - 0.25))}
              disabled={rate <= 0.5}
              aria-label="Slower"
            >
              −
            </button>
            <span className="speech-speed-label">{rate}×</span>
            <button
              className="speech-speed-btn"
              type="button"
              onClick={() => setRate(Math.min(2, rate + 0.25))}
              disabled={rate >= 2}
              aria-label="Faster"
            >
              +
            </button>
          </div>

          {/* Voice selector */}
          {voices.length > 1 && (
            <select
              className="speech-voice-select"
              value={voice?.name || ""}
              onChange={(e) => {
                const selected = voices.find((v) => v.name === e.target.value);
                if (selected) setVoice(selected);
              }}
              aria-label="Select voice"
            >
              {voices
                .filter((v) => v.lang.startsWith("en"))
                .map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name}
                  </option>
                ))}
            </select>
          )}

          {/* Status */}
          {isSpeaking && (
            <span className="speech-status">
              {isPaused ? "Paused" : "Reading…"}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
