// Shared by server routes and client pages so every screen agrees on what a
// youth's status is.

export type YouthStatus =
  | "not_onboarded"
  | "needs_roadmap"
  | "in_progress"
  | "completed";

export interface CaseSummary {
  id: string;
  status: string;
  current_step: number;
  total_steps: number;
  officer_profile_id?: string | null;
  created_at?: string;
}

export const STATUS_LABELS: Record<YouthStatus, string> = {
  not_onboarded: "Not onboarded",
  needs_roadmap: "Needs roadmap",
  in_progress: "In progress",
  completed: "Completed",
};

/** The case carrying the youth's roadmap, else the newest open case. */
export function primaryCase<T extends CaseSummary>(cases: T[] | null | undefined): T | null {
  const open = (cases || [])
    .filter((c) => c.status !== "archived")
    .sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
  return open.find((c) => c.total_steps > 0) || open[0] || null;
}

export function deriveYouthStatus(
  onboardingCompleted: boolean,
  cases: CaseSummary[] | null | undefined,
): YouthStatus {
  const c = primaryCase(cases);
  if (c?.status === "completed") return "completed";
  if (c && c.total_steps > 0) return "in_progress";
  if (!onboardingCompleted) return "not_onboarded";
  return "needs_roadmap";
}

/** Number of finished steps, derived from the case pointer. */
export function completedSteps(c: CaseSummary | null | undefined): number {
  if (!c || c.total_steps === 0) return 0;
  if (c.status === "completed") return c.total_steps;
  return Math.max(0, Math.min(c.total_steps, (c.current_step || 1) - 1));
}

export function progressPercent(c: CaseSummary | null | undefined): number {
  if (!c || c.total_steps === 0) return 0;
  return Math.round((completedSteps(c) / c.total_steps) * 100);
}

export function initials(name: string | null | undefined): string {
  return (
    (name || "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "?"
  );
}
