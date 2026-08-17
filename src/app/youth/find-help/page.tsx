import { ArrowRight, Building2, MapPin, Phone } from "lucide-react";
import { YouthShell } from "@/components/youth/YouthShell";
import { institutions, youthCase } from "@/data/youth";

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
          <strong>{youthCase.youth.district} support map</strong>
          <span>Nearby offices connected to Diane&apos;s roadmap</span>
        </div>
        <div className="institution-list">
          {institutions.map((item) => (
            <article className="institution-card" key={item.title}>
              <Building2 aria-hidden size={28} />
              <div>
                <div className="institution-title-row">
                  <h2>{item.title}</h2>
                  <small>{item.tag}</small>
                </div>
                <p>{item.meta}</p>
                <span>
                  {item.distance} - {item.hours}
                </span>
              </div>
              <button type="button">
                <Phone aria-hidden size={15} />
                Contact
              </button>
            </article>
          ))}
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
