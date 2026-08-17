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

export default function YouthMessages() {
  const active = conversations.find((c) => c.active)!;

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
              <button className="new-message-btn" type="button">
                <PenSquare aria-hidden size={15} />
                New message
              </button>
            </div>

            <label className="conversations-search">
              <Search aria-hidden size={16} />
              <input type="search" placeholder="Search messages..." />
              <button type="button" aria-label="Filter conversations">
                <SlidersHorizontal aria-hidden size={15} />
              </button>
            </label>

            <div className="conversation-list">
              {conversations.map((c) => (
                <button
                  className={`conversation-item ${c.active ? "active" : ""}`}
                  key={c.id}
                  type="button"
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
                    {active.role} • {active.location}
                  </em>
                </span>
              </div>
            </header>

            <div className="chat-messages">
              <div className="date-divider">May 12, 2025</div>
              {conversationMessages.map((m) => (
                <div
                  className={`chat-bubble-row ${m.from === "me" ? "mine" : ""}`}
                  key={m.id}
                >
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
              <textarea placeholder="Type your message..." rows={1} />
              <div className="composer-tools">
                <span className="composer-attach">
                  <button type="button" aria-label="Attach a file">
                    <Paperclip aria-hidden size={17} />
                  </button>
                  <button type="button" aria-label="Record a voice message">
                    <Mic aria-hidden size={17} />
                  </button>
                </span>
                <button className="composer-send" type="button" aria-label="Send message">
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
              <button type="button">Notify my officer</button>
            </footer>
          </section>
        </div>
      </div>
    </YouthShell>
  );
}
