import { NextRequest, NextResponse } from 'next/server'
import { getThreats } from '@/lib/db'
import { chartData as mockChartData } from '@/lib/mock-data'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const timeRange = searchParams.get('timeRange') || '6m'

        // Try to fetch threats data and aggregate for chart
        const result = await getThreats({ limit: 100 })

        if (result.success && result.data) {
            // Aggregate threat data by time or status for chart display
            // This would typically be done with a separate aggregation query
            const chartData = result.data

            return NextResponse.json(
                {
                    success: true,
                    data: chartData,
                    timeRange,
                    timestamp: new Date().toISOString(),
                },
                { status: 200 }
            )
        }

        // Fallback to mock data
        return NextResponse.json(
            {
                success: true,
                data: mockChartData,
                timeRange,
                timestamp: new Date().toISOString(),
                _warning: 'Using mock data - database unavailable',
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
