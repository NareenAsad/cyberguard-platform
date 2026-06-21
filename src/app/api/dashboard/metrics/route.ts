import { NextRequest, NextResponse } from 'next/server'
import { getDashboardMetrics } from '@/lib/db'
import { cacheGet, cacheSet } from '@/lib/cache'

const CACHE_KEY = 'dashboard:metrics'
const CACHE_TTL = 30 // seconds — matches previous Next.js revalidate: 30

export async function GET(request: NextRequest) {
    try {
        // 1. Try Redis cache first
        const cached = await cacheGet<object>(CACHE_KEY)
        if (cached) {
            return NextResponse.json(
                {
                    success: true,
                    data: cached,
                    timestamp: new Date().toISOString(),
                    _cache: 'HIT',
                },
                {
                    status: 200,
                    headers: { 'X-Cache': 'HIT' },
                }
            )
        }

        // 2. Cache miss — fetch from database
        const result = await getDashboardMetrics()

        if (result?.success && result?.data) {
            // 3. Populate cache for next request
            await cacheSet(CACHE_KEY, result.data, CACHE_TTL)

            return NextResponse.json(
                {
                    success: true,
                    data: result.data,
                    timestamp: new Date().toISOString(),
                    _cache: 'MISS',
                },
                {
                    status: 200,
                    headers: { 'X-Cache': 'MISS' },
                }
            )
        }

        // DB is reachable but returned no data — tables might be empty
        console.warn('[API] getDashboardMetrics returned no data:', result?.error)
        return NextResponse.json(
            { success: false, error: 'No metrics available' },
            { status: 503 }
        )

    } catch (error) {
        console.error('[API] Unexpected error in metrics route:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}