"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  ClipboardList,
  ExternalLink,
  GraduationCap,
  Info,
  Send,
  ThumbsDown,
  ThumbsUp,
  Wallet,
} from "lucide-react";
import { YouthShell } from "@/components/youth/YouthShell";
import { askCommonTopics, askSuggestions } from "@/data/youth";

const topicIcons = {
  building: Building2,
  wallet: Wallet,
  graduation: GraduationCap,
  clipboard: ClipboardList,
};

type Source = {
  institution: string;
  document: string;
  page: number | null;
  documentId: string;
};

type Exchange = {
  question: string;
  answer: string;
  sources: Source[];
  loading?: boolean;
  error?: string;
};

export default function YouthAsk() {
  const [input, setInput] = useState("");
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(question: string) {
    const q = question.trim();
    if (!q || isSubmitting) return;

    // Add the question immediately with a loading state
    const loadingExchange: Exchange = {
      question: q,
      answer: "",
      sources: [],
      loading: true,
    };
    setExchanges((prev) => [...prev, loadingExchange]);
    setInput("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setExchanges((prev) =>
          prev.map((ex) =>
            ex.question === q && ex.loading
              ? {
                  ...ex,
                  loading: false,
                  error:
                    errorData.error ||
                    "Failed to get an answer. Please try again.",
                }
              : ex,
          ),
        );
      } else {
        const data = await res.json();
        setExchanges((prev) =>
          prev.map((ex) =>
            ex.question === q && ex.loading
              ? {
                  ...ex,
                  loading: false,
                  answer: data.answer,
                  sources: data.sources || [],
                }
              : ex,
          ),
        );
      }
    } catch {
      setExchanges((prev) =>
        prev.map((ex) =>
          ex.question === q && ex.loading
            ? {
                ...ex,
                loading: false,
                error:
                  "Failed to connect to Inzira AI. Please check your connection and try again.",
              }
            : ex,
          ),
        );
    } finally {
      setIsSubmitting(false);
    }
  }

  function notifyOfficer() {
    window.alert(
      "Your youth officer has been notified and will follow up with you.",
    );
  }

  return (
    <YouthShell active="Ask">
      <div className="youth-page-wrap ask-page">
        <header className="ask-page-heading">
          <div>
            <h1>Ask Inzira</h1>
            <p>Ask anything about programs, requirements, or next steps.</p>
          </div>
          <button
            className="ask-how-link"
            type="button"
            onClick={() =>
              window.alert(
                "Inzira answers using verified official sources. You can ask about programs, requirements, documents, and next steps.",
              )
            }
          >
            <Info aria-hidden size={16} />
            How it works
          </button>
        </header>

        <div className="ask-layout">
          <div className="ask-chat-column">
            {exchanges.length === 0 && (
              <div className="ask-empty-state">
                <Info aria-hidden size={32} />
                <h3>Ask a question to get started</h3>
                <p>
                  Inzira will search verified documents from RDB, RRA, BDF,
                  RTB, and other institutions to answer your questions.
                </p>
              </div>
            )}

            <div className="chat-thread">
              {exchanges.map((exchange, index) => (
                <div
                  className="ask-exchange"
                  key={`${exchange.question}-${index}`}
                >
                  <div className="user-message">{exchange.question}</div>

                  {exchange.loading ? (
                    <article className="ai-response-card">
                      <div className="ai-loading">
                        <div className="yd-loading-spinner" />
                        <p>Searching verified sources…</p>
                      </div>
                    </article>
                  ) : exchange.error ? (
                    <article className="ai-response-card">
                      <p className="ai-response-intro" style={{ color: "#c0392b" }}>
                        {exchange.error}
                      </p>
                    </article>
                  ) : (
                    <article className="ai-response-card">
                      <p className="ai-response-intro">
                        Here&apos;s what I found from verified sources:
                      </p>
                      <div className="ai-answer-text">
                        {exchange.answer.split("\n").map((paragraph, i) =>
                          paragraph.trim() ? (
                            <p key={i}>{paragraph}</p>
                          ) : null,
                        )}
                      </div>

                      {exchange.sources.length > 0 && (
                        <footer className="ai-response-footer">
                          <div className="ai-sources-list">
                            <span className="ai-sources-label">Sources:</span>
                            {exchange.sources.map((source, si) => (
                              <span className="ai-source-item" key={si}>
                                {source.institution} – {source.document}
                                {source.page
                                  ? ` (Page ${source.page})`
                                  : ""}
                              </span>
                            ))}
                          </div>

                          <div className="ai-feedback">
                            <span>Is this answer helpful?</span>
                            <button
                              aria-label="Yes, helpful"
                              type="button"
                              className={
                                feedback[exchange.question] === "yes"
                                  ? "active"
                                  : ""
                              }
                              onClick={() =>
                                setFeedback((f) => ({
                                  ...f,
                                  [exchange.question]: "yes",
                                }))
                              }
                            >
                              <ThumbsUp aria-hidden size={16} />
                            </button>
                            <button
                              aria-label="No, not helpful"
                              type="button"
                              className={
                                feedback[exchange.question] === "no"
                                  ? "active"
                                  : ""
                              }
                              onClick={() =>
                                setFeedback((f) => ({
                                  ...f,
                                  [exchange.question]: "no",
                                }))
                              }
                            >
                              <ThumbsDown aria-hidden size={16} />
                            </button>
                          </div>
                        </footer>
                      )}
                    </article>
                  )}
                </div>
              ))}
            </div>

            <div className="ask-suggestions">
              {askSuggestions.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => submit(item)}
                  disabled={isSubmitting}
                >
                  {item}
                </button>
              ))}
            </div>

            <form
              className="ask-input"
              onSubmit={(e) => {
                e.preventDefault();
                submit(input);
              }}
            >
              <input
                aria-label="Ask a question"
                placeholder="Ask a question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isSubmitting}
              />
              <button
                aria-label="Send question"
                type="submit"
                disabled={isSubmitting || !input.trim()}
              >
                <Send aria-hidden size={18} />
              </button>
            </form>

            <div className="ask-disclaimer">
              <Info aria-hidden size={16} />
              <p>
                Inzira gives answers based only on verified official sources.
                For financial, legal, or complex cases, we&apos;ll connect you
                to a real officer.
              </p>
            </div>
          </div>

          <aside className="ask-sidebar">
            <div className="officer-notify-card">
              <h2>Need to speak with a real person?</h2>
              <p>
                If your question needs a human review, we can notify your youth
                officer to follow up with you.
              </p>
              <button type="button" onClick={notifyOfficer}>
                Notify my officer
              </button>
            </div>

            <div className="common-topics">
              <h2>Common topics</h2>
              <ul>
                {askCommonTopics.map((topic) => {
                  const Icon =
                    topicIcons[topic.icon as keyof typeof topicIcons];
                  return (
                    <li key={topic.label}>
                      <button type="button">{topic.label}</button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </YouthShell>
  );
}
