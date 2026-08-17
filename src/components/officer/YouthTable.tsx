"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
} from "lucide-react";
import { OfficerAvatar } from "@/components/officer/OfficerShell";
import type { officerYouthList } from "@/data/officer";

type Youth = (typeof officerYouthList)[number];
type SortKey = "name" | "goal" | "currentStep" | "lastActivity" | "status";

const PAGE_SIZE = 8;

function statusClass(status: string) {
  return status.toLowerCase().replace(/ /g, "-");
}

function statusRank(status: string) {
  if (status === "On track") return 0;
  if (status === "Needs follow-up") return 1;
  return 2;
}

export function YouthTable({
  initialYouth,
  goals,
  statuses,
}: {
  initialYouth: Youth[];
  goals: string[];
  statuses: string[];
}) {
  const [query, setQuery] = useState("");
  const [goal, setGoal] = useState(goals[0]);
  const [status, setStatus] = useState(statuses[0]);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let rows = initialYouth;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      rows = rows.filter((y) => y.name.toLowerCase().includes(q));
    }
    if (goal !== goals[0]) {
      rows = rows.filter((y) => y.goal === goal);
    }
    if (status !== statuses[0]) {
      rows = rows.filter((y) => y.status === status);
    }

    const dir = sortDir === "asc" ? 1 : -1;
    const sorted = [...rows].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "status") {
        cmp = statusRank(a.status) - statusRank(b.status);
      } else {
        cmp = String(a[sortKey]).localeCompare(String(b[sortKey]));
      }
      return cmp * dir;
    });

    return { rows: sorted, total: sorted.length };
  }, [initialYouth, query, goal, status, sortKey, sortDir, goals, statuses]);

  const totalPages = Math.max(1, Math.ceil(filtered.total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.rows.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );
  const from = filtered.total === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const to = Math.min(filtered.total, safePage * PAGE_SIZE);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  }

  function exportCsv() {
    const header = ["Name", "Goal", "Current step", "Last activity", "Status"];
    const lines = filtered.rows.map((y) =>
      [y.name, y.goal, y.currentStep, y.lastActivity, y.status]
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(","),
    );
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inzira-youth-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <ArrowUpDown aria-hidden size={13} />;
    return sortDir === "asc" ? (
      <ArrowUp aria-hidden size={13} />
    ) : (
      <ArrowDown aria-hidden size={13} />
    );
  };

  return (
    <>
      <div className="youth-filters">
        <label className="youth-search">
          <Search aria-hidden size={16} />
          <input
            type="search"
            placeholder="Search by name..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
        </label>
        <label className="youth-select">
          <select
            value={goal}
            onChange={(e) => {
              setGoal(e.target.value);
              setPage(1);
            }}
          >
            {goals.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
          <ChevronDown aria-hidden size={14} />
        </label>
        <label className="youth-select">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            {statuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <ChevronDown aria-hidden size={14} />
        </label>
        <button className="officer-button outline export-btn" type="button" onClick={exportCsv}>
          <Download aria-hidden size={15} />
          Export
        </button>
      </div>

      <section className="officer-card youth-table-card">
        <div className="youth-table-wrap">
          <table className="youth-table">
            <thead>
              <tr>
                <th>
                  <button className="sortable" type="button" onClick={() => toggleSort("name")}>
                    Name <SortIcon column="name" />
                  </button>
                </th>
                <th>
                  <button className="sortable" type="button" onClick={() => toggleSort("goal")}>
                    Goal <SortIcon column="goal" />
                  </button>
                </th>
                <th>
                  <button className="sortable" type="button" onClick={() => toggleSort("currentStep")}>
                    Current step <SortIcon column="currentStep" />
                  </button>
                </th>
                <th>
                  <button className="sortable" type="button" onClick={() => toggleSort("lastActivity")}>
                    Last activity <SortIcon column="lastActivity" />
                  </button>
                </th>
                <th>
                  <button className="sortable" type="button" onClick={() => toggleSort("status")}>
                    Status <SortIcon column="status" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((youth) => (
                <tr key={youth.id}>
                  <td>
                    <Link className="youth-cell-name" href={`/officer/youth/${youth.id}`}>
                      <OfficerAvatar avatar={youth.avatar} size="small" />
                      <strong>{youth.name}</strong>
                    </Link>
                  </td>
                  <td>{youth.goal}</td>
                  <td>{youth.currentStep}</td>
                  <td>{youth.lastActivity}</td>
                  <td>
                    <span className={`status-pill ${statusClass(youth.status)}`}>
                      {youth.status}
                    </span>
                  </td>
                </tr>
              ))}
              {pageRows.length === 0 ? (
                <tr>
                  <td className="empty-cell" colSpan={5}>
                    No youth match your search. Try different filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <footer className="youth-table-footer">
          <p>
            Showing {from} to {to} of {filtered.total} youth
          </p>
          <div className="pagination">
            <button
              className="page-next"
              type="button"
              aria-label="Previous page"
              disabled={safePage === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft aria-hidden size={15} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let num: number;
              if (totalPages <= 5) {
                num = i + 1;
              } else if (safePage <= 3) {
                num = i + 1;
              } else if (safePage >= totalPages - 2) {
                num = totalPages - 4 + i;
              } else {
                num = safePage - 2 + i;
              }
              return (
                <button
                  className={`page-num ${safePage === num ? "active" : ""}`}
                  type="button"
                  key={num}
                  onClick={() => setPage(num)}
                >
                  {num}
                </button>
              );
            })}
            {totalPages > 5 && safePage < totalPages - 2 ? <span>...</span> : null}
            <button
              className="page-next"
              type="button"
              aria-label="Next page"
              disabled={safePage === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight aria-hidden size={15} />
            </button>
          </div>
        </footer>
      </section>
    </>
  );
}
