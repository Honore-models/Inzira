"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { MapPin, MessageCircle, Search, UserRound } from "lucide-react";
import { ChatThread } from "@/components/ChatThread";
import { Alert, Avatar, EmptyState, PageHeader, PageSkeleton } from "@/components/ui";
import { api } from "@/lib/api-client";
import { firstName } from "@/lib/format";
import { useJourney } from "@/lib/use-journey";

interface Officer {
  id: string;
  full_name: string;
  department: string | null;
  district_assigned: string | null;
}

export default function YouthMessages() {
  const { data: session } = useSession();
  const { data, error, loading, reload } = useJourney({ requireOnboarding: false });
  const [officers, setOfficers] = useState<Officer[] | null>(null);
  const [query, setQuery] = useState("");
  const [choosing, setChoosing] = useState<string | null>(null);
  const [chooseError, setChooseError] = useState("");

  const needsOfficer = !!data && !data.officer;

  useEffect(() => {
    if (!needsOfficer) return;
    api<Officer[]>("/api/officers")
      .then(setOfficers)
      .catch((e) => setChooseError(e.message));
  }, [needsOfficer]);

  if (loading) return <PageSkeleton />;
  if (error || !data) return <Alert tone="error" title="We couldn't load your messages">{error}</Alert>;

  const profileId = data.profile?.id || session?.user?.profileId || "";

  if (data.officer && data.case) {
    return (
      <>
        <PageHeader
          title="Messages"
          description={`Your conversation with ${data.officer.full_name}, your youth officer. They usually reply within one working day.`}
        />
        <ChatThread
          caseId={data.case.id}
          currentProfileId={profileId}
          title={data.officer.full_name}
          subtitle={[data.officer.department, data.officer.district_assigned].filter(Boolean).join(" · ") || "Youth officer"}
          avatar={<Avatar name={data.officer.full_name} email={data.officer.email} />}
          emptyHint={`Introduce yourself to ${firstName(data.officer.full_name)} or ask anything about your roadmap.`}
        />
      </>
    );
  }

  async function choose(officer: Officer) {
    setChoosing(officer.id);
    setChooseError("");
    try {
      await api("/api/me/officer", { method: "POST", json: { officerProfileId: officer.id } });
      await reload();
    } catch (e) {
      setChooseError(e instanceof Error ? e.message : "Could not connect you with this officer.");
    } finally {
      setChoosing(null);
    }
  }

  const q = query.trim().toLowerCase();
  const district = (data.profile?.district || "").toLowerCase().replace(/\s*district$/, "");
  const list = (officers || [])
    .filter((o) => `${o.full_name} ${o.department || ""} ${o.district_assigned || ""}`.toLowerCase().includes(q))
    .sort((a, b) => {
      const local = (o: Officer) => (o.district_assigned || "").toLowerCase().includes(district) && district ? 0 : 1;
      return local(a) - local(b);
    });

  return (
    <>
      <PageHeader
        title="Messages"
        description="Choose a youth officer to talk to. Officers working in your district are listed first."
      />
      {chooseError ? <Alert tone="error">{chooseError}</Alert> : null}
      <section className="card" style={{ marginTop: chooseError ? 12 : 0 }}>
        <div className="toolbar">
          <label className="search-input">
            <Search size={16} aria-hidden />
            <input
              className="input"
              type="search"
              placeholder="Search by name, department or district"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search officers"
            />
          </label>
        </div>
        {officers === null ? (
          <div className="card-body">
            <PageSkeleton />
          </div>
        ) : list.length === 0 ? (
          <EmptyState icon={<UserRound size={24} />} title={officers.length ? "No officers match your search" : "No officers available yet"}>
            {officers.length ? "Try a different name or district." : "An officer will be assigned to you once your information is reviewed."}
          </EmptyState>
        ) : (
          list.map((o) => (
            <div className="list-row" key={o.id}>
              <Avatar name={o.full_name} />
              <div className="list-row-body">
                <strong>{o.full_name}</strong>
                <span>
                  {[o.department, o.district_assigned].filter(Boolean).join(" · ") || "Youth officer"}
                </span>
              </div>
              {o.district_assigned && district && o.district_assigned.toLowerCase().includes(district) ? (
                <span className="badge badge-green plain" style={{ marginRight: 8 }}>
                  <MapPin size={12} aria-hidden /> Your district
                </span>
              ) : null}
              <button className="btn btn-secondary btn-sm" type="button" disabled={!!choosing} onClick={() => choose(o)}>
                {choosing === o.id ? <span className="spinner" aria-hidden /> : <MessageCircle size={14} aria-hidden />}
                Message
              </button>
            </div>
          ))
        )}
      </section>
    </>
  );
}
