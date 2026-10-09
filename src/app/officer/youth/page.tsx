"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Users } from "lucide-react";
import { Alert, Avatar, EmptyState, PageHeader, PageSkeleton, ProgressBar } from "@/components/ui";
import { api } from "@/lib/api-client";
import { STATUS_LABELS, completedSteps, progressPercent, type YouthStatus } from "@/lib/case-status";
import { formatDate } from "@/lib/format";

interface YouthRow {
  id: string;
  full_name: string;
  email: string;
  goal: string | null;
  district: string | null;
  sector: string | null;
  created_at: string;
  status: YouthStatus;
  case: { id: string; current_step: number; total_steps: number; status: string } | null;
}

const FILTERS: ("all" | YouthStatus)[] = ["all", "needs_roadmap", "in_progress", "completed", "not_onboarded"];

function YouthList() {
  const router = useRouter();
  const params = useSearchParams();
  const initial = params.get("status");
  const [filter, setFilter] = useState<"all" | YouthStatus>(
    FILTERS.includes(initial as YouthStatus) ? (initial as YouthStatus) : "all",
  );
  const [query, setQuery] = useState("");
  const [youth, setYouth] = useState<YouthRow[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<YouthRow[]>("/api/youth").then(setYouth).catch((e) => setError(e.message));
  }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: youth?.length || 0 };
    for (const y of youth || []) c[y.status] = (c[y.status] || 0) + 1;
    return c;
  }, [youth]);

  if (error) return <Alert tone="error" title="We couldn't load the youth list">{error}</Alert>;
  if (!youth) return <PageSkeleton />;

  const q = query.trim().toLowerCase();
  const rows = youth.filter(
    (y) =>
      (filter === "all" || y.status === filter) &&
      (!q || `${y.full_name} ${y.email} ${y.goal || ""} ${y.district || ""}`.toLowerCase().includes(q)),
  );

  return (
    <>
      <PageHeader
        title="Youth"
        description="Everyone registered on Inzira. Open a profile to review their information, roadmap and progress."
      />

      <section className="card">
        <div className="toolbar">
          <div className="chip-row" role="tablist" aria-label="Filter by status">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                role="tab"
                aria-selected={filter === f}
                className={`chip ${filter === f ? "active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "All" : STATUS_LABELS[f]}
                <span className="count">{counts[f] || 0}</span>
              </button>
            ))}
          </div>
          <label className="search-input">
            <Search size={16} aria-hidden />
            <input
              className="input"
              type="search"
              placeholder="Search name, email, goal, district"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search youth"
            />
          </label>
        </div>

        {rows.length === 0 ? (
          <EmptyState icon={<Users size={24} />} title={youth.length ? "No youth match these filters" : "No youth registered yet"}>
            {youth.length
              ? "Try a different search or status."
              : "Youth appear here as soon as they create an account."}
          </EmptyState>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Goal</th>
                  <th>District</th>
                  <th>Progress</th>
                  <th>Status</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((y) => (
                  <tr key={y.id} onClick={() => router.push(`/officer/youth/${y.id}`)}>
                    <td>
                      <Link className="person" href={`/officer/youth/${y.id}`} onClick={(e) => e.stopPropagation()}>
                        <Avatar name={y.full_name} email={y.email} size="sm" />
                        <span className="person-text">
                          <strong>{y.full_name}</strong>
                          <span>{y.email}</span>
                        </span>
                      </Link>
                    </td>
                    <td>{y.goal || <span className="muted">—</span>}</td>
                    <td>{y.district ? y.district.replace(/\s*District$/, "") : <span className="muted">—</span>}</td>
                    <td style={{ minWidth: 150 }}>
                      {y.case && y.case.total_steps > 0 ? (
                        <div className="progress-row">
                          <ProgressBar value={progressPercent(y.case)} />
                          <span>
                            {completedSteps(y.case)}/{y.case.total_steps}
                          </span>
                        </div>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge badge-${y.status}`}>{STATUS_LABELS[y.status]}</span>
                    </td>
                    <td className="muted">{formatDate(y.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

export default function OfficerYouthPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <YouthList />
    </Suspense>
  );
}
