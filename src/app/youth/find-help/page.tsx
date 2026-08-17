import {
  ChevronDown,
  Filter,
  MapPin,
  Navigation,
  Search,
} from "lucide-react";
import { YouthShell } from "@/components/youth/YouthShell";
import { helpCategories, institutions } from "@/data/youth";

export default function YouthFindHelp() {
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
              />
              <Search aria-hidden size={18} />
            </label>
            <button className="find-help-filter" type="button">
              <Filter aria-hidden size={16} />
              Filter
            </button>
          </div>

          <div className="find-help-filters" role="tablist" aria-label="Filter by category">
            {helpCategories.map((category, index) => (
              <button
                className={index === 0 ? "active" : ""}
                key={category}
                type="button"
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="institution-list">
          {institutions.map((item) => (
            <article className="institution-card" key={item.id}>
              <div
                className="institution-logo"
                style={{ backgroundColor: item.logoBg }}
              >
                {item.initials}
              </div>

              <div className="institution-body">
                <h2>{item.title}</h2>
                <p>{item.description}</p>
                <div className="institution-meta">
                  <span>
                    <MapPin aria-hidden size={14} />
                    {item.location}
                  </span>
                  <span>
                    <Navigation aria-hidden size={14} />
                    {item.distance}
                  </span>
                </div>
              </div>

              <div className="institution-actions">
                <span className="institution-tag">{item.category}</span>
                <button className="institution-details" type="button">
                  View details
                </button>
              </div>
            </article>
          ))}
        </div>

        <button className="load-more-card" type="button">
          Load more results
          <ChevronDown aria-hidden size={18} />
        </button>
      </div>
    </YouthShell>
  );
}
