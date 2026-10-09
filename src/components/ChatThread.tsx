"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { Alert, Skeleton } from "@/components/ui";
import { api } from "@/lib/api-client";
import { dayLabel, formatTime } from "@/lib/format";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_role: string;
  created_at: string;
  pending?: boolean;
}

export function ChatThread({
  caseId,
  currentProfileId,
  title,
  subtitle,
  avatar,
  headerAction,
  onBack,
  emptyHint,
}: {
  caseId: string;
  currentProfileId: string;
  title: string;
  subtitle?: string;
  avatar?: ReactNode;
  headerAction?: ReactNode;
  onBack?: () => void;
  emptyHint?: string;
}) {
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const atBottom = useRef(true);

  const load = useCallback(async () => {
    try {
      const data = await api<Message[]>(`/api/cases/${caseId}/messages`);
      setMessages(data);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load messages.");
      setMessages((m) => m ?? []);
    }
  }, [caseId]);

  useEffect(() => {
    setMessages(null);
    load();
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, 8000);
    return () => window.clearInterval(timer);
  }, [load]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el && atBottom.current) el.scrollTop = el.scrollHeight;
  }, [messages]);

  async function send() {
    const content = draft.trim();
    if (!content || sending) return;
    setSending(true);
    setError("");
    const temp: Message = {
      id: `temp-${Date.now()}`,
      content,
      sender_id: currentProfileId,
      sender_role: "",
      created_at: new Date().toISOString(),
      pending: true,
    };
    setMessages((m) => [...(m || []), temp]);
    setDraft("");
    atBottom.current = true;
    try {
      await api(`/api/cases/${caseId}/messages`, { method: "POST", json: { content } });
      await load();
    } catch (e) {
      setMessages((m) => (m || []).filter((x) => x.id !== temp.id));
      setDraft(content);
      setError(e instanceof Error ? e.message : "Message could not be sent.");
    } finally {
      setSending(false);
    }
  }

  let lastDay = "";

  return (
    <section className="card chat" aria-label={`Conversation with ${title}`}>
      <header className="chat-head">
        {onBack ? (
          <button className="icon-button" type="button" onClick={onBack} aria-label="Back to conversations">
            <ArrowLeft size={18} aria-hidden />
          </button>
        ) : null}
        {avatar}
        <div className="chat-head-info">
          <strong>{title}</strong>
          {subtitle ? <span>{subtitle}</span> : null}
        </div>
        {headerAction}
      </header>

      <div
        className="chat-scroll"
        ref={scrollRef}
        onScroll={(e) => {
          const el = e.currentTarget;
          atBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
        }}
        aria-live="polite"
      >
        {messages === null ? (
          <div style={{ display: "grid", gap: 10 }}>
            <Skeleton height={40} width="55%" radius={14} />
            <div style={{ justifySelf: "end", width: "45%" }}>
              <Skeleton height={40} radius={14} />
            </div>
            <Skeleton height={56} width="60%" radius={14} />
          </div>
        ) : messages.length === 0 ? (
          <p className="muted" style={{ margin: "auto", textAlign: "center", maxWidth: 360 }}>
            {emptyHint || "No messages yet. Say hello to start the conversation."}
          </p>
        ) : (
          messages.map((m) => {
            const day = dayLabel(m.created_at);
            const showDay = day !== lastDay;
            lastDay = day;
            const mine = m.sender_id === currentProfileId;
            return (
              <div key={m.id} style={{ display: "contents" }}>
                {showDay ? <span className="chat-day">{day}</span> : null}
                <div className={`bubble ${mine ? "mine" : "theirs"}`} style={m.pending ? { opacity: 0.7 } : undefined}>
                  {m.content}
                  <span className="bubble-time">{m.pending ? "Sending…" : formatTime(m.created_at)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {error ? (
        <div style={{ padding: "0 14px 10px" }}>
          <Alert tone="error">{error}</Alert>
        </div>
      ) : null}

      <form
        className="chat-compose"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <label className="visually-hidden" htmlFor={`compose-${caseId}`}>
          Message
        </label>
        <textarea
          id={`compose-${caseId}`}
          className="textarea"
          rows={1}
          maxLength={4000}
          placeholder={`Message ${title}…`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />
        <button className="btn btn-primary" type="submit" disabled={!draft.trim() || sending} aria-label="Send message">
          {sending ? <span className="spinner" aria-hidden /> : <Send size={17} aria-hidden />}
        </button>
      </form>
    </section>
  );
}
