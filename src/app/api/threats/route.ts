import { NextRequest, NextResponse } from 'next/server'
import { getThreats } from '@/lib/db'
import { threatData } from '@/lib/mock-data'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const severity = searchParams.get('severity') || undefined
        const status = searchParams.get('status') || undefined
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')

        // Try to fetch from database
        const result = await getThreats({ severity, status, page, limit })

        if (result.success && result.data) {
            return NextResponse.json(
                {
                    success: true,
                    data: result.data,
                    total: result.data.length,
                    page,
                    limit,
                    pages: Math.ceil(result.data.length / limit),
                    timestamp: new Date().toISOString(),
                },
                { status: 200 }
            )
        }

        // Fallback to mock data
        let filtered = threatData
        if (severity) {
            filtered = filtered.filter(t => t.severity === severity)
        }
        if (status) {
            filtered = filtered.filter(t => t.status === status)
        }

        const paginated = filtered.slice((page - 1) * limit, page * limit)

        return NextResponse.json(
            {
                success: true,
                data: paginated,
                total: filtered.length,
                page,
                limit,
                pages: Math.ceil(filtered.length / limit),
                timestamp: new Date().toISOString(),
                _warning: 'Using mock data - database unavailable',
            },
            { status: 200 }
        )
    } catch (error) {
        console.error('[API] Error fetching threats:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch threats',
            },
            { status: 500 }
        )
    }
}
