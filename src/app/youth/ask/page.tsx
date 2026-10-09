"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUp, Check, Copy, FileText, MessageCircle, RotateCcw, Sparkles } from "lucide-react";
import { Alert, PageHeader, RichText } from "@/components/ui";
import { ASK_SUGGESTIONS, ASK_TOPICS } from "@/data/options";
import { api } from "@/lib/api-client";
import type { Journey } from "@/lib/use-journey";

type Source = { documentId: string; documentTitle: string; institution: string; page: number | null };

type Exchange = {
  id: string;
  question: string;
  answer?: string;
  kind?: "answer" | "no_info" | "off_topic";
  sources?: Source[];
  error?: string;
  forwarded?: boolean;
};

const STORAGE_KEY = "inzira.ask.v1";

function load(): Exchange[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Exchange[]).filter((e) => e.answer || e.error) : [];
  } catch {
    return [];
  }
}

/** Sources actually cited in the answer (or all, if the model cited none). */
function citedSources(answer: string, sources: Source[]) {
  const cited = new Set(Array.from(answer.matchAll(/\[(\d+)\]/g)).map((m) => parseInt(m[1], 10)));
  const picked = cited.size ? sources.filter((_, i) => cited.has(i + 1)) : sources.slice(0, 3);
  const seen = new Set<string>();
  return picked.filter((s) => {
    const key = `${s.documentId}-${s.page ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export default function AskInzira() {
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [forwardError, setForwardError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => setExchanges(load()), []);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(exchanges.slice(-20)));
    } catch {
      /* storage unavailable */
    }
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [exchanges]);

  async function ask(raw: string) {
    const question = raw.trim();
    if (!question || busy) return;

    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const history = exchanges
      .filter((e) => e.answer && e.kind === "answer")
      .slice(-4)
      .map((e) => ({ question: e.question, answer: e.answer! }));

    setExchanges((prev) => [...prev, { id, question }]);
    setInput("");
    setBusy(true);

    try {
      const data = await api<{ answer: string; kind: Exchange["kind"]; sources: Source[] }>("/api/ai/ask", {
        method: "POST",
        json: { question, history },
      });
      setExchanges((prev) => prev.map((e) => (e.id === id ? { ...e, ...data } : e)));
    } catch (e) {
      setExchanges((prev) =>
        prev.map((x) => (x.id === id ? { ...x, error: e instanceof Error ? e.message : "Something went wrong." } : x)),
      );
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }

  async function forwardToOfficer(exchange: Exchange) {
    setForwardError("");
    try {
      const me = await api<Journey>("/api/me");
      if (!me.case) {
        setForwardError("You don't have an officer yet. Open Messages to choose one.");
        return;
      }
      await api(`/api/cases/${me.case.id}/messages`, {
        method: "POST",
        json: { content: `Question from Ask Inzira:\n\n${exchange.question}` },
      });
      setExchanges((prev) => prev.map((e) => (e.id === exchange.id ? { ...e, forwarded: true } : e)));
    } catch (e) {
      setForwardError(e instanceof Error ? e.message : "Could not send to your officer.");
    }
  }

  async function copy(exchange: Exchange) {
    try {
      await navigator.clipboard.writeText((exchange.answer || "").replace(/\s*\[\d+(?:,\s*\d+)*\]/g, ""));
      setCopied(exchange.id);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <>
      <PageHeader
        title="Ask Inzira"
        description="Answers come only from verified documents published by RDB, RRA, BRD, RTB and the Ministry of Youth. For decisions about your situation, your officer has the final word."
        actions={
          exchanges.length ? (
            <button className="btn btn-secondary btn-sm" type="button" onClick={() => setExchanges([])} disabled={busy}>
              <RotateCcw size={14} aria-hidden /> New conversation
            </button>
          ) : null
        }
      />

      {forwardError ? <Alert tone="warning" className="ask-alert">{forwardError}</Alert> : null}

      <section className="card ask" aria-label="Conversation with Inzira" style={{ marginTop: forwardError ? 12 : 0 }}>
        <div className="ask-scroll" ref={scrollRef} aria-live="polite">
          {exchanges.length === 0 ? (
            <div className="ask-welcome">
              <span className="empty-icon">
                <Sparkles size={24} aria-hidden />
              </span>
              <h2>What would you like to know?</h2>
              <p>Ask about registering a business, getting a TIN, youth loans, or vocational training.</p>
              <div className="chip-row">
                {ASK_SUGGESTIONS.map((s) => (
                  <button key={s} className="chip" type="button" onClick={() => ask(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            exchanges.map((ex) => {
              const sources = ex.answer && ex.sources ? citedSources(ex.answer, ex.sources) : [];
              return (
                <div key={ex.id} style={{ display: "grid", gap: 12 }}>
                  <div className="ask-q">{ex.question}</div>
                  <div className="ask-a">
                    <span className="ask-a-icon" aria-hidden>
                      <Sparkles size={16} />
                    </span>
                    <div className="ask-a-body">
                      {ex.error ? (
                        <Alert tone="error">
                          {ex.error}{" "}
                          <button className="btn btn-ghost btn-sm" type="button" onClick={() => ask(ex.question)} disabled={busy}>
                            Try again
                          </button>
                        </Alert>
                      ) : ex.answer === undefined ? (
                        <div className="typing" aria-label="Inzira is searching verified sources">
                          <span />
                          <span />
                          <span />
                        </div>
                      ) : (
                        <>
                          <RichText
                            text={ex.answer}
                            onCite={(n) =>
                              ex.sources?.[n - 1] ? (
                                <span className="cite" title={`${ex.sources[n - 1].institution} – ${ex.sources[n - 1].documentTitle}`}>
                                  {n}
                                </span>
                              ) : null
                            }
                          />
                          {sources.length ? (
                            <div className="ask-sources" aria-label="Sources">
                              {sources.map((s) => (
                                <span className="ask-source" key={`${s.documentId}-${s.page}`}>
                                  <FileText size={12} aria-hidden />
                                  <b>{s.institution}</b>
                                  <span>
                                    {s.documentTitle}
                                    {s.page ? `, p. ${s.page}` : ""}
                                  </span>
                                </span>
                              ))}
                            </div>
                          ) : null}
                          <div className="ask-actions">
                            <button className="icon-button" type="button" onClick={() => copy(ex)} aria-label="Copy answer" title="Copy answer">
                              {copied === ex.id ? <Check size={15} aria-hidden /> : <Copy size={15} aria-hidden />}
                            </button>
                            {ex.forwarded ? (
                              <span className="badge badge-green">Sent to your officer</span>
                            ) : (
                              <button className="btn btn-ghost btn-sm" type="button" onClick={() => forwardToOfficer(ex)}>
                                <MessageCircle size={14} aria-hidden />
                                {ex.kind === "answer" ? "Ask my officer about this" : "Send this question to my officer"}
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="ask-compose">
          {exchanges.length > 0 && !busy ? (
            <div className="chip-row" style={{ marginBottom: 10 }}>
              {ASK_TOPICS.map((t) => (
                <button key={t.label} className="chip" type="button" onClick={() => ask(t.question)}>
                  {t.label}
                </button>
              ))}
            </div>
          ) : null}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
          >
            <label className="visually-hidden" htmlFor="ask-input">
              Your question
            </label>
            <textarea
              id="ask-input"
              ref={inputRef}
              className="textarea"
              rows={1}
              maxLength={1000}
              placeholder="Ask a question…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  ask(input);
                }
              }}
            />
            <button className="btn btn-primary" type="submit" disabled={busy || !input.trim()} aria-label="Send question">
              {busy ? <span className="spinner" aria-hidden /> : <ArrowUp size={18} aria-hidden />}
            </button>
          </form>
          <p className="ask-disclaimer">
            Inzira can make mistakes. Check important details with your officer or the institution.{" "}
            <Link href="/youth/find-help" style={{ textDecoration: "underline" }}>
              Find contacts
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
