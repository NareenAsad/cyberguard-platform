import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'
import { adminAuditLogPostSchema } from '@/lib/validation'

// GET /api/admin/audit-logs
export async function GET(request: NextRequest) {
    // OWASP: Rate limit requests
    const limitRes = await rateLimit(request, { limit: 60, endpoint: 'admin-audit-logs:get' })
    if (!limitRes.isAllowed) return limitRes.response

    const serverClient = await createClient()
    const { data: { user } } = await serverClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await serverClient.from('profiles').select('role').eq('id', user.id).single()
    if (!profile || profile.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const admin = createAdminClient()
    const limit = Number(request.nextUrl.searchParams.get('limit') || '50')

    const { data, error } = await admin
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ logs: data || [] })
}

// POST /api/admin/audit-logs — write a log entry (called server-side)
export async function POST(request: NextRequest) {
    // OWASP: Rate limit requests
    const limitRes = await rateLimit(request, { limit: 15, endpoint: 'admin-audit-logs:post' })
    if (!limitRes.isAllowed) return limitRes.response

    const serverClient = await createClient()
    const { data: { user } } = await serverClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()

    // OWASP: Strict Zod validation and input sanitization
    const validation = adminAuditLogPostSchema.safeParse(body)
    if (!validation.success) {
        return NextResponse.json(
            { success: false, error: 'Validation failed', details: validation.error.format() },
            { status: 400 }
        )
    }

    const admin = createAdminClient()

    const { error } = await admin.from('audit_logs').insert({
        user_id:     user.id,
        user_email:  user.email,
        ...validation.data,
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
}

