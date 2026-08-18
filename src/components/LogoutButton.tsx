"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { ConfirmModal } from "@/components/ConfirmModal";

export function LogoutButton({
  className = "",
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const [showConfirm, setShowConfirm] = useState(false);

  function handleLogout() {
    signOut({ callbackUrl: "/" });
  }

  return (
    <>
      <button
        className={className}
        type="button"
        onClick={() => setShowConfirm(true)}
        title="Log out"
      >
        <LogOut aria-hidden size={16} />
        {compact ? null : <span>Log out</span>}
      </button>

      <ConfirmModal
        open={showConfirm}
        title="Log out?"
        message="Are you sure you want to log out? You will need to sign in again to access your account."
        confirmText="Log out"
        cancelText="Stay logged in"
        variant="danger"
        icon="logout"
        onConfirm={handleLogout}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
