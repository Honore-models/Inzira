"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function LogoutButton({
  className = "",
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  function handleLogout() {
    if (window.confirm("Log out of Inzira?")) {
      signOut({ callbackUrl: "/" });
    }
  }

  return (
    <button className={className} type="button" onClick={handleLogout} title="Log out">
      <LogOut aria-hidden size={16} />
      {compact ? null : <span>Log out</span>}
    </button>
  );
}
