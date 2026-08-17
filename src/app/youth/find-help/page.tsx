"use client";

import { useState } from "react";
import { ChevronDown, Filter, Search } from "lucide-react";
import { InstitutionCard } from "@/components/youth/InstitutionCard";
import { YouthShell } from "@/components/youth/YouthShell";
import { helpCategories, institutions } from "@/data/youth";

const INITIAL_VISIBLE = 4;

export default function YouthFindHelp() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(helpCategories[0]);
  const [visible, setVisible] = useState(INITIAL_VISIBLE);

  const q = query.trim().toLowerCase();
  const filtered = institutions.filter((item) => {
    const matchesCategory =
      category === "All" || item.category === category;
    const haystack = [
      item.title,
      item.description,
      item.location,
      item.category,
      item.details.fullDescription,
      ...item.details.services,
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
              <input
                type="search"
                placeholder="Search for institutions, programs, or services..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setVisible(INITIAL_VISIBLE);
                }}
              />
              <Search aria-hidden size={18} />
            </label>
            <button
              className="find-help-filter"
              type="button"
              onClick={() =>
                window.alert(
                  "Filters are applied through the category tabs below.",
                )
              }
            >
              <Filter aria-hidden size={16} />
              Filter
            </button>
          </div>

          <div className="find-help-filters" role="tablist" aria-label="Filter by category">
            {helpCategories.map((cat) => (
              <button
                className={category === cat ? "active" : ""}
                key={cat}
                type="button"
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

        {filtered.length === 0 ? (
          <div className="find-help-empty">
            <p>No institutions match your search. Try a different term.</p>
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
