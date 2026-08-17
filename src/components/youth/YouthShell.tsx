import Link from "next/link";
import {
  ChevronDown,
  Globe2,
  HelpCircle,
  Home,
  Lightbulb,
  ListChecks,
  MessageCircle,
  UserRound,
  Volume2,
} from "lucide-react";

const navItems = [
  { href: "/youth", label: "Home", icon: Home },
  { href: "/youth/steps", label: "My Steps", icon: ListChecks },
  { href: "/youth/ask", label: "Ask", icon: HelpCircle },
  { href: "/youth/find-help", label: "Find Help", icon: Lightbulb },
];

export function YouthShell({
  active,
  children,
}: {
  active: string;
  children: React.ReactNode;
}) {
  return (
    <main className="youth-app">
      <aside className="youth-sidebar">
        <Link className="youth-logo" href="/youth">
          <img src="/inzira_logo.png" alt="Inzira" />
        </Link>

        <nav className="youth-nav" aria-label="Youth navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                className={active === item.label ? "active" : ""}
                href={item.href}
                key={item.href}
              >
                <Icon aria-hidden size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="youth-sidebar-spacer" />

        <div className="youth-nav secondary">
          <Link href="/youth/ask">
            <MessageCircle aria-hidden size={18} />
            <span>Messages</span>
            <small>2</small>
          </Link>
          <Link href="/youth/profile">
            <UserRound aria-hidden size={18} />
            <span>My Profile</span>
          </Link>
        </div>

        <button className="read-button sidebar-read-button" type="button">
          <Volume2 aria-hidden size={16} />
          Read aloud
        </button>
        <button className="language-button" type="button">
          <Globe2 aria-hidden size={16} />
          English
          <ChevronDown aria-hidden size={14} />
        </button>
      </aside>
      <section className="youth-content">{children}</section>
    </main>
  );
}

export function ProgressMeter({
  value,
  label,
  showHeader = false,
}: {
  value: number;
  label: string;
  showHeader?: boolean;
}) {
  return (
    <div className="progress-meter" aria-label={label}>
      {showHeader ? (
        <div className="progress-meter-header">
          <span>{label}</span>
          <strong>{value}%</strong>
        </div>
      ) : null}
      <div className="meter-track">
        <span style={{ width: `${value}%` }} />
      </div>
      {!showHeader ? <span className="meter-caption">{label}</span> : null}
    </div>
  );
}
