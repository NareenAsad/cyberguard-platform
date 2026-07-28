import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { buildRoleSlotStatus } from '@/lib/auth/role-slots'
import type { UserRole } from '@/lib/auth/types'

// GET /api/admin/users — list all profiles
export async function GET() {
    const serverClient = await createClient()
    const { data: { user } } = await serverClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Verify admin role
    const { data: profile } = await serverClient.from('profiles').select('role').eq('id', user.id).single()
    if (!profile || profile.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const admin = createAdminClient()

    // Fetch all auth users (includes email even if not in profiles)
    const { data: authUsers, error: authErr } = await admin.auth.admin.listUsers({ perPage: 500 })
    if (authErr) return NextResponse.json({ error: authErr.message }, { status: 500 })

    // Fetch all profiles
    const { data: profiles, error: profileErr } = await admin.from('profiles').select('*')
    if (profileErr) return NextResponse.json({ error: profileErr.message }, { status: 500 })

    // Merge auth users with profile data
    const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]))
    const merged = (authUsers?.users || []).map((u: any) => ({
        id:          u.id,
        email:       u.email,
        full_name:   profileMap.get(u.id)?.full_name || null,
        role:        profileMap.get(u.id)?.role || 'analyst',
        avatar_url:  profileMap.get(u.id)?.avatar_url || null,
        is_active:   profileMap.get(u.id)?.is_active ?? true,
        created_at:  u.created_at,
        last_sign_in_at: u.last_sign_in_at,
    }))

    const roleSlots = buildRoleSlotStatus(
        (profiles || []).map((p: { id: string; role: UserRole }) => ({ id: p.id, role: p.role }))
    )

    return NextResponse.json({ users: merged, roleSlots })
}
