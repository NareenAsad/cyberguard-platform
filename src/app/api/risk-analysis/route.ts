import { NextRequest, NextResponse } from 'next/server'
import { getRisks } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const minRisk = parseInt(searchParams.get('minRisk') || '0')
        const maxRisk = parseInt(searchParams.get('maxRisk') || '100')
        const sortBy = searchParams.get('sortBy') || 'riskLevel'
        const order = (searchParams.get('order') || 'desc') as 'asc' | 'desc'

        const result = await getRisks({ minRisk, maxRisk, sortBy, order })

        if (result.success && result.data) {
            return NextResponse.json(
                {
                    success: true,
                    data: result.data,
                    total: result.data.length,
                    filters: { minRisk, maxRisk },
                    timestamp: new Date().toISOString(),
                },
                { status: 200 }
            )
        }

        return NextResponse.json(
            { success: false, error: 'Failed to fetch risk analysis from database' },
            { status: 503 }
        )
    } catch (error) {
        console.error('[API] Error fetching risk analysis:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch risk analysis',
            },
            { status: 500 }
        )
    }
}
