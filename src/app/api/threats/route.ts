import { NextRequest, NextResponse } from 'next/server'
import { getThreats } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const severity = searchParams.get('severity') || undefined
        const status = searchParams.get('status') || undefined
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')

        const result = await getThreats({ severity, status, page, limit })

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
            { success: false, error: 'Failed to fetch threats from database' },
            { status: 503 }
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
