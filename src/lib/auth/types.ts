export type UserRole = 'admin' | 'analyst' | 'manager' | 'viewer'

export interface UserProfile {
    id: string
    email: string | null
    full_name: string | null
    role: UserRole
    avatar_url: string | null
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface AuthUser {
    id: string
    email: string | undefined
    profile: UserProfile | null
}

// ── Role permissions matrix ───────────────────────────────────────────────────
export const ROLE_PERMISSIONS = {
    admin: {
        // Dashboard & monitoring
        canViewDashboard:    true,
        canViewThreats:      true,
        canViewIncidents:    true,
        canViewReports:      true,
        canViewSettings:     true,
        canViewAdminPanel:   true,
        // Actions
        canRunAiAnalysis:    true,
        canAssignIncidents:  true,
        canExportData:       true,
        // User management
        canManageUsers:      true,
        canManageRoles:      true,
        canDeleteData:       true,
        // System
        canConfigureSources: true,
        canViewAuditLogs:    true,
        canManageAssets:     true,
    },
    manager: {
        canViewDashboard:    true,
        canViewThreats:      true,
        canViewIncidents:    true,
        canViewReports:      true,
        canViewSettings:     true,
        canViewAdminPanel:   false,
        canRunAiAnalysis:    true,
        canAssignIncidents:  true,
        canExportData:       true,
        canManageUsers:      false,
        canManageRoles:      false,
        canDeleteData:       false,
        canConfigureSources: false,
        canViewAuditLogs:    true,
        canManageAssets:     false,
    },
    analyst: {
        canViewDashboard:    true,
        canViewThreats:      true,
        canViewIncidents:    true,
        canViewReports:      true,
        canViewSettings:     true,
        canViewAdminPanel:   false,
        canRunAiAnalysis:    true,
        canAssignIncidents:  false,
        canExportData:       false,
        canManageUsers:      false,
        canManageRoles:      false,
        canDeleteData:       false,
        canConfigureSources: false,
        canViewAuditLogs:    false,
        canManageAssets:     false,
    },
    viewer: {
        canViewDashboard:    true,
        canViewThreats:      true,
        canViewIncidents:    true,
        canViewReports:      true,
        canViewSettings:     true,
        canViewAdminPanel:   false,
        canRunAiAnalysis:    true,
        canAssignIncidents:  false,
        canExportData:       false,
        canManageUsers:      false,
        canManageRoles:      false,
        canDeleteData:       false,
        canConfigureSources: false,
        canViewAuditLogs:    false,
        canManageAssets:     false,
    },
} as const

export type Permission = keyof typeof ROLE_PERMISSIONS.admin

export function hasPermission(
    role: UserRole | null | undefined,
    permission: Permission
): boolean {
    if (!role) return false
    return ROLE_PERMISSIONS[role]?.[permission] ?? false
}

/**
 * Convenience helper for component-level feature gating.
 * @example  {canAccess(profile.role, 'run_ai_analysis') && <RunButton />}
 */
export function canAccess(
    role: string | null | undefined,
    feature: string
): boolean {
    const permissions: Record<string, string[]> = {
        run_ai_analysis:   ['analyst', 'manager', 'admin', 'viewer'],
        assign_incidents:  ['manager', 'admin'],
        export_reports:    ['manager', 'admin'],
        view_reports:      ['analyst', 'manager', 'admin', 'viewer'],
        manage_users:      ['admin'],
        view_admin_panel:  ['admin'],
        configure_sources: ['admin'],
        view_audit_logs:   ['manager', 'admin'],
        manage_assets:     ['admin'],
    }
    if (!role) return false
    return permissions[feature]?.includes(role) ?? false
}

export function getRoleLabel(role: UserRole): string {
    const labels: Record<UserRole, string> = {
        admin:   'Administrator',
        manager: 'Security Manager',
        analyst: 'Security Analyst',
        viewer:  'Viewer',
    }
    return labels[role] || role
}

export function getRoleBadgeColor(role: UserRole): string {
    const colors: Record<UserRole, string> = {
        admin:   'bg-destructive/10 text-destructive border-destructive/20',
        manager: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
        analyst: 'bg-primary/10 text-primary border-primary/20',
        viewer:  'bg-muted text-muted-foreground border-border',
    }
    return colors[role] || 'bg-muted text-muted-foreground'
}
