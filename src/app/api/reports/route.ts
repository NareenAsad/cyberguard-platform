import { NextRequest, NextResponse } from 'next/server'
import { getReports, createReport, deleteReport } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const type = searchParams.get('type') || undefined
        const status = searchParams.get('status') || undefined
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')

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

        return NextResponse.json(
            { success: false, error: 'Failed to fetch reports from database' },
            { status: 503 }
        )
    } catch (error) {
        console.error('[API] Error fetching reports:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch reports' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { title, type, description } = body

        if (!title || !type) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields: title, type' },
                { status: 400 }
            )
        }

        const result = await createReport({ title, type, description })

        if (result.success && result.data) {
            return NextResponse.json(
                { success: true, data: result.data, message: 'Report generated successfully' },
                { status: 201 }
            )
        }

        return NextResponse.json(
            { success: false, error: 'Failed to save report to database' },
            { status: 503 }
        )
    } catch (error) {
        console.error('[API] Error creating report:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to create report' },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 })
        }

        const result = await deleteReport(id)

        if (result.success) {
            return NextResponse.json({ success: true, message: 'Report deleted successfully' })
        }

        return NextResponse.json({ success: false, error: 'Failed to delete report' }, { status: 503 })
    } catch (error) {
        console.error('[API] Error deleting report:', error)
        return NextResponse.json({ success: false, error: 'Failed to delete report' }, { status: 500 })
    }
}
