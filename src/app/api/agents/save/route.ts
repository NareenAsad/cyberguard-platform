import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { hasPermission } from '@/lib/auth/types'
import { agentsSavePostSchema } from '@/lib/validation'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
    try {
        const serverClient = await createServerClient()
        const { data: { user } } = await serverClient.auth.getUser()
        if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

        const { data: profile } = await serverClient.from('profiles').select('role').eq('id', user.id).single()
        if (!profile || !hasPermission(profile.role, 'canRunAiAnalysis')) {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
        }

        const body = await request.json()

        // OWASP: Strict Zod validation — rejects unexpected fields, caps array sizes
        const validation = agentsSavePostSchema.safeParse(body)
        if (!validation.success) {
            return NextResponse.json(
                { success: false, error: 'Validation failed', details: validation.error.format() },
                { status: 400 }
            )
        }

        const { jobId, result } = validation.data

        const summary = await saveAllResults(jobId, result)

        return NextResponse.json({ success: true, summary })

    } catch (error: any) {
        console.error('[Save API] Error:', error)
        return NextResponse.json(
            { success: false, error: error.message || 'Save failed' },
            { status: 500 }
        )
    }
}

async function saveAllResults(jobId: string, result: any) {
    const now = new Date().toISOString()
    const summary = { threats: 0, risks: 0, incidents: 0, playbooks: 0, reports: 0 }

    // ── 1. Threats ────────────────────────────────────────────────────────
    const threats: any[] = result.threats ?? []
    for (const t of threats) {
        const { error } = await supabase.from('Threat').insert({
            id: `thr-${jobId}-${Math.random().toString(36).slice(2, 7)}`,
            title: `[AI] ${t.indicator_value ?? 'Unknown Indicator'}`,
            description: `MITRE: ${t.mitre_tactic ?? 'Unknown'} (${t.mitre_technique_id ?? 'N/A'})`,
            severity: priorityToSeverity(t.priority_score ?? 50),
            status: 'active',
            source: 'AI Agent',
            cveId: t.indicator_type === 'cve' ? t.indicator_value : null,
            ipAddress: t.indicator_type === 'ip' ? t.indicator_value : null,
            detected: now,
            updated: now,
        })
        if (!error) summary.threats++
        else console.error('[Save] Threat error:', error.message)
    }

    // ── 2. Risk Analysis ──────────────────────────────────────────────────
    const riskRegister: any[] = result.risk_register ?? []
    for (const r of riskRegister) {
        const { error } = await supabase.from('RiskAnalysis').insert({
            id: `risk-${jobId}-${Math.random().toString(36).slice(2, 7)}`,
            assetId: r.asset_id ?? 'unknown',
            assetName: r.asset_name ?? 'Unknown Asset',
            riskLevel: Math.min(100, Math.round(r.risk_score ?? 0)),
            cvssScore: r.cvss_score ?? null,
            exploitability: exploitabilityLabel(r.exploitability_score ?? 0),
            patchAvailable: r.patch_available ?? false,
            scoreBreakdown: `CVSS:${r.cvss_score} | Exploit:${r.exploitability_score} | Asset:${r.asset_criticality_score} | ThreatIntel:${r.threat_intel_score}`,
            mitreAttack: r.mitre_tactic ?? null,
            created: now,
            updated: now,
        })
        if (!error) summary.risks++
        else console.error('[Save] Risk error:', error.message)
    }

    // ── 3. Incidents (CRITICAL + HIGH findings) ───────────────────────────
    const highPlus = riskRegister.filter(r => (r.risk_score ?? 0) >= 50)
    for (const r of highPlus) {
        const { error } = await supabase.from('Incident').insert({
            id: `inc-${jobId}-${Math.random().toString(36).slice(2, 7)}`,
            incidentId: `INC-AI-${Date.now()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`,
            title: `[AI] ${r.cve_id ?? 'Vulnerability'} on ${r.asset_name ?? 'Unknown Asset'}`,
            description: `Risk score ${r.risk_score}/100 (${r.severity_label}). MITRE: ${r.mitre_tactic ?? 'N/A'}. Patch available: ${r.patch_available ? 'Yes' : 'No'}.`,
            severity: r.severity_label?.toLowerCase() ?? 'high',
            status: 'open',
            assignee: 'Unassigned',
            created: now,
            updated: now,
        })
        if (!error) summary.incidents++
        else console.error('[Save] Incident error:', error.message)
    }

    // ── 4. Playbooks ──────────────────────────────────────────────────────
    const playbooks: any[] = result.playbooks ?? []
    for (const p of playbooks) {
        const { error } = await supabase.from('Playbook').insert({
            id: `pb-${jobId}-${Math.random().toString(36).slice(2, 7)}`,
            title: p.incident_title ?? `[AI] ${p.cve_id ?? 'Threat'} Response Playbook`,
            description: p.incident_summary ?? 'Auto-generated by CyberGuard AI Incident Response Agent',
            category: 'AI Generated',
            content: p.playbook ?? {},
            cveId: p.cve_id ?? null,
            lastUpdated: now,
            created: now,
        })
        if (!error) summary.playbooks++
        else console.error('[Save] Playbook error:', error.message)
    }

    // ── 5. Report ─────────────────────────────────────────────────────────
    const execReport = result.executive_report ?? {}
    const techReport = result.technical_report ?? {}
    const compReport = result.compliance_report ?? {}

    if (execReport.top_risk || techReport.total_findings) {
        const { error } = await supabase.from('Report').insert({
            id: `rep-${jobId}`,
            title: `AI Analysis Report — ${new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })}`,
            type: 'executive',
            status: 'final',
            content: { executive_report: execReport, technical_report: techReport, compliance_report: compReport },
            jobId: jobId,
            generated: now,
        })
        if (!error) summary.reports++
        else console.error('[Save] Report error:', error.message)
    }

    // ── 6. Update agent_jobs ──────────────────────────────────────────────
    await supabase
        .from('agent_jobs')
        .update({ status: 'completed', completed_at: now })
        .eq('job_id', jobId)

    console.log(`[Save] Job ${jobId} saved:`, summary)
    return summary
}

function priorityToSeverity(score: number): string {
    if (score >= 80) return 'critical'
    if (score >= 60) return 'high'
    if (score >= 40) return 'medium'
    return 'low'
}

function exploitabilityLabel(score: number): string {
    if (score >= 9) return 'PUBLIC'
    if (score >= 5) return 'POC_ONLY'
    if (score >= 1) return 'THEORETICAL'
    return 'NONE'
}
