import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { hasPermission } from '@/lib/auth/types'

/**
 * Server-side guard for destructive routes. Returns a NextResponse to send
 * back immediately (401/403) if the caller may not delete data, or `null`
 * if the request should proceed. Mirrors ROLE_PERMISSIONS.canDeleteData —
 * keep this in sync with src/lib/auth/types.ts rather than hardcoding roles.
 */
export async function requireDeletePermission(): Promise<NextResponse | null> {
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

    if (!profile || !hasPermission(profile.role, 'canDeleteData')) {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    return null
}
