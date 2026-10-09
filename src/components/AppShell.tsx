"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  BookOpen,
  Compass,
  Home,
  LayoutDashboard,
  LifeBuoy,
  ListChecks,
  LogOut,
  Menu,
  MessageCircle,
  Sparkles,
  UserRound,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { ConfirmModal } from "@/components/ConfirmModal";
import { SpeechReader } from "@/components/SpeechReader";
import { Avatar } from "@/components/ui";

type NavItem = { href: string; label: string; icon: LucideIcon; exact?: boolean; badge?: "unread" };

const NAV: Record<"youth" | "officer", { main: NavItem[]; account: NavItem[] }> = {
  youth: {
    main: [
      { href: "/youth", label: "Home", icon: Home, exact: true },
      { href: "/youth/steps", label: "My roadmap", icon: ListChecks },
      { href: "/youth/ask", label: "Ask Inzira", icon: Sparkles },
      { href: "/youth/find-help", label: "Find help", icon: LifeBuoy },
      { href: "/youth/messages", label: "Messages", icon: MessageCircle, badge: "unread" },
    ],
    account: [{ href: "/youth/profile", label: "My profile", icon: UserRound }],
  },
  officer: {
    main: [
      { href: "/officer", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { href: "/officer/youth", label: "Youth", icon: Users },
      { href: "/officer/intake", label: "Smart Intake", icon: Compass },
      { href: "/officer/messages", label: "Messages", icon: MessageCircle, badge: "unread" },
      { href: "/officer/library", label: "Knowledge library", icon: BookOpen },
    ],
    account: [{ href: "/officer/profile", label: "My profile", icon: UserRound }],
  },
};

const CHAT_PAGES = new Set(["/youth/ask", "/youth/messages"]);

function isActive(pathname: string, item: NavItem) {
  return item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function AppShell({ role, children }: { role: "youth" | "officer"; children: ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [unread, setUnread] = useState(0);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      try {
        const res = await fetch("/api/me/unread");
        if (res.ok && !cancelled) setUnread((await res.json()).unread || 0);
      } catch {
        /* the badge is best-effort */
      }
    }
    poll();
    const timer = window.setInterval(poll, 45_000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [pathname]);

  const nav = NAV[role];
  const name = session?.user?.name || "";

  const renderItem = (item: NavItem) => {
    const Icon = item.icon;
    const active = isActive(pathname, item);
    return (
      <Link key={item.href} href={item.href} className={active ? "active" : ""} aria-current={active ? "page" : undefined}>
        <Icon aria-hidden size={18} />
        <span>{item.label}</span>
        {item.badge === "unread" && unread > 0 ? (
          <span className="shell-nav-badge" aria-label={`${unread} unread`}>
            {unread > 99 ? "99+" : unread}
          </span>
        ) : null}
      </Link>
    );
  };

  return (
    <div className="app-shell">
      <div className="shell-topbar">
        <Link href={role === "officer" ? "/officer" : "/youth"} aria-label="Inzira home">
          <img src="/inzira_logo.png" alt="Inzira" />
        </Link>
        <button className="icon-button" type="button" onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open}>
          <Menu size={22} aria-hidden />
          {unread > 0 ? <span className="dot" aria-hidden /> : null}
        </button>
      </div>

      <div className={`shell-backdrop ${open ? "open" : ""}`} onClick={() => setOpen(false)} aria-hidden />

      <aside className={`shell-sidebar ${open ? "open" : ""}`} aria-label="Main navigation">
        <div className="shell-brand">
          <Link href={role === "officer" ? "/officer" : "/youth"} aria-label="Inzira home">
            <img src="/inzira_logo.png" alt="Inzira" />
          </Link>
          {role === "officer" ? <span className="shell-workspace">Officer</span> : null}
          {open ? (
            <button className="icon-button" type="button" onClick={() => setOpen(false)} aria-label="Close menu" style={{ marginLeft: "auto" }}>
              <X size={20} aria-hidden />
            </button>
          ) : null}
        </div>

        <nav className="shell-nav">{nav.main.map(renderItem)}</nav>
        <div className="shell-nav-label">Account</div>
        <nav className="shell-nav">{nav.account.map(renderItem)}</nav>

        <div className="shell-spacer" />

        <div className="shell-user">
          <Avatar name={name} email={session?.user?.email} />
          <div className="shell-user-info">
            <strong>{name || " "}</strong>
            <span>{role === "officer" ? "Youth officer" : "Youth member"}</span>
          </div>
          <button
            className="shell-logout"
            type="button"
            onClick={() => setConfirmLogout(true)}
            disabled={loggingOut}
            aria-label="Log out"
            title="Log out"
          >
            {loggingOut ? <span className="spinner" aria-hidden /> : <LogOut size={17} aria-hidden />}
          </button>
        </div>
      </aside>

      <main className="shell-main" id="main">
        <div className="shell-content">{children}</div>
      </main>

      {/* Read-aloud for youth pages; hidden on chat screens where it would cover the send button. */}
      {role === "youth" && !CHAT_PAGES.has(pathname) ? <SpeechReader /> : null}

      <ConfirmModal
        open={confirmLogout}
        title="Log out of Inzira?"
        message="You'll need to sign in again to continue."
        confirmText="Log out"
        cancelText="Cancel"
        variant="danger"
        icon="logout"
        onConfirm={async () => {
          setConfirmLogout(false);
          setLoggingOut(true);
          await signOut({ callbackUrl: "/" });
        }}
        onCancel={() => setConfirmLogout(false)}
      />
    </div>
  );
}
