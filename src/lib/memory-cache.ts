interface CacheEntry {
  value: any;
  expiresAt: number;
}

const memoryCache = new Map<string, CacheEntry>();

export function getMemoryCache(key: string): any | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  
  return entry.value;
}

export function setMemoryCache(key: string, value: any, ttlSeconds: number) {
  memoryCache.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

export function clearMemoryCache() {
  memoryCache.clear();
}
