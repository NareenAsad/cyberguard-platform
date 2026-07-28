/**
 * GET /api/threats/job?jobId=cg-xxx
 * Polls pipeline, auto-saves to Supabase, emits socket events to refresh pages.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAgentJob } from '@/lib/agent-client'
import type { AgentPipelineResult, RiskResult, ExecutiveReport, TechnicalReport } from '@/lib/agent-client'

/** Extended types for pipeline fields not yet in base interfaces */
interface ExtendedPipelineResult extends AgentPipelineResult {
    compliance_report?: Record<string, unknown>
}

interface ExtendedRiskResult extends RiskResult {
    score_breakdown?: string
}

interface ExtendedPlaybookResult {
    cve_id?: string
    asset_id?: string
    risk_score?: number
    incident_title?: string
    incident_summary?: string
    playbook?: {
        containment?: string[]
        eradication?: string[]
        recovery?: string[]
    }
}
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'
import { jobIdSchema } from '@/lib/validation'
import { emitSocketEvent, emitAlert } from '@/lib/socket/emit-socket-event'

const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const savedJobs = new Set<string>()

export async function GET(request: NextRequest) {
    try {
        // OWASP: Rate limit status/job polling
        const limitRes = await rateLimit(request, { limit: 60, endpoint: 'threats-job:get' })
        if (!limitRes.isAllowed) return limitRes.response

        const jobId = request.nextUrl.searchParams.get('jobId')
        
        // OWASP: Validate query parameter shape
        const validation = jobIdSchema.safeParse({ jobId })
        if (!validation.success) {
            return NextResponse.json({ success: false, error: 'Invalid jobId parameter' }, { status: 400 })
        }

        const validatedJobId = validation.data.jobId

        // Get the current user to associate notifications
        const serverClient = await createServerClient()
        const { data: { user } } = await serverClient.auth.getUser()
        const userId = user?.id

        const job = await getAgentJob(validatedJobId)

        if (job.status === 'completed' && job.result && !savedJobs.has(validatedJobId)) {
            savedJobs.add(validatedJobId)

            // Save and emit — fire and forget so polling stays fast
            saveAndNotify(validatedJobId, job.result, userId).catch((err: unknown) => {
                console.error(`[Job ${validatedJobId}] Save failed:`, err instanceof Error ? err.message : err)
                savedJobs.delete(validatedJobId) // allow retry
            })
        }

        return NextResponse.json({ success: true, job })
    } catch (error: unknown) {
        console.error('[API] Poll error:', error)
        return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
    }
}



