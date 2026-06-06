import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// In-memory request store using standard sliding window log
interface RateLimitRecord {
    timestamps: number[]
}

const rateLimitStore = new Map<string, RateLimitRecord>()

// Clean up expired entries every minute to prevent memory leaks
if (typeof globalThis !== 'undefined') {
    const globalAny = globalThis as any
    if (!globalAny.__rateLimitCleanupInterval) {
        globalAny.__rateLimitCleanupInterval = setInterval(() => {
            const now = Date.now()
            for (const [key, record] of rateLimitStore.entries()) {
                // Keep only timestamps from the last 60 seconds
                record.timestamps = record.timestamps.filter(t => now - t < 60000)
                if (record.timestamps.length === 0) {
                    rateLimitStore.delete(key)
                }
            }
        }, 60000)
    }
}

export interface RateLimitOptions {
    limit?: number       // Max request count in the window
    windowMs?: number    // Window duration (default 60 seconds)
    endpoint?: string    // Unique key prefix for the API endpoint
}

/**
 * Slide-window rate limiting helper.
 * Determines identity by checking authenticated user ID first, falling back to IP.
 */
export async function rateLimit(
    request: NextRequest,
    options: RateLimitOptions = {}
): Promise<{
    isAllowed: boolean
    limit: number
    remaining: number
    reset: number
    response?: NextResponse
}> {
    const { limit = 60, windowMs = 60000, endpoint = 'global' } = options
    const now = Date.now()

    // 1. Resolve client IP address
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : ((request as any).ip || '127.0.0.1')

    // 2. Resolve User ID (if authenticated)
    let userId: string | null = null
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            userId = user.id
        }
    } catch (e) {
        // Safe fallback if server client or cookies are not available during build/prerender
    }

    // 3. Form identifier: User-based if authenticated, IP-based otherwise (OWASP recommendation)
    const identifier = userId ? `user:${userId}` : `ip:${ip}`
    const key = `${endpoint}:${identifier}`

    // 4. Retrieve rate limit state
    let record = rateLimitStore.get(key)
    if (!record) {
        record = { timestamps: [] }
        rateLimitStore.set(key, record)
    }

    // Remove old logs outside of the current window
    record.timestamps = record.timestamps.filter(t => now - t < windowMs)

    const requestCount = record.timestamps.length

    if (requestCount >= limit) {
        const oldestTimestamp = record.timestamps[0] || now
        const resetTime = oldestTimestamp + windowMs
        const retryAfterSeconds = Math.ceil((resetTime - now) / 1000)

        // Return a standard 429 Too Many Requests response with RFC-compliant headers
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
                message: `Rate limit exceeded. Please try again in ${retryAfterSeconds} seconds.` 
            },
            { status: 429, headers }
        )

        return {
            isAllowed: false,
            limit,
            remaining: 0,
            reset: resetTime,
            response,
        }
    }

    // Add current request log
    record.timestamps.push(now)
    const remaining = limit - record.timestamps.length
    const resetTime = now + windowMs

    return {
        isAllowed: true,
        limit,
        remaining,
        reset: resetTime,
    }
}
