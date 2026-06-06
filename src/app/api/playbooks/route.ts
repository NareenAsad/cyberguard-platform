import { NextRequest, NextResponse } from 'next/server'
import { getPlaybooks, createPlaybook, deletePlaybook } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'
import { playbookPostSchema } from '@/lib/validation'

export async function GET(request: NextRequest) {
    try {
        // OWASP: Rate limit public fetch endpoints
        const limitRes = await rateLimit(request, { limit: 60, endpoint: 'playbooks:get' })
        if (!limitRes.isAllowed) return limitRes.response

        const { searchParams } = new URL(request.url)
        const category = searchParams.get('category') || undefined
        const search = searchParams.get('search') || undefined
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')

        const result = await getPlaybooks({ category, search, page, limit })

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
            { success: false, error: 'Failed to fetch playbooks from database' },
            { status: 503 }
        )
    } catch (error) {
        console.error('[API] Error fetching playbooks:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch playbooks' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        // OWASP: Rate limit playbook creation
        const limitRes = await rateLimit(request, { limit: 15, endpoint: 'playbooks:post' })
        if (!limitRes.isAllowed) return limitRes.response

        const body = await request.json()

        // OWASP: Strict input validation and sanitization
        const validation = playbookPostSchema.safeParse(body)
        if (!validation.success) {
            return NextResponse.json(
                { success: false, error: 'Validation failed', details: validation.error.format() },
                { status: 400 }
            )
        }

        const result = await createPlaybook(validation.data)

        if (result.success && result.data) {
            return NextResponse.json({ success: true, data: result.data }, { status: 201 })
        }

        return NextResponse.json(
            { success: false, error: 'Failed to create playbook' },
            { status: 503 }
        )
    } catch (error) {
        console.error('[API] Error creating playbook:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to create playbook' },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest) {
    try {
        // OWASP: Rate limit deletion requests
        const limitRes = await rateLimit(request, { limit: 15, endpoint: 'playbooks:delete' })
        if (!limitRes.isAllowed) return limitRes.response

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        // Validate ID format
        if (!id || typeof id !== 'string' || id.length > 50 || !/^[a-zA-Z0-9_-]+$/.test(id)) {
            return NextResponse.json({ success: false, error: 'Invalid or missing ID parameter' }, { status: 400 })
        }

        const result = await deletePlaybook(id)

        if (result.success) {
            return NextResponse.json({ success: true, message: 'Playbook deleted successfully' })
        }

        return NextResponse.json({ success: false, error: 'Failed to delete playbook' }, { status: 503 })
    } catch (error) {
        console.error('[API] Error deleting playbook:', error)
        return NextResponse.json({ success: false, error: 'Failed to delete playbook' }, { status: 500 })
    }
}

