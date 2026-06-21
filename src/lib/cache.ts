import { redis } from '@/lib/redis'

/**
 * Generic Redis cache utility for CyberGuard API routes.
 *
 * All keys are namespaced under "cg:" to avoid collisions with rate-limit keys.
 *
 * Falls back silently if Redis is not configured — callers always get `null`
 * on a cache miss and must re-fetch from the database.
 */

const KEY_PREFIX = 'cg:cache:'

function prefixed(key: string): string {
    return `${KEY_PREFIX}${key}`
}

/**
 * Retrieve a cached value. Returns `null` on cache miss OR if Redis is not available.
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
    if (!redis) return null
    try {
        const value = await redis.get<T>(prefixed(key))
        return value ?? null
    } catch (err) {
        console.error(`[Cache] GET error for key "${key}":`, err)
        return null
    }
}

/**
 * Store a value in the cache with a TTL (seconds).
 * Silently no-ops if Redis is not available.
 */
export async function cacheSet(
    key: string,
    value: unknown,
    ttlSeconds: number
): Promise<void> {
    if (!redis) return
    try {
        await redis.set(prefixed(key), JSON.stringify(value), { ex: ttlSeconds })
    } catch (err) {
        console.error(`[Cache] SET error for key "${key}":`, err)
    }
}

/**
 * Delete a specific cache key (use after mutations to invalidate stale data).
 */
export async function cacheDel(key: string): Promise<void> {
    if (!redis) return
    try {
        await redis.del(prefixed(key))
    } catch (err) {
        console.error(`[Cache] DEL error for key "${key}":`, err)
    }
}

/**
 * Delete all cache keys that start with a given prefix.
 * Useful for invalidating a group of related keys (e.g. all chart-data ranges).
 *
 * Note: Uses SCAN — safe for production (non-blocking).
 */
export async function cacheInvalidatePrefix(prefix: string): Promise<void> {
    if (!redis) return
    try {
        const fullPrefix = prefixed(prefix)
        let cursor = 0
        do {
            const [nextCursor, keys] = await redis.scan(cursor, {
                match: `${fullPrefix}*`,
                count: 100,
            })
            cursor = Number(nextCursor)
            if (keys.length > 0) {
                await redis.del(...keys)
            }
        } while (cursor !== 0)
    } catch (err) {
        console.error(`[Cache] SCAN/DEL error for prefix "${prefix}":`, err)
    }
}
