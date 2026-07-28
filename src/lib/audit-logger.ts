import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

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
    } catch (err: any) {
        console.error('[AuditLog] Unexpected error recorded:', err?.message || err)
    }
}
