import type { UserRole } from '@/lib/auth/types'

/** Roles limited to a single user; viewer is unlimited. */
export const LIMITED_ROLES: UserRole[] = ['admin', 'manager', 'analyst']

export const ROLE_SLOT_LIMIT = 1

export type RoleSlotStatus = Record<UserRole, { filled: boolean; count: number; limit: number | null }>

export function getRoleSlotLimit(role: UserRole): number | null {
    return LIMITED_ROLES.includes(role) ? ROLE_SLOT_LIMIT : null
}

/** Count profiles per role from a list of role strings. */
export function countRolesByType(roles: UserRole[]): Record<UserRole, number> {
    return {
        admin:   roles.filter(r => r === 'admin').length,
        manager: roles.filter(r => r === 'manager').length,
        analyst: roles.filter(r => r === 'analyst').length,
        viewer:  roles.filter(r => r === 'viewer').length,
    }
}

/** Build slot status for admin UI and validation. */
export function buildRoleSlotStatus(users: { id: string; role: UserRole }[]): RoleSlotStatus {
    const counts = countRolesByType(users.map(u => u.role))

    return {
        admin:   { filled: counts.admin >= ROLE_SLOT_LIMIT,   count: counts.admin,   limit: ROLE_SLOT_LIMIT },
        manager: { filled: counts.manager >= ROLE_SLOT_LIMIT, count: counts.manager, limit: ROLE_SLOT_LIMIT },
        analyst: { filled: counts.analyst >= ROLE_SLOT_LIMIT, count: counts.analyst, limit: ROLE_SLOT_LIMIT },
        viewer:  { filled: false, count: counts.viewer, limit: null },
    }
}

/** Whether a role option should be disabled in the admin dropdown for a given user. */
export function isRoleOptionDisabled(
    role: UserRole,
    slotStatus: RoleSlotStatus,
    currentUserRole: UserRole
): boolean {
    if (role === currentUserRole) return false
    const limit = getRoleSlotLimit(role)
    if (limit === null) return false
    return slotStatus[role].filled
}

/**
 * Pick a role for a new signup:
 * 1 admin → 1 manager → 1 analyst → unlimited viewers.
 */
export function assignRoleOnSignup(existingRoles: UserRole[]): UserRole {
    const counts = countRolesByType(existingRoles)
    if (counts.admin === 0) return 'admin'
    if (counts.manager === 0) return 'manager'
    if (counts.analyst === 0) return 'analyst'
    return 'viewer'
}

/**
 * Check whether a user can be assigned `targetRole`.
 * `currentRole` is the user's existing role (undefined for new users).
 */
export function canAssignRole(
    targetRole: UserRole,
    existingUsers: { id: string; role: UserRole }[],
    userId?: string
): { allowed: boolean; reason?: string } {
    const limit = getRoleSlotLimit(targetRole)
    if (limit === null) return { allowed: true }

    const othersWithRole = existingUsers.filter(
        u => u.role === targetRole && u.id !== userId
    ).length

    if (othersWithRole >= limit) {
        const labels: Record<UserRole, string> = {
            admin:   'Administrator',
            manager: 'Security Manager',
            analyst: 'Security Analyst',
            viewer:  'Viewer',
        }
        return {
            allowed: false,
            reason: `Only one ${labels[targetRole]} is allowed. Demote or remove the current ${labels[targetRole]} first.`,
        }
    }

    return { allowed: true }
}
