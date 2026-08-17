"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  ClipboardList,
  HelpCircle,
  Lightbulb,
  ListChecks,
  MapPin,
  MessageCircle,
  Sun,
} from "lucide-react";
import { YouthShell, ProgressMeter } from "@/components/youth/YouthShell";

interface Profile {
  full_name: string;
  goal: string;
  district: string;
}

interface Case {
  id: string;
  current_step: number;
  total_steps: number;
  youth: Profile;
  officer: { full_name: string } | null;
}

interface Step {
  id: string;
  title: string;
  detail: string;
  location: string | null;
  status: string;
  state: string;
}

export default function YouthDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [youthCase, setYouthCase] = useState<Case | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // Fetch profile
        const profileRes = await fetch("/api/profile");
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData);
        }

        // Fetch cases
        const casesRes = await fetch("/api/cases");
        if (casesRes.ok) {
          const casesData = await casesRes.json();
          if (casesData.length > 0) {
            const activeCase = casesData[0];
            setYouthCase(activeCase);

            // Fetch steps for this case
            const stepsRes = await fetch(`/api/cases/${activeCase.id}/steps`);
            if (stepsRes.ok) {
              const stepsData = await stepsRes.json();
              setSteps(stepsData);
            }
          }
        }
      } catch {
        // Silently handle errors - show empty state
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const currentStep = steps.find((s) => s.state === "current");
  const completedSteps = steps.filter((s) => s.state === "done").length;
  const totalSteps = youthCase?.total_steps || steps.length || 5;
  const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  if (loading) {
    return (
      <YouthShell active="Home">
        <div className="youth-page-wrap">
          <div className="yd-loading">
            <div className="yd-loading-spinner" />
            <p>Loading your dashboard…</p>
          </div>
        </div>
      </YouthShell>
    );
  }

  const userName = profile?.full_name?.split(" ")[0] || "there";

  return (
    <YouthShell active="Home">
      <div className="youth-page-wrap">
        {/* Welcome banner */}
        <section className="welcome-card">
          <div className="welcome-copy">
            <Sun aria-hidden size={28} />
            <div>
              <p>Good morning,</p>
              <h1>{userName}</h1>
              <span>You&apos;re on your path. Keep going!</span>
            </div>
          </div>
          <div className="progress-card compact-card">
            <p>Overall progress</p>
            <strong className="progress-steps">
              {completedSteps} of {totalSteps} steps
            </strong>
            <ProgressMeter
              value={progressPercent}
              label={`${progressPercent}% complete`}
              showHeader
            />
          </div>
        </section>

        {/* Next step card */}
        {currentStep && (
          <section className="content-card next-step-card">
            <p className="section-label">Your next step</p>
            <div className="next-step">
              <div className="large-icon">
                <ClipboardList aria-hidden size={28} />
              </div>
              <div className="next-step-info">
                <h2>{currentStep.title}</h2>
                <p>{currentStep.detail}</p>
                {currentStep.location && (
                  <span className="next-step-location">
                    <MapPin aria-hidden size={14} />
                    {currentStep.location}
                  </span>
                )}
              </div>
              <Link className="small-action" href="/youth/steps">
                View this step
              </Link>
            </div>
          </section>
        )}

        {/* Quick access grid */}
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

        {/* Message strip */}
        <Link className="message-strip" href="/youth/messages">
          <MessageCircle aria-hidden size={20} />
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
