import { NextRequest, NextResponse } from 'next/server'
import { incidents } from '@/lib/mock-data'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')
        const severity = searchParams.get('severity')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')

        // TODO: Replace with actual database query
        // let query = db.query('SELECT * FROM incidents')
        // if (status) query = query.where('status', status)
        // if (severity) query = query.where('severity', severity)
        // const incidents = await query.limit(limit).offset((page - 1) * limit)

        let filtered = incidents
        if (status) {
            filtered = filtered.filter(i => i.status === status)
        }
        if (severity) {
            filtered = filtered.filter(i => i.severity === severity)
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
        console.error('[API] Error fetching incidents:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch incidents',
            },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // TODO: Validate and save to database
        // const newIncident = await db.incidents.create(body)

        const newIncident = {
            id: `INC-2024-${String(incidents.length + 1).padStart(3, '0')}`,
            ...body,
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
        }

        return NextResponse.json(
            {
                success: true,
                data: newIncident,
                message: 'Incident created successfully',
            },
            { status: 201 }
        )
    } catch (error) {
        console.error('[API] Error creating incident:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to create incident',
            },
            { status: 500 }
        )
    }
}
