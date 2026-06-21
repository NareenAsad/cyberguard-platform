import { Redis } from '@upstash/redis'

/**
 * Upstash Redis singleton client.
 *
 * The client communicates over HTTP (no persistent TCP socket), making it
 * safe for Next.js serverless/edge runtimes where long-lived connections are
 * not supported.
 *
 * Falls back gracefully: if the env vars are missing (e.g. local dev without
 * a Redis database yet), `redis` is null and every consumer must handle that
 * case with an in-memory fallback.
 */
let redis: Redis | null = null

if (
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
) {
    redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
} else {
    // Only warn once at startup, not on every request
    if (process.env.NODE_ENV !== 'test') {
        console.warn(
            '[Redis] UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN not set. ' +
            'Falling back to in-memory stores. Add credentials to .env.local to enable Redis.'
        )
    }
}

export { redis }
export default redis
