const rawAgentUrl = process.env.AGENT_API_URL ?? 'http://localhost:8001'
const AGENT_BASE_URL = rawAgentUrl.endsWith('/') ? rawAgentUrl.slice(0, -1) : rawAgentUrl

const AGENT_HEADERS = {
    'Content-Type': 'application/json',
    'x-api-key': process.env.AGENT_API_SECRET ?? '',
}

// ── Types ──────────────────────────────────────────────────────────────────

export interface ThreatIndicator {
    type: 'ip' | 'domain' | 'hash' | 'cve' | 'url'
    value: string
    source: string
    confidence?: number
}

export interface Asset {
    id: string
    name: string
    type?: string
    ip_address?: string
    os?: string
    software?: { name: string; version: string }[]
    criticality: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
    network_exposure?: 'internet-facing' | 'internal' | 'air-gapped'
    owner?: string
}

export interface AgentJobStatus {
    job_id: string
    status: 'queued' | 'running' | 'completed' | 'failed'
    created_at: string
    completed_at?: string | null
    result?: AgentPipelineResult | null
    error?: string | null
    /** Number of the 5 pipeline tasks completed so far (0-5). */
    current_step?: number | null
}

export interface AgentPipelineResult {
    metadata: {
        run_id: string
        processed_at: string
        indicators_processed: number
        assets_scanned: number
    }
    // Threat Intelligence Agent output
    threats?: ThreatIntelResult[]
    // Vulnerability Agent output
    vulnerabilities?: VulnerabilityResult[]
    // Risk Analyst output
    risk_register?: RiskResult[]
    // IR Agent output
    playbooks?: PlaybookResult[]
    // Reporter output
    executive_report?: ExecutiveReport
    technical_report?: TechnicalReport
    // Fallback if LLM wraps in raw_output
    raw_output?: string
}

export interface ThreatIntelResult {
    indicator_value: string
    indicator_type: string
    confidence_score: number
    mitre_tactic: string
    mitre_technique_id: string
    active_exploitation: boolean
    priority_score: number
}

export interface VulnerabilityResult {
    asset_id: string
    asset_name: string
    asset_criticality: string
    cve_id: string
    cvss_base_score: number
    patch_available: boolean
    match_confidence: number
    affected_component: string
}

export interface RiskResult {
    asset_id: string
    asset_name: string
    cve_id: string
    risk_score: number
    severity_label: string
    cvss_score: number
    exploitability_score: number
    asset_criticality_score: number
    threat_intel_score: number
    mitre_tactic: string
    patch_available: boolean
}

export interface PlaybookResult {
    cve_id: string
    asset_id: string
    risk_score: number
    playbook: {
        containment: string[]
        eradication: string[]
        recovery: string[]
    }
}

export interface ExecutiveReport {
    posture_score: number
    severity_summary: { critical: number; high: number; medium: number; low: number }
    top_risk: string
    action_required: string
}

export interface TechnicalReport {
    total_findings: number
    cves_detected: string[]
    assets_at_risk: string[]
    immediate_patches: string[]
}

// ── Client functions ───────────────────────────────────────────────────────

export async function startAgentAnalysis(
    indicators: ThreatIndicator[],
    assets: Asset[],
    runId?: string
): Promise<AgentJobStatus> {
    const res = await fetch(`${AGENT_BASE_URL}/api/agents/analyze`, {
        method: 'POST',
        headers: AGENT_HEADERS,
        body: JSON.stringify({ indicators, assets, run_id: runId }),
    })

    if (!res.ok) {
        const err = await res.text()
        throw new Error(`Agent server error ${res.status}: ${err}`)
    }

    return res.json()
}

export async function getAgentJob(jobId: string): Promise<AgentJobStatus> {
    const res = await fetch(`${AGENT_BASE_URL}/api/agents/jobs/${jobId}`, {
        headers: AGENT_HEADERS,
    })

    if (!res.ok) {
        throw new Error(`Agent job not found: ${jobId}`)
    }

    return res.json()
}

/**
 * Poll a job until completed or failed.
 * @param jobId     The job to poll
 * @param intervalMs How often to poll (default: 4 seconds)
 * @param timeoutMs  Max wait time (default: 3 minutes)
 */
export async function waitForAgentJob(
    jobId: string,
    intervalMs = 4000,
    timeoutMs = 180_000
): Promise<AgentJobStatus> {
    const deadline = Date.now() + timeoutMs

    while (Date.now() < deadline) {
        const job = await getAgentJob(jobId)

        if (job.status === 'completed' || job.status === 'failed') {
            return job
        }

        await new Promise((r) => setTimeout(r, intervalMs))
    }

    throw new Error(`Agent job ${jobId} timed out after ${timeoutMs / 1000}s`)
}

export async function calculateRiskScore(payload: {
    cvss_score: number
    exploit_availability: 'public' | 'poc' | 'theoretical'
    asset_criticality: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
    active_exploitation: boolean
    network_exposure: 'internet-facing' | 'internal' | 'air-gapped'
}): Promise<{ risk_score: number; severity_label: string }> {
    const res = await fetch(`${AGENT_BASE_URL}/api/agents/score`, {
        method: 'POST',
        headers: AGENT_HEADERS,
        body: JSON.stringify(payload),
    })

    if (!res.ok) throw new Error(`Risk score error: ${res.status}`)
    return res.json()
}

export async function checkAgentHealth(): Promise<boolean> {
    try {
        const res = await fetch(`${AGENT_BASE_URL}/health`, {
            signal: AbortSignal.timeout(3000),
        })
        return res.ok
    } catch {
        return false
    }
}
