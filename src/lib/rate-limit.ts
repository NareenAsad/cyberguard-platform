import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { redis } from '@/lib/redis'

// ─── In-Memory Fallback ──────────────────────────────────────────────────────
// Used when Redis is not configured (e.g. local dev without .env credentials).
// Implements the same sliding window log algorithm as the Redis path.

interface RateLimitRecord {
    timestamps: number[]
}

const inMemoryStore = new Map<string, RateLimitRecord>()

// Clean up expired in-memory entries every minute to prevent memory leaks
if (typeof globalThis !== 'undefined') {
    const globalAny = globalThis as any
    if (!globalAny.__rateLimitCleanupInterval) {
        globalAny.__rateLimitCleanupInterval = setInterval(() => {
            const now = Date.now()
            for (const [key, record] of inMemoryStore.entries()) {
                record.timestamps = record.timestamps.filter(t => now - t < 60_000)
                if (record.timestamps.length === 0) {
                    inMemoryStore.delete(key)
                }
            }
        }, 60_000)
    }
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface RateLimitOptions {
    limit?: number     // Max requests in the window (default 60)
    windowMs?: number  // Window duration in ms (default 60 000)
    endpoint?: string  // Unique key prefix per API endpoint
}

export interface RateLimitResult {
    isAllowed: boolean
    limit: number
    remaining: number
    reset: number       // Unix timestamp (ms) when the window resets
    response?: NextResponse
}

// ─── Redis Sliding Window ────────────────────────────────────────────────────

/**
 * Redis sliding window rate limiter using sorted sets.
 *
 * Algorithm:
 *  1. ZREMRANGEBYSCORE  — evict timestamps older than the window
 *  2. ZCARD             — count remaining timestamps
 *  3. ZADD              — record the current request timestamp (score = timestamp)
 *  4. EXPIRE            — auto-expire the key after one window so Redis stays clean
 *
 * All four operations are pipelined in a single round-trip.
 */
async function redisRateLimit(
    key: string,
    limit: number,
    windowMs: number
): Promise<{ count: number }> {
    const now = Date.now()
    const windowStart = now - windowMs

    const pipeline = redis!.pipeline()
    pipeline.zremrangebyscore(key, 0, windowStart)
    pipeline.zcard(key)
    pipeline.zadd(key, { score: now, member: now.toString() })
    pipeline.expire(key, Math.ceil(windowMs / 1000))

    const results = await pipeline.exec()
    // results[1] is the ZCARD result (count before adding current request)
    const countBeforeAdd = (results[1] as number) ?? 0
    return { count: countBeforeAdd }
}

// ─── In-Memory Sliding Window ────────────────────────────────────────────────

function inMemoryRateLimit(
    key: string,
    limit: number,
    windowMs: number,
    now: number
): { count: number } {
    let record = inMemoryStore.get(key)
    if (!record) {
        record = { timestamps: [] }
        inMemoryStore.set(key, record)
    }
    record.timestamps = record.timestamps.filter(t => now - t < windowMs)
    const count = record.timestamps.length
    record.timestamps.push(now)
    return { count }
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Sliding-window rate limiting keyed directly by an arbitrary identifier
 * (already namespaced by the caller). This is the core primitive behind
 * `rateLimit()` below — split out so callers that don't have a `NextRequest`
 * (e.g. Server Actions like `login()`, which only receive `FormData`) can
 * still rate limit using the same Redis/in-memory sliding window.
 */
export async function rateLimitKey(
    key: string,
    options: RateLimitOptions = {}
): Promise<RateLimitResult> {
    const { limit = 60, windowMs = 60_000 } = options
    const now = Date.now()

    let count: number
    try {
        if (redis) {
            ;({ count } = await redisRateLimit(key, limit, windowMs))
        } else {
            ;({ count } = inMemoryRateLimit(key, limit, windowMs, now))
        }
    } catch (err) {
        // Redis error — fall back to in-memory to keep the app running
        console.error('[RateLimit] Redis error, falling back to in-memory:', err)
        ;({ count } = inMemoryRateLimit(key, limit, windowMs, now))
    }

    const resetTime = now + windowMs

    // 5. Enforce limit
    if (count >= limit) {
        const retryAfterSeconds = Math.ceil(windowMs / 1000)

        const headers = new Headers({
            'Retry-After': String(retryAfterSeconds),
            'X-RateLimit-Limit': String(limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(resetTime / 1000)),
        })

        const response = NextResponse.json(
            {
                success: false,
                error: 'Too Many Requests',
                message: `Rate limit exceeded. Please try again in ${retryAfterSeconds} seconds.`,
            },
            { status: 429, headers }
        )

        return { isAllowed: false, limit, remaining: 0, reset: resetTime, response }
    }

    const remaining = limit - (count + 1)

    return { isAllowed: true, limit, remaining, reset: resetTime }
}

/**
 * Sliding-window rate limiting helper for API routes.
 *
 * - Uses Redis (Upstash) when UPSTASH_REDIS_REST_URL is set — persists across
 *   server restarts and works across multiple instances.
 * - Falls back to an in-memory Map when Redis is not configured.
 *
 * Identity resolution (OWASP recommendation):
 *   Authenticated users  → keyed by user ID
 *   Unauthenticated      → keyed by IP address
 */
export async function rateLimit(
    request: NextRequest,
    options: RateLimitOptions = {}
): Promise<RateLimitResult> {
    const { endpoint = 'global' } = options

    // 1. Resolve client IP
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ip = forwardedFor
        ? forwardedFor.split(',')[0].trim()
        : ((request as any).ip || '127.0.0.1')

    // 2. Resolve authenticated user ID (safe fallback if cookies unavailable)
    let userId: string | null = null
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) userId = user.id
    } catch {
        // Safe fallback during build/prerender
    }

    // 3. Build the rate-limit key and delegate to the shared limiter
    const identifier = userId ? `user:${userId}` : `ip:${ip}`
    const key = `rl:${endpoint}:${identifier}`

    return rateLimitKey(key, options)
}
