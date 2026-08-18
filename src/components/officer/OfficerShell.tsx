"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  Home,
  LogOut,
  MessageCircle,
  Sparkles,
  Users,
} from "lucide-react";
import { ConfirmModal } from "@/components/ConfirmModal";

const navItems = [
  { href: "/officer", label: "Dashboard", icon: Home },
  { href: "/officer/intake", label: "Smart Intake", icon: Sparkles },
  { href: "/officer/youth", label: "Youth List", icon: Users },
  { href: "/officer/messages", label: "Messages", icon: MessageCircle },
];

export function OfficerShell({
  active,
  children,
}: {
  active: string;
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const [showLogout, setShowLogout] = useState(false);

  const userName = session?.user?.name || "Officer";

  function handleLogout() {
    signOut({ callbackUrl: "/" });
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
              </Link>
            );
          })}
        </nav>

        <div className="officer-sidebar-spacer" />

        <div className="officer-profile">
          <span className="officer-avatar" style={{ background: "#1f6f4c" }}>
            {userName.split(" ").map((w) => w[0]).join("")}
          </span>
          <div>
            <strong>{userName}</strong>
            <span>Officer</span>
          </div>
          <button
            className="officer-logout"
            type="button"
            onClick={() => setShowLogout(true)}
            title="Log out"
          >
            <LogOut aria-hidden size={16} />
            Log out
          </button>
        </div>
      </aside>
      <section className="officer-content">{children}</section>

      <ConfirmModal
        open={showLogout}
        title="Log out?"
        message="Are you sure you want to log out of the officer workspace? You will need to sign in again to access your dashboard."
        confirmText="Log out"
        cancelText="Stay logged in"
        variant="danger"
        icon="logout"
        onConfirm={handleLogout}
        onCancel={() => setShowLogout(false)}
      />
    </main>
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
