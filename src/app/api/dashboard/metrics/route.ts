import { NextRequest, NextResponse } from 'next/server'
import { getDashboardMetrics } from '@/lib/db'
import { dashboardMetrics as mockMetrics } from '@/lib/mock-data'

export async function GET(request: NextRequest) {
    try {
        // Try to fetch from database first
        const result = await getDashboardMetrics()

        if (result.success && result.data) {
            return NextResponse.json(
                {
                    success: true,
                    data: result.data,
                    timestamp: new Date().toISOString(),
                },
                { status: 200 }
            )
        }

        // Fallback to mock data if database is unavailable
        console.warn('[API] Database unavailable, using mock data')
        return NextResponse.json(
            {
                success: true,
                data: mockMetrics,
                timestamp: new Date().toISOString(),
                _warning: 'Using mock data - database not available',
            },
            { status: 200 }
        )
    } catch (error) {
        console.error('[API] Error fetching metrics:', error)
        // Return mock data on error for graceful degradation
        return NextResponse.json(
            {
                success: true,
                data: mockMetrics,
                timestamp: new Date().toISOString(),
                _error: 'Database error, using mock data',
            },
            { status: 200 }
        )
    }
}
