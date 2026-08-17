"use client";

import { useState } from "react";
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
import { conversationMessages, conversations } from "@/data/youth";

const dianeAvatar = {
  kind: "initials",
  label: "DM",
  bg: "#e8f0eb",
  color: "#1f6f4c",
  photo: "/diane.jpg",
};

function Avatar({
  avatar,
  className,
}: {
  avatar: { kind: string; label: string; bg: string; color?: string; photo?: string };
  className: string;
}) {
  if (avatar.photo) {
    return <img className={`${className} photo-avatar`} src={avatar.photo} alt="" />;
  }
  const style: React.CSSProperties = { backgroundColor: avatar.bg };
  if (avatar.color) style.color = avatar.color;
  return (
    <span className={`${className} ${avatar.kind === "icon" ? "icon-avatar" : ""}`} style={style}>
      {avatar.kind === "icon" ? <Users aria-hidden size={18} /> : avatar.label}
    </span>
  );
}

type Conversation = (typeof conversations)[number];

export default function YouthMessages() {
  const [threads, setThreads] = useState<Conversation[]>(conversations);
  const [messagesByConv, setMessagesByConv] = useState<Record<string, typeof conversationMessages>>({
    "jean-claude": conversationMessages,
  });
  const [activeId, setActiveId] = useState(conversations.find((c) => c.active)?.id ?? "jean-claude");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");

  const active = threads.find((c) => c.id === activeId) ?? threads[0];
  const visibleThreads = threads.filter((c) =>
    c.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  function openConversation(id: string) {
    setActiveId(id);
    setThreads((prev) =>
      prev.map((c) => (c.id === id ? ({ ...c, unread: 0 } as Conversation) : c)),
    );
  }

  function sendMessage() {
    const text = draft.trim();
    if (!text) return;
    setMessagesByConv((prev) => ({
      ...prev,
      [activeId]: [
        ...(prev[activeId] ?? []),
        {
          id: Date.now(),
          from: "me",
          time: "Now",
          text,
        },
      ],
    }));
    setDraft("");
  }

  function notifyOfficer() {
    window.alert(
      "Your youth officer has been notified and will follow up with you.",
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
              <small>2</small>
            </button>
            <button className="topbar-profile" type="button">
              <Avatar avatar={dianeAvatar} className="topbar-avatar" />
              <span className="topbar-profile-copy">
                <strong>Diane Mukamana</strong>
                <em>
                  Gasabo District
                  <ChevronDown aria-hidden size={12} />
                </em>
              </span>
            </button>
          </div>
        </header>

        <div className="messages-layout">
          <aside className="conversations-panel">
            <div className="conversations-header">
              <h2>Conversations</h2>
              <button
                className="new-message-btn"
                type="button"
                onClick={() => window.alert("New message: pick a contact to start a conversation.")}
              >
                <PenSquare aria-hidden size={15} />
                New message
              </button>
            </div>

            <label className="conversations-search">
              <Search aria-hidden size={16} />
              <input
                type="search"
                placeholder="Search messages..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button type="button" aria-label="Filter conversations">
                <SlidersHorizontal aria-hidden size={15} />
              </button>
            </label>

            <div className="conversation-list">
              {visibleThreads.map((c) => (
                <button
                  className={`conversation-item ${c.id === activeId ? "active" : ""}`}
                  key={c.id}
                  type="button"
                  onClick={() => openConversation(c.id)}
                >
                  <Avatar avatar={c.avatar} className="conversation-avatar" />
                  <span className="conversation-copy">
                    <span className="conversation-name-row">
                      <strong>{c.name}</strong>
                      <time>{c.time}</time>
                    </span>
                    {c.role ? (
                      <span className="conversation-role">
                        {c.role} • {c.location}
                      </span>
                    ) : null}
                    <span className="conversation-preview">{c.preview}</span>
                  </span>
                  {c.unread ? <small className="unread-badge">{c.unread}</small> : null}
                </button>
              ))}
              {visibleThreads.length === 0 ? (
                <p className="conversation-empty">No conversations match your search.</p>
              ) : null}
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
                <span className="chat-avatar">
                  <Avatar avatar={active.avatar} className="chat-avatar-img" />
                </span>
                <span className="chat-contact-copy">
                  <strong>{active.name}</strong>
                  <em>
                    {active.role ? `${active.role} • ${active.location}` : "Inzira"}
                  </em>
                </span>
              </div>
            </header>

            <div className="chat-messages">
              <div className="date-divider">May 12, 2025</div>
              {(messagesByConv[activeId] ?? []).map((m) => (
                <div className={`chat-bubble-row ${m.from === "me" ? "mine" : ""}`} key={m.id}>
                  {m.from === "officer" ? (
                    <Avatar avatar={active.avatar} className="bubble-avatar" />
                  ) : null}
                  <div className="chat-bubble">
                    <p>{m.text}</p>
                    <span className="bubble-meta">
                      {m.time}
                      {m.from === "me" ? <CheckCheck aria-hidden size={14} /> : null}
                    </span>
                  </div>
                  {m.from === "me" ? (
                    <Avatar avatar={dianeAvatar} className="bubble-avatar" />
                  ) : null}
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
                  <button
                    type="button"
                    aria-label="Attach a file"
                    onClick={() => window.alert("Attachments are not available in this demo.")}
                  >
                    <Paperclip aria-hidden size={17} />
                  </button>
                  <button
                    type="button"
                    aria-label="Record a voice message"
                    onClick={() => window.alert("Voice messages are not available in this demo.")}
                  >
                    <Mic aria-hidden size={17} />
                  </button>
                </span>
                <button
                  className="composer-send"
                  type="button"
                  aria-label="Send message"
                  onClick={sendMessage}
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
              <button type="button" onClick={notifyOfficer}>
                Notify my officer
              </button>
            </footer>
          </section>
        </div>
      </div>
    </YouthShell>
  );
}
