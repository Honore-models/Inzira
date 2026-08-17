import Link from "next/link";
import {
  ChevronRight,
  ClipboardList,
  HelpCircle,
  Lightbulb,
  ListChecks,
  MapPin,
  MessagesSquare,
  Sun,
} from "lucide-react";
import { ProgressMeter, YouthShell } from "@/components/youth/YouthShell";
import { roadmapSteps, youthCase } from "@/data/youth";

export default function YouthDashboard() {
  const nextStep = roadmapSteps.find((step) => step.id === youthCase.nextStepId)!;

  return (
    <YouthShell active="Home">
      <div className="dashboard-grid youth-dashboard-grid youth-page-wrap">
        <section className="welcome-card">
          <div className="welcome-copy">
            <Sun aria-hidden size={28} />
            <div>
              <p>Good morning,</p>
              <h1>{youthCase.youth.name}</h1>
              <span>You&apos;re on your path. Keep going!</span>
            </div>
          </div>
          <div className="progress-card compact-card">
            <p>Overall progress</p>
            <strong className="progress-steps">
              {youthCase.progress.completed} of {youthCase.progress.total} steps done
            </strong>
            <ProgressMeter
              value={youthCase.progress.percent}
              label={`${youthCase.progress.percent}% complete`}
            />
          </div>
        </section>

        <section className="content-card next-step-card">
          <p className="section-label">Your next step</p>
          <div className="next-step">
            <div className="large-icon">
              <ClipboardList aria-hidden size={28} />
            </div>
            <div>
              <h2>{nextStep.title}</h2>
              <p>{nextStep.detail}</p>
              <span>
                <MapPin aria-hidden size={14} />
                {nextStep.location}
              </span>
            </div>
            <Link className="small-action" href="/youth/steps">
              View this step
            </Link>
          </div>
        </section>

        <section className="quick-section">
          <p className="section-label">Quick access</p>
          <div className="quick-grid">
            <Link className="quick-card" href="/youth/steps">
              <ListChecks aria-hidden size={22} />
              <strong>My Steps</strong>
              <span>See your full plan</span>
            </Link>
            <Link className="quick-card" href="/youth/ask">
              <HelpCircle aria-hidden size={22} />
              <strong>Ask</strong>
              <span>Get answers to your questions</span>
            </Link>
            <Link className="quick-card" href="/youth/find-help">
              <Lightbulb aria-hidden size={22} />
              <strong>Find Help</strong>
              <span>Discover institutions near you</span>
            </Link>
          </div>
        </section>

        <Link className="message-strip" href="/youth/ask">
          <MessagesSquare aria-hidden size={20} />
          <span>
            <strong>Need help from a real person?</strong>
            <em className="message-link">Message your youth officer</em>
          </span>
          <ChevronRight aria-hidden size={18} />
        </Link>
      </div>
    </YouthShell>
  );
}
