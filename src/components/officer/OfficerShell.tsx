"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Home,
  Library,
  LogOut,
  MessageCircle,
  Sparkles,
  Users,
} from "lucide-react";
import { officerProfile } from "@/data/officer";

const navItems = [
  { href: "/officer", label: "Dashboard", icon: Home },
  { href: "/officer/intake", label: "Smart Intake", icon: Sparkles },
  { href: "/officer/youth", label: "Youth List", icon: Users },
  { href: "/officer/messages", label: "Messages", icon: MessageCircle, badge: 3 },
  { href: "/officer/library", label: "Verified Library", icon: Library },
];

export function OfficerShell({
  active,
  children,
}: {
  active: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  function handleLogout() {
    if (window.confirm("Log out of the officer workspace?")) {
      router.push("/");
    }
  }

  return (
    <main className="officer-app">
      <aside className="officer-sidebar">
        <Link className="officer-logo" href="/officer">
          <img src="/inzira_logo.png" alt="Inzira" />
        </Link>

        <nav className="officer-nav" aria-label="Officer navigation">
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
                {item.badge ? <small>{item.badge}</small> : null}
              </Link>
            );
          })}
        </nav>

        <div className="officer-sidebar-spacer" />

        <div className="officer-profile">
          <img src={officerProfile.photo} alt={officerProfile.name} />
          <div>
            <strong>{officerProfile.name}</strong>
            <span>{officerProfile.role}</span>
            <span>{officerProfile.district}</span>
          </div>
          <button
            className="officer-logout"
            type="button"
            onClick={handleLogout}
            title="Log out"
          >
            <LogOut aria-hidden size={16} />
            Log out
          </button>
        </div>
      </aside>
      <section className="officer-content">{children}</section>
    </main>
  );
}

export function OfficerAvatar({
  avatar,
  size = "",
}: {
  avatar: { label: string; bg: string; photo?: string };
  size?: "small" | "large" | "";
}) {
  if (avatar.photo) {
    return (
      <span className={`officer-avatar photo ${size}`}>
        <img src={avatar.photo} alt={avatar.label} />
      </span>
    );
  }
  return (
    <span
      className={`officer-avatar ${size}`}
      style={{ background: avatar.bg }}
    >
      {avatar.label}
    </span>
  );
}

export function OfficerStepper({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) {
  return (
    <ol className="officer-stepper" aria-label="Intake progress">
      {steps.map((step, index) => {
        const done = index + 1 < current;
        const active = index + 1 === current;
        return (
          <li
            className={`${done ? "done" : ""} ${active ? "active" : ""}`}
            key={step}
          >
            <span>{done ? "✓" : index + 1}</span>
            <p>{step}</p>
            {index < steps.length - 1 ? <i /> : null}
          </li>
        );
      })}
    </ol>
  );
}
