/** Minimal in-process TTL cache for read-heavy, eventually-consistent data
 * (dashboard aggregates and similar) — not a distributed cache, so it only
 * saves work within a single server instance and resets on restart. That
 * trade-off is fine for values where a few seconds/minutes of staleness is
 * acceptable in exchange for not recomputing expensive aggregate queries on
 * every request. */
export declare function getOrSetCache<T>(key: string, ttlMs: number, compute: () => Promise<T>): Promise<T>;
export declare function invalidateCache(key: string): void;
//# sourceMappingURL=cache.d.ts.map