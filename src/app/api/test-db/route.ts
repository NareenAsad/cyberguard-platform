import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
    // Debug/diagnostic endpoint — uses the service-role client to dump row
    // counts across every table, so it must never be reachable by a
    // non-admin. Previously required only a logged-in session (any role).
    const serverClient = await createServerClient()
    const { data: { user } } = await serverClient.auth.getUser()
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await serverClient.from('profiles').select('role').eq('id', user.id).single()
    if (!profile || profile.role !== 'admin') {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    try {
        // 1. Check connection
        const { data: tablesRes, error: tablesErr } = await supabase
            .from('Threat')
            .select('id')
            .limit(1)

        if (tablesErr) {
            return NextResponse.json({ success: false, error: tablesErr.message }, { status: 500 })
        }

        // 2. List tables (approximate by checking known tables)
        const tables = ['Threat', 'RiskAnalysis', 'Incident', 'Playbook', 'Report', 'agent_jobs']
        const counts: any = {}

        for (const t of tables) {
            const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true })
            counts[t] = error ? error.message : count
        }

        return NextResponse.json({
            success: true,
            counts,
            env: {
                hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
                hasKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
            }
        })
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 })
    }
}
