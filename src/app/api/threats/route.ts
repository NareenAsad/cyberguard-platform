import { NextRequest, NextResponse } from 'next/server'
import { threatData } from '@/lib/mock-data'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const severity = searchParams.get('severity')
        const status = searchParams.get('status')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')

        // TODO: Replace with actual database query
        // let query = db.query('SELECT * FROM threats')
        // if (severity) query = query.where('severity', severity)
        // if (status) query = query.where('status', status)
        // const threats = await query.limit(limit).offset((page - 1) * limit)

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
