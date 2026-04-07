import { NextRequest, NextResponse } from 'next/server'
import { dashboardMetrics } from '@/lib/mock-data'

export async function GET(request: NextRequest) {
    try {
        // TODO: Replace with actual database query
        // const metrics = await db.query('SELECT * FROM dashboard_metrics WHERE ...')

        return NextResponse.json(
            {
                success: true,
                data: dashboardMetrics,
                timestamp: new Date().toISOString(),
            },
            { status: 200 }
        )
    } catch (error) {
        console.error('[API] Error fetching metrics:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch metrics',
            },
            { status: 500 }
        )
    }
}
