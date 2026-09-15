import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const enabled = process.env.ENABLE_TEST_OFFICER_SIGNUP === "true";
  const code = process.env.TEST_OFFICER_INVITATION_CODE;

  if (!enabled || !code) {
    return NextResponse.json(
      { enabled: false },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  // This endpoint is deliberately only usable when an administrator enables
  // test mode. Its code is for a demo/staging environment, never production.
  return NextResponse.json(
    { enabled: true, code },
    { headers: { "Cache-Control": "no-store" } },
  );
}
