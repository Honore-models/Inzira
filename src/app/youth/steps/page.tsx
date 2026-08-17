import { Check, ChevronDown, Clock, Lock, MapPin } from "lucide-react";
import { ProgressMeter, YouthShell } from "@/components/youth/YouthShell";

const steps = [
  {
    number: 1,
    title: "Learn about business registration",
    status: "Completed on 12 May 2025",
    state: "done",
  },
  {
    number: 2,
    title: "Register your business name with RDB",
    status: "Current step",
    detail: "Visit RDB and register your business name.",
    location: "RDB Office - Your District",
    state: "current",
  },
  {
    number: 3,
    title: "Get your Tax Identification Number (TIN)",
    status: "Locked",
    detail: "This step will unlock after you register your business name.",
    state: "locked",
  },
  {
    number: 4,
    title: "Open a business bank account",
    status: "Locked",
    detail: "This step will unlock after you complete the previous step.",
    state: "locked",
  },
  {
    number: 5,
    title: "Apply for a BDF loan guarantee",
    status: "Locked",
    detail: "This step will unlock after you complete the previous step.",
    state: "locked",
  },
];

export default function YouthSteps() {
  return (
    <YouthShell active="My Steps">
      <header className="page-heading two-column-heading">
        <div>
          <h1>My Steps</h1>
          <p>Your personalized roadmap</p>
        </div>
        <ProgressMeter value={40} label="Overall progress: 2 of 5 steps done" />
      </header>

      <section className="roadmap-list" aria-label="Business roadmap steps">
        {steps.map((step) => (
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
              {step.detail && <p>{step.detail}</p>}
              {step.location && (
                <span className="meta-line">
                  <MapPin aria-hidden size={15} />
                  {step.location}
                </span>
              )}
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
