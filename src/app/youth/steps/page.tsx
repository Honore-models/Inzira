import { Check, ChevronDown, Clock, Lock, MapPin } from "lucide-react";
import { ProgressMeter, YouthShell } from "@/components/youth/YouthShell";
import { roadmapSteps, youthCase } from "@/data/youth";

export default function YouthSteps() {
  return (
    <YouthShell active="My Steps">
      <header className="page-heading two-column-heading">
        <div>
          <h1>My Steps</h1>
          <p>Your personalized roadmap</p>
        </div>
        <ProgressMeter
          value={youthCase.progress.percent}
          label={`Overall progress: ${youthCase.progress.completed} of ${youthCase.progress.total} steps done`}
        />
      </header>

      <section className="roadmap-summary">
        <div>
          <span>Goal</span>
          <strong>{youthCase.youth.goal}</strong>
        </div>
        <div>
          <span>Officer approval</span>
          <strong>Reviewed by {youthCase.youth.officer}</strong>
        </div>
        <div>
          <span>Last update</span>
          <strong>{youthCase.progress.updated}</strong>
        </div>
      </section>

      <section className="roadmap-list" aria-label="Business roadmap steps">
        {roadmapSteps.map((step) => (
          <article className={`roadmap-item ${step.state}`} key={step.number}>
            <div className="roadmap-number">
              {step.state === "done" ? <Check aria-hidden size={18} /> : step.number}
            </div>
            <div className="roadmap-body">
              <div className="roadmap-title-row">
                <h2>{step.title}</h2>
                <span className={`status-pill ${step.state}`}>
                  {step.state === "locked" && <Lock aria-hidden size={12} />}
                  {step.status}
                </span>
              </div>
              <p>{step.detail}</p>
              {step.location && (
                <span className="meta-line">
                  <MapPin aria-hidden size={15} />
                  {step.location}
                </span>
              )}
              {step.source && <span className="source-line">{step.source}</span>}
              {step.state === "current" && (
                <button className="outline-action" type="button">
                  <Clock aria-hidden size={15} />
                  Mark as done
                </button>
              )}
            </div>
            <ChevronDown aria-hidden size={18} />
          </article>
        ))}
      </section>
      <p className="roadmap-note">
        Steps unlock in order. Complete the current step to move forward.
      </p>
    </YouthShell>
  );
}
