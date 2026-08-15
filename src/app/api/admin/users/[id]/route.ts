import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { canAssignRole } from '@/lib/auth/role-slots'
import type { UserRole } from '@/lib/auth/types'
import { adminUserPatchSchema } from '@/lib/validation'

// PATCH /api/admin/users/[id] — update role or is_active
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const serverClient = await createClient()
    const { data: { user } } = await serverClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await serverClient.from('profiles').select('role').eq('id', user.id).single()
    if (!profile || profile.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()

    // OWASP: strict Zod validation — role must be a real enum member,
    // is_active must be a boolean, and no unrecognized fields are accepted.
    const validation = adminUserPatchSchema.safeParse(body)
    if (!validation.success) {
        return NextResponse.json(
            { error: 'Validation failed', details: validation.error.format() },
            { status: 400 }
        )
    }
    const { role, is_active } = validation.data

    const admin = createAdminClient()

    if (role !== undefined) {
        const { data: allProfiles } = await admin.from('profiles').select('id, role')
        const check = canAssignRole(
            role as UserRole,
            (allProfiles || []).map(p => ({ id: p.id, role: p.role as UserRole })),
            id
        )
        if (!check.allowed) {
            return NextResponse.json({ error: check.reason }, { status: 409 })
        }
    }

    const updates: Record<string, any> = { updated_at: new Date().toISOString() }
    if (role      !== undefined) updates.role      = role
    if (is_active !== undefined) updates.is_active = is_active

    const { error } = await admin.from('profiles').update(updates).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // If deactivating: ban the user in Supabase Auth
    if (is_active === false) {
        await admin.auth.admin.updateUserById(id, { ban_duration: '876000h' }) // ~100 years
    } else if (is_active === true) {
        await admin.auth.admin.updateUserById(id, { ban_duration: 'none' })
    }

    // Write audit log
    const actionMap: Record<string, string> = {}
    if (role !== undefined)      actionMap.action = `ROLE_CHANGED → ${role}`
    if (is_active !== undefined) actionMap.action = is_active ? 'USER_ACTIVATED' : 'USER_DEACTIVATED'

    await admin.from('audit_logs').insert({
        user_id:     user.id,
        user_email:  user.email,
        user_name:   profile?.role ? `${user.email}` : user.email,
        action:      actionMap.action || 'USER_UPDATED',
        target_id:   id,
        target_type: 'user',
        details:     updates,
    })

    return NextResponse.json({ success: true })
}

// DELETE /api/admin/users/[id] — permanently remove a user who has left
export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const serverClient = await createClient()
    const { data: { user } } = await serverClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await serverClient.from('profiles').select('role').eq('id', user.id).single()
    if (!profile || profile.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    if (id === user.id) {
        return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 })
    }

    const admin = createAdminClient()

    // profiles.id references auth.users on delete cascade — deleting the
    // auth user removes the profile row automatically.
    const { error } = await admin.auth.admin.deleteUser(id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await admin.from('audit_logs').insert({
        user_id:     user.id,
        user_email:  user.email,
        action:      'USER_DELETED',
        target_id:   id,
        target_type: 'user',
    })

    return NextResponse.json({ success: true })
}
