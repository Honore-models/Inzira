import Link from "next/link";
import { ArrowLeft, BriefcaseBusiness, Hammer, Target, Volume2 } from "lucide-react";

const goals = [
  {
    title: "Start a business",
    text: "I want to start or grow my own business",
    icon: BriefcaseBusiness,
  },
  {
    title: "Get vocational training",
    text: "I want to learn skills or go to a training center",
    icon: Hammer,
  },
  {
    title: "Find a job",
    text: "I want to find employment",
    icon: BriefcaseBusiness,
  },
];

export default function YouthOnboarding() {
  return (
    <main className="intake-screen">
      <section className="intake-panel">
        <header className="intake-header">
          <Link href="/" className="back-link">
            <ArrowLeft aria-hidden size={16} />
            Back
          </Link>
          <Link href="/" className="intake-logo">
            Inzira
          </Link>
          <span>Step 2 of 6</span>
        </header>
        <div className="intake-progress" aria-hidden="true">
          <span />
          <span className="active" />
          <span />
          <span />
          <span />
        </div>

        <div className="question-block">
          <div className="question-icon">
            <Target aria-hidden size={54} />
          </div>
          <h1>What is your main goal right now?</h1>
          <p>This helps us build the right path for you.</p>
        </div>

        <div className="goal-grid">
          {goals.map((goal) => {
            const Icon = goal.icon;
            return (
              <button className="goal-card" type="button" key={goal.title}>
                <Icon aria-hidden size={42} />
                <strong>{goal.title}</strong>
                <span>{goal.text}</span>
              </button>
            );
          })}
        </div>

        <footer className="intake-actions">
          <button className="read-button" type="button">
            <Volume2 aria-hidden size={15} />
            Read this question
          </button>
          <Link className="youth-primary-action" href="/youth">
            Next
          </Link>
        </footer>
      </section>
    </main>
  );
}
