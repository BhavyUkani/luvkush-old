interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

/** Minimal in-process TTL cache for read-heavy, eventually-consistent data
 * (dashboard aggregates and similar) — not a distributed cache, so it only
 * saves work within a single server instance and resets on restart. That
 * trade-off is fine for values where a few seconds/minutes of staleness is
 * acceptable in exchange for not recomputing expensive aggregate queries on
 * every request. */
export async function getOrSetCache<T>(key: string, ttlMs: number, compute: () => Promise<T>): Promise<T> {
  const hit = store.get(key);
  if (hit && hit.expiresAt > Date.now()) return hit.value as T;

  const value = await compute();
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
  return value;
}

export function invalidateCache(key: string): void {
  store.delete(key);
}
