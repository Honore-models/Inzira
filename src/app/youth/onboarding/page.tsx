import Link from "next/link";
import { ArrowLeft, BriefcaseBusiness, Hammer, Target, Volume2 } from "lucide-react";
import { intakeGoals } from "@/data/youth";

const goalIcons = [BriefcaseBusiness, Hammer, BriefcaseBusiness];

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
            <img src="/inzira_logo.png" alt="Inzira" />
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
            <Target aria-hidden size={32} />
          </div>
          <h1>What is your main goal right now?</h1>
          <p>This helps us build the right path for you.</p>
        </div>

        <div className="goal-grid">
          {intakeGoals.map((goal, index) => {
            const Icon = goalIcons[index];
            return (
              <button
                className={`goal-card ${goal.selected ? "selected" : ""}`}
                type="button"
                key={goal.title}
              >
                <Icon aria-hidden size={28} />
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
