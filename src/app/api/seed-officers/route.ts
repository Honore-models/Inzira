import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

export async function POST() {
  try {
    const supabase = getSupabaseAdmin();

    // Check if any officers already exist
    const { data: existingOfficers } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "officer")
      .limit(1);

    if (existingOfficers && existingOfficers.length > 0) {
      return NextResponse.json({
        message: "Officers already exist in the database",
        count: existingOfficers.length,
      });
    }

    const passwordHash = await bcrypt.hash("password123", 12);

    const officers = [
      {
        email: "honore@officer.rw",
        fullName: "NHOGUSHIMWA Honore",
        department: "Youth Empowerment",
        districtAssigned: "Gasabo",
      },
      {
        email: "jean@officer.rw",
        fullName: "Jean Claude Mutoni",
        department: "Employment Services",
        districtAssigned: "Kicukiro",
      },
      {
        email: "marie@officer.rw",
        fullName: "Marie Uwimana",
        department: "Vocational Training",
        districtAssigned: "Nyarugenge",
      },
    ];

    const created: string[] = [];

    for (const officer of officers) {
      // Create auth user
      const { data: authUser, error: authError } =
        await supabase.auth.admin.createUser({
          email: officer.email,
          password: "password123",
          email_confirm: true,
        });

      if (authError || !authUser.user) {
        continue;
      }

      // Create profile
      const { error: profileError } = await supabase.from("profiles").insert({
        user_id: authUser.user.id,
        email: officer.email,
        full_name: officer.fullName,
        role: "officer",
        password_hash: passwordHash,
        department: officer.department,
        district_assigned: officer.districtAssigned,
      });

      if (!profileError) {
        created.push(officer.email);
      }
    }

    return NextResponse.json({
      message: "Officers seeded successfully",
      officersCreated: created,
      totalOfficers: created.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to seed officers", details: String(error) },
      { status: 500 },
    );
  }
}
