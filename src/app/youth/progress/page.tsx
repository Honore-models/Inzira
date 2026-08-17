import { CheckCircle2, CircleDashed, Clock3 } from "lucide-react";
import { ProgressMeter, YouthShell } from "@/components/youth/YouthShell";

const milestones = [
  { label: "Roadmap reviewed", value: "Approved by officer", icon: CheckCircle2 },
  { label: "Current step", value: "RDB registration", icon: Clock3 },
  { label: "Next unlock", value: "TIN application", icon: CircleDashed },
];

export default function YouthProgress() {
  return (
    <YouthShell active="My Steps">
      <header className="page-heading two-column-heading">
        <div>
          <h1>Progress</h1>
          <p>Track what is done, what is current, and what comes next.</p>
        </div>
        <ProgressMeter value={40} label="Overall progress" />
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
    </YouthShell>
  );
}
