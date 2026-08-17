import { ArrowRight, MapPin, Phone } from "lucide-react";
import { institutions, YouthShell } from "@/components/youth/YouthShell";

export default function YouthFindHelp() {
  return (
    <YouthShell active="Find Help">
      <header className="page-heading">
        <h1>Find Help</h1>
        <p>Verified offices and support points connected to your roadmap.</p>
      </header>

      <section className="directory-layout">
        <div className="map-panel">
          <MapPin aria-hidden size={44} />
          <strong>Your district support map</strong>
          <span>Map preview for nearby institutions</span>
        </div>
        <div className="institution-list">
          {institutions.map((item) => {
            const Icon = item.icon;
            return (
              <article className="institution-card" key={item.title}>
                <Icon aria-hidden size={28} />
                <div>
                  <h2>{item.title}</h2>
                  <p>{item.meta}</p>
                  <span>{item.distance}</span>
                </div>
                <button type="button">
                  <Phone aria-hidden size={15} />
                  Contact
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <a className="message-strip" href="/youth/steps">
        <span>
          <strong>Not sure which office to visit first?</strong>
          Open your roadmap and follow the current step.
        </span>
        <ArrowRight aria-hidden size={18} />
      </a>
    </YouthShell>
  );
}
