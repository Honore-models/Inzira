"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { InstitutionCard } from "@/components/youth/InstitutionCard";
import { YouthShell } from "@/components/youth/YouthShell";
import { CardSkeleton, SkeletonGroup } from "@/components/Skeleton";

const INITIAL_VISIBLE = 4;

interface Institution {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  initials: string;
  logo_bg: string;
  logo_url: string | null;
  details: {
    fullDescription: string;
    services: string[];
    phone: string;
    email: string;
    hours: string;
    address: string;
  };
}

const helpCategories = ["All", "Business", "Training", "Loans"];

export default function YouthFindHelp() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [visible, setVisible] = useState(INITIAL_VISIBLE);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/institutions");
        if (res.ok) {
          setInstitutions(await res.json());
        }
      } catch {
        // Silently handle errors
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const q = query.trim().toLowerCase();
  const filtered = institutions.filter((item) => {
    const matchesCategory =
      category === "All" || item.category === category;
    const haystack = [
      item.title,
      item.description,
      item.location,
      item.category,
      item.details?.fullDescription || "",
      ...(item.details?.services || []),
    ]
      .join(" ")
      .toLowerCase();
    return matchesCategory && (!q || haystack.includes(q));
  });

  const shown = filtered.slice(0, visible);

  return (
    <YouthShell active="Find Help">
      <div className="youth-page-wrap find-help-page">
        <header className="page-heading">
          <h1>Find Help</h1>
          <p>Find verified institutions and programs near you.</p>
        </header>

        <div className="find-help-toolbar">
          <div className="find-help-search-row">
            <label className="find-help-search">
              <Search aria-hidden size={18} />
              <input
                type="search"
                placeholder="Search for institutions, programs, or services…"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setVisible(INITIAL_VISIBLE);
                }}
              />
              {query && (
                <button
                  type="button"
                  className="find-help-clear"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                >
                  <X aria-hidden size={16} />
                </button>
              )}
            </label>
          </div>

          <div className="find-help-filters" role="tablist" aria-label="Filter by category">
            {helpCategories.map((cat) => (
              <button
                className={category === cat ? "active" : ""}
                key={cat}
                type="button"
                role="tab"
                aria-selected={category === cat}
                onClick={() => {
                  setCategory(cat);
                  setVisible(INITIAL_VISIBLE);
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <SkeletonGroup count={4} className="h-16" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="find-help-empty">
            <p>No institutions match your search. Try a different term or category.</p>
          </div>
        ) : (
          <div className="institution-list">
            {shown.map((item) => (
              <InstitutionCard item={item} key={item.id} />
            ))}
          </div>
        )}

        {shown.length < filtered.length ? (
          <button
            className="load-more-card"
            type="button"
            onClick={() => setVisible((v) => v + INITIAL_VISIBLE)}
          >
            Load more results ({filtered.length - shown.length} more)
            <ChevronDown aria-hidden size={18} />
          </button>
        ) : null}
      </div>
    </YouthShell>
  );
}
