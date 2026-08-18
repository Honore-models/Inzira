"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Clock,
  Sparkles,
  TrendingUp,
  Users,
  ShieldCheck,
} from "lucide-react";
import { DateSelector } from "@/components/officer/DateSelector";
import { OfficerAvatar, OfficerShell } from "@/components/officer/OfficerShell";
import { getPhotoUrl } from "@/lib/photos";

interface YouthProfile {
  id: string;
  full_name: string;
  email: string;
  goal: string;
  district: string;
  onboarding_completed: boolean;
  youth_cases: { id: string; status: string; current_step: number; total_steps: number }[];
}

interface YouthCase {
  id: string;
  status: string;
  current_step: number;
  total_steps: number;
  created_at: string;
  youth: { full_name: string; email: string; goal: string; district: string } | null;
  officer: { full_name: string } | null;
}

const statIcons: Record<string, typeof Users> = {
  users: Users,
  sparkles: Sparkles,
  trending: TrendingUp,
  clock: Clock,
};

export default function OfficerDashboard() {
  const { data: session } = useSession();
  const userName = session?.user?.name || "Officer";
  const [youth, setYouth] = useState<YouthProfile[]>([]);
  const [cases, setCases] = useState<YouthCase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [youthRes, casesRes] = await Promise.all([
          fetch("/api/youth"),
          fetch("/api/cases"),
        ]);
        if (youthRes.ok) setYouth(await youthRes.json());
        if (casesRes.ok) setCases(await casesRes.json());
      } catch {
        // Silently handle errors
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const activeCases = cases.filter((c) => c.status === "active");
  const pendingCases = cases.filter((c) => c.status === "pending" || (c.status === "active" && c.current_step > 0));
  const waitingForRoadmap = youth.filter((y) => {
    const hasCase = y.youth_cases && y.youth_cases.length > 0;
    return y.onboarding_completed && !hasCase;
  });

  const stats = [
    {
      label: "Total youth",
      value: String(youth.length),
      change: "Registered in system",
      icon: "users",
      tone: "green",
    },
    {
      label: "Need roadmap",
      value: String(waitingForRoadmap.length),
      change: "Waiting for officer",
      icon: "sparkles",
      tone: "amber",
    },
    {
      label: "Active cases",
      value: String(activeCases.length),
      change: "In progress",
      icon: "clock",
      tone: "blue",
    },
    {
      label: "Completed",
      value: String(cases.filter((c) => c.status === "completed").length),
      change: "Successfully finished",
      icon: "trending",
      tone: "purple",
    },
  ];

  if (loading) {
    return (
      <OfficerShell active="Dashboard">
        <div className="officer-page-wrap">
          <div className="yd-loading">
            <div className="yd-loading-spinner" />
            <p>Loading dashboard…</p>
          </div>
        </div>
      </OfficerShell>
    );
  }

  return (
    <OfficerShell active="Dashboard">
      <div className="officer-page-wrap">
        <header className="officer-heading">
          <div>
            <h1>Good morning, {userName}</h1>
            <p>Here&apos;s what&apos;s happening in your caseload today.</p>
          </div>
          <DateSelector />
        </header>

        <section className="officer-stat-grid" aria-label="Caseload summary">
          {stats.map((stat) => {
            const Icon = statIcons[stat.icon];
            return (
              <article className={`officer-stat-card ${stat.tone}`} key={stat.label}>
                <div className="officer-stat-icon">
                  <Icon aria-hidden size={19} />
                </div>
                <div className="officer-stat-body">
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                  <p>{stat.change}</p>
                </div>
              </article>
            );
          })}
        </section>

        <section className="officer-dash-columns">
          <article className="officer-card pending-card">
            <header className="officer-card-header">
              <div>
                <h2>Youth needing attention</h2>
                <p>Youth who need a roadmap or follow-up</p>
              </div>
              <Link className="officer-text-link" href="/officer/youth">
                View all
              </Link>
            </header>
            <div className="pending-list">
              {/* Youth waiting for roadmap */}
              {waitingForRoadmap.slice(0, 3).map((y) => (
                <Link
                  className="pending-row"
                  href="/officer/youth"
                  key={y.id}
                >
                  <OfficerAvatar
                    avatar={{
                      label: y.full_name?.split(" ").map((w) => w[0]).join("") || "?",
                      bg: "#1f6f4c",
                      photo: getPhotoUrl(y.email) || undefined,
                    }}
                  />
                  <div className="pending-row-body">
                    <strong>{y.full_name}</strong>
                    <span>{y.goal || "No goal set"} — Needs roadmap</span>
                  </div>
                  <div className="pending-row-meta">
                    <span style={{ color: "#d4a017", fontSize: 12 }}>Waiting</span>
                  </div>
                </Link>
              ))}

              {/* Active cases */}
              {activeCases.slice(0, 3).map((item) => (
                <Link
                  className="pending-row"
                  href={`/officer/youth/${item.id}`}
                  key={item.id}
                >
                  <OfficerAvatar
                    avatar={{
                      label: item.youth?.full_name?.split(" ").map((w) => w[0]).join("") || "?",
                      bg: "#1f6f4c",
                      photo: getPhotoUrl(item.youth?.email) || undefined,
                    }}
                  />
                  <div className="pending-row-body">
                    <strong>{item.youth?.full_name || "Unknown"}</strong>
                    <span>{item.youth?.goal || "No goal set"}</span>
                  </div>
                  <div className="pending-row-meta">
                    <span>
                      Step {item.current_step}/{item.total_steps}
                    </span>
                    <i className="pending-dot" title="In progress" />
                  </div>
                </Link>
              ))}

              {waitingForRoadmap.length === 0 && activeCases.length === 0 && (
                <p style={{ color: "#545d65", fontSize: 13, padding: "16px", textAlign: "center" }}>
                  No youth in your caseload yet. Youth will appear here after they sign up.
                </p>
              )}
            </div>
          </article>

          <article className="officer-card weekly-card">
            <header className="officer-card-header">
              <div>
                <h2>Caseload overview</h2>
                <p>Summary of all youth cases</p>
              </div>
            </header>
            <div className="caseload-summary">
              <div className="caseload-stat">
                <strong>{activeCases.length}</strong>
                <span>Active</span>
              </div>
              <div className="caseload-stat">
                <strong>{cases.filter((c) => c.status === "completed").length}</strong>
                <span>Completed</span>
              </div>
              <div className="caseload-stat">
                <strong>{waitingForRoadmap.length}</strong>
                <span>Needs roadmap</span>
              </div>
            </div>
          </article>
        </section>

        <aside className="officer-banner">
          <span className="officer-banner-icon">
            <ShieldCheck aria-hidden size={22} />
          </span>
          <div>
            <strong>You&apos;re the final decision-maker.</strong>
            <p>
              All roadmaps are drafts until you review and approve them. The
              youth only sees approved steps.
            </p>
          </div>
        </aside>
      </div>
    </OfficerShell>
  );
}
