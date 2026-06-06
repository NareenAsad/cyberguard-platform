import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'
import { adminAssetPostSchema } from '@/lib/validation'

// GET /api/admin/assets
export async function GET(request: NextRequest) {
    // OWASP: Rate limit requests
    const limitRes = await rateLimit(request, { limit: 60, endpoint: 'admin-assets:get' })
    if (!limitRes.isAllowed) return limitRes.response

    const serverClient = await createClient()
    const { data: { user } } = await serverClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient()
    const { data, error } = await admin
        .from('assets')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ assets: data || [] })
}

// POST /api/admin/assets — create an asset
export async function POST(request: NextRequest) {
    // OWASP: Rate limit requests
    const limitRes = await rateLimit(request, { limit: 15, endpoint: 'admin-assets:post' })
    if (!limitRes.isAllowed) return limitRes.response

    const serverClient = await createClient()
    const { data: { user } } = await serverClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await serverClient.from('profiles').select('role').eq('id', user.id).single()
    if (!profile || profile.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    // OWASP: Strict Zod validation and input sanitization
    const validation = adminAssetPostSchema.safeParse(body)
    if (!validation.success) {
        return NextResponse.json(
            { success: false, error: 'Validation failed', details: validation.error.format() },
            { status: 400 }
        )
    }

    const admin = createAdminClient()

    const { data, error } = await admin
        .from('assets')
        .insert({ ...validation.data, last_seen: new Date().toISOString() })
        .select('*')
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Audit log
    await admin.from('audit_logs').insert({
        user_id: user.id, user_email: user.email,
        action: 'ASSET_CREATED', target_id: data.id, target_type: 'asset',
        details: { name: validation.data.name, type: validation.data.type },
    })

    return NextResponse.json({ asset: data })
}

// DELETE /api/admin/assets?id=xxx
export async function DELETE(request: NextRequest) {
    // OWASP: Rate limit requests
    const limitRes = await rateLimit(request, { limit: 15, endpoint: 'admin-assets:delete' })
    if (!limitRes.isAllowed) return limitRes.response

    const serverClient = await createClient()
    const { data: { user } } = await serverClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await serverClient.from('profiles').select('role').eq('id', user.id).single()
    if (!profile || profile.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const id = request.nextUrl.searchParams.get('id')
    if (!id || typeof id !== 'string' || id.length > 50 || !/^[a-zA-Z0-9_-]+$/.test(id)) {
        return NextResponse.json({ error: 'Invalid or missing id' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { error } = await admin.from('assets').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await admin.from('audit_logs').insert({
        user_id: user.id, user_email: user.email,
        action: 'ASSET_DELETED', target_id: id, target_type: 'asset',
    })

    return NextResponse.json({ success: true })
}

