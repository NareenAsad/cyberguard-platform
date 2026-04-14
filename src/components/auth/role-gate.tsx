'use client'

import { useAuth } from '@/lib/auth/auth-context'
import type { UserRole, Permission } from '@/lib/auth/types'
import { Shield, Lock } from 'lucide-react'

interface RoleGateProps {
    children: React.ReactNode
    allowedRoles?: UserRole[]
    permission?: Permission
    fallback?: React.ReactNode
    showFallback?: boolean
}

export function RoleGate({
    children,
    allowedRoles,
    permission,
    fallback,
    showFallback = true,
}: RoleGateProps) {
    const { role, can, loading } = useAuth()

    if (loading) {
        return null
    }

    // Check role-based access
    if (allowedRoles && role && !allowedRoles.includes(role)) {
        return showFallback ? (fallback ?? <AccessDenied />) : null
    }

    // Check permission-based access
    if (permission && !can(permission)) {
        return showFallback ? (fallback ?? <AccessDenied />) : null
    }

    return <>{children}</>
}

function AccessDenied() {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 mb-4">
                <Lock className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Access Denied</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
                {"You don't have permission to view this content. Contact your administrator if you believe this is an error."}
            </p>
        </div>
    )
}

// Hook for conditional rendering based on roles
export function useRoleAccess(allowedRoles: UserRole[]): boolean {
    const { role } = useAuth()
    return role ? allowedRoles.includes(role) : false
}

// Hook for conditional rendering based on permissions
export function usePermission(permission: Permission): boolean {
    const { can } = useAuth()
    return can(permission)
}