async function saveAndNotify(jobId: string, result: ExtendedPipelineResult, userId?: string) {
    const now = new Date().toISOString()
    const summary = { threats: 0, risks: 0, incidents: 0, playbooks: 0, reports: 0 }

    console.log(`[Save ${jobId}] Keys:`, Object.keys(result))

    // ── 1. Threats ────────────────────────────────────────────────────────
    const threats = result.threats ?? []
    for (let index = 0; index < threats.length; index++) {
        const t = threats[index]
        const indicatorValue = t.indicator_value ?? 'Unknown'

        // Derive a meaningful source: use MITRE tactic or confidence label
        const sourceLabel = t.mitre_tactic
            ? `MITRE: ${t.mitre_tactic}`
            : t.active_exploitation
            ? 'Active Exploitation'
            : 'Threat Intelligence Feed'

        const severity = priorityToSeverity(t.priority_score ?? 50)

        const { error } = await supabase.from('Threat').insert({
            id:          `thr-${jobId}-${index}`,
            threatId:    `THR-AI-${index}-${rand().toUpperCase()}`,
            type:        t.indicator_type  ?? 'malware',
            severity,
            source:      sourceLabel,
            target:      indicatorValue,
            detected:    now,
            status:      'mitigating',
        })
        if (error) {
            console.error('[Save] Threat:', error.message)
        } else {
            summary.threats++
            if (severity === 'critical') {
                await emitAlert({
                    id:      `alert-threat-${jobId}-${index}`,
                    type:    userId ? `critical_threat|${userId}` : 'critical_threat',
                    title:   'Critical Threat Detected',
                    message: `${indicatorValue} (${t.indicator_type ?? 'indicator'}) — ${sourceLabel}`,
                    severity: 'critical',
                })
            }
        }
    }

    // ── 2. Risk Analysis ──────────────────────────────────────────────────
    const risks = (result.risk_register ?? []) as ExtendedRiskResult[]
    for (let index = 0; index < risks.length; index++) {
        const r = risks[index]
        const { error } = await supabase.from('RiskAnalysis').insert({
            id:             `risk-${jobId}-${index}`,
            asset:          r.asset_name      ?? 'Unknown Asset',
            riskLevel:      Math.min(100, Math.round(r.risk_score ?? 0)),
            vulnerabilities: 1,
            exposureTime:   'Active',
            recommendation: r.score_breakdown ?? `Risk score: ${r.risk_score}`,
        })
        if (error) console.error('[Save] Risk:', error.message)
        else summary.risks++
    }

    // ── 3. Incidents for risk >= 50 ───────────────────────────────────────
    const criticalRisks = risks.filter(r => (r.risk_score ?? 0) >= 50)
    for (let index = 0; index < criticalRisks.length; index++) {
        const r = criticalRisks[index]
        const severity = (r.severity_label ?? 'high').toLowerCase()
        const title = `[AI] ${r.cve_id ?? 'Vulnerability'} on ${r.asset_name ?? 'Unknown Asset'}`

        const { error } = await supabase.from('Incident').insert({
            id:          `inc-${jobId}-${index}`,
            incidentId:  `INC-AI-${index}-${Date.now()}`,
            title,
            description: `Risk ${r.risk_score}/100. MITRE: ${r.mitre_tactic ?? 'N/A'}.`,
            severity,
            status:      'open',
            assignee:    'Unassigned',
            created:     now,
            updated:     now,
        })
        if (error) {
            console.error('[Save] Incident:', error.message)
        } else {
            summary.incidents++
            if (severity === 'critical') {
                await emitAlert({
                    id:      `alert-incident-${jobId}-${index}`,
                    type:    userId ? `critical_incident|${userId}` : 'critical_incident',
                    title:   'Critical Incident Opened',
                    message: `${title} — Risk ${r.risk_score}/100`,
                    severity: 'critical',
                })
            }
        }
    }

    // ── 4. Playbooks ──────────────────────────────────────────────────────
    const playbooks = (result.playbooks ?? []) as ExtendedPlaybookResult[]
    for (let index = 0; index < playbooks.length; index++) {
        const p = playbooks[index]
        const { error } = await supabase.from('Playbook').insert({
            id:          `pb-${jobId}-${index}`,
            playbookId:  `PB-${index}-${rand().toUpperCase()}`,
            title:       p.incident_title   ?? `[AI] ${p.cve_id ?? 'Threat'} Response Playbook`,
            description: p.incident_summary ?? 'Auto-generated by CyberGuard AI IR Agent',
            category:    'AI Generated',
            steps:       (p.playbook?.containment?.length ?? 0) + (p.playbook?.eradication?.length ?? 0),
            content:     p.playbook ?? {},
            updatedBy:   'CyberGuard AI',
            lastUpdated: now,
        })
        if (error) console.error('[Save] Playbook:', error.message)
        else summary.playbooks++
    }

    // ── 5. Report ─────────────────────────────────────────────────────────
    const exec = result.executive_report ?? {} as Partial<ExecutiveReport>
    const tech = result.technical_report ?? {} as Partial<TechnicalReport>
    const comp = result.compliance_report ?? {} as Partial<Record<string, unknown>>

    if (exec.top_risk || tech.total_findings) {
        const { error } = await supabase.from('Report').insert({
            id:        `rep-${jobId}`,
            reportId:  `REP-${rand().toUpperCase()}`,
            title:     `AI Analysis Report — ${new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })}`,
            type:      'executive',
            status:    'final',
            content:   { 
                executive_report: exec, 
                technical_report: tech, 
                compliance_report: comp,
                description: exec.top_risk ?? 'Full security posture and remediation analysis.'
            },
            jobId:     jobId,
            generated: now,
            threats:   summary.threats,
            resolved:  0
        })
        if (error) console.error('[Save] Report:', error.message)
        else summary.reports++
    }

    // ── 6. Mark job done ──────────────────────────────────────────────────
    await supabase.from('agent_jobs')
        .update({ status: 'completed', completed_at: now })
        .eq('job_id', jobId)

    console.log(`[Save ${jobId}] Complete:`, summary)

    // ── 7. Emit socket events to refresh all affected pages ───────────────
    await emitRefreshEvents(result, summary, exec, userId)
}


async function emitRefreshEvents(result: AgentPipelineResult, summary: { threats: number; risks: number; incidents: number; playbooks: number; reports: number }, exec: Partial<ExecutiveReport>, userId?: string) {
    // Dashboard metrics update
    await emitSocketEvent('metrics:update', {
        postureScore:   exec.posture_score                ?? 0,
        criticalCount:  exec.severity_summary?.critical   ?? 0,
        highCount:      exec.severity_summary?.high       ?? 0,
        totalFindings:  result.technical_report?.total_findings ?? 0,
        topRisk:        exec.top_risk                     ?? '',
        actionRequired: exec.action_required              ?? '',
    })

    // Tell each page to refetch its data
    if (summary.threats   > 0) await emitSocketEvent('page:refresh', { page: 'threats' })
    if (summary.risks     > 0) await emitSocketEvent('page:refresh', { page: 'risk-analysis' })
    if (summary.incidents > 0) await emitSocketEvent('page:refresh', { page: 'incident-response' })
    if (summary.playbooks > 0) await emitSocketEvent('page:refresh', { page: 'playbooks' })
    if (summary.reports   > 0) await emitSocketEvent('page:refresh', { page: 'reports' })

    // Alert banner for dashboard — always fires once per completed run.
    await emitAlert({
        id:      `alert-${Date.now()}`,
        type:    userId ? `analysis_complete|${userId}` : 'analysis_complete',
        title:   'AI Analysis Saved',
        message: `${summary.threats} threats · ${summary.risks} risks · ${summary.incidents} incidents · ${summary.playbooks} playbooks`,
        severity: (exec.severity_summary?.critical ?? 0) > 0 ? 'critical' : 'info',
    })
}

const rand = () => Math.random().toString(36).slice(2, 7)

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
