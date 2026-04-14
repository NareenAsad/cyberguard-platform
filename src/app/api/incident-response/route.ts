import { NextRequest, NextResponse } from 'next/server'
import { getIncidents, createIncident } from '@/lib/db'
import { incidents as mockIncidents } from '@/lib/mock-data'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status') || undefined
        const severity = searchParams.get('severity') || undefined
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')

        // Try to fetch from database
        const result = await getIncidents({ status, severity, page, limit })

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
        let filtered = mockIncidents
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
                _warning: 'Using mock data - database unavailable',
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

        // Validate required fields
        if (!body.title || !body.description || !body.severity || !body.assignee) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Missing required fields: title, description, severity, assignee',
                },
                { status: 400 }
            )
        }

        // Try to save to database
        const result = await createIncident(body)

        if (result.success && result.data) {
            return NextResponse.json(
                {
                    success: true,
                    data: result.data,
                    message: 'Incident created successfully',
                },
                { status: 201 }
            )
        }

        // Fallback: return mock response
        const newIncident = {
            id: `INC-2024-${String(mockIncidents.length + 1).padStart(3, '0')}`,
            ...body,
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
        }

        return NextResponse.json(
            {
                success: true,
                data: newIncident,
                message: 'Incident created successfully (mock mode)',
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
