"use client";

import { Fragment, type ReactNode } from "react";
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";
import { getPhotoUrl } from "@/lib/photos";
import { initials } from "@/lib/case-status";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="page-header">
      <div>
        {eyebrow ? <span className="page-eyebrow">{eyebrow}</span> : null}
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {actions ? <div className="page-actions">{actions}</div> : null}
    </header>
  );
}

const ALERT_ICONS = {
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  error: AlertCircle,
};

export function Alert({
  tone = "info",
  title,
  children,
  className = "",
}: {
  tone?: keyof typeof ALERT_ICONS;
  title?: string;
  children?: ReactNode;
  className?: string;
}) {
  const Icon = ALERT_ICONS[tone];
  return (
    <div className={`alert alert-${tone} ${className}`} role={tone === "error" ? "alert" : "status"}>
      <Icon aria-hidden size={18} />
      <div>
        {title ? <strong>{title}</strong> : null}
        {children ? <div>{children}</div> : null}
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  children,
  action,
}: {
  icon: ReactNode;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      <span className="empty-icon">{icon}</span>
      <h2>{title}</h2>
      {children ? <p>{children}</p> : null}
      {action}
    </div>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <>
      <span className="spinner" aria-hidden />
      {label ? <span className="visually-hidden">{label}</span> : null}
    </>
  );
}

export function Skeleton({ height = 16, width = "100%", radius }: { height?: number; width?: number | string; radius?: number }) {
  return <div className="skeleton-block" style={{ height, width, borderRadius: radius }} aria-hidden />;
}

export function PageSkeleton() {
  return (
    <div className="page-loading" aria-busy="true" aria-label="Loading">
      <Skeleton height={28} width={240} />
      <Skeleton height={16} width={360} />
      <Skeleton height={140} radius={12} />
      <Skeleton height={220} radius={12} />
    </div>
  );
}

export function Avatar({
  name,
  email,
  size = "",
}: {
  name: string | null | undefined;
  email?: string | null;
  size?: "" | "sm" | "lg";
}) {
  const photo = getPhotoUrl(email);
  return (
    <span className={`avatar ${size ? `avatar-${size}` : ""}`}>
      {photo ? <img src={photo} alt="" /> : <span aria-hidden>{initials(name)}</span>}
    </span>
  );
}

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label || "Progress"}>
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}

/* ---------- Minimal, safe Markdown for AI answers ---------- */

function renderInline(text: string, onCite?: (n: number) => ReactNode): ReactNode[] {
  const parts: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|\[\d+(?:\s*,\s*\d+)*\])/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text))) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    const token = match[0];
    if (token.startsWith("**")) {
      parts.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
    } else {
      const numbers = token.slice(1, -1).split(",").map((n) => parseInt(n.trim(), 10));
      parts.push(
        <Fragment key={key++}>
          {numbers.map((n) => (onCite ? <Fragment key={n}>{onCite(n)}</Fragment> : null))}
        </Fragment>,
      );
    }
    last = match.index + token.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

/**
 * Renders paragraphs, "- " / "* " bullet lists, "1. " numbered lists, **bold**
 * and [n] citations. Everything is rendered as React text — no raw HTML.
 */
export function RichText({ text, onCite }: { text: string; onCite?: (n: number) => ReactNode }) {
  const blocks: ReactNode[] = [];
  const lines = text.replace(/\r/g, "").split("\n");
  let list: { ordered: boolean; items: string[] } | null = null;
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push(<p key={blocks.length}>{renderInline(paragraph.join(" "), onCite)}</p>);
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list) {
      const items = list.items.map((item, i) => <li key={i}>{renderInline(item, onCite)}</li>);
      blocks.push(list.ordered ? <ol key={blocks.length}>{items}</ol> : <ul key={blocks.length}>{items}</ul>);
      list = null;
    }
  };

  for (const raw of lines) {
    const line = raw.trim().replace(/^#{1,6}\s+/, "");
    const bullet = line.match(/^[-*•]\s+(.*)$/);
    const numbered = line.match(/^\d+[.)]\s+(.*)$/);

    if (!line) {
      flushParagraph();
      flushList();
    } else if (bullet || numbered) {
      flushParagraph();
      const ordered = !!numbered;
      if (list && list.ordered !== ordered) flushList();
      if (!list) list = { ordered, items: [] };
      list.items.push((bullet || numbered)![1]);
    } else {
      flushList();
      paragraph.push(line);
    }
  }
  flushParagraph();
  flushList();

  return <div className="prose">{blocks}</div>;
}
