"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Search, MessageCircle, MapPin, ArrowRight } from "lucide-react";
import { YouthShell } from "@/components/youth/YouthShell";
import { ChatPanel } from "@/components/ChatPanel";

interface Officer {
  id: string;
  full_name: string;
  email: string;
  department: string | null;
  district_assigned: string | null;
  photo_url: string | null;
  case: {
    id: string;
    status: string;
    current_step: number;
    total_steps: number;
  } | null;
}

export default function YouthMessages() {
  const { data: session } = useSession();
  const [query, setQuery] = useState("");
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [activeOfficerName, setActiveOfficerName] = useState("");
  const [connecting, setConnecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOfficers();
  }, []);

  async function loadOfficers() {
    try {
      const res = await fetch("/api/officers");
      const data = await res.json();
      if (res.ok) {
        setOfficers(data);
        setError(null);
      } else {
        console.error("Officers API error:", data);
        setError(data.error || "Failed to load officers");
      }
    } catch (err) {
      console.error("Failed to fetch officers:", err);
      setError("Could not connect to server");
    } finally {
      setLoading(false);
    }
  }

  async function handleContactOfficer(officer: Officer) {
    setConnecting(officer.id);
    try {
      if (officer.case) {
        // Already have a case — open chat directly
        setActiveCaseId(officer.case.id);
        setActiveOfficerName(officer.full_name);
      } else {
        // No case yet — create one, then open chat
        const res = await fetch("/api/cases/find-or-create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ officerProfileId: officer.id }),
        });
        if (res.ok) {
          const data = await res.json();
          setActiveCaseId(data.case.id);
          setActiveOfficerName(officer.full_name);
          // Reload officers to update the case status
          loadOfficers();
        }
      }
    } catch {
      // Silently handle errors
    } finally {
      setConnecting(null);
    }
  }

  const q = query.trim().toLowerCase();
  const filtered = officers.filter((o) => {
    const name = o.full_name || "";
    const dept = o.department || "";
    const dist = o.district_assigned || "";
    return `${name} ${dept} ${dist}`.toLowerCase().includes(q);
  });

  // If a chat is active, show the ChatPanel
  if (activeCaseId) {
    return (
      <YouthShell active="Messages">
        <div className="youth-page-wrap">
          <ChatPanel
            caseInfo={{
              id: activeCaseId,
              youth_name: session?.user?.name || "You",
              officer_name: activeOfficerName,
            }}
            currentUserId={session?.user?.profileId || ""}
            currentRole="youth"
            onBack={() => {
              setActiveCaseId(null);
              setActiveOfficerName("");
            }}
          />
        </div>
      </YouthShell>
    );
  }

  if (loading) {
    return (
      <YouthShell active="Messages">
        <div className="youth-page-wrap">
          <div className="yd-loading">
            <div className="yd-loading-spinner" />
            <p>Loading officers…</p>
          </div>
        </div>
      </YouthShell>
    );
  }

  return (
    <YouthShell active="Messages">
      <div className="youth-page-wrap">
        <header className="page-heading">
          <h1>Messages</h1>
          <p>Contact your youth officers for guidance and support.</p>
        </header>

        <section className="content-card" style={{ padding: 0 }}>
          {/* Search */}
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid #e2e5df",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Search
              aria-hidden
              size={16}
              style={{ color: "#777f87", flexShrink: 0 }}
            />
            <input
              type="search"
              placeholder="Search officers by name, department, or district…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                flex: 1,
                fontSize: 14,
                background: "transparent",
              }}
            />
          </div>

          {/* Officers list */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            {filtered.map((officer) => {
              const initials = officer.full_name
                .split(" ")
                .map((w) => w[0])
                .join("");
              const hasCase = !!officer.case;
              const isConnecting = connecting === officer.id;

              return (
                <button
                  key={officer.id}
                  type="button"
                  onClick={() => handleContactOfficer(officer)}
                  disabled={isConnecting}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "14px 16px",
                    borderBottom: "1px solid #f0f2ee",
                    background: "transparent",
                    border: "none",
                    borderLeft: hasCase
                      ? "3px solid #1f6f4c"
                      : "3px solid transparent",
                    cursor: isConnecting ? "wait" : "pointer",
                    textAlign: "left",
                    width: "100%",
                    fontFamily: "inherit",
                    transition: "background 0.15s",
                    opacity: isConnecting ? 0.6 : 1,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#fafbfa")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  {/* Avatar */}
                  <span
                    className="officer-avatar small"
                    style={{
                      background: hasCase ? "#1f6f4c" : "#5f6860",
                      flexShrink: 0,
                    }}
                  >
                    {initials}
                  </span>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 2,
                      }}
                    >
                      <strong
                        style={{ fontSize: 14, lineHeight: 1.3 }}
                      >
                        {officer.full_name}
                      </strong>
                      {hasCase && (
                        <span
                          style={{
                            fontSize: 11,
                            background: "#e8f5e9",
                            color: "#1f6f4c",
                            padding: "1px 6px",
                            borderRadius: 4,
                            fontWeight: 600,
                          }}
                        >
                          Active
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      {officer.department && (
                        <span
                          style={{
                            color: "#777f87",
                            fontSize: 12,
                            display: "flex",
                            alignItems: "center",
                            gap: 3,
                          }}
                        >
                          <MessageCircle size={11} />
                          {officer.department}
                        </span>
                      )}
                      {officer.district_assigned && (
                        <span
                          style={{
                            color: "#777f87",
                            fontSize: 12,
                            display: "flex",
                            alignItems: "center",
                            gap: 3,
                          }}
                        >
                          <MapPin size={11} />
                          {officer.district_assigned}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Arrow */}
                  <ArrowRight
                    size={16}
                    style={{ color: "#aab0ad", flexShrink: 0 }}
                  />
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div
                style={{
                  color: "#777f87",
                  fontSize: 14,
                  padding: 40,
                  textAlign: "center",
                }}
              >
                {error ? (
                  <div>
                    <p style={{ color: "#c0392b", fontWeight: 600, marginBottom: 8 }}>
                      Error: {error}
                    </p>
                    <p>Please try refreshing the page.</p>
                  </div>
                ) : officers.length === 0 ? (
                  <p>No youth officers available yet. Your officer will be assigned after your case is reviewed.</p>
                ) : (
                  <p>No officers match your search.</p>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </YouthShell>
  );
}
