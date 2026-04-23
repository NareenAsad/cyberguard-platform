import { NextRequest, NextResponse } from 'next/server'
import { getIncidents, createIncident } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status') || undefined
        const severity = searchParams.get('severity') || undefined
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')

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

        return NextResponse.json(
            { success: false, error: 'Failed to fetch incidents from database' },
            { status: 503 }
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

        return NextResponse.json(
            { success: false, error: 'Failed to create incident in database' },
            { status: 503 }
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
