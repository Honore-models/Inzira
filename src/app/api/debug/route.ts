import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        error: "Missing env vars",
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Count total profiles
    const { count: totalProfiles } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true });

    // Count officers
    const { count: totalOfficers } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "officer");

    // Get all officers (basic info)
    const { data: officers, error: officerError } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, department, district_assigned")
      .eq("role", "officer");

    // Get all youth
    const { count: totalYouth } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "youth");

    return NextResponse.json({
      supabaseUrl: supabaseUrl?.substring(0, 30) + "...",
      hasServiceRoleKey: !!supabaseKey,
      totalProfiles,
      totalOfficers,
      totalYouth,
      officers: officers || [],
      officerError: officerError?.message || null,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
