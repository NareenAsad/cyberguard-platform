import { NextRequest, NextResponse } from 'next/server'
import { getNotifications, createNotification, markNotificationRead, deleteNotification, clearNotifications } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'
import { requirePermission } from '@/lib/auth/require-delete-permission'
import { notificationPostSchema, notificationPatchSchema } from '@/lib/validation'

// GET /api/notifications — Fetch notifications from DB
export async function GET(request: NextRequest) {
    try {
        const limitRes = await rateLimit(request, { limit: 60, endpoint: 'notifications:get' })
        if (!limitRes.isAllowed) return limitRes.response

        const limit = parseInt(request.nextUrl.searchParams.get('limit') || '30')
        const result = await getNotifications(limit)

        if (result.success) {
            return NextResponse.json({ success: true, notifications: result.data || [] })
        }
        return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

// POST /api/notifications — Create & store notification
export async function POST(request: NextRequest) {
    try {
        const limitRes = await rateLimit(request, { limit: 30, endpoint: 'notifications:post' })
        if (!limitRes.isAllowed) return limitRes.response

        // Notifications are a shared, system-wide feed (no per-user ownership),
        // so creating one is treated as an administrative action, same as
        // clearing the feed below — otherwise any authenticated Viewer could
        // inject spoofed alerts into every user's notification bell.
        const denied = await requirePermission('canDeleteData')
        if (denied) return denied

        const body = await request.json()

        // OWASP: strict Zod validation and input sanitization
        const validation = notificationPostSchema.safeParse(body)
        if (!validation.success) {
            return NextResponse.json(
                { success: false, error: 'Validation failed', details: validation.error.format() },
                { status: 400 }
            )
        }

        const result = await createNotification(validation.data)

        if (result.success) {
            return NextResponse.json({ success: true, notification: result.data }, { status: 201 })
        }
        return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

// PATCH /api/notifications — Mark notification(s) read
export async function PATCH(request: NextRequest) {
    try {
        const limitRes = await rateLimit(request, { limit: 30, endpoint: 'notifications:patch' })
        if (!limitRes.isAllowed) return limitRes.response

        const body = await request.json()

        // OWASP: strict Zod validation
        const validation = notificationPatchSchema.safeParse(body)
        if (!validation.success) {
            return NextResponse.json(
                { success: false, error: 'Validation failed', details: validation.error.format() },
                { status: 400 }
            )
        }
        const { id, markAll } = validation.data

        const result = await markNotificationRead(id, Boolean(markAll))
        if (result.success) {
            return NextResponse.json({ success: true })
        }
        return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

// DELETE /api/notifications           — Clear the entire feed
// DELETE /api/notifications?id=xxx    — Remove a single notification
export async function DELETE(request: NextRequest) {
    try {
        const limitRes = await rateLimit(request, { limit: 15, endpoint: 'notifications:delete' })
        if (!limitRes.isAllowed) return limitRes.response

        // Both a single delete and a full clear remove the item from the
        // shared, system-wide feed for every user — restrict to the same
        // permission as other destructive routes.
        const denied = await requirePermission('canDeleteData')
        if (denied) return denied

        const id = request.nextUrl.searchParams.get('id')
        const result = id ? await deleteNotification(id) : await clearNotifications()

        if (result.success) {
            return NextResponse.json({ success: true })
        }
        return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
