import { NextRequest, NextResponse } from 'next/server'
import { chartData } from '@/lib/mock-data'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const timeRange = searchParams.get('timeRange') || '6m'

        // TODO: Replace with actual database query based on timeRange
        // const data = await db.query('SELECT * FROM threat_history WHERE date >= ...')

        return NextResponse.json(
            {
                success: true,
                data: chartData,
                timeRange,
                timestamp: new Date().toISOString(),
            },
            { status: 200 }
        )
    } catch (error) {
        console.error('[API] Error fetching chart data:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch chart data',
            },
            { status: 500 }
        )
    }
}
