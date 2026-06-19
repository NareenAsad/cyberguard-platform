import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
)

export async function GET(request: NextRequest) {
    const buildMockRows = (range: string) => {
        if (range === '24h') {
            return Array.from({ length: 12 }, (_, i) => ({
                name: `${String(i * 2).padStart(2, '0')}:00`,
                threats: Math.floor(Math.random() * 60 + 20),
            }))
        }
        if (range === '7d') {
            const now = new Date()
            return Array.from({ length: 7 }, (_, i) => {
                const d = new Date(now)
                d.setDate(d.getDate() - (6 - i))
                return { name: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }), threats: Math.floor(Math.random() * 80 + 10) }
            })
        }
        const now = new Date()
        return Array.from({ length: 30 }, (_, i) => {
            const d = new Date(now)
            d.setDate(d.getDate() - (29 - i))
            return { name: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }), threats: Math.floor(Math.random() * 100 + 10) }
        })
    }

    try {
        const { searchParams } = new URL(request.url)
        const timeRange = searchParams.get('timeRange') || '24h'

        let rows: { name: string; threats: number }[] = []
        const now = Date.now()

        if (timeRange === '24h') {
            const start = new Date(now - 24 * 60 * 60 * 1000).toISOString()
            const { data, error } = await supabase
                .from('Threat')
                .select('detected')
                .gte('detected', start)
            if (error) throw error
            const bucketMap = new Map<string, number>()
            for (let i = 0; i < 12; i++) {
                const hour = (i * 2) % 24
                bucketMap.set(`${String(hour).padStart(2, '0')}:00`, 0)
            }
            for (const item of data || []) {
                const d = new Date(item.detected)
                const hour = Math.floor(d.getHours() / 2) * 2
                const key = `${String(hour).padStart(2, '0')}:00`
                bucketMap.set(key, (bucketMap.get(key) || 0) + 1)
            }
            rows = Array.from(bucketMap.entries()).map(([name, threats]) => ({ name, threats }))

            // Fill missing 2h slots so the chart has 12 points
            if (rows.length === 0) rows = buildMockRows('24h')

        } else if (timeRange === '7d') {
            const start = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString()
            const { data, error } = await supabase
                .from('Threat')
                .select('detected')
                .gte('detected', start)
            if (error) throw error
            const bucketMap = new Map<string, number>()
            const startDay = new Date(now)
            startDay.setHours(0, 0, 0, 0)
            startDay.setDate(startDay.getDate() - 6)
            for (let i = 0; i < 7; i++) {
                const d = new Date(startDay)
                d.setDate(startDay.getDate() + i)
                bucketMap.set(d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }), 0)
            }
            for (const item of data || []) {
                const key = new Date(item.detected).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
                bucketMap.set(key, (bucketMap.get(key) || 0) + 1)
            }
            rows = Array.from(bucketMap.entries()).map(([name, threats]) => ({ name, threats }))
            if (rows.length === 0) rows = buildMockRows('7d')

        } else {
            // 30d — daily
            const start = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString()
            const { data, error } = await supabase
                .from('Threat')
                .select('detected')
                .gte('detected', start)
            if (error) throw error
            const bucketMap = new Map<string, number>()
            const startDay = new Date(now)
            startDay.setHours(0, 0, 0, 0)
            startDay.setDate(startDay.getDate() - 29)
            for (let i = 0; i < 30; i++) {
                const d = new Date(startDay)
                d.setDate(startDay.getDate() + i)
                bucketMap.set(d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }), 0)
            }
            for (const item of data || []) {
                const key = new Date(item.detected).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
                bucketMap.set(key, (bucketMap.get(key) || 0) + 1)
            }
            rows = Array.from(bucketMap.entries()).map(([name, threats]) => ({ name, threats }))
            if (rows.length === 0) rows = buildMockRows('30d')
        }

        return NextResponse.json(
            { success: true, data: rows, timeRange, timestamp: new Date().toISOString() },
            { status: 200 }
        )
    } catch (error: any) {
        if (error?.code === 'PGRST205') {
            const { searchParams } = new URL(request.url)
            const timeRange = searchParams.get('timeRange') || '24h'
            console.warn('[API] Supabase table missing, serving mock chart data:', error.message)
            return NextResponse.json(
                { success: true, data: buildMockRows(timeRange), timeRange, timestamp: new Date().toISOString(), _warning: 'Using mock data - missing Supabase tables' },
                { status: 200 }
            )
        }
        console.error('[API] Error fetching chart data:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch chart data' },
            { status: 500 }
        )
    }
}
