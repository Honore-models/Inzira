"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";

export interface JourneyStep {
  id: string;
  step_number: number;
  title: string;
  detail: string | null;
  institution: string | null;
  location: string | null;
  source: string | null;
  state: "done" | "current" | "locked";
  what_to_bring: string[];
  why_this_step: string | null;
}

export interface Journey {
  profile: {
    id: string;
    full_name: string;
    email: string;
    goal: string | null;
    skills: string | null;
    skills_background: string | null;
    district: string | null;
    sector: string | null;
    onboarding_completed: boolean;
    created_at: string;
  } | null;
  case: {
    id: string;
    status: string;
    current_step: number;
    total_steps: number;
    officer_profile_id: string | null;
    created_at: string;
  } | null;
  steps: JourneyStep[];
  roadmap: { id: string; title: string; summary: string; approvedAt: string } | null;
  officer: { id: string; full_name: string; email: string; department: string | null; district_assigned: string | null } | null;
  unreadCount: number;
}

/** Loads the signed-in youth's journey; sends un-onboarded youth to onboarding. */
export function useJourney({ requireOnboarding = true } = {}) {
  const router = useRouter();
  const [data, setData] = useState<Journey | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      const journey = await api<Journey>("/api/me");
      if (requireOnboarding && journey.profile && !journey.profile.onboarding_completed && !journey.case) {
        router.replace("/onboarding");
        return;
      }
      setData(journey);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load your information.");
    } finally {
      setLoading(false);
    }
  }, [requireOnboarding, router]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, error, loading, reload };
}
