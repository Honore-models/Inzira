// Small in-memory sliding-window limiter. It is per server instance, which is
// enough to stop one user from exhausting the shared free-tier AI quota.

const buckets = new Map<string, number[]>();

export function takeToken(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    buckets.set(key, recent);
    return false;
  }
  recent.push(now);
  buckets.set(key, recent);
  return true;
}
