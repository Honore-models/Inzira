/**
 * Runs once when the server starts.
 *
 * Prefer IPv4 when resolving hostnames. On networks that advertise IPv6 but
 * can't route it, Node otherwise tries IPv6 first and outbound calls to Groq
 * and Supabase intermittently time out.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const dns = await import("node:dns");
    dns.setDefaultResultOrder("ipv4first");
  }
}
