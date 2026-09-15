"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  HelpCircle,
  Home,
  Lightbulb,
  ListChecks,
  MessageCircle,
  UserRound,
} from "lucide-react";
import { LogoutButton } from "@/components/LogoutButton";
import { SidebarControls } from "@/components/youth/SidebarControls";
import { UserAvatar } from "@/components/UserAvatar";

const navItems = [
  { href: "/youth", label: "Home", icon: Home },
  { href: "/youth/steps", label: "My Steps", icon: ListChecks },
  { href: "/youth/ask", label: "Ask", icon: HelpCircle },
  { href: "/youth/find-help", label: "Find Help", icon: Lightbulb },
];

const secondaryNavItems = [
  { href: "/youth/messages", label: "Messages", icon: MessageCircle },
  { href: "/youth/profile", label: "My Profile", icon: UserRound },
];

export function YouthShell({
  active,
  children,
}: {
  active: string;
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const userName = session?.user?.name || "You";
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
          {secondaryNavItems.map((item) => {
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
        </div>

        <SidebarControls />

        <div className="youth-profile">
          <UserAvatar />
          <div>
            <strong>{userName}</strong>
            <span>Youth</span>
          </div>
        </div>

        <LogoutButton className="youth-logout" />
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
