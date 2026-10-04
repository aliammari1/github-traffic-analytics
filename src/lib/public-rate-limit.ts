// SPDX-License-Identifier: MIT

// An isolate-local backstop. Cloudflare edge controls and GitHub upstream
// limits remain necessary because different Worker isolates do not share it.
const ipRateLimit = new Map<string, number[]>();
const MAX_RATE_LIMIT_ENTRIES = 5_000;

export function checkIpRateLimit(
  ip: string,
  maxRequests = 60,
  windowMs = 60_000,
  now = Date.now()
): boolean {
  const windowStart = now - windowMs;
  let timestamps = ipRateLimit.get(ip);
  if (!timestamps) {
    if (ipRateLimit.size >= MAX_RATE_LIMIT_ENTRIES) {
      for (const [key, times] of ipRateLimit.entries()) {
        const valid = times.filter((t) => t > windowStart);
        if (valid.length === 0) ipRateLimit.delete(key);
        else ipRateLimit.set(key, valid);
      }
    }
    timestamps = [];
    ipRateLimit.set(ip, timestamps);
  }
  const recent = timestamps.filter((t) => t > windowStart);
  if (recent.length >= maxRequests) {
    ipRateLimit.set(ip, recent);
    return false;
  }
  recent.push(now);
  ipRateLimit.set(ip, recent);
  return true;
}

export function resetIpRateLimit() {
  ipRateLimit.clear();
}

export function requesterIp(headers: Headers): string {
  return (
    headers.get("cf-connecting-ip") ??
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "anonymous"
  );
}
