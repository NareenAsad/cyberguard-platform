import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
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
