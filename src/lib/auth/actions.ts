'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { assignRoleOnSignup } from '@/lib/auth/role-slots'
import type { UserRole } from '@/lib/auth/types'
import { recordAuditLog } from '@/lib/audit-logger'

export type AuthResult = {
    error?: string
    success?: boolean
}

export async function login(formData: FormData): Promise<AuthResult> {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        return { error: 'Email and password are required' }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    if (data?.user) {
        await recordAuditLog({
            userId: data.user.id,
            userEmail: data.user.email,
            action: 'USER_SIGNIN',
            targetType: 'user',
            targetId: data.user.id,
            details: { provider: 'email' },
        })
    }

    revalidatePath('/', 'layout')
    return { success: true }
}

export async function signup(formData: FormData): Promise<AuthResult> {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string

    if (!email || !password) {
        return { error: 'Email and password are required' }
    }

    if (password.length < 6) {
        return { error: 'Password must be at least 6 characters' }
    }

    // One admin, one manager, one analyst — everyone else gets viewer
    const adminClient = createAdminClient()
    const { data: profiles } = await adminClient.from('profiles').select('role')
    const existingRoles = (profiles || []).map(p => p.role as UserRole)
    const role = assignRoleOnSignup(existingRoles)

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo:
                process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
                `${process.env.NEXT_PUBLIC_SITE_URL || ''}/auth/callback`,
            data: {
                full_name: fullName || email.split('@')[0],
                role,
            },
        },
    })

    if (error) {
        return { error: error.message }
    }

    if (data?.user) {
        await recordAuditLog({
            userId: data.user.id,
            userEmail: data.user.email,
            action: 'USER_SIGNUP',
            targetType: 'user',
            targetId: data.user.id,
            details: { role },
        })
    }

    return { success: true }
}

export async function logout(): Promise<void> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        await recordAuditLog({
            userId: user.id,
            userEmail: user.email,
            action: 'USER_SIGNOUT',
            targetType: 'user',
            targetId: user.id,
        })
    }

    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/auth/login')
}

export async function getUser() {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        return null
    }

    // Get user profile with role
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    return {
        ...user,
        profile,
    }
}

export async function getUserRole(): Promise<string | null> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    return profile?.role || null
}
