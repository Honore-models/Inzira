import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createClient } from "@/lib/supabase/server";
import { takeToken } from "@/lib/server/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    if (!takeToken(`signup:${ip}`, 8, 10 * 60_000)) {
      return NextResponse.json(
        { error: "Too many sign-up attempts. Please try again in a few minutes." },
        { status: 429 },
      );
    }

    const { email: rawEmail, password, fullName: rawFullName, role, officerCode } = await request.json();
    const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
    const fullName = typeof rawFullName === "string" ? rawFullName.trim() : "";

    if (!email || !password || !fullName || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (!["youth", "officer"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 },
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || fullName.length < 2 || fullName.length > 120) {
      return NextResponse.json({ error: "Enter a valid name and email address" }, { status: 400 });
    }
    if (typeof password !== "string" || password.length < 8 || password.length > 128) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }
    if (role === "officer") {
      const inviteCode = process.env.OFFICER_SIGNUP_CODE;
      const testInviteCode = process.env.TEST_OFFICER_INVITATION_CODE;
      const testSignupsEnabled = process.env.ENABLE_TEST_OFFICER_SIGNUP === "true";
      const hasValidProductionCode = !!inviteCode && officerCode === inviteCode;
      const hasValidTestCode = testSignupsEnabled && !!testInviteCode && officerCode === testInviteCode;
      if (!hasValidProductionCode && !hasValidTestCode) {
        return NextResponse.json({ error: "A valid officer invitation code is required" }, { status: 403 });
      }
    }

    const supabase = await createClient();

    // Check if user already exists
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists. Try signing in instead." },
        { status: 409 },
      );
    }

    // Create auth user (admin API with email pre-confirmed, since we
    // don't send confirmation emails)
    const { data: authUser, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError || !authUser.user) {
      return NextResponse.json(
        {
          error: authError?.message?.includes("already")
            ? "An account with this email already exists. Try signing in instead."
            : "We couldn't create your account. Please try again.",
        },
        { status: 500 },
      );
    }

    // Hash password for our profiles table
    const passwordHash = await bcrypt.hash(password, 12);

    // Create profile
    const { error: profileError } = await supabase.from("profiles").insert({
      user_id: authUser.user.id,
      email,
      full_name: fullName,
      role,
      password_hash: passwordHash,
    });

    if (profileError) {
      await supabase.auth.admin.deleteUser(authUser.user.id);
      return NextResponse.json(
        { error: "We couldn't create your account. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { message: "User created successfully", userId: authUser.user.id },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
