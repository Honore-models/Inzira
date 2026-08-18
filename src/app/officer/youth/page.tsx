"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { OfficerShell } from "@/components/officer/OfficerShell";

interface YouthCase {
  id: string;
  status: string;
  current_step: number;
  total_steps: number;
  created_at: string;
  youth: {
    full_name: string;
    email: string;
    goal: string;
    district: string;
    sector: string;
  } | null;
}

export default function OfficerYouthList() {
  const [cases, setCases] = useState<YouthCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/cases");
        if (res.ok) {
          setCases(await res.json());
        }
      } catch {
        // Silently handle errors
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered =
    filter === "all" ? cases : cases.filter((c) => c.status === filter);

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
            <p>All youth assigned to you.</p>
          </div>
          <div className="officer-heading-actions">
            <Link className="officer-button primary" href="/officer/intake">
              <Plus aria-hidden size={15} />
              Add new youth
            </Link>
          </div>
        </header>

        <div className="officer-card">
          {/* Filter tabs */}
          <div className="youth-filter-tabs">
            {["all", "active", "completed", "archived"].map((f) => (
              <button
                key={f}
                className={filter === f ? "active" : ""}
                type="button"
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                <span>
                  {f === "all"
                    ? cases.length
                    : cases.filter((c) => c.status === f).length}
                </span>
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
                {filtered.map((c) => {
                  const name = c.youth?.full_name || "Unknown";
                  const initials = name
                    .split(" ")
                    .map((w) => w[0])
                    .join("");
                  const pct =
                    c.total_steps > 0
                      ? Math.round((c.current_step / c.total_steps) * 100)
                      : 0;

                  return (
                    <tr key={c.id}>
                      <td>
                        <div className="youth-name-cell">
                          <span
                            className="officer-avatar small"
                            style={{ background: "#1f6f4c" }}
                          >
                            {initials}
                          </span>
                          <div>
                            <strong>{name}</strong>
                            <span>{c.youth?.email || ""}</span>
                          </div>
                        </div>
                      </td>
                      <td>{c.youth?.goal || "—"}</td>
                      <td>{c.youth?.district || "—"}</td>
                      <td>
                        <div className="progress-cell">
                          <div className="progress-bar-wrap">
                            <div
                              className="progress-bar-fill"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span>
                            {c.current_step}/{c.total_steps}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${c.status}`}>
                          {c.status}
                        </span>
                      </td>
                      <td>
                        <Link
                          className="officer-text-link"
                          href={`/officer/youth/${c.id}`}
                        >
                          View
                        </Link>
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
