import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { hasPermission, type Permission } from '@/lib/auth/types'

export async function requirePermission(permission: Permission): Promise<NextResponse | null> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile || !hasPermission(profile.role, permission)) {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    return null
}

/** @deprecated Use requirePermission('canDeleteData') directly. */
export async function requireDeletePermission(): Promise<NextResponse | null> {
    return requirePermission('canDeleteData')
}
