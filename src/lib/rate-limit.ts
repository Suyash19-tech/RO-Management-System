import { redis } from './redis';

export interface RateLimitConfig {
  limit: number;      // max requests
  windowMs: number;   // time window in ms
}

if (redis) {
  console.log('Redis Rate Limiting active.');
} else {
  console.log('In-memory Rate Limiting active (No Redis URL/Token found).');
}

// ---------------- In-Memory Fallback Store ----------------
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, RateLimitRecord>();

// Cleanup old memory entries every 5 minutes to prevent memory leak
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    memoryStore.forEach((value, key) => {
      if (value.resetAt < now) memoryStore.delete(key);
    });
  }, 5 * 60 * 1000);
}

// ---------------- Main Rate Limiter Function ----------------
export async function rateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<{ success: boolean; remaining: number; resetAt: number }> {
  const now = Date.now();

  // If Redis is configured, run sliding window via Redis sorted set (ZSET)
  if (redis) {
    const key = `ratelimit:${identifier}`;
    const windowStart = now - config.windowMs;

    try {
      const pipeline = redis.pipeline();
      // 1. Remove timestamps outside the rolling window
      pipeline.zremrangebyscore(key, 0, windowStart);
      // 2. Add current request timestamp (using member name to ensure uniqueness)
      const member = `${now}-${Math.random().toString(36).substring(2, 7)}`;
      pipeline.zadd(key, { score: now, member });
      // 3. Count total items within the rolling window
      pipeline.zcard(key);
      // 4. Set key expiration to auto-cleanup inactive keys
      pipeline.expire(key, Math.ceil(config.windowMs / 1000));

      const results = await pipeline.exec();
      const count = results[2] as number;

      const success = count <= config.limit;
      const remaining = Math.max(0, config.limit - count);
      const resetAt = now + config.windowMs;

      return { success, remaining, resetAt };
    } catch (err) {
      console.error('Redis Rate Limiting failed, falling back to in-memory:', err);
    }
  }

  // In-memory Fallback sliding window
  const record = memoryStore.get(identifier);

  if (!record || record.resetAt < now) {
    const resetAt = now + config.windowMs;
    memoryStore.set(identifier, { count: 1, resetAt });
    return { success: true, remaining: config.limit - 1, resetAt };
  }

  if (record.count >= config.limit) {
    return { success: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count++;
  return { success: true, remaining: config.limit - record.count, resetAt: record.resetAt };
}
