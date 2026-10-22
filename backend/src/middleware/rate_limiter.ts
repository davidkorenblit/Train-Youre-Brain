// ============================================================================
// CodeReview Arena - In-Memory Rate Limiter Middleware
// Limits API request frequency per client IP to prevent abuse and token depletion
// ============================================================================

import { Context, Next } from "hono";

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number;      // Maximum allowed requests per window
}

// Map of IP addresses to their request timestamps
const requestLog = new Map<string, number[]>();

/**
 * Creates a Hono middleware that enforces a rate limit threshold.
 * Default: 15 requests per 5 minutes (300,000 ms).
 */
export function rateLimiter(config: RateLimitConfig = { windowMs: 5 * 60 * 1000, max: 15 }) {
  return async (c: Context, next: Next) => {
    // Extract client IP address from standard Cloudflare headers
    const clientIp =
      c.req.header("cf-connecting-ip") ||
      c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ||
      "anonymous";

    const now = Date.now();
    const timestamps = requestLog.get(clientIp) || [];

    // Filter out timestamps older than the sliding window
    const recentTimestamps = timestamps.filter((time) => now - time < config.windowMs);

    if (recentTimestamps.length >= config.max) {
      const oldestTime = recentTimestamps[0];
      const retryAfterSec = Math.ceil((oldestTime + config.windowMs - now) / 1000);

      return c.json(
        {
          error: `Rate limit exceeded. Maximum ${config.max} requests per ${Math.round(
            config.windowMs / 60000
          )} minutes.`,
          retry_after_seconds: retryAfterSec,
        },
        429
      );
    }

    // Record the current timestamp and update map
    recentTimestamps.push(now);
    requestLog.set(clientIp, recentTimestamps);

    // Housekeeping: occasionally purge old IPs to keep memory footprint minimal
    if (requestLog.size > 2000) {
      for (const [ip, logs] of requestLog.entries()) {
        if (logs.every((time) => now - time >= config.windowMs)) {
          requestLog.delete(ip);
        }
      }
    }

    await next();
  };
}
