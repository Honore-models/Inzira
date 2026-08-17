"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Clock,
  Sparkles,
  TrendingUp,
  Users,
  ShieldCheck,
} from "lucide-react";
import { DateSelector } from "@/components/officer/DateSelector";
import { OfficerAvatar, OfficerShell } from "@/components/officer/OfficerShell";
import { officerProfile } from "@/data/officer";

interface YouthCase {
  id: string;
  status: string;
  current_step: number;
  total_steps: number;
  created_at: string;
  youth: {
    full_name: string;
    goal: string;
    district: string;
  } | null;
  officer: {
    full_name: string;
  } | null;
}

const statIcons: Record<string, typeof Users> = {
  users: Users,
  sparkles: Sparkles,
  trending: TrendingUp,
  clock: Clock,
};

export default function OfficerDashboard() {
  const [cases, setCases] = useState<YouthCase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/cases");
        if (res.ok) {
          const data = await res.json();
          setCases(data);
        }
      } catch {
        // Silently handle errors
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const activeCases = cases.filter((c) => c.status === "active");
  const pendingCases = cases.filter((c) => c.status === "active" && c.current_step > 0);

  const stats = [
    {
      label: "Active youth",
      value: String(activeCases.length),
      change: "Currently in your caseload",
      icon: "users",
      tone: "green",
    },
    {
      label: "Pending approvals",
      value: String(pendingCases.length),
      change: "Requires your review",
      icon: "clock",
      tone: "amber",
    },
    {
      label: "Total cases",
      value: String(cases.length),
      change: "All time",
      icon: "sparkles",
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
            <h1>Good morning, {officerProfile.name}</h1>
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
                <h2>Pending roadmap approvals</h2>
                <p>Roadmaps waiting for your review</p>
              </div>
              <Link className="officer-text-link" href="/officer/youth">
                View all
              </Link>
            </header>
            <div className="pending-list">
              {activeCases.slice(0, 5).map((item) => (
                <Link
                  className="pending-row"
                  href={`/officer/youth/${item.id}`}
                  key={item.id}
                >
                  <OfficerAvatar
                    avatar={{
                      label: item.youth?.full_name?.split(" ").map((w) => w[0]).join("") || "?",
                      bg: "#1f6f4c",
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
                    <i className="pending-dot" title="Needs review" />
                  </div>
                </Link>
              ))}
              {activeCases.length === 0 && (
                <p style={{ color: "#545d65", fontSize: 13, padding: "16px", textAlign: "center" }}>
                  No active cases yet. Create one from the Smart Intake page.
                </p>
              )}
            </div>
            {activeCases.length > 5 && (
              <footer className="pending-footer">
                <Link href="/officer/youth">See all ({activeCases.length})</Link>
              </footer>
            )}
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
                <strong>{cases.filter((c) => c.status === "archived").length}</strong>
                <span>Archived</span>
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
