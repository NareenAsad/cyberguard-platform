import { NextRequest, NextResponse } from 'next/server'
import { playbooks } from '@/lib/mock-data'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const category = searchParams.get('category')
        const search = searchParams.get('search')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')

        // TODO: Replace with actual database query
        // let query = db.query('SELECT * FROM playbooks')
        // if (category) query = query.where('category', category)
        // if (search) query = query.where('title', 'LIKE', `%${search}%`)

        let filtered = playbooks
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
