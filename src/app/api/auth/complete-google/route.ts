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
      if (!inviteCode || officerCode !== inviteCode) {
        return NextResponse.json(
          { error: "A valid officer invitation code is required" },
          { status: 403 },
        );
      }
    }

    const supabase = await createClient();

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
