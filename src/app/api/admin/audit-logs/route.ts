import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

// GET /api/admin/audit-logs
export async function GET(request: NextRequest) {
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
    const serverClient = await createClient()
    const { data: { user } } = await serverClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const admin = createAdminClient()

    const { error } = await admin.from('audit_logs').insert({
        user_id:     user.id,
        user_email:  user.email,
        ...body,
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
}
