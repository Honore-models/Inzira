"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { OfficerAvatar, OfficerShell } from "@/components/officer/OfficerShell";
import { officerMessages } from "@/data/officer";

export default function OfficerMessages() {
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const visible = officerMessages.filter((chat) =>
    `${chat.name} ${chat.preview}`.toLowerCase().includes(q),
  );

  return (
    <OfficerShell active="Messages">
      <div className="officer-page-wrap">
        <header className="officer-heading">
          <div>
            <h1>Messages</h1>
            <p>Conversations with the youth in your caseload.</p>
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
              <article className="inbox-row" key={chat.id}>
                <OfficerAvatar avatar={chat.avatar} />
                <div className="inbox-row-body">
                  <strong>{chat.name}</strong>
                  <p>{chat.preview}</p>
                </div>
                <div className="inbox-row-meta">
                  <span>{chat.time}</span>
                  {chat.unread ? <small>{chat.unread}</small> : null}
                </div>
              </article>
            ))}
            {visible.length === 0 ? (
              <p className="inbox-empty">No conversations match your search.</p>
            ) : null}
          </div>
        </section>
      </div>
    </OfficerShell>
  );
}
