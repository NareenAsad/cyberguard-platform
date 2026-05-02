import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

// GET /api/admin/data-sources
export async function GET() {
    const serverClient = await createClient()
    const { data: { user } } = await serverClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await serverClient.from('profiles').select('role').eq('id', user.id).single()
    if (!profile || profile.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const admin = createAdminClient()
    const { data, error } = await admin
        .from('data_source_configs')
        .select('id, key, name, enabled, updated_at, updated_by')
        .order('key')

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ sources: data || [] })
}

// PATCH /api/admin/data-sources — update a data source config
export async function PATCH(request: NextRequest) {
    const serverClient = await createClient()
    const { data: { user } } = await serverClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await serverClient.from('profiles').select('role').eq('id', user.id).single()
    if (!profile || profile.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { key, api_key, enabled } = body
    if (!key) return NextResponse.json({ error: 'Missing key' }, { status: 400 })

    const admin = createAdminClient()
    const updates: Record<string, any> = {
        updated_at: new Date().toISOString(),
        updated_by: user.id,
    }
    if (api_key  !== undefined) updates.api_key  = api_key
    if (enabled  !== undefined) updates.enabled  = enabled

    const { error } = await admin
        .from('data_source_configs')
        .update(updates)
        .eq('key', key)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Audit log (don't log the actual API key value)
    await admin.from('audit_logs').insert({
        user_id: user.id, user_email: user.email,
        action: 'DATA_SOURCE_UPDATED', target_id: key, target_type: 'data_source',
        details: { enabled, api_key_set: api_key ? true : undefined },
    })

    return NextResponse.json({ success: true })
}
