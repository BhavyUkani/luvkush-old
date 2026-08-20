"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrSetCache = getOrSetCache;
exports.invalidateCache = invalidateCache;
const store = new Map();
/** Minimal in-process TTL cache for read-heavy, eventually-consistent data
 * (dashboard aggregates and similar) — not a distributed cache, so it only
 * saves work within a single server instance and resets on restart. That
 * trade-off is fine for values where a few seconds/minutes of staleness is
 * acceptable in exchange for not recomputing expensive aggregate queries on
 * every request. */
async function getOrSetCache(key, ttlMs, compute) {
    const hit = store.get(key);
    if (hit && hit.expiresAt > Date.now())
        return hit.value;
    const value = await compute();
    store.set(key, { value, expiresAt: Date.now() + ttlMs });
    return value;
}
function invalidateCache(key) {
    store.delete(key);
}
//# sourceMappingURL=cache.js.map