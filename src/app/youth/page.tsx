import Link from "next/link";
import { ClipboardList, HelpCircle, Lightbulb, ListChecks, MapPin, MessagesSquare, Sun } from "lucide-react";
import { ProgressMeter, YouthShell } from "@/components/youth/YouthShell";

export default function YouthDashboard() {
  return (
    <YouthShell active="Home">
      <div className="dashboard-grid">
        <section className="welcome-card">
          <div className="welcome-copy">
            <Sun aria-hidden size={42} />
            <div>
              <p>Good morning,</p>
              <h1>Diane</h1>
              <span>You are on your path. Keep going.</span>
            </div>
          </div>
          <div className="progress-card compact-card">
            <p>Overall progress</p>
            <strong>2 of 5 steps done</strong>
            <ProgressMeter value={40} label="40% complete" />
          </div>
        </section>

        <section className="content-card next-step-card">
          <p className="section-label">Your next step</p>
          <div className="next-step">
            <div className="large-icon">
              <ClipboardList aria-hidden size={44} />
            </div>
            <div>
              <h2>Register your business name with RDB</h2>
              <p>This is the first official step to start your business.</p>
              <span>
                <MapPin aria-hidden size={15} />
                RDB Office - Your District
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
              <ListChecks aria-hidden size={28} />
              <strong>My Steps</strong>
              <span>See your full plan</span>
            </Link>
            <Link className="quick-card" href="/youth/ask">
              <HelpCircle aria-hidden size={28} />
              <strong>Ask</strong>
              <span>Get answers to your questions</span>
            </Link>
            <Link className="quick-card" href="/youth/find-help">
              <Lightbulb aria-hidden size={28} />
              <strong>Find Help</strong>
              <span>Discover institutions near you</span>
            </Link>
          </div>
        </section>

        <Link className="message-strip" href="/youth/ask">
          <MessagesSquare aria-hidden size={22} />
          <span>
            <strong>Need help from a real person?</strong>
            Message your youth officer
          </span>
          <span aria-hidden>→</span>
        </Link>
      </div>
    </YouthShell>
  );
}
