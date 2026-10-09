import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createClient } from "@/lib/supabase/server";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { role, password, officerCode } = await request.json();

    if (!role || !["youth", "officer"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    if (role === "officer") {
      const inviteCode = process.env.OFFICER_SIGNUP_CODE;
      const testInviteCode = process.env.TEST_OFFICER_INVITATION_CODE;
      const testSignupsEnabled = process.env.ENABLE_TEST_OFFICER_SIGNUP === "true";
      const hasValidProductionCode = !!inviteCode && officerCode === inviteCode;
      const hasValidTestCode = testSignupsEnabled && !!testInviteCode && officerCode === testInviteCode;
      if (!hasValidProductionCode && !hasValidTestCode) {
        return NextResponse.json(
          { error: "A valid officer invitation code is required" },
          { status: 403 },
        );
      }
    }

    const supabase = await createClient();

    // Only a first-time Google account (no password yet) may pick its role.
    const { data: existing } = await supabase
      .from("profiles")
      .select("password_hash")
      .eq("user_id", session.user.id)
      .single();
    if (!existing || existing.password_hash !== "google") {
      return NextResponse.json({ error: "Your account is already set up." }, { status: 409 });
    }

    // Hash the password and update the profile
    const passwordHash = await bcrypt.hash(password, 12);

    const { error } = await supabase
      .from("profiles")
      .update({
        role,
        password_hash: passwordHash,
      })
      .eq("user_id", session.user.id);

    if (error) {
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 },
      );
    }

    const { error: authError } = await supabase.auth.admin.updateUserById(
      session.user.id,
      { password },
    );
    if (authError) {
      return NextResponse.json({ error: "Failed to set account password" }, { status: 500 });
    }

    return NextResponse.json({ message: "Profile completed" }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
