import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import { auth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type Db = Awaited<ReturnType<typeof createClient>>;

export interface Viewer {
  session: Session;
  profileId: string;
  role: "youth" | "officer";
  name: string;
  db: Db;
}

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Resolve the signed-in user and their profile row. Returns a ready-made
 * error response when the request is not authorised.
 */
export async function requireViewer(
  role?: "youth" | "officer",
): Promise<Viewer | NextResponse> {
  const session = await auth();
  if (!session?.user?.id) return jsonError("Please sign in to continue.", 401);

  const db = await createClient();
  const { data: profile } = await db
    .from("profiles")
    .select("id, role, full_name")
    .eq("user_id", session.user.id)
    .single();

  if (!profile) return jsonError("Your profile could not be found.", 404);
  if (role && profile.role !== role) {
    return jsonError("You don't have access to this.", 403);
  }

  return {
    session,
    profileId: profile.id,
    role: profile.role,
    name: profile.full_name,
    db,
  };
}

export function isResponse(value: unknown): value is NextResponse {
  return value instanceof NextResponse;
}

/**
 * A youth has one primary case: the most recent case that carries a roadmap,
 * otherwise their most recent open case.
 */
export async function getPrimaryCase(db: Db, youthProfileId: string) {
  const { data: cases } = await db
    .from("youth_cases")
    .select("*")
    .eq("youth_profile_id", youthProfileId)
    .neq("status", "archived")
    .order("created_at", { ascending: false });

  if (!cases?.length) return null;
  return cases.find((c) => c.total_steps > 0) || cases[0];
}

/** Officers may access every case; a youth only their own. */
export async function canAccessCase(viewer: Viewer, caseId: string) {
  const { data: youthCase } = await viewer.db
    .from("youth_cases")
    .select("id, youth_profile_id, officer_profile_id, current_step, total_steps, status")
    .eq("id", caseId)
    .single();

  if (!youthCase) return null;
  if (viewer.role === "officer") return youthCase;
  return youthCase.youth_profile_id === viewer.profileId ? youthCase : null;
}

/**
 * Choose an officer for a new youth: one assigned to their district if
 * possible, otherwise the officer with the lightest caseload.
 */
export async function pickOfficerFor(db: Db, district?: string | null) {
  const { data: officers } = await db
    .from("profiles")
    .select("id, district_assigned")
    .eq("role", "officer");
  if (!officers?.length) return null;

  const { data: cases } = await db
    .from("youth_cases")
    .select("officer_profile_id")
    .eq("status", "active");

  const load = new Map<string, number>();
  for (const c of cases || []) {
    if (c.officer_profile_id) {
      load.set(c.officer_profile_id, (load.get(c.officer_profile_id) || 0) + 1);
    }
  }

  const normalise = (d?: string | null) =>
    (d || "").toLowerCase().replace(/\s*district$/, "").trim();
  const local = officers.filter(
    (o) => district && normalise(o.district_assigned) === normalise(district),
  );
  const pool = local.length ? local : officers;
  pool.sort((a, b) => (load.get(a.id) || 0) - (load.get(b.id) || 0));
  return pool[0].id as string;
}

/** Profile columns safe to send to officers (never password_hash). */
export const YOUTH_FIELDS =
  "id, full_name, email, goal, skills, skills_background, situation, district, sector, onboarding_completed, onboarding_submitted_at, created_at";
