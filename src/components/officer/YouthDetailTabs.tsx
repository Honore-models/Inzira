"use client";

import { useState } from "react";
import { Check, Clock, Lock, RefreshCw } from "lucide-react";

interface DetailStep {
  number: number;
  title: string;
  detail: string;
  institution: string;
  status: string;
  state: string;
  location?: string;
  source?: string;
}

interface YouthDetail {
  avatar: { label: string; bg: string };
  name: string;
  goal: string;
  location: string;
  skills: string;
  situation: string;
  progress: number;
  currentStep: number;
  totalSteps: number;
  steps: DetailStep[];
}

const activityLog = [
  { time: "Today, 09:32", action: "Viewed step details (2. Get TIN)" },
  { time: "Today, 09:31", action: "Completed step 1 · Register your business name with RDB" },
  { time: "May 10, 11:05", action: "Asked a question: \"How do I get my TIN?\" via Inzira Ask" },
  { time: "May 10, 10:20", action: "Officer Jean Claude added intake notes" },
  { time: "May 9, 14:00", action: "Roadmap approved by officer" },
  { time: "May 8, 09:12", action: "Completed onboarding and set goal: Start a business" },
];

type Tab = "roadmap" | "intake" | "activity";

export function YouthDetailTabs({ detail }: { detail: YouthDetail }) {
  const [tab, setTab] = useState<Tab>("roadmap");

  return (
    <>
      <nav className="officer-tabs" aria-label="Youth details">
        <button
          className={tab === "roadmap" ? "active" : ""}
          type="button"
          onClick={() => setTab("roadmap")}
        >
          Roadmap (Youth view)
        </button>
        <button
          className={tab === "intake" ? "active" : ""}
          type="button"
          onClick={() => setTab("intake")}
        >
          Intake Notes
        </button>
        <button
          className={tab === "activity" ? "active" : ""}
          type="button"
          onClick={() => setTab("activity")}
        >
          Activity Log
        </button>
      </nav>

      <div className="detail-columns">
        {tab === "roadmap" ? (
          <section className="officer-card detail-roadmap">
            <header className="officer-card-header">
              <div>
                <h2>Roadmap</h2>
                <p>{detail.steps.length} steps toward {detail.goal.toLowerCase()}</p>
              </div>
            </header>
            <div className="detail-timeline">
              {detail.steps.map((step) => (
                <article className={`detail-step ${step.state}`} key={step.number}>
                  <div className="detail-step-node">
                    {step.state === "done" ? (
                      <Check aria-hidden size={16} />
                    ) : step.state === "locked" ? (
                      <Lock aria-hidden size={14} />
                    ) : (
                      step.number
                    )}
                  </div>
                  <div className="detail-step-body">
                    <strong>{step.title}</strong>
                    <span className={step.state}>{step.status}</span>
                    <small>{step.institution}</small>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {tab === "intake" ? (
          <section className="officer-card detail-intake">
            <header className="officer-card-header">
              <div>
                <h2>Intake Notes</h2>
                <p>Recorded when this youth was onboarded</p>
              </div>
            </header>
            <dl className="intake-readonly">
              <div>
                <dt>Youth name</dt>
                <dd>{detail.name}</dd>
              </div>
              <div>
                <dt>Goal</dt>
                <dd>{detail.goal}</dd>
              </div>
              <div>
                <dt>Skills / background</dt>
                <dd>{detail.skills || "—"}</dd>
              </div>
              <div>
                <dt>Current situation</dt>
                <dd>{detail.situation || "—"}</dd>
              </div>
              <div>
                <dt>Location</dt>
                <dd>{detail.location}</dd>
              </div>
            </dl>
          </section>
        ) : null}

        {tab === "activity" ? (
          <section className="officer-card detail-activity">
            <header className="officer-card-header">
              <div>
                <h2>Activity Log</h2>
                <p>Recent activity for {detail.name}</p>
              </div>
            </header>
            <ol className="activity-list">
              {activityLog.map((entry) => (
                <li key={entry.time + entry.action}>
                  <span className="activity-time">
                    <Clock aria-hidden size={13} />
                    {entry.time}
                  </span>
                  <p>{entry.action}</p>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        <aside className="detail-side">
          <section className="officer-card detail-progress-card">
            <h2>Progress</h2>
            <div className="detail-progress-head">
              <strong>
                {detail.currentStep} of {detail.totalSteps} steps
              </strong>
              <span>{detail.progress}%</span>
            </div>
            <div className="detail-progress-track">
              <span style={{ width: `${detail.progress}%` }} />
            </div>
          </section>

          <section className="officer-card detail-actions">
            <a className="officer-button outline" href="/officer/messages">
              💬 Message youth
            </a>
            <button
              className="officer-button outline"
              type="button"
              onClick={() =>
                window.alert(
                  "Regenerate plan: the AI draft would be regenerated from the youth's intake notes.",
                )
              }
            >
              <RefreshCw aria-hidden size={15} />
              Regenerate plan
            </button>
          </section>
        </aside>
      </div>
    </>
  );
}
