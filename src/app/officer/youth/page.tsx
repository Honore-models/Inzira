"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { OfficerShell } from "@/components/officer/OfficerShell";
import { getPhotoUrl } from "@/lib/photos";

interface YouthProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  goal: string;
  skills: string;
  skills_background: string;
  situation: string;
  district: string;
  sector: string;
  onboarding_completed: boolean;
  onboarding_submitted_at: string | null;
  created_at: string;
  youth_cases: {
    id: string;
    status: string;
    current_step: number;
    total_steps: number;
    officer_profile_id: string | null;
  }[] | null;
}

export default function OfficerYouthList() {
  const [youth, setYouth] = useState<YouthProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/youth");
        if (res.ok) {
          setYouth(await res.json());
        }
      } catch {
        // Silently handle errors
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Determine status for each youth
  function getStatus(y: YouthProfile): string {
    const youthCase = y.youth_cases?.[0];
    if (youthCase) {
      if (youthCase.status === "active" && youthCase.total_steps > 0) return "active";
      if (youthCase.status === "completed") return "completed";
      if (youthCase.status === "pending") return "pending";
    }
    if (!y.onboarding_completed) return "new";
    return "waiting";
  }

  const filtered = youth.filter((y) => {
    const status = getStatus(y);
    const matchesFilter = filter === "all" || status === filter;
    const q = search.trim().toLowerCase();
    const matchesSearch = !q ||
      y.full_name.toLowerCase().includes(q) ||
      y.email.toLowerCase().includes(q) ||
      (y.goal || "").toLowerCase().includes(q) ||
      (y.district || "").toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const statusCounts = {
    all: youth.length,
    waiting: youth.filter((y) => getStatus(y) === "waiting").length,
    pending: youth.filter((y) => getStatus(y) === "pending").length,
    active: youth.filter((y) => getStatus(y) === "active").length,
    completed: youth.filter((y) => getStatus(y) === "completed").length,
    new: youth.filter((y) => getStatus(y) === "new").length,
  };

  if (loading) {
    return (
      <OfficerShell active="Youth List">
        <div className="officer-page-wrap">
          <div className="yd-loading">
            <div className="yd-loading-spinner" />
            <p>Loading youth list…</p>
          </div>
        </div>
      </OfficerShell>
    );
  }

  return (
    <OfficerShell active="Youth List">
      <div className="officer-page-wrap">
        <header className="officer-heading">
          <div>
            <h1>Youth List</h1>
            <p>All youth registered in the system. Review and follow up.</p>
          </div>
          <div className="officer-heading-actions">
            <Link className="officer-button primary" href="/officer/intake">
              <Plus aria-hidden size={15} />
              Add new youth
            </Link>
          </div>
        </header>

        <div className="officer-card" style={{ padding: 0 }}>
          {/* Search */}
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #eef0ed" }}>
            <input
              type="search"
              placeholder="Search by name, email, goal, or district…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                border: "1px solid #e2e5df",
                borderRadius: 8,
                fontSize: 14,
                padding: "10px 14px",
                width: "100%",
                outline: "none",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#1f6f4c")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e5df")}
            />
          </div>

          {/* Filter tabs */}
          <div className="youth-filter-tabs">
            {(["all", "waiting", "pending", "active", "completed", "new"] as const).map((f) => (
              <button
                key={f}
                className={filter === f ? "active" : ""}
                type="button"
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                <span>{statusCounts[f]}</span>
              </button>
            ))}
          </div>

          {/* Youth table */}
          <div className="youth-table-wrap">
            <table className="youth-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Goal</th>
                  <th>District</th>
                  <th>Progress</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((y) => {
                  const name = y.full_name || "Unknown";
                  const initials = name.split(" ").map((w) => w[0]).join("");
                  const youthCase = y.youth_cases?.[0];
                  const status = getStatus(y);
                  const pct = youthCase && youthCase.total_steps > 0
                    ? Math.round((youthCase.current_step / youthCase.total_steps) * 100)
                    : 0;

                  const statusLabels: Record<string, string> = {
                    waiting: "Needs roadmap",
                    pending: "Officer review",
                    active: "In progress",
                    completed: "Completed",
                    new: "Not onboarded",
                  };

                  return (
                    <tr key={y.id}>
                      <td>
                        <div className="youth-name-cell">
                          <div className={`youth-avatar ${getPhotoUrl(y.email) ? "" : "initials"}`}>
                            {getPhotoUrl(y.email) ? (
                              <img src={getPhotoUrl(y.email)!} alt={name} />
                            ) : (
                              initials
                            )}
                          </div>
                          <div className="youth-info">
                            <strong>{name}</strong>
                            <span>{y.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>{y.goal || "—"}</td>
                      <td>{y.district || "—"}{y.sector ? ` • ${y.sector}` : ""}</td>
                      <td>
                        {youthCase && youthCase.total_steps > 0 ? (
                          <div className="progress-cell">
                            <div className="progress-bar-wrap">
                              <div
                                className="progress-bar-fill"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span>{youthCase.current_step}/{youthCase.total_steps}</span>
                          </div>
                        ) : (
                          <span style={{ color: "#a0a8a5", fontSize: 12 }}>—</span>
                        )}
                      </td>
                      <td>
                        <span className={`status-badge ${status}`}>
                          {statusLabels[status] || status}
                        </span>
                      </td>
                      <td>
                        {youthCase ? (
                          <Link
                            className={status === "waiting" || status === "new" ? "generate-link" : "officer-text-link"}
                            href={`/officer/youth/${youthCase.id}`}
                          >
                            {status === "waiting" || status === "new" ? "Generate Roadmap" : "View"}
                          </Link>
                        ) : (
                          <Link
                            className="generate-link"
                            href={`/officer/intake?youthId=${y.id}`}
                          >
                            Generate Roadmap
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="youth-table-empty">
                      No youth found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </OfficerShell>
  );
}
