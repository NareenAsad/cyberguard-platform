/**
 * Server-side helper to push a Socket.io event from any API route.
 *
 * Next.js API route handlers can't reach the Socket.io `io` instance directly
 * — it lives inside the custom server.js process. Instead we POST to the
 * internal webhook server.js exposes at /api/internal/socket-emit, which
 * looks up the right `io.emit(...)` call. See server.js for the receiving
 * end and src/proxy.ts, which excludes this path from auth middleware.
 */
export async function emitSocketEvent(event: string, data: Record<string, unknown>): Promise<void> {
    const rawAppUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const appUrl = rawAppUrl.endsWith('/') ? rawAppUrl.slice(0, -1) : rawAppUrl

    try {
        await fetch(`${appUrl}/api/internal/socket-emit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
    await emitSocketEvent('alert:new', {
        ...alert,
        timestamp: alert.timestamp ?? new Date().toISOString(),
    })
}
