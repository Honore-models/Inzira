"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Search } from "lucide-react";
import { OfficerAvatar, OfficerShell } from "@/components/officer/OfficerShell";
import { ChatPanel } from "@/components/ChatPanel";

interface ConversationCase {
  id: string;
  current_step: number;
  total_steps: number;
  status: string;
  youth: { full_name: string; email: string; goal: string } | null;
  lastMessage?: { content: string; created_at: string } | null;
}

export default function OfficerMessages() {
  const { data: session } = useSession();
  const [query, setQuery] = useState("");
  const [cases, setCases] = useState<ConversationCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<ConversationCase | null>(null);

  useEffect(() => {
    loadCases();
  }, []);

  async function loadCases() {
    try {
      const res = await fetch("/api/cases");
      if (res.ok) {
        const data = await res.json();
        const withMessages = await Promise.all(
          data.map(async (c: ConversationCase) => {
            try {
              const mRes = await fetch(`/api/cases/${c.id}/messages`);
              if (mRes.ok) {
                const msgs = await mRes.json();
                return { ...c, lastMessage: msgs[msgs.length - 1] || null };
              }
            } catch {}
            return { ...c, lastMessage: null };
          }),
        );
        setCases(withMessages);
      }
    } catch {
      // Silently handle errors
    } finally {
      setLoading(false);
    }
  }

  const q = query.trim().toLowerCase();
  const visible = cases.filter((c) => {
    const name = c.youth?.full_name || "";
    const preview = c.lastMessage?.content || "";
    return `${name} ${preview}`.toLowerCase().includes(q);
  });

  // If a conversation is selected, show the chat panel
  if (selectedCase) {
    return (
      <OfficerShell active="Messages">
        <div className="officer-page-wrap">
          <ChatPanel
            caseInfo={{
              id: selectedCase.id,
              youth_name: selectedCase.youth?.full_name || "Youth",
              officer_name: session?.user?.name || "Officer",
            }}
            currentUserId={session?.user?.profileId || ""}
            currentRole="officer"
            onBack={() => setSelectedCase(null)}
          />
        </div>
      </OfficerShell>
    );
  }

  if (loading) {
    return (
      <OfficerShell active="Messages">
        <div className="officer-page-wrap">
          <div className="yd-loading">
            <div className="yd-loading-spinner" />
            <p>Loading messages…</p>
          </div>
        </div>
      </OfficerShell>
    );
  }

  return (
    <OfficerShell active="Messages">
      <div className="officer-page-wrap">
        <header className="officer-heading">
          <div>
            <h1>Messages</h1>
            <p>Select a youth to start or continue a conversation.</p>
          </div>
        </header>

        <section className="officer-card officer-inbox">
          <label className="youth-search inbox-search">
            <Search aria-hidden size={16} />
            <input
              type="search"
              placeholder="Search conversations..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <div className="inbox-list">
            {visible.map((chat) => (
              <button
                className="inbox-row"
                key={chat.id}
                type="button"
                onClick={() => setSelectedCase(chat)}
                style={{
                  background: "transparent",
                  border: "none",
                  width: "100%",
                  textAlign: "left",
                  cursor: "pointer",
                  padding: 0,
                  fontFamily: "inherit",
                }}
              >
                <OfficerAvatar
                  avatar={{
                    label:
                      chat.youth?.full_name
                        ?.split(" ")
                        .map((w) => w[0])
                        .join("") || "?",
                    bg: "#1f6f4c",
                  }}
                />
                <div className="inbox-row-body">
                  <strong>{chat.youth?.full_name || "Unknown"}</strong>
                  <p>
                    {chat.lastMessage?.content || "No messages yet — say hello!"}
                  </p>
                </div>
                <div className="inbox-row-meta">
                  <span>
                    {chat.lastMessage?.created_at
                      ? new Date(chat.lastMessage.created_at).toLocaleDateString()
                      : "—"}
                  </span>
                </div>
              </button>
            ))}
            {visible.length === 0 ? (
              <p className="inbox-empty">
                {cases.length === 0
                  ? "No cases yet. Create one from the Smart Intake page."
                  : "No conversations match your search."}
              </p>
            ) : null}
          </div>
        </section>
      </div>
    </OfficerShell>
  );
}
