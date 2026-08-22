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

    // Get existing officers and delete their auth users + profiles
    const { data: existingOfficers } = await supabase
      .from("profiles")
      .select("id, user_id")
      .eq("role", "officer");

    if (existingOfficers && existingOfficers.length > 0) {
      // Delete auth users for existing officers
      for (const officer of existingOfficers) {
        await supabase.auth.admin.deleteUser(officer.user_id);
      }
      // Delete profiles
      await supabase
        .from("profiles")
        .delete()
        .eq("role", "officer");
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
        console.error(`Failed to create auth user for ${officer.email}:`, authError);
        continue;
      }

      // Create profile with all required fields
      const { error: profileError } = await supabase.from("profiles").insert({
        user_id: authUser.user.id,
        email: officer.email,
        full_name: officer.fullName,
        role: "officer",
        password_hash: passwordHash,
        department: officer.department,
        district_assigned: officer.districtAssigned,
        onboarding_completed: true,
      });

      if (profileError) {
        console.error(`Failed to create profile for ${officer.email}:`, profileError);
        continue;
      }

      created.push(officer.email);
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
