import { createNotification } from '@/lib/db'

export async function emitSocketEvent(event: string, data: Record<string, unknown>): Promise<void> {
    const rawAppUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const appUrl = rawAppUrl.endsWith('/') ? rawAppUrl.slice(0, -1) : rawAppUrl

    try {
        await fetch(`${appUrl}/api/internal/socket-emit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-internal-secret': process.env.INTERNAL_WEBHOOK_SECRET ?? '',
            },
            body: JSON.stringify({ event, data }),
        })
    } catch {
        console.warn(`[Socket] ${event} emit failed`)
    }
}

export interface AlertNotification {
    id: string
    type: string
    title: string
    message: string
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
    timestamp: string
}

export async function emitAlert(alert: Omit<AlertNotification, 'timestamp'> & { timestamp?: string }): Promise<void> {
    const payload = {
        ...alert,
        timestamp: alert.timestamp ?? new Date().toISOString(),
    }

    try {
        await createNotification({
            id: payload.id,
            type: payload.type,
            title: payload.title,
            message: payload.message,
            severity: payload.severity,
            timestamp: payload.timestamp,
        })
    } catch (err) {
        console.error('[Notification] Failed to store notification in DB:', err)
    }

    await emitSocketEvent('alert:new', payload)
}
