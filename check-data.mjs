import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const env = fs.readFileSync(".env.local", "utf8");
const get = (k) => env.split("\n").map(l => l.trim()).find(l => l.startsWith(k + "="))?.split("=").slice(1).join("=");
const supabase = createClient(get("NEXT_PUBLIC_SUPABASE_URL"), get("SUPABASE_SERVICE_ROLE_KEY"));

const tables = ["profiles", "youth_cases", "roadmap_steps", "messages", "institutions"];
for (const t of tables) {
  const { data, error } = await supabase.from(t).select("*").limit(5);
  console.log(`\n=== ${t} ===`);
  console.log(error ? `ERROR: ${error.message}` : `Count sample: ${data?.length}`);
  if (data?.length) console.log(JSON.stringify(data[0], null, 2).slice(0, 600));
}

// Check auth users
const { data: users, error: uErr } = await supabase.auth.admin.listUsers();
console.log("\n=== Auth users ===");
console.log(uErr ? `ERROR: ${uErr.message}` : users?.users?.map(u => u.email).join(", "));
