import Link from "next/link";
import {
  ChevronDown,
  Globe2,
  HelpCircle,
  Home,
  ListChecks,
  MessageCircle,
  PanelLeft,
  Search,
  UserRound,
  Volume2,
} from "lucide-react";
import { youthCase } from "@/data/youth";

const navItems = [
  { href: "/youth", label: "Home", icon: Home },
  { href: "/youth/steps", label: "My Steps", icon: ListChecks },
  { href: "/youth/ask", label: "Ask", icon: HelpCircle },
  { href: "/youth/find-help", label: "Find Help", icon: Search },
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
        <div className="sidebar-brand-row">
          <Link className="youth-logo" href="/youth">
            Inzira
          </Link>
          <PanelLeft aria-hidden size={18} />
        </div>

        <div className="youth-profile-card">
          <div>{youthCase.youth.name.slice(0, 1)}</div>
          <span>
            <strong>{youthCase.youth.name}</strong>
            {youthCase.youth.district} District
          </span>
        </div>

        <nav className="youth-nav" aria-label="Youth navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                className={active === item.label ? "active" : ""}
                href={item.href}
                key={item.href}
              >
                <Icon aria-hidden size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="youth-sidebar-spacer" />

        <div className="youth-nav secondary">
          <Link href="/youth/ask">
            <MessageCircle aria-hidden size={16} />
            <span>Messages</span>
            <small>2</small>
          </Link>
          <Link href="/youth/profile">
            <UserRound aria-hidden size={16} />
            <span>My Profile</span>
          </Link>
        </div>

        <button className="read-button" type="button">
          <Volume2 aria-hidden size={15} />
          Read aloud
        </button>
        <button className="language-button" type="button">
          <Globe2 aria-hidden size={15} />
          English
          <ChevronDown aria-hidden size={14} />
        </button>
      </aside>
      <section className="youth-content">
        <header className="youth-topbar">
          <div>
            <span>Representative youth case</span>
            <strong>{youthCase.youth.goal}</strong>
          </div>
          <div>
            <span>Officer</span>
            <strong>{youthCase.youth.officer}</strong>
          </div>
        </header>
        {children}
      </section>
    </main>
  );
}

export function ProgressMeter({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div className="progress-meter" aria-label={label}>
      <div>
        <span>{label}</span>
        <strong>{value}%</strong>
      </div>
      <div className="meter-track">
        <span style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
