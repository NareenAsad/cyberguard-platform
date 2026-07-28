import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { emitAlert } from '@/lib/socket/emit-socket-event'

interface AuditLogOptions {
    userId?: string
    userEmail?: string
    action: string
    targetType?: string
    targetId?: string
    details?: Record<string, any>
}

/**
 * Record an audit log entry for actions performed by any user role (Admin, Manager, Analyst, Viewer).
 * Also stores a notification in the database.
 */
export async function recordAuditLog(options: AuditLogOptions): Promise<void> {
    try {
        let userId = options.userId
        let userEmail = options.userEmail

        if (!userId || !userEmail) {
            const serverClient = await createClient()
            const { data: { user } } = await serverClient.auth.getUser()
            if (user) {
                userId = userId || user.id
                userEmail = userEmail || user.email
            }
        }

        if (!userId || !userEmail) {
            console.warn('[AuditLog] No authenticated user found for action:', options.action)
            return
        }

        const admin = createAdminClient()
        const { error } = await admin.from('audit_logs').insert({
            user_id: userId,
            user_email: userEmail,
            action: options.action,
            target_type: options.targetType || null,
            target_id: options.targetId || null,
            details: options.details || null,
        })

        if (error) {
            console.error('[AuditLog] Database error inserting audit log:', error.message)
        }

        // Also store a notification in the database for important actions
        if (!error && userId) {
            // Decide severity based on action
            let severity: 'info' | 'medium' | 'high' = 'info'
            if (options.action === 'PIPELINE_RUN') severity = 'high'
            else if (options.action.includes('DELETE')) severity = 'high'
            else if (options.action.includes('UPDATE')) severity = 'medium'

            let title = 'System Event'
            if (options.action === 'PIPELINE_RUN') title = 'Pipeline Started'
            else if (options.action === 'LOGIN') title = 'User Logged In'
            else if (options.action === 'LOGOUT') title = 'User Logged Out'
            else if (options.action === 'SIGNUP') title = 'New User Registration'

            await emitAlert({
                id: `audit-notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                type: 'audit',
                title: title,
                message: `${userEmail} performed ${options.action}${options.targetType ? ` on ${options.targetType}` : ''}`,
                severity: severity
            })
        }
    } catch (err: any) {
        console.error('[AuditLog] Unexpected error recorded:', err?.message || err)
    }
}
