import { NextRequest, NextResponse } from 'next/server'
import { getNotifications, createNotification, markNotificationRead, clearNotifications } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'

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

        const body = await request.json()
        const result = await createNotification(body)

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
        const { id, markAll } = body || {}

        const result = await markNotificationRead(id, Boolean(markAll))
        if (result.success) {
            return NextResponse.json({ success: true })
        }
        return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

// DELETE /api/notifications — Clear notifications
export async function DELETE(request: NextRequest) {
    try {
        const limitRes = await rateLimit(request, { limit: 15, endpoint: 'notifications:delete' })
        if (!limitRes.isAllowed) return limitRes.response

        const result = await clearNotifications()
        if (result.success) {
            return NextResponse.json({ success: true })
        }
        return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
