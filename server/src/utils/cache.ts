import { redis } from "./redis";

const DEFAULT_TTL_SECONDS = 60 * 60 * 24; // 24 hours

/**
 * Generic read-through cache. Returns the cached value for `key` if present,
 * otherwise runs `fetcher`, caches the result (JSON) for `ttlSeconds`, and
 * returns it.
 *
 * @example
 *   const profile = await cached(`profile:${id}`, () => loadProfile(id));
 */
export async function cached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = DEFAULT_TTL_SECONDS,
): Promise<T> {
  if (redis.isReady) {
    const hit = await redis.get(key);
    if (hit) return JSON.parse(hit) as T;
  }

  const value = await fetcher();

  if (redis.isReady && value !== undefined && value !== null) {
    await redis.set(key, JSON.stringify(value), { EX: ttlSeconds });
  }

  return value;
}

/** Invalidate a cached key. */
export async function invalidateCache(key: string): Promise<void> {
  if (redis.isReady) await redis.del(key);
}
