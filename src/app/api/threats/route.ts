import { NextRequest, NextResponse } from 'next/server'
import { getThreats } from '@/lib/db'
import { startAgentAnalysis } from '@/lib/agent-client'
import { rateLimit } from '@/lib/rate-limit'
import { threatsPostSchema } from '@/lib/validation'

// ── POST /api/threats — Trigger AI agent pipeline ─────────────────────────
// Fire-and-forget: returns job_id immediately, don't block waiting for result.
// The client should poll GET /api/threats/job?jobId=xxx for completion.
export async function POST(request: NextRequest) {
    try {
        // OWASP: Rate limit pipeline invocation (heavy agent work)
        const limitRes = await rateLimit(request, { limit: 5, endpoint: 'threats:post' })
        if (!limitRes.isAllowed) return limitRes.response

        const body = await request.json()
        
        // OWASP: Strict input validation and rejecting unexpected fields
        const validation = threatsPostSchema.safeParse(body)
        if (!validation.success) {
            return NextResponse.json(
                { success: false, error: 'Validation failed', details: validation.error.format() },
                { status: 400 }
            )
        }

        const { indicators, assets } = validation.data

        // 1. Kick off FastAPI pipeline — returns immediately with job_id
        const job = await startAgentAnalysis(indicators, assets)

        // 2. Return job_id to client so it can poll for results
        //    Do NOT await the full pipeline here — it takes 1-3 minutes
        return NextResponse.json(
            {
                success: true,
                job_id: job.job_id,
                status: job.status,
                message: 'Analysis started. Poll /api/threats/job?jobId= for results.',
            },
            { status: 202 }  // 202 Accepted = async job started
        )

    } catch (error: any) {
        console.error('[API] Error starting agent analysis:', error)
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to start analysis' },
            { status: 500 }
        )
    }
}

// ── GET /api/threats — Fetch threats from DB ──────────────────────────────
export async function GET(request: NextRequest) {
    try {
        // OWASP: Rate limit public fetch endpoints
        const limitRes = await rateLimit(request, { limit: 60, endpoint: 'threats:get' })
        if (!limitRes.isAllowed) return limitRes.response

        const { searchParams } = new URL(request.url)
        const severity = searchParams.get('severity') || undefined
        const status   = searchParams.get('status')   || undefined
        const page     = parseInt(searchParams.get('page')  || '1')
        const limit    = parseInt(searchParams.get('limit') || '10')

        const result = await getThreats({ severity, status, page, limit })

        if (result.success && result.data) {
            return NextResponse.json({
                success: true,
                data:  result.data,
                total: result.data.length,
                page,
                limit,
                pages: Math.ceil(result.data.length / limit),
                timestamp: new Date().toISOString(),
            })
        }

        return NextResponse.json(
            { success: false, error: 'Failed to fetch threats from database' },
            { status: 503 }
        )
    } catch (error) {
        console.error('[API] Error fetching threats:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}

