"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { MessageCircle, Search } from "lucide-react";
import { ChatThread } from "@/components/ChatThread";
import { Alert, Avatar, EmptyState, PageHeader, PageSkeleton } from "@/components/ui";
import { api } from "@/lib/api-client";
import { formatRelative } from "@/lib/format";

interface Conversation {
  id: string;
  youth_profile_id: string;
  officer_profile_id: string | null;
  updated_at: string;
  youth: { full_name: string; email: string; goal: string | null; district: string | null } | null;
  officer: { full_name: string } | null;
  lastMessage: { content: string; created_at: string; sender_role: string } | null;
  unreadCount: number;
}

function Inbox() {
  const router = useRouter();
  const params = useSearchParams();
  const selectedId = params.get("case");
  const { data: session } = useSession();
  const me = session?.user?.profileId || "";

  const [items, setItems] = useState<Conversation[] | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<"mine" | "all">("mine");

  const load = useCallback(() => {
    api<Conversation[]>("/api/cases").then(setItems).catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    load();
    const timer = window.setInterval(() => document.visibilityState === "visible" && load(), 30_000);
    return () => window.clearInterval(timer);
  }, [load]);

  // Opening a conversation clears its unread badge locally.
  useEffect(() => {
    if (selectedId) setItems((list) => list?.map((c) => (c.id === selectedId ? { ...c, unreadCount: 0 } : c)) ?? null);
  }, [selectedId]);

  if (error) return <Alert tone="error" title="We couldn't load your inbox">{error}</Alert>;
  if (!items) return <PageSkeleton />;

  const q = query.trim().toLowerCase();
  const visible = items
    .filter((c) => (scope === "all" ? true : c.officer_profile_id === me || !c.officer_profile_id))
    .filter((c) => scope === "all" || c.lastMessage || c.officer_profile_id === me)
    .filter((c) => !q || `${c.youth?.full_name || ""} ${c.lastMessage?.content || ""}`.toLowerCase().includes(q))
    .sort((a, b) => (b.lastMessage?.created_at || "").localeCompare(a.lastMessage?.created_at || ""));

  const selected = items.find((c) => c.id === selectedId) || null;
  const open = (id: string | null) => router.replace(id ? `/officer/messages?case=${id}` : "/officer/messages", { scroll: false });

  return (
    <>
      <PageHeader title="Messages" description="Conversations with the youth you support." />

      <section className={`card inbox ${selected ? "has-selection" : ""}`}>
        <div className="inbox-list">
          <div className="toolbar" style={{ display: "grid", gap: 10 }}>
            <label className="search-input">
              <Search size={16} aria-hidden />
              <input className="input" type="search" placeholder="Search conversations" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search conversations" />
            </label>
            <div className="chip-row">
              <button type="button" className={`chip ${scope === "mine" ? "active" : ""}`} onClick={() => setScope("mine")}>
                My youth
              </button>
              <button type="button" className={`chip ${scope === "all" ? "active" : ""}`} onClick={() => setScope("all")}>
                All cases
              </button>
            </div>
          </div>
          <div className="inbox-items">
            {visible.length === 0 ? (
              <EmptyState icon={<MessageCircle size={24} />} title="No conversations">
                {q ? "Nothing matches your search." : "When a youth messages you, the conversation appears here."}
              </EmptyState>
            ) : (
              visible.map((c) => (
                <button className={`list-row ${c.id === selectedId ? "selected" : ""}`} type="button" key={c.id} onClick={() => open(c.id)}>
                  <Avatar name={c.youth?.full_name} email={c.youth?.email} />
                  <div className="list-row-body">
                    <strong style={{ fontWeight: c.unreadCount ? 700 : 600 }}>{c.youth?.full_name || "Youth"}</strong>
                    <span>
                      {c.lastMessage
                        ? `${c.lastMessage.sender_role === "officer" ? "You: " : ""}${c.lastMessage.content}`
                        : "No messages yet"}
                    </span>
                  </div>
                  <div className="list-row-meta">
                    <span>{formatRelative(c.lastMessage?.created_at)}</span>
                    {c.unreadCount ? <span className="unread-count">{c.unreadCount}</span> : null}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {selected ? (
          <ChatThread
            key={selected.id}
            caseId={selected.id}
            currentProfileId={me}
            title={selected.youth?.full_name || "Youth"}
            subtitle={[selected.youth?.goal, selected.youth?.district].filter(Boolean).join(" · ")}
            avatar={<Avatar name={selected.youth?.full_name} email={selected.youth?.email} />}
            headerAction={
              <Link className="btn btn-secondary btn-sm" href={`/officer/youth/${selected.youth_profile_id}`}>
                View profile
              </Link>
            }
            onBack={() => {
              open(null);
              load();
            }}
            emptyHint={
              selected.officer_profile_id && selected.officer_profile_id !== me
                ? `This youth is assigned to ${selected.officer?.full_name || "another officer"}.`
                : "Send a message to check in or answer a question."
            }
          />
        ) : (
          <div className="chat" style={{ alignItems: "center", justifyContent: "center" }}>
            <EmptyState icon={<MessageCircle size={24} />} title="Select a conversation">
              Choose a youth on the left to read and reply.
            </EmptyState>
          </div>
        )}
      </section>
    </>
  );
}

export default function OfficerMessagesPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Inbox />
    </Suspense>
  );
}
