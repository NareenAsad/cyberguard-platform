export type UserRole = 'admin' | 'analyst' | 'manager'

export interface UserProfile {
    id: string
    email: string | null
    full_name: string | null
    role: UserRole
    avatar_url: string | null
    created_at: string
    updated_at: string
}

export interface AuthUser {
    id: string
    email: string | undefined
    profile: UserProfile | null
}

// Role permissions matrix
export const ROLE_PERMISSIONS = {
    admin: {
        canViewDashboard: true,
        canViewThreats: true,
        canViewIncidents: true,
        canViewReports: true,
        canViewSettings: true,
        canManageUsers: true,
        canManageRoles: true,
        canDeleteData: true,
        canExportData: true,
    },
    manager: {
        canViewDashboard: true,
        canViewThreats: true,
        canViewIncidents: true,
        canViewReports: true,
        canViewSettings: true,
        canManageUsers: false,
        canManageRoles: false,
        canDeleteData: false,
        canExportData: true,
    },
    analyst: {
        canViewDashboard: true,
        canViewThreats: true,
        canViewIncidents: true,
        canViewReports: false,
        canViewSettings: false,
        canManageUsers: false,
        canManageRoles: false,
        canDeleteData: false,
        canExportData: false,
    },
} as const

export type Permission = keyof typeof ROLE_PERMISSIONS.admin

export function hasPermission(role: UserRole | null | undefined, permission: Permission): boolean {
    if (!role) return false
    return ROLE_PERMISSIONS[role]?.[permission] ?? false
}

export function getRoleLabel(role: UserRole): string {
    const labels: Record<UserRole, string> = {
        admin: 'Administrator',
        manager: 'Security Manager',
        analyst: 'Security Analyst',
    }
    return labels[role] || role
}

export function getRoleBadgeColor(role: UserRole): string {
    const colors: Record<UserRole, string> = {
        admin: 'bg-destructive/10 text-destructive border-destructive/20',
        manager: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
        analyst: 'bg-primary/10 text-primary border-primary/20',
    }
    return colors[role] || 'bg-muted text-muted-foreground'
}
