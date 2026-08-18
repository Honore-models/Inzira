"use client";

import { useEffect, useRef, useState } from "react";
import { Send, ArrowLeft } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_role: string;
  is_read: boolean;
  created_at: string;
  sender: { full_name: string; role: string } | null;
}

interface CaseInfo {
  id: string;
  youth_name: string;
  officer_name: string;
}

export function ChatPanel({
  caseInfo,
  currentUserId,
  currentRole,
  onBack,
}: {
  caseInfo: CaseInfo;
  currentUserId: string;
  currentRole: string;
  onBack: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadMessages();
    // Poll for new messages every 5 seconds
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [caseInfo.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadMessages() {
    try {
      const res = await fetch(`/api/cases/${caseInfo.id}/messages`);
      if (res.ok) {
        setMessages(await res.json());
      }
    } catch {
      // Silently handle errors
    } finally {
      setLoading(false);
    }
  }

  async function handleSend() {
    if (!newMessage.trim() || sending) return;
    setSending(true);

    try {
      const res = await fetch(`/api/cases/${caseInfo.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage.trim() }),
      });

      if (res.ok) {
        setNewMessage("");
        await loadMessages();
      }
    } catch {
      // Silently handle errors
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function formatTime(dateStr: string) {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHours < 24) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  }

  const otherName = currentRole === "officer" ? caseInfo.youth_name : caseInfo.officer_name;

  return (
    <div className="chat-panel">
      {/* Header */}
      <div className="chat-header">
        <button className="chat-back" type="button" onClick={onBack} aria-label="Back to conversations">
          <ArrowLeft size={18} />
        </button>
        <div className="chat-header-info">
          <strong>{otherName}</strong>
          <span>{currentRole === "officer" ? "Youth" : "Your Officer"}</span>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {loading ? (
          <div className="chat-loading">
            <div className="yd-loading-spinner" />
            <p>Loading messages…</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="chat-empty">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => {
              const isMine = msg.sender_role === currentRole;
              return (
                <div
                  className={`chat-bubble ${isMine ? "mine" : "theirs"}`}
                  key={msg.id}
                >
                  <div className="chat-bubble-header">
                    <span className="chat-sender">
                      {msg.sender?.full_name || msg.sender_role}
                    </span>
                    <span className="chat-time">{formatTime(msg.created_at)}</span>
                  </div>
                  <p>{msg.content}</p>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="chat-input">
        <textarea
          ref={inputRef}
          placeholder={`Message ${otherName}…`}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={sending}
        />
        <button
          className="chat-send"
          type="button"
          onClick={handleSend}
          disabled={!newMessage.trim() || sending}
          aria-label="Send message"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
