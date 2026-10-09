"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowRight, CheckCircle2, ClipboardList, Compass, MessageCircle, TrendingUp, Users } from "lucide-react";
import { Alert, Avatar, EmptyState, PageHeader, PageSkeleton, ProgressBar } from "@/components/ui";
import { api } from "@/lib/api-client";
import { completedSteps, progressPercent, type YouthStatus } from "@/lib/case-status";
import { firstName, formatRelative, greeting } from "@/lib/format";

interface YouthRow {
  id: string;
  full_name: string;
  email: string;
  goal: string | null;
  district: string | null;
  onboarding_submitted_at: string | null;
  created_at: string;
  status: YouthStatus;
  case: { id: string; status: string; current_step: number; total_steps: number; officer_profile_id: string | null } | null;
}

interface CaseRow {
  id: string;
  youth_profile_id: string;
  officer_profile_id: string | null;
  youth: { full_name: string; email: string } | null;
  lastMessage: { content: string; created_at: string; sender_role: string } | null;
  unreadCount: number;
}

export default function OfficerDashboard() {
  const { data: session } = useSession();
  const [youth, setYouth] = useState<YouthRow[] | null>(null);
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api<YouthRow[]>("/api/youth"), api<CaseRow[]>("/api/cases")])
      .then(([y, c]) => {
        setYouth(y);
        setCases(c);
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <Alert tone="error" title="We couldn't load your dashboard">{error}</Alert>;
  if (!youth) return <PageSkeleton />;

  const me = session?.user?.profileId;
  const count = (s: YouthStatus) => youth.filter((y) => y.status === s).length;
  const queue = youth
    .filter((y) => y.status === "needs_roadmap")
    .sort((a, b) => (a.onboarding_submitted_at || a.created_at).localeCompare(b.onboarding_submitted_at || b.created_at));
  const active = youth
    .filter((y) => y.status === "in_progress" && (!me || !y.case?.officer_profile_id || y.case.officer_profile_id === me))
    .sort((a, b) => progressPercent(a.case) - progressPercent(b.case));
  const unreadConvos = cases.filter((c) => c.unreadCount > 0 && (!c.officer_profile_id || c.officer_profile_id === me));

  const stats = [
    { label: "Registered youth", value: youth.length, hint: `${count("not_onboarded")} still onboarding`, icon: Users, tone: "green" },
    { label: "Need a roadmap", value: count("needs_roadmap"), hint: "Waiting for review", icon: ClipboardList, tone: "amber" },
    { label: "In progress", value: count("in_progress"), hint: "Following a roadmap", icon: TrendingUp, tone: "blue" },
    { label: "Completed", value: count("completed"), hint: "Finished every step", icon: CheckCircle2, tone: "purple" },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Officer workspace"
        title={`${greeting()}, ${firstName(session?.user?.name)}`}
        description="Here's who needs you today."
        actions={
          <Link className="btn btn-primary" href="/officer/intake">
            <Compass size={16} aria-hidden /> New Smart Intake
          </Link>
        }
      />

      <section className="stat-grid" aria-label="Caseload summary">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <article className={`stat tone-${s.tone}`} key={s.label}>
              <div className="stat-top">
                <span>{s.label}</span>
                <span className="stat-icon">
                  <Icon size={17} aria-hidden />
                </span>
              </div>
              <strong>{s.value}</strong>
              <small>{s.hint}</small>
            </article>
          );
        })}
      </section>

      <div className="grid-2">
        <section className="card">
          <header className="card-header">
            <div>
              <h2>Roadmap queue</h2>
              <p>Onboarded youth waiting for a roadmap, oldest first</p>
            </div>
            <Link className="btn btn-ghost btn-sm" href="/officer/youth?status=needs_roadmap">
              View all
            </Link>
          </header>
          {queue.length === 0 ? (
            <EmptyState icon={<CheckCircle2 size={24} />} title="Queue is clear">
              Every onboarded youth has a roadmap.
            </EmptyState>
          ) : (
            queue.slice(0, 5).map((y) => (
              <div className="list-row" key={y.id}>
                <Avatar name={y.full_name} email={y.email} />
                <Link className="list-row-body" href={`/officer/youth/${y.id}`}>
                  <strong>{y.full_name}</strong>
                  <span>
                    {y.goal || "No goal"} · {y.district || "No district"} · submitted {formatRelative(y.onboarding_submitted_at || y.created_at)}
                  </span>
                </Link>
                <Link className="btn btn-secondary btn-sm" href={`/officer/intake?youthId=${y.id}`}>
                  Start intake
                </Link>
              </div>
            ))
          )}
        </section>

        <section className="card">
          <header className="card-header">
            <div>
              <h2>Unread messages</h2>
              <p>Youth waiting for a reply</p>
            </div>
            <Link className="btn btn-ghost btn-sm" href="/officer/messages">
              Open inbox
            </Link>
          </header>
          {unreadConvos.length === 0 ? (
            <EmptyState icon={<MessageCircle size={24} />} title="You're all caught up">
              New messages from youth will appear here.
            </EmptyState>
          ) : (
            unreadConvos.slice(0, 5).map((c) => (
              <Link className="list-row" href={`/officer/messages?case=${c.id}`} key={c.id}>
                <Avatar name={c.youth?.full_name} email={c.youth?.email} />
                <div className="list-row-body">
                  <strong>{c.youth?.full_name || "Youth"}</strong>
                  <span>{c.lastMessage?.content}</span>
                </div>
                <div className="list-row-meta">
                  <span>{formatRelative(c.lastMessage?.created_at)}</span>
                  <span className="unread-count">{c.unreadCount}</span>
                </div>
              </Link>
            ))
          )}
        </section>
      </div>

      <section className="card" style={{ marginTop: 16 }}>
        <header className="card-header">
          <div>
            <h2>Active roadmaps</h2>
            <p>Youth following a roadmap, least progress first</p>
          </div>
          <Link className="btn btn-ghost btn-sm" href="/officer/youth?status=in_progress">
            View all
          </Link>
        </header>
        {active.length === 0 ? (
          <EmptyState icon={<TrendingUp size={24} />} title="No active roadmaps yet">
            Approve a roadmap from Smart Intake and it will be tracked here.
          </EmptyState>
        ) : (
          active.slice(0, 6).map((y) => (
            <Link className="list-row" href={`/officer/youth/${y.id}`} key={y.id}>
              <Avatar name={y.full_name} email={y.email} />
              <div className="list-row-body">
                <strong>{y.full_name}</strong>
                <span>{y.goal || "No goal"}</span>
              </div>
              <div className="progress-row" style={{ width: 200 }}>
                <ProgressBar value={progressPercent(y.case)} />
                <span>
                  {completedSteps(y.case)}/{y.case?.total_steps}
                </span>
              </div>
              <ArrowRight size={16} className="muted" aria-hidden />
            </Link>
          ))
        )}
      </section>

      <div style={{ marginTop: 16 }}>
        <Alert tone="success" title="You are the final decision-maker">
          AI-generated roadmaps are drafts. A youth only sees steps after you review and approve them.
        </Alert>
      </div>
    </>
  );
}
