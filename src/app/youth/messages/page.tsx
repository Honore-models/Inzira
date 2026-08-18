"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Search } from "lucide-react";
import { YouthShell } from "@/components/youth/YouthShell";
import { ChatPanel } from "@/components/ChatPanel";

interface ConversationCase {
  id: string;
  current_step: number;
  total_steps: number;
  status: string;
  youth: { full_name: string } | null;
  officer: { full_name: string } | null;
  lastMessage?: { content: string; created_at: string } | null;
}

export default function YouthMessages() {
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
    const name = c.officer?.full_name || "";
    const preview = c.lastMessage?.content || "";
    return `${name} ${preview}`.toLowerCase().includes(q);
  });

  // If a conversation is selected, show the chat panel
  if (selectedCase) {
    return (
      <YouthShell active="Messages">
        <div className="youth-page-wrap">
          <ChatPanel
            caseInfo={{
              id: selectedCase.id,
              youth_name: session?.user?.name || "You",
              officer_name: selectedCase.officer?.full_name || "Your Officer",
            }}
            currentUserId={session?.user?.profileId || ""}
            currentRole="youth"
            onBack={() => setSelectedCase(null)}
          />
        </div>
      </YouthShell>
    );
  }

  if (loading) {
    return (
      <YouthShell active="Messages">
        <div className="youth-page-wrap">
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
      <div className="youth-page-wrap">
        <header className="page-heading">
          <h1>Messages</h1>
          <p>Your conversations with your assigned officer.</p>
        </header>

        <section className="content-card" style={{ padding: 0 }}>
          <label className="youth-search" style={{ padding: "12px 16px", borderBottom: "1px solid #e2e5df", display: "flex", alignItems: "center", gap: 10 }}>
            <Search aria-hidden size={16} style={{ color: "#777f87", flexShrink: 0 }} />
            <input
              type="search"
              placeholder="Search conversations..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ border: "none", outline: "none", flex: 1, fontSize: 14, background: "transparent" }}
            />
          </label>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {visible.map((chat) => {
              const officerName = chat.officer?.full_name || "Unassigned";
              const initials = officerName.split(" ").map((w) => w[0]).join("");
              return (
                <button
                  key={chat.id}
                  type="button"
                  onClick={() => setSelectedCase(chat)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "14px 16px",
                    borderBottom: "1px solid #f0f2ee",
                    background: "transparent",
                    border: "none",
                    borderLeft: "3px solid transparent",
                    cursor: "pointer",
                    textAlign: "left",
                    width: "100%",
                    fontFamily: "inherit",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#fafbfa")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <span
                    className="officer-avatar small"
                    style={{ background: "#1f6f4c", flexShrink: 0 }}
                  >
                    {initials}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong style={{ display: "block", fontSize: 14, lineHeight: 1.3 }}>
                      {officerName}
                    </strong>
                    <p style={{ color: "#777f87", fontSize: 13, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {chat.lastMessage?.content || "No messages yet — say hello!"}
                    </p>
                  </div>
                  <span style={{ color: "#999", fontSize: 11, flexShrink: 0 }}>
                    {chat.lastMessage?.created_at
                      ? new Date(chat.lastMessage.created_at).toLocaleDateString()
                      : "—"}
                  </span>
                </button>
              );
            })}
            {visible.length === 0 ? (
              <p style={{ color: "#777f87", fontSize: 14, padding: 40, textAlign: "center" }}>
                {cases.length === 0
                  ? "No conversations yet. Your officer will reach out after reviewing your case."
                  : "No conversations match your search."}
              </p>
            ) : null}
          </div>
        </section>
      </div>
    </YouthShell>
  );
}
