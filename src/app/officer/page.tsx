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
import {
  dashboardStats,
  officerProfile,
  pendingApprovals,
  weeklySteps,
} from "@/data/officer";

const statIcons: Record<string, typeof Users> = {
  users: Users,
  sparkles: Sparkles,
  trending: TrendingUp,
  clock: Clock,
};

export default function OfficerDashboard() {
  const maxWeekly = Math.max(...weeklySteps.map((d) => d.value));

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
          {dashboardStats.map((stat) => {
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
              {pendingApprovals.map((item) => (
                <Link
                  className="pending-row"
                  href={`/officer/youth/${item.id}`}
                  key={item.id}
                >
                  <OfficerAvatar avatar={item.avatar} />
                  <div className="pending-row-body">
                    <strong>{item.name}</strong>
                    <span>{item.goal}</span>
                  </div>
                  <div className="pending-row-meta">
                    <span>
                      {item.steps} • {item.time}
                    </span>
                    <i className="pending-dot" title="Needs review" />
                  </div>
                </Link>
              ))}
            </div>
            <footer className="pending-footer">
              <Link href="/officer/youth">See all pending (7)</Link>
            </footer>
          </article>

          <article className="officer-card weekly-card">
            <header className="officer-card-header">
              <div>
                <h2>Steps completed this week</h2>
                <p>Across all active youth</p>
              </div>
              <span className="officer-chip">+32 this week</span>
            </header>
            <div className="bar-chart" aria-label="Steps completed per day">
              {weeklySteps.map((day) => (
                <div className="bar-column" key={day.day}>
                  <span className="bar-value">{day.value}</span>
                  <div className="bar-track">
                    <span
                      style={{
                        height: `${Math.round((day.value / maxWeekly) * 100)}%`,
                      }}
                    />
                  </div>
                  <small>{day.day}</small>
                </div>
              ))}
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
