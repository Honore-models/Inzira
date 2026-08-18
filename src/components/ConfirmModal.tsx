"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, LogOut, X } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  icon?: "logout" | "warning";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  icon = "warning",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Focus the cancel button when opened
  useEffect(() => {
    if (open) {
      cancelRef.current?.focus();
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape" && open) {
        onCancel();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onCancel]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div
        className="confirm-dialog"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          className="confirm-close"
          type="button"
          onClick={onCancel}
          aria-label="Close"
        >
          <X size={16} />
        </button>

        {/* Icon */}
        <div className={`confirm-icon ${variant}`}>
          {icon === "logout" ? (
            <LogOut size={24} />
          ) : (
            <AlertTriangle size={24} />
          )}
        </div>

        {/* Content */}
        <h2 id="confirm-title" className="confirm-title">
          {title}
        </h2>
        <p className="confirm-message">{message}</p>

        {/* Actions */}
        <div className="confirm-actions">
          <button
            ref={cancelRef}
            className="confirm-btn cancel"
            type="button"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            className={`confirm-btn confirm ${variant}`}
            type="button"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
