import { NextResponse } from 'next/server'
import { checkAgentHealth } from '@/lib/agent-client'

export async function GET() {
    try {
        const healthy = await checkAgentHealth()
        return NextResponse.json({ healthy })
    } catch (error) {
        console.error('[API] Health check proxy error:', error)
        return NextResponse.json({ healthy: false }, { status: 500 })
    }
}
