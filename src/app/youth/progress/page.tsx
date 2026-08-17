import { CheckCircle2, CircleDashed, Clock3 } from "lucide-react";
import { ProgressMeter, YouthShell } from "@/components/youth/YouthShell";
import { roadmapSteps, youthCase } from "@/data/youth";

export default function YouthProgress() {
  const currentStep = roadmapSteps.find((step) => step.state === "current")!;
  const nextLocked = roadmapSteps.find(
    (step) => step.number === currentStep.number + 1,
  )!;
  const milestones = [
    {
      label: "Roadmap reviewed",
      value: `Approved by ${youthCase.youth.officer}`,
      icon: CheckCircle2,
    },
    { label: "Current step", value: currentStep.title, icon: Clock3 },
    { label: "Next unlock", value: nextLocked.title, icon: CircleDashed },
  ];

  return (
    <YouthShell active="My Steps">
      <header className="page-heading two-column-heading">
        <div>
          <h1>Progress</h1>
          <p>Track what is done, what is current, and what comes next.</p>
        </div>
        <ProgressMeter value={youthCase.progress.percent} label="Overall progress" />
      </header>

      <section className="progress-overview">
        {milestones.map((item) => {
          const Icon = item.icon;
          return (
            <article className="content-card milestone-card" key={item.label}>
              <Icon aria-hidden size={32} />
              <p>{item.label}</p>
              <strong>{item.value}</strong>
            </article>
          );
        })}
      </section>

      <section className="content-card document-panel">
        <div>
          <h2>Documents for the current step</h2>
          <p>Prepare these before visiting the office.</p>
        </div>
        <ul>
          {youthCase.documents.map((document) => (
            <li key={document}>{document}</li>
          ))}
        </ul>
      </section>
    </YouthShell>
  );
}
