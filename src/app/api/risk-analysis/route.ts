import { NextRequest, NextResponse } from 'next/server'
import { getRisks } from '@/lib/db'
import { riskAnalysis } from '@/lib/mock-data'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const minRisk = parseInt(searchParams.get('minRisk') || '0')
        const maxRisk = parseInt(searchParams.get('maxRisk') || '100')
        const sortBy = searchParams.get('sortBy') || 'riskLevel'
        const order = (searchParams.get('order') || 'desc') as 'asc' | 'desc'

        // Try to fetch from database
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

        // Fallback to mock data
        let filtered = riskAnalysis.filter(
            r => r.riskLevel >= minRisk && r.riskLevel <= maxRisk
        )

        if (sortBy === 'riskLevel') {
            filtered.sort((a, b) => order === 'asc' ? a.riskLevel - b.riskLevel : b.riskLevel - a.riskLevel)
        } else if (sortBy === 'vulnerabilities') {
            filtered.sort((a, b) => order === 'asc' ? a.vulnerabilities - b.vulnerabilities : b.vulnerabilities - a.vulnerabilities)
        }

        return NextResponse.json(
            {
                success: true,
                data: filtered,
                total: filtered.length,
                filters: { minRisk, maxRisk },
                timestamp: new Date().toISOString(),
                _warning: 'Using mock data - database unavailable',
            },
            { status: 200 }
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
