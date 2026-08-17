import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();

    // Check if seed data already exists
    const { data: existingProfiles } = await supabase
      .from("profiles")
      .select("id")
      .limit(1);

    if (existingProfiles && existingProfiles.length > 0) {
      return NextResponse.json(
        { message: "Seed data already exists" },
        { status: 200 },
      );
    }

    const passwordHash = await bcrypt.hash("password123", 12);

    // Create test users via Supabase Auth
    const users = [
      {
        email: "diane@youth.rw",
        password: "password123",
        fullName: "Diane Uwimana",
        role: "youth",
        goal: "Start a business",
        skills: "Tailoring certificate, basic business knowledge",
        situation:
          "Unemployed. Wants to start a tailoring business but needs guidance on registration and funding.",
        district: "Gasabo District",
        sector: "Kimihurura",
      },
      {
        email: "jean@officer.rw",
        password: "password123",
        fullName: "Jean Claude",
        role: "officer",
        department: "Youth Empowerment",
        districtAssigned: "Gasabo District",
      },
      {
        email: "eric@youth.rw",
        password: "password123",
        fullName: "Eric Niyonzima",
        role: "youth",
        goal: "Get vocational training",
        skills: "Basic computer skills",
        situation: "Looking for vocational training in IT.",
        district: "Kicukiro District",
        sector: "Kicukiro",
      },
    ];

    const createdProfiles: Array<{ id: string; user_id: string; role: string }> = [];

    for (const user of users) {
      // Create auth user
      const { data: authUser, error: authError } =
        await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
        });

      if (authError || !authUser.user) {
        continue;
      }

      // Create profile
      const profileData: Record<string, unknown> = {
        user_id: authUser.user.id,
        email: user.email,
        full_name: user.fullName,
        role: user.role,
        password_hash: passwordHash,
      };

      if (user.role === "youth") {
        profileData.goal = user.goal;
        profileData.skills = user.skills;
        profileData.situation = user.situation;
        profileData.district = user.district;
        profileData.sector = user.sector;
      } else {
        profileData.department = user.department;
        profileData.district_assigned = user.districtAssigned;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .insert(profileData)
        .select()
        .single();

      if (profile) {
        createdProfiles.push({
          id: profile.id,
          user_id: authUser.user.id,
          role: user.role,
        });
      }
    }

    // Create a case for Diane (youth) assigned to Jean (officer)
    const youthProfile = createdProfiles.find(
      (p) => p.role === "youth" && p.id,
    );
    const officerProfile = createdProfiles.find(
      (p) => p.role === "officer" && p.id,
    );

    if (youthProfile && officerProfile) {
      const { data: youthCase } = await supabase
        .from("youth_cases")
        .insert({
          youth_profile_id: youthProfile.id,
          officer_profile_id: officerProfile.id,
          total_steps: 5,
          current_step: 2,
        })
        .select()
        .single();

      if (youthCase) {
        // Add roadmap steps
        const steps = [
          {
            case_id: youthCase.id,
            step_number: 1,
            title: "Register your business name with RDB",
            detail:
              "Register your business name and obtain a registration certificate.",
            institution: "RDB",
            status: "done",
            state: "done",
            location: "RDB Office – Gasabo District",
            source: "Verified RDB business registration rules",
          },
          {
            case_id: youthCase.id,
            step_number: 2,
            title: "Get your Tax Identification Number (TIN)",
            detail: "Apply for and get your TIN from RRA.",
            institution: "RRA",
            status: "current",
            state: "current",
            location: "RRA Office – Gasabo District",
            source: "Verified RRA tax registration rules",
          },
          {
            case_id: youthCase.id,
            step_number: 3,
            title: "Open a business bank account",
            detail: "Open an account in a bank in your business name.",
            institution: "Bank",
            status: "locked",
            state: "locked",
          },
          {
            case_id: youthCase.id,
            step_number: 4,
            title: "Apply for BDF loan guarantee",
            detail: "Prepare documents and apply for a loan guarantee.",
            institution: "BDF",
            status: "locked",
            state: "locked",
          },
          {
            case_id: youthCase.id,
            step_number: 5,
            title: "Build your business plan",
            detail: "Prepare or review this plan for funding.",
            institution: "Training",
            status: "locked",
            state: "locked",
          },
        ];

        await supabase.from("roadmap_steps").insert(steps);

        // Add a test message
        const officerProfileForMsg = createdProfiles.find(
          (p) => p.role === "officer",
        );
        if (officerProfileForMsg) {
          await supabase.from("messages").insert({
            case_id: youthCase.id,
            sender_id: officerProfileForMsg.id,
            sender_role: "officer",
            content:
              "Hello Diane! I reviewed your progress. Great job completing the first step! You can now move to the next step.",
          });
        }
      }
    }

    return NextResponse.json({
      message: "Seed data created successfully",
      users: [
        { email: "diane@youth.rw", password: "password123", role: "youth" },
        { email: "jean@officer.rw", password: "password123", role: "officer" },
        { email: "eric@youth.rw", password: "password123", role: "youth" },
      ],
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to seed data", details: String(error) },
      { status: 500 },
    );
  }
}
