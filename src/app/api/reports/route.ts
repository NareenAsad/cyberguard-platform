import { NextRequest, NextResponse } from 'next/server'
import { getReports, createReport, deleteReport } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'
import { reportPostSchema } from '@/lib/validation'
import { requireDeletePermission } from '@/lib/auth/require-delete-permission'

export async function GET(request: NextRequest) {
    try {
        // OWASP: Rate limit public fetch endpoints
        const limitRes = await rateLimit(request, { limit: 60, endpoint: 'reports:get' })
        if (!limitRes.isAllowed) return limitRes.response

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
        // OWASP: Rate limit creation requests
        const limitRes = await rateLimit(request, { limit: 15, endpoint: 'reports:post' })
        if (!limitRes.isAllowed) return limitRes.response

        const body = await request.json()

        // OWASP: Strict Zod validation and input sanitization
        const validation = reportPostSchema.safeParse(body)
        if (!validation.success) {
            return NextResponse.json(
                { success: false, error: 'Validation failed', details: validation.error.format() },
                { status: 400 }
            )
        }

        const result = await createReport(validation.data)

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
        // OWASP: Rate limit deletion requests
        const limitRes = await rateLimit(request, { limit: 15, endpoint: 'reports:delete' })
        if (!limitRes.isAllowed) return limitRes.response

        // RBAC: only roles with canDeleteData (currently: admin) may delete
        const denied = await requireDeletePermission()
        if (denied) return denied

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        // Validate ID format
        if (!id || typeof id !== 'string' || id.length > 50 || !/^[a-zA-Z0-9_-]+$/.test(id)) {
            return NextResponse.json({ success: false, error: 'Invalid or missing ID parameter' }, { status: 400 })
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

