import { NextRequest, NextResponse } from 'next/server'
import { getPlaybooks, createPlaybook, deletePlaybook } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
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
        const body = await request.json()
        const { title, description, category, steps } = body

        if (!title || !description || !category) {
            return NextResponse.json(
                { success: false, error: 'title, description and category are required' },
                { status: 400 }
            )
        }

        const result = await createPlaybook({
            title,
            description,
            category,
            steps: Number(steps) || 0,
        })

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
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 })
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
