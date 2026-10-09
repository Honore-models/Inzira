import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** GET /api/institutions — public directory of verified institutions. */
export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("institutions")
    .select("id, title, description, location, category, initials, logo_bg, logo_url, details")
    .order("title");

  if (error) {
    return NextResponse.json({ error: "Could not load institutions." }, { status: 500 });
  }
  return NextResponse.json(data, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
  });
}
