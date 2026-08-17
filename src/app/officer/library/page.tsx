import { BadgeCheck, BookOpen } from "lucide-react";
import { OfficerShell } from "@/components/officer/OfficerShell";
import { institutions } from "@/data/youth";

export default function OfficerLibrary() {
  return (
    <OfficerShell active="Verified Library">
      <div className="officer-page-wrap">
        <header className="officer-heading">
          <div>
            <h1>Verified Library</h1>
            <p>
              Programs, offices, and requirements the AI uses to draft roadmaps.
            </p>
          </div>
        </header>

        <div className="library-grid">
          {institutions.map((inst) => (
            <article className="officer-card library-card" key={inst.id}>
              <header>
                <span
                  className="library-logo"
                  style={{ background: inst.logoBg }}
                >
                  {inst.logo ? (
                    <img src={inst.logo} alt={`${inst.initials} logo`} />
                  ) : (
                    inst.initials
                  )}
                </span>
                <span className="library-verified">
                  <BadgeCheck aria-hidden size={14} />
                  Verified
                </span>
              </header>
              <h2>{inst.title}</h2>
              <p>{inst.description}</p>
              <dl className="library-meta">
                <div>
                  <dt>Category</dt>
                  <dd>{inst.category}</dd>
                </div>
                <div>
                  <dt>Location</dt>
                  <dd>{inst.location}</dd>
                </div>
                <div>
                  <dt>Contact</dt>
                  <dd>{inst.details.phone}</dd>
                </div>
              </dl>
              <footer>
                <BookOpen aria-hidden size={14} />
                Used as a source for AI roadmaps
              </footer>
            </article>
          ))}
        </div>
      </div>
    </OfficerShell>
  );
}
