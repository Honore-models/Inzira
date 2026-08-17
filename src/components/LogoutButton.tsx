"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton({
  className = "",
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const router = useRouter();

  function handleLogout() {
    if (window.confirm("Log out of Inzira?")) {
      router.push("/");
    }
  }

  return (
    <button className={className} type="button" onClick={handleLogout} title="Log out">
      <LogOut aria-hidden size={16} />
      {compact ? null : <span>Log out</span>}
    </button>
  );
}
