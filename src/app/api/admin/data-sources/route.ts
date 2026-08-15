import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'
import { adminDataSourcePatchSchema } from '@/lib/validation'
import { encryptSecret } from '@/lib/crypto'

// GET /api/admin/data-sources
export async function GET(request: NextRequest) {
    // OWASP: Rate limit requests
    const limitRes = await rateLimit(request, { limit: 60, endpoint: 'admin-data-sources:get' })
    if (!limitRes.isAllowed) return limitRes.response

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
    // OWASP: Rate limit requests
    const limitRes = await rateLimit(request, { limit: 15, endpoint: 'admin-data-sources:patch' })
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
    const validation = adminDataSourcePatchSchema.safeParse(body)
    if (!validation.success) {
        return NextResponse.json(
            { success: false, error: 'Validation failed', details: validation.error.format() },
            { status: 400 }
        )
    }

    const { key, api_key, enabled } = validation.data

    const admin = createAdminClient()
    const updates: Record<string, any> = {
        updated_at: new Date().toISOString(),
        updated_by: user.id,
    }
    // Encrypt at rest — never store the raw third-party API key in the DB.
    if (api_key  !== undefined) updates.api_key  = encryptSecret(api_key)
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

