import { NextRequest, NextResponse } from 'next/server'
import { getReports } from '@/lib/db'
import { reports as mockReports } from '@/lib/mock-data'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const type = searchParams.get('type') || undefined
        const status = searchParams.get('status') || undefined
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')

        // Try to fetch from database
        const result = await getReports({ type, status, page, limit })

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
        let filtered = mockReports
        if (type) {
            filtered = filtered.filter(r => r.type === type)
        }
        if (status) {
            filtered = filtered.filter(r => r.status === status)
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
        console.error('[API] Error fetching reports:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch reports',
            },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Validate required fields
        if (!body.title || !body.type) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Missing required fields: title, type',
                },
                { status: 400 }
            )
        }

        // Mock report creation (database integration would go here)
        const newReport = {
            id: `REP-${String(mockReports.length + 1).padStart(3, '0')}`,
            ...body,
            status: 'generating',
            generated: new Date().toISOString().split('T')[0],
        }

        return NextResponse.json(
            {
                success: true,
                data: newReport,
                message: 'Report generation started',
            },
            { status: 201 }
        )
    } catch (error) {
        console.error('[API] Error creating report:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to create report',
            },
            { status: 500 }
        )
    }
}
