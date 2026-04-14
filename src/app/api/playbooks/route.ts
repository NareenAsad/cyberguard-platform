import { NextRequest, NextResponse } from 'next/server'
import { getPlaybooks } from '@/lib/db'
import { playbooks as mockPlaybooks } from '@/lib/mock-data'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const category = searchParams.get('category') || undefined
        const search = searchParams.get('search') || undefined
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')

        // Try to fetch from database
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

        // Fallback to mock data
        let filtered = mockPlaybooks
        if (category) {
            filtered = filtered.filter(p => p.category === category)
        }
        if (search) {
            filtered = filtered.filter(p =>
                p.title.toLowerCase().includes(search.toLowerCase()) ||
                p.description.toLowerCase().includes(search.toLowerCase())
            )
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
        console.error('[API] Error fetching playbooks:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch playbooks',
            },
            { status: 500 }
        )
    }
}
