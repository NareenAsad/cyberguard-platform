import { NextRequest, NextResponse } from 'next/server'
import { reports } from '@/lib/mock-data'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const type = searchParams.get('type')
        const status = searchParams.get('status')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')

        // TODO: Replace with actual database query
        // let query = db.query('SELECT * FROM reports')
        // if (type) query = query.where('type', type)
        // if (status) query = query.where('status', status)

        let filtered = reports
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

        // TODO: Validate and save to database, generate actual report
        // const newReport = await db.reports.create(body)

        const newReport = {
            id: `REP-${String(reports.length + 1).padStart(3, '0')}`,
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
