"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  CheckCheck,
  ChevronDown,
  Info,
  Lock,
  Mic,
  Paperclip,
  PenSquare,
  Search,
  Send,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import { YouthShell } from "@/components/youth/YouthShell";

interface Message {
  id: string;
  content: string;
  sender_role: string;
  created_at: string;
  sender: {
    full_name: string;
    role: string;
  };
}

interface Case {
  id: string;
  youth: { full_name: string } | null;
  officer: { full_name: string } | null;
}

function Avatar({
  name,
  className,
  bg = "#e8f0eb",
}: {
  name: string;
  className: string;
  bg?: string;
}) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);
  return (
    <span className={className} style={{ backgroundColor: bg, color: "#1f6f4c" }}>
      {initials}
    </span>
  );
}

export default function YouthMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [youthCase, setYouthCase] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        // Fetch cases to get the case ID
        const casesRes = await fetch("/api/cases");
        if (casesRes.ok) {
          const casesData = await casesRes.json();
          if (casesData.length > 0) {
            const activeCase = casesData[0];
            setYouthCase(activeCase);

            // Fetch messages for this case
            const msgRes = await fetch(`/api/cases/${activeCase.id}/messages`);
            if (msgRes.ok) {
              const msgData = await msgRes.json();
              setMessages(msgData);
            }
          }
        }
      } catch {
        // Silently handle errors
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function sendMessage() {
    const text = draft.trim();
    if (!text || !youthCase?.id) return;

    setSending(true);
    try {
      const res = await fetch(`/api/cases/${youthCase.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });

      if (res.ok) {
        const newMsg = await res.json();
        setMessages((prev) => [...prev, newMsg]);
        setDraft("");
      }
    } catch {
      // Silently handle errors
    } finally {
      setSending(false);
    }
  }

  const officerName = youthCase?.officer?.full_name || "Your Officer";

  if (loading) {
    return (
      <YouthShell active="Messages">
        <div className="youth-page-wrap messages-page">
          <div className="yd-loading">
            <div className="yd-loading-spinner" />
            <p>Loading messages…</p>
          </div>
        </div>
      </YouthShell>
    );
  }

  return (
    <YouthShell active="Messages">
      <div className="youth-page-wrap messages-page">
        <header className="messages-topbar">
          <div>
            <h1>Messages</h1>
            <p>Talk with your youth officer and get support.</p>
          </div>
          <div className="messages-topbar-actions">
            <button className="topbar-bell" type="button" aria-label="Notifications">
              <Bell aria-hidden size={18} />
            </button>
          </div>
        </header>

        <div className="messages-layout">
          <aside className="conversations-panel">
            <div className="conversations-header">
              <h2>Conversation</h2>
            </div>

            <div className="conversation-list">
              {youthCase && (
                <div className="conversation-item active">
                  <Avatar name={officerName} className="conversation-avatar" bg="#1f6f4c" />
                  <span className="conversation-copy">
                    <span className="conversation-name-row">
                      <strong>{officerName}</strong>
                    </span>
                    <span className="conversation-role">Youth Officer</span>
                    <span className="conversation-preview">
                      {messages.length > 0
                        ? messages[messages.length - 1].content.slice(0, 50) + "…"
                        : "Start a conversation"}
                    </span>
                  </span>
                </div>
              )}
            </div>

            <div className="privacy-note">
              <Lock aria-hidden size={16} />
              <p>
                Your conversations are private and secure. Inzira shares messages
                with your assigned officer to support you better.
              </p>
            </div>
          </aside>

          <section className="chat-panel">
            <header className="chat-header">
              <div className="chat-contact">
                <Avatar name={officerName} className="chat-avatar-img" bg="#1f6f4c" />
                <span className="chat-contact-copy">
                  <strong>{officerName}</strong>
                  <em>Youth Officer</em>
                </span>
              </div>
            </header>

            <div className="chat-messages">
              {messages.length === 0 && (
                <div style={{ textAlign: "center", color: "#8a9290", padding: 40 }}>
                  <p style={{ fontSize: 14 }}>No messages yet. Start a conversation!</p>
                </div>
              )}
              {messages.map((m) => (
                <div
                  className={`chat-bubble-row ${m.sender_role === "youth" ? "mine" : ""}`}
                  key={m.id}
                >
                  {m.sender_role !== "youth" && (
                    <Avatar name={officerName} className="bubble-avatar" bg="#1f6f4c" />
                  )}
                  <div className="chat-bubble">
                    <p>{m.content}</p>
                    <span className="bubble-meta">
                      {new Date(m.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {m.sender_role === "youth" && <CheckCheck aria-hidden size={14} />}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="chat-composer">
              <textarea
                placeholder="Type your message..."
                rows={1}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <div className="composer-tools">
                <span className="composer-attach">
                  <button type="button" aria-label="Attach a file">
                    <Paperclip aria-hidden size={17} />
                  </button>
                </span>
                <button
                  className="composer-send"
                  type="button"
                  aria-label="Send message"
                  onClick={sendMessage}
                  disabled={sending || !draft.trim()}
                >
                  <Send aria-hidden size={16} />
                </button>
              </div>
            </div>

            <footer className="chat-footer">
              <span>
                <Info aria-hidden size={15} />
                For financial, legal, or eligibility disputes, Inzira will connect
                you to a real person.
              </span>
            </footer>
          </section>
        </div>
      </div>
    </YouthShell>
  );
}
