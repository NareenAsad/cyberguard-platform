import { NextRequest, NextResponse } from 'next/server'
import { getIncidents, createIncident, deleteIncident, updateIncident } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'
import { incidentPostSchema, incidentPatchSchema } from '@/lib/validation'
import { emitAlert } from '@/lib/socket/emit-socket-event'
import { requireDeletePermission, requirePermission } from '@/lib/auth/require-delete-permission'
import { recordAuditLog } from '@/lib/audit-logger'

export async function GET(request: NextRequest) {
    try {
        // OWASP: Rate limit public fetch endpoints
        const limitRes = await rateLimit(request, { limit: 60, endpoint: 'incidents:get' })
        if (!limitRes.isAllowed) return limitRes.response

        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status') || undefined
        const severity = searchParams.get('severity') || undefined
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')

        const result = await getIncidents({ status, severity, page, limit })

        if (result.success && result.data) {
            return NextResponse.json(
                {
                    success: true,
                    data: result.data,
                    total: result.data.length,
                    page,
                    limit,
                    pages: Math.ceil(result.data.length / limit),
                    timestamp: new Date().toISOString(),
                },
                { status: 200 }
            )
        }

        return NextResponse.json(
            { success: false, error: 'Failed to fetch incidents from database' },
            { status: 503 }
        )
    } catch (error) {
        console.error('[API] Error fetching incidents:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch incidents',
            },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        // OWASP: Rate limit creation requests
        const limitRes = await rateLimit(request, { limit: 15, endpoint: 'incidents:post' })
        if (!limitRes.isAllowed) return limitRes.response

        const body = await request.json()

        // OWASP: Strict Zod validation and input sanitization (strips unknown fields)
        const validation = incidentPostSchema.safeParse(body)
        if (!validation.success) {
            return NextResponse.json(
                { success: false, error: 'Validation failed', details: validation.error.format() },
                { status: 400 }
            )
        }

        const result = await createIncident(validation.data)

        if (result.success && result.data) {
            await recordAuditLog({
                action: 'INCIDENT_CREATED',
                targetType: 'incident',
                targetId: result.data.id,
                details: { title: validation.data.title, severity: validation.data.severity },
            })

            if (validation.data.severity === 'critical') {
                await emitAlert({
                    id:      `alert-incident-manual-${Date.now()}`,
                    type:    'critical_incident',
                    title:   'Critical Incident Opened',
                    message: validation.data.title,
                    severity: 'critical',
                })
            }

            return NextResponse.json(
                {
                    success: true,
                    data: result.data,
                    message: 'Incident created successfully',
                },
                { status: 201 }
            )
        }

        return NextResponse.json(
            { success: false, error: 'Failed to create incident in database' },
            { status: 503 }
        )
    } catch (error) {
        console.error('[API] Error creating incident:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to create incident',
            },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest) {
    try {
        // OWASP: Rate limit deletion requests
        const limitRes = await rateLimit(request, { limit: 15, endpoint: 'incidents:delete' })
        if (!limitRes.isAllowed) return limitRes.response

        // RBAC: only roles with canDeleteData (currently: admin) may delete
        const denied = await requireDeletePermission()
        if (denied) return denied

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        // Validate ID format
        if (!id || typeof id !== 'string' || id.length > 50 || !/^[a-zA-Z0-9_-]+$/.test(id)) {
            return NextResponse.json({ success: false, error: 'Invalid or missing ID parameter' }, { status: 400 })
        }

        const result = await deleteIncident(id)

        if (result.success) {
            await recordAuditLog({
                action: 'INCIDENT_DELETED',
                targetType: 'incident',
                targetId: id,
            })

            return NextResponse.json({ success: true, message: 'Incident deleted successfully' })
        }

        return NextResponse.json({ success: false, error: 'Failed to delete incident' }, { status: 503 })
    } catch (error) {
        console.error('[API] Error deleting incident:', error)
        return NextResponse.json({ success: false, error: 'Failed to delete incident' }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest) {
    try {
        // OWASP: Rate limit update requests
        const limitRes = await rateLimit(request, { limit: 15, endpoint: 'incidents:patch' })
        if (!limitRes.isAllowed) return limitRes.response

        // RBAC: only roles with canAssignIncidents may reassign/change status
        const denied = await requirePermission('canAssignIncidents')
        if (denied) return denied

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        // Validate ID format
        if (!id || typeof id !== 'string' || id.length > 50 || !/^[a-zA-Z0-9_-]+$/.test(id)) {
            return NextResponse.json({ success: false, error: 'Invalid or missing ID parameter' }, { status: 400 })
        }

        const body = await request.json()

        // OWASP: Strict Zod validation and input sanitization
        const validation = incidentPatchSchema.safeParse(body)
        if (!validation.success) {
            return NextResponse.json(
                { success: false, error: 'Validation failed', details: validation.error.format() },
                { status: 400 }
            )
        }

        const result = await updateIncident(id, validation.data)

        if (result.success) {
            await recordAuditLog({
                action: 'INCIDENT_UPDATED',
                targetType: 'incident',
                targetId: id,
                details: validation.data,
            })

            return NextResponse.json({ success: true, data: result.data })
        }

        return NextResponse.json({ success: false, error: 'Failed to update incident' }, { status: 503 })
    } catch (error) {
        console.error('[API] Error updating incident:', error)
        return NextResponse.json({ success: false, error: 'Failed to update incident' }, { status: 500 })
    }
}

