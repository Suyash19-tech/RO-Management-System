// In-memory sliding window rate limiter
// Production-safe for single-instance deployments

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitRecord>();

// Cleanup old entries every 5 minutes to prevent memory leak
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    store.forEach((value, key) => {
      if (value.resetAt < now) store.delete(key);
    });
  }, 5 * 60 * 1000);
}

export interface RateLimitConfig {
  limit: number;      // max requests
  windowMs: number;   // time window in ms
}

export function rateLimit(
  identifier: string,
  config: RateLimitConfig
): { success: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = store.get(identifier);

  if (!record || record.resetAt < now) {
    // New window
    const resetAt = now + config.windowMs;
    store.set(identifier, { count: 1, resetAt });
    return { success: true, remaining: config.limit - 1, resetAt };
  }

  if (record.count >= config.limit) {
    return { success: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count++;
  return { success: true, remaining: config.limit - record.count, resetAt: record.resetAt };
}
