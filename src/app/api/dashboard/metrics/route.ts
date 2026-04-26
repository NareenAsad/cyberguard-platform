import { NextRequest, NextResponse } from 'next/server'
import { getDashboardMetrics } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const result = await getDashboardMetrics()

        if (result?.success && result?.data) {
            return NextResponse.json(
                {
                    success: true,
                    data: result.data,
                    timestamp: new Date().toISOString(),
                },
                { status: 200 }
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